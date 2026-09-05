-- ============================================================
-- Guarantee Payment Migration
-- ============================================================

-- 1. Add guarantee_paid column to order_items
ALTER TABLE public.order_items ADD COLUMN IF NOT EXISTS guarantee_paid BOOLEAN DEFAULT false;

-- 2. Update shop_wallet_transactions type constraint if we want to log it there
-- Wait, we don't log personal wallet deductions in shop_wallet_transactions.
-- We can just deduct from personal wallet. If we want a log, we'd need a personal wallet transaction log, which we don't have yet (or do we?).
-- Actually, we can log it in admin_activity_log or just not log it strictly, since profile.wallet_balance is just updated directly everywhere else.
-- Wait, let's create a new table for wallet_transactions if it doesn't exist? No, let's just deduct it.

-- 3. Create function to pay guarantee
CREATE OR REPLACE FUNCTION public.pay_order_guarantee(
  p_shop_id UUID,
  p_item_ids UUID[]
)
RETURNS JSON AS $$
  v_shop_owner_id UUID;
  v_total_amount NUMERIC := 0;
  v_wallet_balance NUMERIC;
  v_shipping_days INTEGER;
  v_item RECORD;
BEGIN
  -- Get shop owner
  SELECT owner_id INTO v_shop_owner_id FROM public.shops WHERE id = p_shop_id;
  IF v_shop_owner_id IS NULL THEN
    RETURN json_build_object('success', false, 'message', 'Shop not found.');
  END IF;
  
  -- Calculate total for selected items that belong to the shop and haven't been paid
  FOR v_item IN 
    SELECT id, price, quantity 
    FROM public.order_items 
    WHERE id = ANY(p_item_ids) 
    AND shop_id = p_shop_id 
    AND guarantee_paid = false 
  LOOP
    v_total_amount := v_total_amount + (v_item.price * v_item.quantity);
  END LOOP;
  
  IF v_total_amount = 0 THEN
    RETURN json_build_object('success', false, 'message', 'No valid items to pay for.');
  END IF;

  -- Check wallet balance (owner's personal wallet)
  SELECT wallet_balance INTO v_wallet_balance FROM public.profiles WHERE id = v_shop_owner_id;
  IF v_wallet_balance < v_total_amount THEN
    RETURN json_build_object('success', false, 'message', 'Insufficient wallet balance.');
  END IF;
  
  -- Deduct wallet
  UPDATE public.profiles 
  SET wallet_balance = wallet_balance - v_total_amount 
  WHERE id = v_shop_owner_id;
  
  -- Mark items as paid
  UPDATE public.order_items 
  SET guarantee_paid = true 
  WHERE id = ANY(p_item_ids) 
  AND shop_id = p_shop_id;
  
  -- Get configured shipping days
  SELECT COALESCE(shipping_days, 3) INTO v_shipping_days FROM public.quota_settings WHERE id = 1;

  -- Also mark the parent order status to processing if it's currently pending
  -- And update the expected delivery date so the cooldown starts from payment time
  UPDATE public.orders 
  SET 
    status = 'processing',
    expected_delivery_date = timezone('utc', now()) + (v_shipping_days || ' days')::INTERVAL
  WHERE id IN (
    SELECT order_id FROM public.order_items WHERE id = ANY(p_item_ids) AND shop_id = p_shop_id
  ) AND status = 'pending';
  
  RETURN json_build_object('success', true, 'amount_deducted', v_total_amount);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
