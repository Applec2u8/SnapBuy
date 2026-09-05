-- 1. Add shipping_days to quota_settings
ALTER TABLE public.quota_settings ADD COLUMN IF NOT EXISTS shipping_days INTEGER DEFAULT 3;

-- 2. Add expected_delivery_date to orders
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS expected_delivery_date TIMESTAMP WITH TIME ZONE;

-- 3. Update place_order to NOT credit wallet immediately, and to set expected_delivery_date
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
  v_shipping_days  INTEGER;
BEGIN
  -- Get configured shipping days
  SELECT COALESCE(shipping_days, 3) INTO v_shipping_days FROM public.quota_settings WHERE id = 1;

  -- Insert the order header with expected delivery date
  INSERT INTO public.orders (user_id, total_amount, shipping_address_id, status, expected_delivery_date)
  VALUES (p_user_id, p_total_amount, p_shipping_address_id, 'pending', timezone('utc', now()) + (v_shipping_days || ' days')::INTERVAL)
  RETURNING id INTO v_order_id;

  -- Process each order item (NO WALLET UPDATES YET)
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
  END LOOP;

  RETURN json_build_object('success', true, 'order_id', v_order_id);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- 4. Function to mark order as delivered and process payouts
CREATE OR REPLACE FUNCTION public.mark_order_delivered(p_order_id UUID)
RETURNS JSON AS $$
DECLARE
  v_order_status TEXT;
  v_item RECORD;
  v_shop_id UUID;
  v_percentage NUMERIC;
  v_sale_amount NUMERIC;
  v_bonus_amount NUMERIC;
BEGIN
  -- Check if order exists and is not already delivered
  SELECT status INTO v_order_status FROM public.orders WHERE id = p_order_id;
  
  IF v_order_status IS NULL THEN
    RETURN json_build_object('success', false, 'message', 'Order not found');
  END IF;

  IF v_order_status = 'delivered' THEN
    RETURN json_build_object('success', false, 'message', 'Order is already delivered');
  END IF;

  -- Update order status
  UPDATE public.orders SET status = 'delivered' WHERE id = p_order_id;

  -- Process payouts for each item in the order
  FOR v_item IN (SELECT shop_id, price, quantity FROM public.order_items WHERE order_id = p_order_id) LOOP
    v_shop_id := v_item.shop_id;
    
    -- Get the shop's active sales_percentage bonus
    SELECT COALESCE(sales_percentage, 0) INTO v_percentage FROM public.shops WHERE id = v_shop_id;

    -- Calculate amounts
    v_sale_amount := v_item.price * v_item.quantity;
    v_bonus_amount := v_sale_amount * (v_percentage / 100.0);

    -- Update shop balances
    UPDATE public.shops
    SET
      sale_balance  = COALESCE(sale_balance,  0) + v_sale_amount,
      bonus_balance = COALESCE(bonus_balance, 0) + v_bonus_amount
    WHERE id = v_shop_id;

    -- Record transactions
    INSERT INTO public.shop_wallet_transactions (shop_id, type, amount, note)
    VALUES (v_shop_id, 'sale', v_sale_amount, 'Order ' || p_order_id::TEXT);

    IF v_bonus_amount > 0 THEN
      INSERT INTO public.shop_wallet_transactions (shop_id, type, amount, note)
      VALUES (v_shop_id, 'bonus', v_bonus_amount, v_percentage::TEXT || '% bonus on Order ' || p_order_id::TEXT);
    END IF;
  END LOOP;

  RETURN json_build_object('success', true);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. Enable pg_cron and schedule auto-delivery
CREATE EXTENSION IF NOT EXISTS pg_cron WITH SCHEMA pg_catalog;

CREATE OR REPLACE FUNCTION public.process_auto_deliveries()
RETURNS void AS $$
DECLARE
  v_order RECORD;
BEGIN
  FOR v_order IN 
    SELECT id FROM public.orders 
    WHERE status = 'pending' 
      AND expected_delivery_date <= timezone('utc', now())
  LOOP
    PERFORM public.mark_order_delivered(v_order.id);
  END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Remove existing job if any to avoid duplicates on re-run
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM cron.job WHERE jobname = 'process_auto_deliveries_job') THEN
    PERFORM cron.unschedule('process_auto_deliveries_job');
  END IF;
EXCEPTION WHEN OTHERS THEN
  -- Ignore if cron.job table is not accessible
END $$;

-- Schedule the job to run every hour
SELECT cron.schedule(
  'process_auto_deliveries_job',
  '0 * * * *',
  'SELECT public.process_auto_deliveries()'
);
