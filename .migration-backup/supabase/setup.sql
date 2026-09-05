-- =====================================================================
-- SnapBuy — Complete Database Setup (Single File)
-- Run this ONCE on a fresh Supabase project.
-- =====================================================================

-- Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS pg_cron;
GRANT USAGE ON SCHEMA cron TO postgres;

-- =====================================================================
-- TABLES
-- =====================================================================

CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  role TEXT DEFAULT 'customer' CHECK (role IN ('customer', 'vendor', 'admin')),
  allow_credit_card BOOLEAN DEFAULT false,
  wallet_balance NUMERIC DEFAULT 0 CHECK (wallet_balance >= 0),
  token_balance NUMERIC DEFAULT 0 CHECK (token_balance >= 0),
  auto_boost_enabled BOOLEAN DEFAULT false,
  auto_boost_amount INTEGER DEFAULT 100,
  auto_boost_frequency TEXT DEFAULT 'hourly',
  auto_like_boost_enabled BOOLEAN DEFAULT false,
  auto_like_boost_amount INTEGER DEFAULT 100,
  auto_like_boost_frequency TEXT DEFAULT 'hourly',
  last_auto_boost_at TIMESTAMP WITH TIME ZONE,
  last_auto_like_boost_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS shops (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  owner_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  logo_url TEXT,
  banner_url TEXT,
  is_verified BOOLEAN DEFAULT false,
  location TEXT,
  phone TEXT,
  contact_info TEXT,
  product_limit INTEGER DEFAULT 10,
  category_limit INTEGER DEFAULT 3,
  quota_expires_at TIMESTAMP WITH TIME ZONE,
  price NUMERIC DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS quota_packages (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  product_limit INTEGER NOT NULL DEFAULT 10,
  category_limit INTEGER NOT NULL DEFAULT 3,
  duration_days INTEGER,
  price NUMERIC NOT NULL DEFAULT 0,
  badge TEXT,
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS quota_history (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  shop_id UUID REFERENCES shops(id) ON DELETE CASCADE NOT NULL,
  type TEXT NOT NULL DEFAULT 'purchase' CHECK (type IN ('purchase', 'code_redeem', 'admin_set')),
  amount INTEGER NOT NULL DEFAULT 0,
  category_amount INTEGER DEFAULT 0,
  duration_days INTEGER,
  source TEXT,
  cost NUMERIC DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS store_quotas (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  code TEXT UNIQUE NOT NULL,
  product_limit INTEGER NOT NULL,
  category_limit INTEGER DEFAULT 3,
  duration_days INTEGER,
  is_used BOOLEAN DEFAULT false,
  used_by_shop_id UUID REFERENCES shops(id) ON DELETE SET NULL,
  used_at TIMESTAMP WITH TIME ZONE,
  created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS shop_categories (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  shop_id UUID REFERENCES shops(id) ON DELETE CASCADE NOT NULL,
  category_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE (shop_id, category_id)
);

CREATE TABLE IF NOT EXISTS categories (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  icon TEXT,
  slug TEXT UNIQUE NOT NULL,
  parent_id UUID REFERENCES categories(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS products (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  shop_id UUID REFERENCES shops(id) ON DELETE CASCADE NOT NULL,
  category_id UUID REFERENCES categories(id),
  name TEXT NOT NULL,
  description TEXT,
  price DECIMAL(12, 2) NOT NULL,
  compare_at_price DECIMAL(12, 2),
  stock_quantity INTEGER DEFAULT 0,
  images TEXT[] DEFAULT '{}',
  is_published BOOLEAN DEFAULT true,
  brand TEXT,
  ratings_count INTEGER DEFAULT 0,
  average_rating DECIMAL(3,2) DEFAULT 0,
  highlights TEXT[] DEFAULT '{}',
  view_count INTEGER DEFAULT 0,
  like_count INTEGER DEFAULT 0,
  comment_count INTEGER DEFAULT 0,
  is_promoted BOOLEAN DEFAULT false,
  promote_type TEXT,
  promoted_at TIMESTAMP WITH TIME ZONE,
  promoted_until TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS product_variants (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  product_id UUID REFERENCES products(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  value TEXT NOT NULL,
  price_override DECIMAL(12, 2),
  stock_quantity INTEGER DEFAULT 0,
  image_url TEXT,
  sku TEXT UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS product_boosts (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  product_id UUID REFERENCES products(id) ON DELETE CASCADE NOT NULL,
  shop_id UUID REFERENCES shops(id) ON DELETE CASCADE NOT NULL,
  boost_type TEXT NOT NULL DEFAULT 'views' CHECK (boost_type IN ('views','likes')),
  duration_key TEXT NOT NULL DEFAULT 'hour',
  boost_per_min INTEGER NOT NULL DEFAULT 1,
  cost NUMERIC NOT NULL DEFAULT 0,
  started_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS user_addresses (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  full_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  province TEXT NOT NULL,
  city TEXT NOT NULL,
  district TEXT NOT NULL,
  postal_code TEXT NOT NULL,
  address_line TEXT NOT NULL,
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS orders (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  shop_id UUID REFERENCES shops(id) ON DELETE CASCADE,
  total_price DECIMAL(12, 2),
  total_amount DECIMAL(12, 2) NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending','processing','confirmed','shipped','delivered','cancelled')),
  shipping_address_id UUID REFERENCES user_addresses(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS order_items (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE NOT NULL,
  product_id UUID REFERENCES products(id) ON DELETE SET NULL,
  variant_id UUID REFERENCES product_variants(id) ON DELETE SET NULL,
  quantity INTEGER NOT NULL,
  price DECIMAL(12, 2) NOT NULL,
  shop_id UUID REFERENCES shops(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS reviews (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  product_id UUID REFERENCES products(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5) NOT NULL,
  comment TEXT,
  images TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS user_payment_methods (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  brand TEXT NOT NULL,
  last4 TEXT NOT NULL,
  cardholder_name TEXT NOT NULL,
  expiry_date TEXT NOT NULL,
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS admin_activity_log (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  admin_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  action_type TEXT NOT NULL,
  target_type TEXT NOT NULL,
  target_id TEXT,
  target_name TEXT,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE TABLE IF NOT EXISTS site_settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  description TEXT,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS support_channels (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  channel_type TEXT NOT NULL,
  label TEXT NOT NULL,
  value TEXT NOT NULL DEFAULT '',
  is_enabled BOOLEAN NOT NULL DEFAULT false,
  icon TEXT NOT NULL DEFAULT 'phone',
  sort_order INTEGER NOT NULL DEFAULT 0,
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS conversations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  shop_id UUID REFERENCES shops(id) ON DELETE CASCADE NOT NULL,
  last_message TEXT,
  last_message_at TIMESTAMPTZ DEFAULT now(),
  unread_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE NOT NULL,
  sender_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  content TEXT NOT NULL,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- =====================================================================
-- INDEXES
-- =====================================================================
CREATE INDEX IF NOT EXISTS user_payment_methods_user_id_idx ON user_payment_methods(user_id);
CREATE INDEX IF NOT EXISTS admin_activity_log_created_at_idx ON admin_activity_log(created_at DESC);
CREATE INDEX IF NOT EXISTS product_boosts_product_id_idx ON product_boosts(product_id);
CREATE INDEX IF NOT EXISTS product_boosts_shop_id_idx ON product_boosts(shop_id);
CREATE INDEX IF NOT EXISTS quota_history_shop_id_idx ON quota_history(shop_id);

-- =====================================================================
-- ENABLE ROW LEVEL SECURITY
-- =====================================================================
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE shops ENABLE ROW LEVEL SECURITY;
ALTER TABLE quota_packages ENABLE ROW LEVEL SECURITY;
ALTER TABLE quota_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE store_quotas ENABLE ROW LEVEL SECURITY;
ALTER TABLE shop_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_boosts ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_payment_methods ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_activity_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE support_channels ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- =====================================================================
-- HELPER FUNCTIONS
-- =====================================================================
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE OR REPLACE FUNCTION is_order_buyer(p_order_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (SELECT 1 FROM orders WHERE id = p_order_id AND user_id = auth.uid());
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION is_order_vendor(p_order_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (SELECT 1 FROM order_items WHERE order_id = p_order_id AND shop_id IN (SELECT id FROM shops WHERE owner_id = auth.uid()));
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION is_item_vendor(p_shop_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (SELECT 1 FROM shops WHERE id = p_shop_id AND owner_id = auth.uid());
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================================
-- RLS POLICIES
-- =====================================================================
CREATE POLICY "profiles_select_all" ON profiles FOR SELECT USING (true);
CREATE POLICY "profiles_update_own" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "profiles_admin_update" ON profiles FOR UPDATE USING (public.is_admin()) WITH CHECK (public.is_admin());

CREATE POLICY "shops_select_all" ON shops FOR SELECT USING (true);
CREATE POLICY "shops_vendor_manage" ON shops FOR ALL USING (auth.uid() = owner_id);
CREATE POLICY "shops_admin_all" ON shops FOR ALL USING (public.is_admin());

CREATE POLICY "qpkg_select_all" ON quota_packages FOR SELECT USING (true);
CREATE POLICY "qpkg_admin_all" ON quota_packages FOR ALL USING (public.is_admin());

CREATE POLICY "qhist_vendor_select" ON quota_history FOR SELECT USING (shop_id IN (SELECT id FROM shops WHERE owner_id = auth.uid()));
CREATE POLICY "qhist_admin_all" ON quota_history FOR ALL USING (public.is_admin());

CREATE POLICY "squota_admin_select" ON store_quotas FOR SELECT USING (public.is_admin());
CREATE POLICY "squota_admin_insert" ON store_quotas FOR INSERT WITH CHECK (public.is_admin());
CREATE POLICY "squota_owner_select" ON store_quotas FOR SELECT USING (used_by_shop_id IN (SELECT id FROM shops WHERE owner_id = auth.uid()));

CREATE POLICY "shopcat_select_all" ON shop_categories FOR SELECT USING (true);
CREATE POLICY "shopcat_vendor_all" ON shop_categories FOR ALL USING (shop_id IN (SELECT id FROM shops WHERE owner_id = auth.uid()));
CREATE POLICY "shopcat_admin_all" ON shop_categories FOR ALL USING (public.is_admin());

CREATE POLICY "cats_select_all" ON categories FOR SELECT USING (true);
CREATE POLICY "cats_auth_insert" ON categories FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "products_select_pub" ON products FOR SELECT USING (is_published = true);
CREATE POLICY "products_vendor_all" ON products FOR ALL USING (EXISTS (SELECT 1 FROM shops WHERE shops.id = products.shop_id AND shops.owner_id = auth.uid()));
CREATE POLICY "products_admin_all" ON products FOR ALL USING (public.is_admin());

CREATE POLICY "variants_select_all" ON product_variants FOR SELECT USING (true);
CREATE POLICY "variants_vendor_all" ON product_variants FOR ALL USING (EXISTS (SELECT 1 FROM products p JOIN shops s ON p.shop_id = s.id WHERE p.id = product_variants.product_id AND s.owner_id = auth.uid()));

CREATE POLICY "boosts_select_all" ON product_boosts FOR SELECT USING (true);
CREATE POLICY "boosts_vendor_all" ON product_boosts FOR ALL USING (shop_id IN (SELECT id FROM shops WHERE owner_id = auth.uid()));
CREATE POLICY "boosts_admin_all" ON product_boosts FOR ALL USING (public.is_admin());

CREATE POLICY "addr_own_all" ON user_addresses FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "orders_insert_own" ON orders FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "orders_view" ON orders FOR SELECT USING (auth.uid() = user_id OR is_order_vendor(id));
CREATE POLICY "orders_admin_all" ON orders FOR ALL USING (public.is_admin());

CREATE POLICY "oitems_insert" ON order_items FOR INSERT WITH CHECK (is_order_buyer(order_id));
CREATE POLICY "oitems_view" ON order_items FOR SELECT USING (is_order_buyer(order_id) OR is_item_vendor(shop_id));

CREATE POLICY "reviews_select_all" ON reviews FOR SELECT USING (true);
CREATE POLICY "reviews_own_all" ON reviews FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "pay_select_own" ON user_payment_methods FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "pay_insert_own" ON user_payment_methods FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "pay_update_own" ON user_payment_methods FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "pay_delete_own" ON user_payment_methods FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "alog_select_all" ON admin_activity_log FOR SELECT USING (true);
CREATE POLICY "alog_insert_own" ON admin_activity_log FOR INSERT WITH CHECK (admin_id = auth.uid());

CREATE POLICY "settings_select_all" ON site_settings FOR SELECT USING (true);
CREATE POLICY "settings_admin_all" ON site_settings FOR ALL USING (public.is_admin());

CREATE POLICY "schan_select_enabled" ON support_channels FOR SELECT USING (is_enabled = true);
CREATE POLICY "schan_admin_select" ON support_channels FOR SELECT USING (public.is_admin());
CREATE POLICY "schan_admin_all" ON support_channels FOR ALL USING (public.is_admin());

CREATE POLICY "conv_user_select" ON conversations FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "conv_admin_select" ON conversations FOR SELECT USING (public.is_admin());
CREATE POLICY "conv_admin_update" ON conversations FOR UPDATE USING (public.is_admin());
CREATE POLICY "conv_vendor_select" ON conversations FOR SELECT USING (shop_id IN (SELECT id FROM shops WHERE owner_id = auth.uid()));

CREATE POLICY "msg_conv_select" ON messages FOR SELECT USING (conversation_id IN (SELECT id FROM conversations WHERE user_id = auth.uid() OR shop_id IN (SELECT id FROM shops WHERE owner_id = auth.uid())));
CREATE POLICY "msg_admin_select" ON messages FOR SELECT USING (public.is_admin());
CREATE POLICY "msg_admin_insert" ON messages FOR INSERT WITH CHECK (public.is_admin());
CREATE POLICY "msg_admin_update" ON messages FOR UPDATE USING (public.is_admin());
CREATE POLICY "msg_auth_insert" ON messages FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- =====================================================================
-- FUNCTIONS & TRIGGERS
-- =====================================================================

-- New user -> create profile
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, avatar_url, role, allow_credit_card, wallet_balance, token_balance)
  VALUES (new.id, new.email, COALESCE(new.raw_user_meta_data->>'full_name',''), COALESCE(new.raw_user_meta_data->>'avatar_url',''), 'customer', false, 0, 0);
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users FOR EACH ROW EXECUTE PROCEDURE handle_new_user();

-- Enforce product limit
CREATE OR REPLACE FUNCTION enforce_shop_product_limit()
RETURNS TRIGGER AS $$
DECLARE v_limit INTEGER; v_expires TIMESTAMP WITH TIME ZONE; v_count INTEGER;
BEGIN
  SELECT product_limit, quota_expires_at INTO v_limit, v_expires FROM shops WHERE id = NEW.shop_id;
  IF NOT FOUND THEN RAISE EXCEPTION 'Shop not found.'; END IF;
  IF v_expires IS NOT NULL AND v_expires < timezone('utc'::text, now()) THEN RAISE EXCEPTION 'Your store quota has expired. Please purchase a new quota package.'; END IF;
  SELECT COUNT(*) INTO v_count FROM products WHERE shop_id = NEW.shop_id;
  IF v_count >= v_limit THEN RAISE EXCEPTION 'You have reached your product limit of %. Please upgrade your quota.', v_limit; END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_enforce_shop_product_limit ON products;
CREATE TRIGGER trg_enforce_shop_product_limit BEFORE INSERT ON products FOR EACH ROW EXECUTE FUNCTION enforce_shop_product_limit();

-- Admin top-up wallet
CREATE OR REPLACE FUNCTION public.admin_top_up_wallet(target_user_id UUID, amount NUMERIC, is_token BOOLEAN DEFAULT false)
RETURNS JSON AS $$
DECLARE new_wallet NUMERIC;
BEGIN
  IF NOT public.is_admin() THEN RAISE EXCEPTION 'Unauthorized: admin only'; END IF;
  IF amount <= 0 THEN RAISE EXCEPTION 'Amount must be positive'; END IF;
  UPDATE public.profiles SET wallet_balance = wallet_balance + amount WHERE id = target_user_id RETURNING wallet_balance INTO new_wallet;
  IF NOT FOUND THEN RAISE EXCEPTION 'User not found'; END IF;
  RETURN json_build_object('success', true, 'wallet_balance', new_wallet);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Admin deduct wallet
CREATE OR REPLACE FUNCTION public.admin_deduct_wallet(target_user_id UUID, amount NUMERIC, is_token BOOLEAN DEFAULT false)
RETURNS JSON AS $$
DECLARE new_wallet NUMERIC;
BEGIN
  IF NOT public.is_admin() THEN RAISE EXCEPTION 'Unauthorized: admin only'; END IF;
  IF amount <= 0 THEN RAISE EXCEPTION 'Amount must be positive'; END IF;
  UPDATE public.profiles SET wallet_balance = GREATEST(0, wallet_balance - amount) WHERE id = target_user_id RETURNING wallet_balance INTO new_wallet;
  IF NOT FOUND THEN RAISE EXCEPTION 'User not found'; END IF;
  RETURN json_build_object('success', true, 'wallet_balance', new_wallet);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Pay with wallet
CREATE OR REPLACE FUNCTION public.pay_with_wallet(p_amount NUMERIC)
RETURNS JSON AS $$
DECLARE cur NUMERIC; nw NUMERIC;
BEGIN
  SELECT wallet_balance INTO cur FROM public.profiles WHERE id = auth.uid() FOR UPDATE;
  IF cur IS NULL THEN RAISE EXCEPTION 'User profile not found'; END IF;
  IF cur < p_amount THEN RAISE EXCEPTION 'Insufficient wallet balance. Need % but have %', p_amount, cur; END IF;
  UPDATE public.profiles SET wallet_balance = wallet_balance - p_amount WHERE id = auth.uid() RETURNING wallet_balance INTO nw;
  RETURN json_build_object('success', true, 'new_balance', nw);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Buy quota package
CREATE OR REPLACE FUNCTION public.buy_quota_package(p_shop_id UUID, p_package_id UUID)
RETURNS JSON AS $$
DECLARE
  v_pkg quota_packages%ROWTYPE; v_shop shops%ROWTYPE;
  v_owner UUID; v_wallet NUMERIC; v_expires TIMESTAMP WITH TIME ZONE;
BEGIN
  SELECT owner_id INTO v_owner FROM shops WHERE id = p_shop_id;
  IF v_owner IS NULL OR v_owner != auth.uid() THEN RAISE EXCEPTION 'Unauthorized: you do not own this shop.'; END IF;
  SELECT * INTO v_pkg FROM quota_packages WHERE id = p_package_id AND is_active = true;
  IF NOT FOUND THEN RAISE EXCEPTION 'Package not found or inactive.'; END IF;
  SELECT wallet_balance INTO v_wallet FROM profiles WHERE id = auth.uid() FOR UPDATE;
  IF v_wallet < v_pkg.price THEN RAISE EXCEPTION 'Insufficient wallet balance. Need $% but have $%.', v_pkg.price, v_wallet; END IF;
  UPDATE profiles SET wallet_balance = wallet_balance - v_pkg.price WHERE id = auth.uid();
  SELECT * INTO v_shop FROM shops WHERE id = p_shop_id;
  IF v_pkg.duration_days IS NOT NULL THEN
    IF v_shop.quota_expires_at IS NOT NULL AND v_shop.quota_expires_at > now() THEN
      v_expires := v_shop.quota_expires_at + (v_pkg.duration_days || ' days')::interval;
    ELSE
      v_expires := now() + (v_pkg.duration_days || ' days')::interval;
    END IF;
  END IF;
  UPDATE shops SET product_limit = GREATEST(product_limit,0) + v_pkg.product_limit, category_limit = GREATEST(category_limit,0) + v_pkg.category_limit, quota_expires_at = v_expires WHERE id = p_shop_id;
  INSERT INTO quota_history (shop_id, type, amount, category_amount, duration_days, source, cost) VALUES (p_shop_id, 'purchase', v_pkg.product_limit, v_pkg.category_limit, v_pkg.duration_days, v_pkg.name, v_pkg.price);
  RETURN json_build_object('success', true, 'message', 'Quota purchased successfully.', 'expires_at', v_expires);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Redeem quota code
CREATE OR REPLACE FUNCTION redeem_store_quota(p_quota_code TEXT, p_shop_id UUID)
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
  UPDATE shops SET product_limit = GREATEST(product_limit,0) + v_quota.product_limit, category_limit = GREATEST(COALESCE(category_limit,0),0) + COALESCE(v_quota.category_limit,0), quota_expires_at = v_expires WHERE id = p_shop_id;
  INSERT INTO quota_history (shop_id, type, amount, category_amount, duration_days, source, cost) VALUES (p_shop_id, 'code_redeem', v_quota.product_limit, COALESCE(v_quota.category_limit,0), v_quota.duration_days, p_quota_code, 0);
  RETURN json_build_object('success', true, 'message', 'Quota redeemed successfully.', 'new_limit', v_shop.product_limit + v_quota.product_limit, 'expires_at', v_expires)::jsonb;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Boost product with wallet
CREATE OR REPLACE FUNCTION public.boost_product_wallet(p_product_id UUID, p_boost_type TEXT, p_duration_key TEXT, p_cost NUMERIC, p_boost_per_min INTEGER, p_minutes INTEGER)
RETURNS JSON AS $$
DECLARE v_shop_id UUID; v_owner UUID; v_wallet NUMERIC; v_expires TIMESTAMP WITH TIME ZONE;
BEGIN
  SELECT shop_id INTO v_shop_id FROM products WHERE id = p_product_id;
  SELECT owner_id INTO v_owner FROM shops WHERE id = v_shop_id;
  IF v_owner IS NULL OR v_owner != auth.uid() THEN RAISE EXCEPTION 'Unauthorized to boost this product'; END IF;
  SELECT wallet_balance INTO v_wallet FROM profiles WHERE id = auth.uid() FOR UPDATE;
  IF v_wallet IS NULL OR v_wallet < p_cost THEN RAISE EXCEPTION 'Insufficient wallet balance. Need $$% but have $$%.', p_cost, COALESCE(v_wallet,0); END IF;
  UPDATE profiles SET wallet_balance = wallet_balance - p_cost WHERE id = auth.uid();
  v_expires := now() + (p_minutes || ' minutes')::interval;
  INSERT INTO product_boosts (product_id, shop_id, boost_type, duration_key, boost_per_min, cost, started_at, expires_at, is_active) VALUES (p_product_id, v_shop_id, p_boost_type, p_duration_key, p_boost_per_min, p_cost, now(), v_expires, true);
  RETURN json_build_object('success', true, 'expires_at', v_expires);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Promote product with wallet
CREATE OR REPLACE FUNCTION public.promote_product(p_product_id UUID, p_promote_type TEXT, p_cost_amount NUMERIC, p_promoted_until TIMESTAMP WITH TIME ZONE)
RETURNS JSON AS $$
DECLARE v_shop_id UUID; v_owner UUID; v_wallet NUMERIC; nw NUMERIC;
BEGIN
  SELECT shop_id INTO v_shop_id FROM products WHERE id = p_product_id;
  SELECT owner_id INTO v_owner FROM shops WHERE id = v_shop_id;
  IF v_owner IS NULL OR v_owner != auth.uid() THEN RAISE EXCEPTION 'Unauthorized to promote this product'; END IF;
  SELECT wallet_balance INTO v_wallet FROM profiles WHERE id = auth.uid() FOR UPDATE;
  IF v_wallet IS NULL OR v_wallet < p_cost_amount THEN RAISE EXCEPTION 'Insufficient wallet balance.'; END IF;
  UPDATE profiles SET wallet_balance = wallet_balance - p_cost_amount WHERE id = auth.uid() RETURNING wallet_balance INTO nw;
  UPDATE products SET is_promoted = true, promote_type = p_promote_type, promoted_at = NOW(), promoted_until = p_promoted_until WHERE id = p_product_id;
  RETURN json_build_object('wallet_balance', nw);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Auto boost frequency to interval
CREATE OR REPLACE FUNCTION public.boost_frequency_to_interval(freq TEXT)
RETURNS INTERVAL AS $$
BEGIN
  RETURN CASE freq
    WHEN 'minute' THEN INTERVAL '1 minute' WHEN '5_minutes' THEN INTERVAL '5 minutes'
    WHEN '15_minutes' THEN INTERVAL '15 minutes' WHEN '30_minutes' THEN INTERVAL '30 minutes'
    WHEN 'hourly' THEN INTERVAL '1 hour' WHEN 'daily' THEN INTERVAL '1 day'
    WHEN 'weekly' THEN INTERVAL '1 week' ELSE INTERVAL '1 hour' END;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Auto boost engine
CREATE OR REPLACE FUNCTION public.process_auto_boosts()
RETURNS void AS $$
DECLARE rec RECORD; now_ts TIMESTAMP WITH TIME ZONE := NOW();
BEGIN
  FOR rec IN SELECT p.id AS user_id, p.auto_boost_amount, p.auto_boost_frequency FROM profiles p WHERE p.auto_boost_enabled = true AND (p.last_auto_boost_at IS NULL OR (now_ts - p.last_auto_boost_at) >= boost_frequency_to_interval(p.auto_boost_frequency)) LOOP
    UPDATE products SET view_count = COALESCE(view_count,0) + rec.auto_boost_amount WHERE shop_id IN (SELECT id FROM shops WHERE owner_id = rec.user_id);
    UPDATE profiles SET last_auto_boost_at = now_ts WHERE id = rec.user_id;
  END LOOP;
  FOR rec IN SELECT p.id AS user_id, p.auto_like_boost_amount, p.auto_like_boost_frequency FROM profiles p WHERE p.auto_like_boost_enabled = true AND (p.last_auto_like_boost_at IS NULL OR (now_ts - p.last_auto_like_boost_at) >= boost_frequency_to_interval(p.auto_like_boost_frequency)) LOOP
    UPDATE products SET like_count = COALESCE(like_count,0) + rec.auto_like_boost_amount WHERE shop_id IN (SELECT id FROM shops WHERE owner_id = rec.user_id);
    UPDATE profiles SET last_auto_like_boost_at = now_ts WHERE id = rec.user_id;
  END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Support channels updated_at
CREATE OR REPLACE FUNCTION update_support_channels_updated_at() RETURNS TRIGGER AS $$ BEGIN NEW.updated_at = now(); RETURN NEW; END; $$ LANGUAGE plpgsql;
DROP TRIGGER IF EXISTS support_channels_updated_at ON support_channels;
CREATE TRIGGER support_channels_updated_at BEFORE UPDATE ON support_channels FOR EACH ROW EXECUTE FUNCTION update_support_channels_updated_at();

-- Schedule auto boost every minute
SELECT cron.unschedule('auto-boost-products') WHERE EXISTS (SELECT 1 FROM cron.job WHERE jobname = 'auto-boost-products');
SELECT cron.schedule('auto-boost-products', '* * * * *', $`$SELECT public.process_auto_boosts()$`$);

-- =====================================================================
-- STORAGE
-- =====================================================================
INSERT INTO storage.buckets (id, name, public) VALUES ('strong-shop', 'strong-shop', true) ON CONFLICT (id) DO NOTHING;
CREATE POLICY "storage_select_all" ON storage.objects FOR SELECT USING (bucket_id = 'strong-shop');
CREATE POLICY "storage_auth_insert" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'strong-shop' AND auth.role() = 'authenticated');
CREATE POLICY "storage_auth_update" ON storage.objects FOR UPDATE USING (bucket_id = 'strong-shop' AND auth.role() = 'authenticated');
CREATE POLICY "storage_auth_delete" ON storage.objects FOR DELETE USING (bucket_id = 'strong-shop' AND auth.role() = 'authenticated');

-- =====================================================================
-- SEED DATA
-- =====================================================================
INSERT INTO categories (name, slug, icon) VALUES
  ('Men''s Clothes','mens-clothes','👕'),('Women''s Clothes','womens-clothes','👗'),
  ('Mobile & Gadgets','mobile-gadgets','📱'),('Computers & Laptops','computers-laptops','💻'),
  ('Home & Living','home-living','🏠'),('Health & Beauty','health-beauty','💄'),
  ('Baby & Toys','baby-toys','🧸'),('Sports & Outdoors','sports-outdoors','⚽'),
  ('Automotive','automotive','🚗'),('Watches & Glasses','watches-glasses','⌚'),
  ('Men''s Shoes','mens-shoes','👞'),('Women''s Shoes','womens-shoes','👠'),
  ('Bags','bags','👜'),('Groceries & Pets','groceries-pets','🛒'),
  ('Books & Stationery','books-stationery','📚'),('Gaming & Consoles','gaming-consoles','🎮'),
  ('Cameras & Drones','cameras-drones','📷'),('Home Appliances','home-appliances','🔌')
ON CONFLICT (slug) DO NOTHING;

WITH p AS (SELECT id, slug FROM categories)
INSERT INTO categories (name, slug, icon, parent_id) VALUES
  ('T-Shirts','mens-tshirts','👕',(SELECT id FROM p WHERE slug='mens-clothes')),
  ('Shirts','mens-shirts','👔',(SELECT id FROM p WHERE slug='mens-clothes')),
  ('Pants','mens-pants','👖',(SELECT id FROM p WHERE slug='mens-clothes')),
  ('Dresses','womens-dresses','👗',(SELECT id FROM p WHERE slug='womens-clothes')),
  ('Tops','womens-tops','👚',(SELECT id FROM p WHERE slug='womens-clothes')),
  ('Smartphones','smartphones','📱',(SELECT id FROM p WHERE slug='mobile-gadgets')),
  ('Tablets','tablets','📟',(SELECT id FROM p WHERE slug='mobile-gadgets')),
  ('Laptops','laptops','💻',(SELECT id FROM p WHERE slug='computers-laptops')),
  ('PC Components','pc-components','📟',(SELECT id FROM p WHERE slug='computers-laptops')),
  ('Kitchen','kitchen-dining','🍳',(SELECT id FROM p WHERE slug='home-living')),
  ('Furniture','furniture','🪑',(SELECT id FROM p WHERE slug='home-living')),
  ('Skincare','skincare','🧴',(SELECT id FROM p WHERE slug='health-beauty')),
  ('Makeup','makeup','💄',(SELECT id FROM p WHERE slug='health-beauty')),
  ('Consoles','consoles','🎮',(SELECT id FROM p WHERE slug='gaming-consoles')),
  ('Games','game-titles','💿',(SELECT id FROM p WHERE slug='gaming-consoles')),
  ('Fitness','fitness','🏋️',(SELECT id FROM p WHERE slug='sports-outdoors')),
  ('Car Parts','car-parts','🔧',(SELECT id FROM p WHERE slug='automotive')),
  ('Sneakers','sneakers','👟',(SELECT id FROM p WHERE slug='mens-shoes')),
  ('Heels','heels','👠',(SELECT id FROM p WHERE slug='womens-shoes')),
  ('Backpacks','backpacks','🎒',(SELECT id FROM p WHERE slug='bags')),
  ('Handbags','handbags','👜',(SELECT id FROM p WHERE slug='bags')),
  ('Snacks','snacks','🍿',(SELECT id FROM p WHERE slug='groceries-pets')),
  ('Pet Supplies','pet-supplies','🐾',(SELECT id FROM p WHERE slug='groceries-pets')),
  ('DSLR','dslr-cameras','📷',(SELECT id FROM p WHERE slug='cameras-drones')),
  ('Drones','drones','🚁',(SELECT id FROM p WHERE slug='cameras-drones')),
  ('Vacuum Cleaners','vacuum-cleaners','🧹',(SELECT id FROM p WHERE slug='home-appliances')),
  ('Fans','fans','🌀',(SELECT id FROM p WHERE slug='home-appliances'))
ON CONFLICT (slug) DO NOTHING;

INSERT INTO quota_packages (name, product_limit, category_limit, duration_days, price, badge, sort_order) VALUES
  ('Starter',10,3,30,0,NULL,1),
  ('Basic',30,5,30,9.99,NULL,2),
  ('Pro',100,10,90,29.99,'Popular',3),
  ('Business',300,20,180,79.99,'Best Value',4),
  ('Enterprise',999,50,365,199.99,'Premium',5)
ON CONFLICT DO NOTHING;

INSERT INTO site_settings (key, value, description) VALUES ('token_exchange_rate_usd_per_token', '1.0', 'USD per token') ON CONFLICT (key) DO NOTHING;

INSERT INTO support_channels (channel_type, label, value, is_enabled, icon, sort_order) VALUES
  ('phone','Customer Hotline','',false,'phone',1),
  ('facebook','Facebook Page','',false,'facebook',2),
  ('whatsapp','WhatsApp','',false,'message-circle',3),
  ('line','Line Official','',false,'message-square',4),
  ('email','Email Support','',false,'mail',5),
  ('instagram','Instagram','',false,'instagram',6),
  ('website','Official Website','',false,'globe',7)
ON CONFLICT DO NOTHING;

-- Customer Support shop (run after adding an admin user)
INSERT INTO shops (id, name, description, logo_url, owner_id)
SELECT '00000000-0000-0000-0000-000000000000','Customer Support','Official SnapBuy Customer Support','https://api.dicebear.com/7.x/shapes/svg?seed=support&backgroundColor=0ea5e9,14b8a6',id
FROM profiles WHERE role = 'admin' LIMIT 1
ON CONFLICT (id) DO NOTHING;
CREATE TABLE IF NOT EXISTS quota_settings (
  id INTEGER PRIMARY KEY DEFAULT 1,
  price_per_slot NUMERIC NOT NULL DEFAULT 0.50,
  price_per_day NUMERIC NOT NULL DEFAULT 0.10,
  base_category_price NUMERIC NOT NULL DEFAULT 2.00,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

INSERT INTO quota_settings (id, price_per_slot, price_per_day, base_category_price) VALUES (1, 0.50, 0.10, 2.00) ON CONFLICT (id) DO NOTHING;

-- Buy custom quota
CREATE OR REPLACE FUNCTION public.buy_custom_quota(p_shop_id UUID, p_limit_amount INTEGER, p_duration_days INTEGER, p_category_ids UUID[], p_cost_amount NUMERIC)
RETURNS JSON AS $$
DECLARE
  v_owner UUID; v_wallet NUMERIC; v_expires TIMESTAMP WITH TIME ZONE;
  v_cat UUID;
BEGIN
  SELECT owner_id INTO v_owner FROM shops WHERE id = p_shop_id;
  IF v_owner IS NULL OR v_owner != auth.uid() THEN RAISE EXCEPTION 'Unauthorized: you do not own this shop.'; END IF;
  
  SELECT wallet_balance INTO v_wallet FROM profiles WHERE id = auth.uid() FOR UPDATE;
  IF v_wallet < p_cost_amount THEN RAISE EXCEPTION 'Insufficient wallet balance.'; END IF;
  
  UPDATE profiles SET wallet_balance = wallet_balance - p_cost_amount WHERE id = auth.uid();
  
  IF p_duration_days > 0 THEN
    SELECT quota_expires_at INTO v_expires FROM shops WHERE id = p_shop_id;
    IF v_expires IS NOT NULL AND v_expires > now() THEN
      v_expires := v_expires + (p_duration_days || ' days')::interval;
    ELSE
      v_expires := now() + (p_duration_days || ' days')::interval;
    END IF;
  END IF;
  
  UPDATE shops SET 
    product_limit = GREATEST(product_limit, 0) + p_limit_amount,
    category_limit = GREATEST(category_limit, 0) + COALESCE(array_length(p_category_ids, 1), 0),
    quota_expires_at = COALESCE(v_expires, quota_expires_at) 
  WHERE id = p_shop_id;
  
  IF p_category_ids IS NOT NULL THEN
    FOREACH v_cat IN ARRAY p_category_ids LOOP
      INSERT INTO shop_categories (shop_id, category_id) VALUES (p_shop_id, v_cat) ON CONFLICT DO NOTHING;
    END LOOP;
  END IF;
  
  INSERT INTO quota_history (shop_id, type, amount, category_amount, duration_days, source, cost) 
  VALUES (p_shop_id, 'purchase', p_limit_amount, COALESCE(array_length(p_category_ids, 1), 0), p_duration_days, 'Custom Upgrade', p_cost_amount);
  
  RETURN json_build_object('success', true, 'expires_at', v_expires);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================================
-- QUOTA SALES PERCENTAGE BONUS UPDATE
-- =====================================================================

ALTER TABLE public.store_quotas ADD COLUMN IF NOT EXISTS sales_percentage NUMERIC DEFAULT 0;
ALTER TABLE public.shops ADD COLUMN IF NOT EXISTS sales_percentage NUMERIC DEFAULT 0;

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
