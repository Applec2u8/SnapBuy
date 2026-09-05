-- ============================================================
-- Stock Deduction Migration
-- เพิ่มการหักสต็อกสินค้า (stock_quantity) เมื่อมีการสั่งซื้อ
-- ============================================================

-- 1. อัปเดต place_order ให้หักสต็อกพร้อมสั่งซื้อ
DROP FUNCTION IF EXISTS public.place_order(uuid, numeric, uuid, jsonb);
CREATE OR REPLACE FUNCTION public.place_order(
  p_user_id            UUID,
  p_total_amount       NUMERIC,
  p_shipping_address_id UUID,
  p_items              JSONB
)
RETURNS JSON AS $$
DECLARE
  v_order_id        UUID;
  v_item            JSONB;
  v_shop_id         UUID;
  v_item_price      NUMERIC;
  v_item_qty        INTEGER;
  v_product_id      UUID;
  v_variant_id      UUID;
  v_shipping_days   INTEGER;
  v_current_stock   INTEGER;
BEGIN
  -- Get configured shipping days
  SELECT COALESCE(shipping_days, 3) INTO v_shipping_days FROM public.quota_settings WHERE id = 1;

  -- Insert the order header with expected delivery date
  INSERT INTO public.orders (user_id, total_amount, shipping_address_id, status, expected_delivery_date)
  VALUES (p_user_id, p_total_amount, p_shipping_address_id, 'pending', timezone('utc', now()) + (v_shipping_days || ' days')::INTERVAL)
  RETURNING id INTO v_order_id;

  -- Process each order item
  FOR v_item IN SELECT * FROM jsonb_array_elements(p_items) LOOP
    v_item_price := (v_item->>'price')::NUMERIC;
    v_item_qty   := (v_item->>'quantity')::INTEGER;
    v_shop_id    := (v_item->>'shop_id')::UUID;
    v_product_id := (v_item->>'product_id')::UUID;
    v_variant_id := NULLIF(v_item->>'variant_id', '')::UUID;

    -- ── Stock check & deduction ──────────────────────────────────
    IF v_variant_id IS NOT NULL THEN
      -- Variant exists: check and deduct variant stock
      SELECT stock_quantity INTO v_current_stock
        FROM public.product_variants
        WHERE id = v_variant_id;

      IF v_current_stock IS NULL THEN
        RAISE EXCEPTION 'Variant not found: %', v_variant_id;
      END IF;

      IF v_current_stock < v_item_qty THEN
        RAISE EXCEPTION 'Insufficient stock for variant %. Available: %, Requested: %',
          v_variant_id, v_current_stock, v_item_qty;
      END IF;

      UPDATE public.product_variants
        SET stock_quantity = stock_quantity - v_item_qty
        WHERE id = v_variant_id;

      -- Also sync parent product stock (sum of variants)
      UPDATE public.products
        SET stock_quantity = (
          SELECT COALESCE(SUM(stock_quantity), 0)
          FROM public.product_variants
          WHERE product_id = v_product_id
        )
        WHERE id = v_product_id;

    ELSE
      -- No variant: check and deduct product stock directly
      SELECT stock_quantity INTO v_current_stock
        FROM public.products
        WHERE id = v_product_id;

      IF v_current_stock IS NULL THEN
        RAISE EXCEPTION 'Product not found: %', v_product_id;
      END IF;

      IF v_current_stock < v_item_qty THEN
        RAISE EXCEPTION 'Insufficient stock for product %. Available: %, Requested: %',
          v_product_id, v_current_stock, v_item_qty;
      END IF;

      UPDATE public.products
        SET stock_quantity = stock_quantity - v_item_qty
        WHERE id = v_product_id;
    END IF;
    -- ─────────────────────────────────────────────────────────────

    -- Insert order item row
    INSERT INTO public.order_items (order_id, product_id, variant_id, quantity, price, shop_id)
    VALUES (
      v_order_id,
      v_product_id,
      v_variant_id,
      v_item_qty,
      v_item_price,
      v_shop_id
    );
  END LOOP;

  RETURN json_build_object('success', true, 'order_id', v_order_id);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
