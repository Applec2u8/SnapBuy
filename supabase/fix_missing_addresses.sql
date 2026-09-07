-- 1. Ensure all bots have an address
INSERT INTO public.user_addresses (
  user_id, 
  full_name, 
  phone, 
  province, 
  city, 
  district, 
  postal_code, 
  address_line, 
  is_default
)
SELECT 
  p.id, 
  p.full_name, 
  '08' || lpad(floor(random() * 100000000)::text, 8, '0'),
  'Bangkok', 
  'Bangkok', 
  'Pathum Wan', 
  '10330', 
  floor(random() * 999)::text || '/' || floor(random() * 99)::text || ' Bot Street', 
  true
FROM public.profiles p
WHERE p.is_bot = true
AND NOT EXISTS (
  SELECT 1 FROM public.user_addresses ua WHERE ua.user_id = p.id
);

-- 2. Ensure all orders have shipping_address_id linked to the bot's address
UPDATE public.orders o
SET shipping_address_id = (
  SELECT id FROM public.user_addresses ua WHERE ua.user_id = o.user_id LIMIT 1
)
WHERE o.shipping_address_id IS NULL
AND EXISTS (
  SELECT 1 FROM public.profiles p WHERE p.id = o.user_id AND p.is_bot = true
);

-- 3. Update run_bot_job to create random address if missing
CREATE OR REPLACE FUNCTION public.run_bot_job(p_job_id UUID)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  job RECORD;
  v_bot_id UUID;
  v_product RECORD;
  v_order_id UUID;
  v_quantity INTEGER;
  v_price DECIMAL;
  v_total DECIMAL;
  v_address_id UUID;
  i INTEGER;
  v_bots_run INTEGER := 0;
  v_actual_runs INTEGER;
BEGIN
  SELECT * INTO job FROM bot_simulation_jobs WHERE id = p_job_id AND status = 'active';
  IF NOT FOUND THEN RETURN json_build_object('success', false, 'message', 'Job not active or not found'); END IF;
  IF job.max_runs IS NOT NULL AND job.max_runs <= 0 THEN RETURN json_build_object('success', false, 'message', 'Job has reached max runs'); END IF;

  v_actual_runs := floor(random() * (job.bot_count_max - job.bot_count_min + 1))::int + job.bot_count_min;
  
  FOR i IN 1..v_actual_runs LOOP
    SELECT id INTO v_bot_id FROM profiles WHERE is_bot = true ORDER BY random() LIMIT 1;
    IF v_bot_id IS NULL THEN CONTINUE; END IF;

    SELECT id INTO v_address_id FROM user_addresses WHERE user_id = v_bot_id LIMIT 1;
    IF v_address_id IS NULL THEN
      INSERT INTO user_addresses (user_id, full_name, phone, province, city, district, postal_code, address_line, is_default)
      VALUES (v_bot_id, 'Bot Customer', '08' || lpad(floor(random() * 100000000)::text, 8, '0'), 'Bangkok', 'Bangkok', 'Pathum Wan', '10330', floor(random() * 999)::text || '/' || floor(random() * 99)::text || ' Bot Street', true)
      RETURNING id INTO v_address_id;
    END IF;

    IF job.price_preference = 'cheap' THEN
      SELECT * INTO v_product FROM products WHERE shop_id = job.shop_id AND is_published = true AND stock_quantity > 0 ORDER BY price ASC LIMIT 1;
    ELSIF job.price_preference = 'expensive' THEN
      SELECT * INTO v_product FROM products WHERE shop_id = job.shop_id AND is_published = true AND stock_quantity > 0 ORDER BY price DESC LIMIT 1;
    ELSE
      SELECT * INTO v_product FROM products WHERE shop_id = job.shop_id AND is_published = true AND stock_quantity > 0 ORDER BY random() LIMIT 1;
    END IF;

    IF v_product IS NULL THEN CONTINUE; END IF;

    v_quantity := floor(random() * (job.items_per_order_max - job.items_per_order_min + 1)) + job.items_per_order_min;
    IF v_quantity > v_product.stock_quantity THEN v_quantity := v_product.stock_quantity; END IF;
    IF v_quantity <= 0 THEN CONTINUE; END IF;

    v_price := v_product.price;
    v_total := v_price * v_quantity;

    INSERT INTO orders (user_id, total_amount, status, shipping_address_id)
    VALUES (v_bot_id, v_total, 'pending', v_address_id)
    RETURNING id INTO v_order_id;

    INSERT INTO order_items (order_id, product_id, quantity, price, shop_id)
    VALUES (v_order_id, v_product.id, v_quantity, v_price, job.shop_id);

    UPDATE products SET stock_quantity = stock_quantity - v_quantity WHERE id = v_product.id;
    v_bots_run := v_bots_run + 1;
  END LOOP;

  IF job.max_runs IS NOT NULL THEN
    UPDATE bot_simulation_jobs 
    SET last_run_at = NOW(), 
        max_runs = max_runs - 1,
        status = CASE WHEN (max_runs - 1) <= 0 THEN 'paused' ELSE 'active' END
    WHERE id = job.id;
  ELSE
    UPDATE bot_simulation_jobs SET last_run_at = NOW() WHERE id = job.id;
  END IF;

  RETURN json_build_object('success', true, 'bots_run', v_bots_run);
END;
$function$;
