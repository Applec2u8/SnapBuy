-- =====================================================================
-- SnapBuy — Add Quota Sales Bonus Percentage
-- =====================================================================

-- 1. Add sales_percentage column to store_quotas and shops tables
ALTER TABLE public.store_quotas ADD COLUMN IF NOT EXISTS sales_percentage NUMERIC DEFAULT 0;
ALTER TABLE public.shops ADD COLUMN IF NOT EXISTS sales_percentage NUMERIC DEFAULT 0;

-- 2. Update redeem_store_quota function to copy sales_percentage to the shop
CREATE OR REPLACE FUNCTION public.redeem_store_quota(p_quota_code TEXT, p_shop_id UUID)
RETURNS JSONB AS $$
DECLARE
  v_quota RECORD; v_owner UUID; v_shop shops%ROWTYPE; v_expires TIMESTAMP WITH TIME ZONE;
BEGIN
  SELECT owner_id INTO v_owner FROM shops WHERE id = p_shop_id;
  IF v_owner IS NULL OR v_owner != auth.uid() THEN RAISE EXCEPTION 'You do not have permission to modify this shop.'; END IF;
  SELECT * INTO v_quota FROM store_quotas WHERE code = p_quota_code FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'Invalid quota code.'; END IF;
  IF v_quota.is_used THEN RAISE EXCEPTION 'This quota code has already been used.'; END IF;
  SELECT * INTO v_shop FROM shops WHERE id = p_shop_id;
  IF v_quota.duration_days IS NOT NULL THEN
    IF v_shop.quota_expires_at IS NOT NULL AND v_shop.quota_expires_at > now() THEN
      v_expires := v_shop.quota_expires_at + (v_quota.duration_days || ' days')::interval;
    ELSE
      v_expires := now() + (v_quota.duration_days || ' days')::interval;
    END IF;
  END IF;
  UPDATE store_quotas SET is_used = true, used_by_shop_id = p_shop_id, used_at = now() WHERE id = v_quota.id;
  UPDATE shops SET 
    product_limit = GREATEST(product_limit,0) + v_quota.product_limit, 
    category_limit = GREATEST(COALESCE(category_limit,0),0) + COALESCE(v_quota.category_limit,0), 
    quota_expires_at = v_expires,
    sales_percentage = COALESCE(v_quota.sales_percentage, 0)
  WHERE id = p_shop_id;
  INSERT INTO quota_history (shop_id, type, amount, category_amount, duration_days, source, cost) VALUES (p_shop_id, 'code_redeem', v_quota.product_limit, COALESCE(v_quota.category_limit,0), v_quota.duration_days, p_quota_code, 0);
  RETURN json_build_object('success', true, 'message', 'Quota redeemed successfully.', 'new_limit', v_shop.product_limit + v_quota.product_limit, 'expires_at', v_expires)::jsonb;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Define/update place_order function to handle order payouts to the vendor with sales percentage bonus
DROP FUNCTION IF EXISTS public.place_order(uuid,numeric,uuid,jsonb);
CREATE OR REPLACE FUNCTION public.place_order(
  p_user_id UUID,
  p_total_amount NUMERIC,
  p_shipping_address_id UUID,
  p_items JSONB
)
RETURNS JSON AS $$
DECLARE
  v_order_id UUID;
  v_item JSONB;
  v_shop_owner_id UUID;
  v_item_price NUMERIC;
  v_item_qty INTEGER;
  v_item_shop_id UUID;
  v_percentage NUMERIC;
  v_payout_amount NUMERIC;
BEGIN
  -- Insert order
  INSERT INTO public.orders (user_id, total_amount, shipping_address_id, status)
  VALUES (p_user_id, p_total_amount, p_shipping_address_id, 'pending')
  RETURNING id INTO v_order_id;

  -- Insert order items and process payout to vendor
  FOR v_item IN SELECT * FROM jsonb_array_elements(p_items) LOOP
    v_item_price := (v_item->>'price')::NUMERIC;
    v_item_qty := (v_item->>'quantity')::INTEGER;
    v_item_shop_id := (v_item->>'shop_id')::UUID;

    INSERT INTO public.order_items (order_id, product_id, variant_id, quantity, price, shop_id)
    VALUES (
      v_order_id,
      (v_item->>'product_id')::UUID,
      (v_item->>'variant_id')::UUID,
      v_item_qty,
      v_item_price,
      v_item_shop_id
    );

    -- Find shop owner to payout
    SELECT owner_id INTO v_shop_owner_id FROM public.shops WHERE id = v_item_shop_id;
    
    -- Check if there is a quota percentage on the shop
    SELECT COALESCE(sales_percentage, 0) INTO v_percentage FROM public.shops WHERE id = v_item_shop_id;

    -- Calculate payout: payout = (price * quantity) * (1.0 + sales_percentage / 100)
    v_payout_amount := (v_item_price * v_item_qty) * (1.0 + (v_percentage / 100.0));

    -- Update vendor's wallet balance
    UPDATE public.profiles
    SET wallet_balance = wallet_balance + v_payout_amount
    WHERE id = v_shop_owner_id;
  END LOOP;

  RETURN json_build_object('success', true, 'order_id', v_order_id);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
