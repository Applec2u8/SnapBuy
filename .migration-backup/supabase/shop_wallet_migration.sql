-- =====================================================================
-- SnapBuy — Shop Wallet System Migration
-- Run this in Supabase SQL Editor AFTER update_quota_sales_percentage.sql
-- =====================================================================

-- 1. Add shop wallet balance columns to shops table
ALTER TABLE public.shops ADD COLUMN IF NOT EXISTS sale_balance  NUMERIC DEFAULT 0;
ALTER TABLE public.shops ADD COLUMN IF NOT EXISTS bonus_balance NUMERIC DEFAULT 0;

-- 2. Create shop_wallet_transactions table
CREATE TABLE IF NOT EXISTS public.shop_wallet_transactions (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  shop_id    UUID NOT NULL REFERENCES public.shops(id) ON DELETE CASCADE,
  type       TEXT NOT NULL CHECK (type IN ('sale', 'bonus', 'withdrawal')),
  amount     NUMERIC NOT NULL,
  note       TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now()) NOT NULL
);

-- RLS
ALTER TABLE public.shop_wallet_transactions ENABLE ROW LEVEL SECURITY;

-- Shop owners can read their own shop's transactions
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public'
      AND tablename = 'shop_wallet_transactions'
      AND policyname = 'shop_owner_read_wallet_tx'
  ) THEN
    CREATE POLICY "shop_owner_read_wallet_tx"
      ON public.shop_wallet_transactions FOR SELECT
      USING (
        EXISTS (
          SELECT 1 FROM public.shops s
          WHERE s.id = shop_wallet_transactions.shop_id
            AND s.owner_id = auth.uid()
        )
      );
  END IF;
END $$;

-- 3. Replace place_order — now credits shop wallet (sale_balance + bonus_balance)
DROP FUNCTION IF EXISTS public.place_order(uuid, numeric, uuid, jsonb);
CREATE OR REPLACE FUNCTION public.place_order(
  p_user_id            UUID,
  p_total_amount       NUMERIC,
  p_shipping_address_id UUID,
  p_items              JSONB
)
RETURNS JSON AS $$
DECLARE
  v_order_id       UUID;
  v_item           JSONB;
  v_shop_id        UUID;
  v_item_price     NUMERIC;
  v_item_qty       INTEGER;
  v_sale_amount    NUMERIC;
  v_bonus_amount   NUMERIC;
  v_percentage     NUMERIC;
BEGIN
  -- Insert the order header
  INSERT INTO public.orders (user_id, total_amount, shipping_address_id, status)
  VALUES (p_user_id, p_total_amount, p_shipping_address_id, 'pending')
  RETURNING id INTO v_order_id;

  -- Process each order item
  FOR v_item IN SELECT * FROM jsonb_array_elements(p_items) LOOP
    v_item_price := (v_item->>'price')::NUMERIC;
    v_item_qty   := (v_item->>'quantity')::INTEGER;
    v_shop_id    := (v_item->>'shop_id')::UUID;

    -- Insert order item row
    INSERT INTO public.order_items (order_id, product_id, variant_id, quantity, price, shop_id)
    VALUES (
      v_order_id,
      (v_item->>'product_id')::UUID,
      (v_item->>'variant_id')::UUID,
      v_item_qty,
      v_item_price,
      v_shop_id
    );

    -- Get the shop's active sales_percentage bonus
    SELECT COALESCE(sales_percentage, 0) INTO v_percentage
    FROM public.shops WHERE id = v_shop_id;

    -- Split payout: base sale amount vs bonus amount
    v_sale_amount  := v_item_price * v_item_qty;
    v_bonus_amount := v_sale_amount * (v_percentage / 100.0);

    -- Credit shop wallet balances (separated)
    UPDATE public.shops
    SET
      sale_balance  = COALESCE(sale_balance,  0) + v_sale_amount,
      bonus_balance = COALESCE(bonus_balance, 0) + v_bonus_amount
    WHERE id = v_shop_id;

    -- Record sale transaction
    INSERT INTO public.shop_wallet_transactions (shop_id, type, amount, note)
    VALUES (v_shop_id, 'sale', v_sale_amount, 'Order ' || v_order_id::TEXT);

    -- Record bonus transaction (only if > 0)
    IF v_bonus_amount > 0 THEN
      INSERT INTO public.shop_wallet_transactions (shop_id, type, amount, note)
      VALUES (v_shop_id, 'bonus', v_bonus_amount, v_percentage::TEXT || '% bonus on Order ' || v_order_id::TEXT);
    END IF;
  END LOOP;

  RETURN json_build_object('success', true, 'order_id', v_order_id);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Create withdraw_shop_wallet function
CREATE OR REPLACE FUNCTION public.withdraw_shop_wallet(
  p_shop_id UUID,
  p_amount  NUMERIC
)
RETURNS JSON AS $$
DECLARE
  v_owner_id    UUID;
  v_sale_bal    NUMERIC;
  v_bonus_bal   NUMERIC;
  v_total_bal   NUMERIC;
  v_from_sale   NUMERIC;
  v_from_bonus  NUMERIC;
BEGIN
  -- Verify ownership
  SELECT owner_id INTO v_owner_id FROM public.shops WHERE id = p_shop_id;
  IF v_owner_id IS NULL OR v_owner_id != auth.uid() THEN
    RAISE EXCEPTION 'Unauthorized: you do not own this shop.';
  END IF;

  -- Get current shop balances
  SELECT
    COALESCE(sale_balance, 0),
    COALESCE(bonus_balance, 0)
  INTO v_sale_bal, v_bonus_bal
  FROM public.shops WHERE id = p_shop_id
  FOR UPDATE;

  v_total_bal := v_sale_bal + v_bonus_bal;

  IF p_amount <= 0 THEN
    RAISE EXCEPTION 'Withdrawal amount must be greater than 0.';
  END IF;

  IF p_amount > v_total_bal THEN
    RAISE EXCEPTION 'Insufficient shop wallet balance. Available: %.2f', v_total_bal;
  END IF;

  -- Deduct from sale_balance first, then bonus_balance
  IF p_amount <= v_sale_bal THEN
    v_from_sale  := p_amount;
    v_from_bonus := 0;
  ELSE
    v_from_sale  := v_sale_bal;
    v_from_bonus := p_amount - v_sale_bal;
  END IF;

  -- Deduct shop wallet
  UPDATE public.shops
  SET
    sale_balance  = sale_balance  - v_from_sale,
    bonus_balance = bonus_balance - v_from_bonus
  WHERE id = p_shop_id;

  -- Credit owner's personal wallet
  UPDATE public.profiles
  SET wallet_balance = wallet_balance + p_amount
  WHERE id = v_owner_id;

  -- Record withdrawal transaction
  INSERT INTO public.shop_wallet_transactions (shop_id, type, amount, note)
  VALUES (p_shop_id, 'withdrawal', p_amount, 'Withdrawal to personal wallet');

  RETURN json_build_object(
    'success',          true,
    'withdrawn',        p_amount,
    'remaining_total',  v_total_bal - p_amount
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
