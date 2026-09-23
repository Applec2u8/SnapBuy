-- Fix run_bot_job: Add price_min / price_max filtering for 'custom' price preference
-- Run this in Supabase SQL Editor > New Query

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
  
  DECLARE
    v_target_total_qty INTEGER;
    v_remaining_qty INTEGER;
    v_max_for_this_bot INTEGER;
  BEGIN
    -- ใช้จำนวนสินค้าสูงสุดที่ผู้ใช้กำหนดเป็นเป้าหมายเป๊ะๆ (ไม่ต้องสุ่มลดลง)
    v_target_total_qty := job.items_per_order_max;
    v_remaining_qty := v_target_total_qty;

    -- ป้องกันไม่ให้จำนวนบอท มากกว่าจำนวนสินค้าที่จะซื้อ (เพราะบอท 1 ตัวต้องซื้ออย่างน้อย 1 ชิ้น)
    IF v_actual_runs > v_remaining_qty THEN
      v_actual_runs := v_remaining_qty;
    END IF;

    FOR i IN 1..v_actual_runs LOOP
      IF v_remaining_qty <= 0 THEN EXIT; END IF;

      SELECT id INTO v_bot_id FROM profiles WHERE is_bot = true ORDER BY random() LIMIT 1;
      IF v_bot_id IS NULL THEN CONTINUE; END IF;

      SELECT id INTO v_address_id FROM user_addresses WHERE user_id = v_bot_id LIMIT 1;
      IF v_address_id IS NULL THEN
        INSERT INTO user_addresses (user_id, full_name, phone, province, city, district, postal_code, address_line, is_default)
        VALUES (v_bot_id, 'Bot Customer', '08' || lpad(floor(random() * 100000000)::text, 8, '0'), 'Bangkok', 'Bangkok', 'Pathum Wan', '10330', floor(random() * 999)::text || '/' || floor(random() * 99)::text || ' Bot Street', true)
        RETURNING id INTO v_address_id;
      END IF;

      -- ── Product selection with price range support ──────────────────────────
      IF job.price_preference = 'cheap' THEN
        SELECT * INTO v_product FROM products WHERE shop_id = job.shop_id AND is_published = true AND stock_quantity > 0 ORDER BY price ASC LIMIT 1;
      ELSIF job.price_preference = 'expensive' THEN
        SELECT * INTO v_product FROM products WHERE shop_id = job.shop_id AND is_published = true AND stock_quantity > 0 ORDER BY price DESC LIMIT 1;
      ELSIF job.price_min IS NOT NULL OR job.price_max IS NOT NULL THEN
        SELECT * INTO v_product FROM products
        WHERE shop_id = job.shop_id AND is_published = true AND stock_quantity > 0
          AND (job.price_min IS NULL OR price >= job.price_min)
          AND (job.price_max IS NULL OR price <= job.price_max)
        ORDER BY random() LIMIT 1;
      ELSE
        SELECT * INTO v_product FROM products WHERE shop_id = job.shop_id AND is_published = true AND stock_quantity > 0 ORDER BY random() LIMIT 1;
      END IF;
      -- ────────────────────────────────────────────────────────────────────────

      IF v_product IS NULL THEN CONTINUE; END IF;

      -- แบ่งจำนวนสินค้าให้บอทตัวนี้
      IF i = v_actual_runs THEN
        v_quantity := v_remaining_qty; -- บอทตัวสุดท้าย เหมาจำนวนที่เหลือ
      ELSE
        -- สุ่มจำนวนชิ้น โดยต้องเหลือไว้ให้บอทตัวอื่นอย่างน้อยตัวละ 1 ชิ้น
        v_max_for_this_bot := v_remaining_qty - (v_actual_runs - i);
        v_quantity := floor(random() * v_max_for_this_bot) + 1;
      END IF;

      IF v_quantity > v_product.stock_quantity THEN v_quantity := v_product.stock_quantity; END IF;
      IF v_quantity <= 0 THEN CONTINUE; END IF;

      v_price := v_product.price;


      -- ── ไม่มีการตัด Cap quantity ตาม price_max แล้ว ──────────
      -- (ให้ price_max กรองเฉพาะราคาสินค้าต่อหน่วยตอน SELECT เท่านั้น)

      IF v_quantity <= 0 THEN CONTINUE; END IF;

      v_remaining_qty := v_remaining_qty - v_quantity;
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
END;
$function$;
