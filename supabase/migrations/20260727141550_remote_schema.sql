
  create table "public"."addresses" (
    "id" uuid not null default extensions.uuid_generate_v4(),
    "user_id" uuid not null,
    "receiver_name" text not null,
    "phone_number" text not null,
    "address_line1" text not null,
    "address_line2" text,
    "district" text,
    "city" text,
    "province" text,
    "postal_code" text not null,
    "is_default" boolean default false,
    "created_at" timestamp with time zone not null default timezone('utc'::text, now())
      );


alter table "public"."addresses" enable row level security;


  create table "public"."admin_activity_log" (
    "id" uuid not null default extensions.uuid_generate_v4(),
    "admin_id" uuid,
    "action_type" text not null,
    "target_type" text not null,
    "target_id" text,
    "target_name" text,
    "metadata" jsonb,
    "created_at" timestamp with time zone not null default now()
      );


alter table "public"."admin_activity_log" enable row level security;


  create table "public"."api_keys" (
    "id" uuid not null default gen_random_uuid(),
    "provider" text not null,
    "key_value" text not null,
    "is_active" boolean default true,
    "created_at" timestamp with time zone not null default timezone('utc'::text, now()),
    "rate_limit" integer default 50,
    "remaining_requests" integer default 50,
    "last_used_at" timestamp with time zone
      );


alter table "public"."api_keys" enable row level security;


  create table "public"."bot_simulation_jobs" (
    "id" uuid not null default gen_random_uuid(),
    "shop_id" uuid not null,
    "items_per_order_min" integer not null default 1,
    "items_per_order_max" integer not null default 3,
    "interval_minutes" integer not null default 60,
    "status" text default 'active'::text,
    "last_run_at" timestamp with time zone,
    "created_at" timestamp with time zone not null default now(),
    "price_preference" text default 'random'::text,
    "max_runs" integer,
    "bot_count_min" integer not null default 2,
    "bot_count_max" integer not null default 10
      );


alter table "public"."bot_simulation_jobs" enable row level security;


  create table "public"."categories" (
    "id" uuid not null default extensions.uuid_generate_v4(),
    "name" text not null,
    "icon" text,
    "slug" text not null,
    "parent_id" uuid,
    "created_at" timestamp with time zone not null default timezone('utc'::text, now())
      );


alter table "public"."categories" enable row level security;


  create table "public"."conversations" (
    "id" uuid not null default gen_random_uuid(),
    "user_id" uuid not null,
    "shop_id" uuid not null,
    "last_message" text,
    "last_message_at" timestamp with time zone default now(),
    "created_at" timestamp with time zone default now()
      );


alter table "public"."conversations" enable row level security;


  create table "public"."data_exports" (
    "id" uuid not null default extensions.uuid_generate_v4(),
    "file_name" text not null,
    "file_url" text not null,
    "table_names" text[] not null,
    "shop_ids" text[] not null,
    "record_count" integer not null,
    "created_at" timestamp with time zone not null default timezone('utc'::text, now()),
    "shop_names" text[] default '{}'::text[]
      );


alter table "public"."data_exports" enable row level security;


  create table "public"."generation_jobs" (
    "id" uuid not null default gen_random_uuid(),
    "shop_id" uuid not null,
    "target_count" integer not null,
    "completed_count" integer default 0,
    "category_ids" jsonb default '[]'::jsonb,
    "status" text default 'running'::text,
    "created_at" timestamp with time zone not null default timezone('utc'::text, now()),
    "updated_at" timestamp with time zone not null default timezone('utc'::text, now()),
    "resume_at" timestamp with time zone,
    "pause_reason" text
      );


alter table "public"."generation_jobs" enable row level security;


  create table "public"."messages" (
    "id" uuid not null default gen_random_uuid(),
    "conversation_id" uuid not null,
    "sender_id" uuid not null,
    "content" text not null,
    "is_read" boolean default false,
    "created_at" timestamp with time zone default now(),
    "image_url" text,
    "is_edited" boolean default false,
    "is_deleted" boolean default false
      );


alter table "public"."messages" enable row level security;


  create table "public"."order_items" (
    "id" uuid not null default extensions.uuid_generate_v4(),
    "order_id" uuid not null,
    "product_id" uuid,
    "variant_id" uuid,
    "quantity" integer not null,
    "price" numeric(12,2) not null,
    "created_at" timestamp with time zone not null default timezone('utc'::text, now()),
    "shop_id" uuid,
    "guarantee_paid" boolean default false,
    "guarantee_paid_at" timestamp with time zone
      );


alter table "public"."order_items" enable row level security;


  create table "public"."orders" (
    "id" uuid not null default extensions.uuid_generate_v4(),
    "user_id" uuid not null,
    "total_amount" numeric(12,2) not null,
    "status" text default 'pending'::text,
    "shipping_address_id" uuid,
    "created_at" timestamp with time zone not null default timezone('utc'::text, now()),
    "expected_delivery_date" timestamp with time zone,
    "shop_id" uuid
      );


alter table "public"."orders" enable row level security;


  create table "public"."product_variants" (
    "id" uuid not null default extensions.uuid_generate_v4(),
    "product_id" uuid,
    "name" text not null,
    "value" text not null,
    "price_override" numeric(12,2),
    "stock_quantity" integer default 0,
    "sku" text,
    "created_at" timestamp with time zone not null default timezone('utc'::text, now()),
    "image_url" text
      );


alter table "public"."product_variants" enable row level security;


  create table "public"."products" (
    "id" uuid not null default extensions.uuid_generate_v4(),
    "shop_id" uuid not null,
    "category_id" uuid,
    "name" text not null,
    "description" text,
    "price" numeric(12,2) not null,
    "compare_at_price" numeric(12,2),
    "stock_quantity" integer default 0,
    "images" text[] default '{}'::text[],
    "is_published" boolean default true,
    "brand" text,
    "ratings_count" integer default 0,
    "average_rating" numeric(3,2) default 0,
    "created_at" timestamp with time zone default timezone('utc'::text, now()),
    "highlights" text[] default '{}'::text[],
    "view_count" integer default 0,
    "like_count" integer default 0,
    "comment_count" integer default 0,
    "is_promoted" boolean default false,
    "promote_type" character varying(50),
    "promoted_at" timestamp with time zone,
    "promoted_until" timestamp with time zone,
    "boost_per_minute" integer default 0
      );


alter table "public"."products" enable row level security;


  create table "public"."profiles" (
    "id" uuid not null,
    "username" text,
    "full_name" text,
    "avatar_url" text,
    "role" text default 'customer'::text,
    "updated_at" timestamp with time zone default timezone('utc'::text, now()),
    "auto_boost_enabled" boolean default false,
    "auto_boost_amount" integer default 0,
    "auto_boost_frequency" text default 'hourly'::text,
    "allow_credit_card" boolean default false,
    "auto_like_boost_enabled" boolean default false,
    "auto_like_boost_amount" integer default 100,
    "auto_like_boost_frequency" text default 'hourly'::text,
    "last_auto_boost_at" timestamp with time zone,
    "last_auto_like_boost_at" timestamp with time zone,
    "wallet_balance" numeric not null default 0,
    "token_balance" numeric not null default 0,
    "email" text,
    "created_at" timestamp with time zone default timezone('utc'::text, now()),
    "is_bot" boolean default false
      );


alter table "public"."profiles" enable row level security;


  create table "public"."quota_history" (
    "id" uuid not null default extensions.uuid_generate_v4(),
    "shop_id" uuid,
    "type" text not null,
    "amount" integer not null,
    "duration_days" integer,
    "source" text,
    "cost" numeric(10,2) default 0,
    "created_at" timestamp with time zone not null default timezone('utc'::text, now()),
    "category_amount" integer default 0
      );


alter table "public"."quota_history" enable row level security;


  create table "public"."quota_packages" (
    "id" uuid not null default extensions.uuid_generate_v4(),
    "name" text not null,
    "product_limit" integer not null,
    "duration_days" integer,
    "price" numeric(10,2) not null,
    "badge" text,
    "is_active" boolean default true,
    "sort_order" integer default 0,
    "created_at" timestamp with time zone not null default timezone('utc'::text, now()),
    "category_limit" integer default 0
      );


alter table "public"."quota_packages" enable row level security;


  create table "public"."quota_settings" (
    "id" integer not null default 1,
    "price_per_slot" numeric(10,2) not null default 0.10,
    "price_per_day" numeric(10,2) not null default 0.50,
    "base_category_price" numeric(10,2) not null default 5.00,
    "updated_at" timestamp with time zone not null default timezone('utc'::text, now()),
    "shipping_days" integer default 3
      );


alter table "public"."quota_settings" enable row level security;


  create table "public"."reviews" (
    "id" uuid not null default extensions.uuid_generate_v4(),
    "product_id" uuid,
    "user_id" uuid,
    "rating" integer,
    "comment" text,
    "images" text[],
    "created_at" timestamp with time zone not null default timezone('utc'::text, now())
      );


alter table "public"."reviews" enable row level security;


  create table "public"."shop_categories" (
    "shop_id" uuid not null,
    "category_id" uuid not null,
    "created_at" timestamp with time zone not null default timezone('utc'::text, now())
      );


alter table "public"."shop_categories" enable row level security;


  create table "public"."shop_followers" (
    "id" uuid not null default extensions.uuid_generate_v4(),
    "shop_id" uuid,
    "user_id" uuid,
    "created_at" timestamp with time zone not null default timezone('utc'::text, now())
      );


alter table "public"."shop_followers" enable row level security;


  create table "public"."shop_wallet_transactions" (
    "id" uuid not null default gen_random_uuid(),
    "shop_id" uuid not null,
    "type" text not null,
    "amount" numeric not null,
    "note" text,
    "created_at" timestamp with time zone not null default timezone('utc'::text, now())
      );


alter table "public"."shop_wallet_transactions" enable row level security;


  create table "public"."shops" (
    "id" uuid not null default extensions.uuid_generate_v4(),
    "owner_id" uuid not null,
    "name" text not null,
    "description" text,
    "logo_url" text,
    "banner_url" text,
    "is_verified" boolean default false,
    "created_at" timestamp with time zone default timezone('utc'::text, now()),
    "location" text,
    "phone" text,
    "contact_info" text,
    "view_count" bigint default 0,
    "product_limit" integer default 50,
    "quota_expires_at" timestamp with time zone,
    "category_limit" integer default 0,
    "price" numeric default 0,
    "sales_percentage" numeric default 0,
    "sale_balance" numeric default 0,
    "bonus_balance" numeric default 0,
    "has_special_quota" boolean default false,
    "special_quota_expires_at" timestamp with time zone
      );


alter table "public"."shops" enable row level security;


  create table "public"."site_settings" (
    "key" text not null,
    "value" text not null,
    "description" text,
    "updated_at" timestamp with time zone not null default timezone('utc'::text, now())
      );


alter table "public"."site_settings" enable row level security;


  create table "public"."store_quotas" (
    "id" uuid not null default extensions.uuid_generate_v4(),
    "code" text not null,
    "product_limit" integer not null,
    "duration_days" integer,
    "is_used" boolean default false,
    "used_by_shop_id" uuid,
    "used_at" timestamp with time zone,
    "created_by" uuid,
    "created_at" timestamp with time zone not null default timezone('utc'::text, now()),
    "category_limit" integer default 0,
    "sales_percentage" numeric default 0,
    "auto_import_count" integer not null default 0,
    "is_special_quota" boolean default false
      );


alter table "public"."store_quotas" enable row level security;


  create table "public"."support_channels" (
    "id" uuid not null default gen_random_uuid(),
    "channel_type" text not null,
    "label" text not null,
    "value" text not null default ''::text,
    "is_enabled" boolean not null default false,
    "icon" text not null default 'phone'::text,
    "sort_order" integer not null default 0,
    "updated_at" timestamp with time zone default now()
      );


alter table "public"."support_channels" enable row level security;


  create table "public"."user_addresses" (
    "id" uuid not null default extensions.uuid_generate_v4(),
    "user_id" uuid not null,
    "full_name" text not null,
    "phone" text not null,
    "province" text not null,
    "city" text not null,
    "district" text not null,
    "postal_code" text not null,
    "address_line" text not null,
    "is_default" boolean default false,
    "created_at" timestamp with time zone not null default timezone('utc'::text, now())
      );


alter table "public"."user_addresses" enable row level security;


  create table "public"."user_payment_methods" (
    "id" uuid not null default gen_random_uuid(),
    "user_id" uuid not null,
    "brand" text not null,
    "last4" text not null,
    "cardholder_name" text not null,
    "expiry_date" text not null,
    "is_default" boolean default false,
    "created_at" timestamp with time zone not null default timezone('utc'::text, now())
      );


alter table "public"."user_payment_methods" enable row level security;

CREATE UNIQUE INDEX addresses_pkey ON public.addresses USING btree (id);

CREATE INDEX admin_activity_log_created_at_idx ON public.admin_activity_log USING btree (created_at DESC);

CREATE UNIQUE INDEX admin_activity_log_pkey ON public.admin_activity_log USING btree (id);

CREATE UNIQUE INDEX api_keys_pkey ON public.api_keys USING btree (id);

CREATE UNIQUE INDEX bot_simulation_jobs_pkey ON public.bot_simulation_jobs USING btree (id);

CREATE UNIQUE INDEX categories_pkey ON public.categories USING btree (id);

CREATE UNIQUE INDEX categories_slug_key ON public.categories USING btree (slug);

CREATE UNIQUE INDEX conversations_pkey ON public.conversations USING btree (id);

CREATE UNIQUE INDEX conversations_user_id_shop_id_key ON public.conversations USING btree (user_id, shop_id);

CREATE UNIQUE INDEX data_exports_pkey ON public.data_exports USING btree (id);

CREATE UNIQUE INDEX generation_jobs_pkey ON public.generation_jobs USING btree (id);

CREATE UNIQUE INDEX messages_pkey ON public.messages USING btree (id);

CREATE UNIQUE INDEX order_items_pkey ON public.order_items USING btree (id);

CREATE UNIQUE INDEX orders_pkey ON public.orders USING btree (id);

CREATE UNIQUE INDEX product_variants_pkey ON public.product_variants USING btree (id);

CREATE UNIQUE INDEX product_variants_sku_key ON public.product_variants USING btree (sku);

CREATE UNIQUE INDEX products_pkey ON public.products USING btree (id);

CREATE UNIQUE INDEX profiles_pkey ON public.profiles USING btree (id);

CREATE UNIQUE INDEX profiles_username_key ON public.profiles USING btree (username);

CREATE UNIQUE INDEX quota_history_pkey ON public.quota_history USING btree (id);

CREATE UNIQUE INDEX quota_packages_pkey ON public.quota_packages USING btree (id);

CREATE UNIQUE INDEX quota_settings_pkey ON public.quota_settings USING btree (id);

CREATE UNIQUE INDEX reviews_pkey ON public.reviews USING btree (id);

CREATE UNIQUE INDEX shop_categories_pkey ON public.shop_categories USING btree (shop_id, category_id);

CREATE UNIQUE INDEX shop_followers_pkey ON public.shop_followers USING btree (id);

CREATE UNIQUE INDEX shop_followers_shop_id_user_id_key ON public.shop_followers USING btree (shop_id, user_id);

CREATE UNIQUE INDEX shop_wallet_transactions_pkey ON public.shop_wallet_transactions USING btree (id);

CREATE UNIQUE INDEX shops_pkey ON public.shops USING btree (id);

CREATE UNIQUE INDEX site_settings_pkey ON public.site_settings USING btree (key);

CREATE UNIQUE INDEX store_quotas_code_key ON public.store_quotas USING btree (code);

CREATE UNIQUE INDEX store_quotas_pkey ON public.store_quotas USING btree (id);

CREATE UNIQUE INDEX support_channels_pkey ON public.support_channels USING btree (id);

CREATE UNIQUE INDEX user_addresses_pkey ON public.user_addresses USING btree (id);

CREATE UNIQUE INDEX user_payment_methods_pkey ON public.user_payment_methods USING btree (id);

CREATE INDEX user_payment_methods_user_id_idx ON public.user_payment_methods USING btree (user_id);

alter table "public"."addresses" add constraint "addresses_pkey" PRIMARY KEY using index "addresses_pkey";

alter table "public"."admin_activity_log" add constraint "admin_activity_log_pkey" PRIMARY KEY using index "admin_activity_log_pkey";

alter table "public"."api_keys" add constraint "api_keys_pkey" PRIMARY KEY using index "api_keys_pkey";

alter table "public"."bot_simulation_jobs" add constraint "bot_simulation_jobs_pkey" PRIMARY KEY using index "bot_simulation_jobs_pkey";

alter table "public"."categories" add constraint "categories_pkey" PRIMARY KEY using index "categories_pkey";

alter table "public"."conversations" add constraint "conversations_pkey" PRIMARY KEY using index "conversations_pkey";

alter table "public"."data_exports" add constraint "data_exports_pkey" PRIMARY KEY using index "data_exports_pkey";

alter table "public"."generation_jobs" add constraint "generation_jobs_pkey" PRIMARY KEY using index "generation_jobs_pkey";

alter table "public"."messages" add constraint "messages_pkey" PRIMARY KEY using index "messages_pkey";

alter table "public"."order_items" add constraint "order_items_pkey" PRIMARY KEY using index "order_items_pkey";

alter table "public"."orders" add constraint "orders_pkey" PRIMARY KEY using index "orders_pkey";

alter table "public"."product_variants" add constraint "product_variants_pkey" PRIMARY KEY using index "product_variants_pkey";

alter table "public"."products" add constraint "products_pkey" PRIMARY KEY using index "products_pkey";

alter table "public"."profiles" add constraint "profiles_pkey" PRIMARY KEY using index "profiles_pkey";

alter table "public"."quota_history" add constraint "quota_history_pkey" PRIMARY KEY using index "quota_history_pkey";

alter table "public"."quota_packages" add constraint "quota_packages_pkey" PRIMARY KEY using index "quota_packages_pkey";

alter table "public"."quota_settings" add constraint "quota_settings_pkey" PRIMARY KEY using index "quota_settings_pkey";

alter table "public"."reviews" add constraint "reviews_pkey" PRIMARY KEY using index "reviews_pkey";

alter table "public"."shop_categories" add constraint "shop_categories_pkey" PRIMARY KEY using index "shop_categories_pkey";

alter table "public"."shop_followers" add constraint "shop_followers_pkey" PRIMARY KEY using index "shop_followers_pkey";

alter table "public"."shop_wallet_transactions" add constraint "shop_wallet_transactions_pkey" PRIMARY KEY using index "shop_wallet_transactions_pkey";

alter table "public"."shops" add constraint "shops_pkey" PRIMARY KEY using index "shops_pkey";

alter table "public"."site_settings" add constraint "site_settings_pkey" PRIMARY KEY using index "site_settings_pkey";

alter table "public"."store_quotas" add constraint "store_quotas_pkey" PRIMARY KEY using index "store_quotas_pkey";

alter table "public"."support_channels" add constraint "support_channels_pkey" PRIMARY KEY using index "support_channels_pkey";

alter table "public"."user_addresses" add constraint "user_addresses_pkey" PRIMARY KEY using index "user_addresses_pkey";

alter table "public"."user_payment_methods" add constraint "user_payment_methods_pkey" PRIMARY KEY using index "user_payment_methods_pkey";

alter table "public"."addresses" add constraint "addresses_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE not valid;

alter table "public"."addresses" validate constraint "addresses_user_id_fkey";

alter table "public"."admin_activity_log" add constraint "admin_activity_log_admin_id_fkey" FOREIGN KEY (admin_id) REFERENCES public.profiles(id) ON DELETE SET NULL not valid;

alter table "public"."admin_activity_log" validate constraint "admin_activity_log_admin_id_fkey";

alter table "public"."bot_simulation_jobs" add constraint "bot_simulation_jobs_price_preference_check" CHECK ((price_preference = ANY (ARRAY['random'::text, 'cheap'::text, 'expensive'::text, 'all'::text]))) not valid;

alter table "public"."bot_simulation_jobs" validate constraint "bot_simulation_jobs_price_preference_check";

alter table "public"."bot_simulation_jobs" add constraint "bot_simulation_jobs_shop_id_fkey" FOREIGN KEY (shop_id) REFERENCES public.shops(id) ON DELETE CASCADE not valid;

alter table "public"."bot_simulation_jobs" validate constraint "bot_simulation_jobs_shop_id_fkey";

alter table "public"."bot_simulation_jobs" add constraint "bot_simulation_jobs_status_check" CHECK ((status = ANY (ARRAY['active'::text, 'paused'::text]))) not valid;

alter table "public"."bot_simulation_jobs" validate constraint "bot_simulation_jobs_status_check";

alter table "public"."categories" add constraint "categories_parent_id_fkey" FOREIGN KEY (parent_id) REFERENCES public.categories(id) not valid;

alter table "public"."categories" validate constraint "categories_parent_id_fkey";

alter table "public"."categories" add constraint "categories_slug_key" UNIQUE using index "categories_slug_key";

alter table "public"."conversations" add constraint "conversations_shop_id_fkey" FOREIGN KEY (shop_id) REFERENCES public.shops(id) ON DELETE CASCADE not valid;

alter table "public"."conversations" validate constraint "conversations_shop_id_fkey";

alter table "public"."conversations" add constraint "conversations_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE not valid;

alter table "public"."conversations" validate constraint "conversations_user_id_fkey";

alter table "public"."conversations" add constraint "conversations_user_id_shop_id_key" UNIQUE using index "conversations_user_id_shop_id_key";

alter table "public"."generation_jobs" add constraint "generation_jobs_status_check" CHECK ((status = ANY (ARRAY['running'::text, 'paused'::text, 'completed'::text, 'failed'::text]))) not valid;

alter table "public"."generation_jobs" validate constraint "generation_jobs_status_check";

alter table "public"."messages" add constraint "messages_conversation_id_fkey" FOREIGN KEY (conversation_id) REFERENCES public.conversations(id) ON DELETE CASCADE not valid;

alter table "public"."messages" validate constraint "messages_conversation_id_fkey";

alter table "public"."messages" add constraint "messages_sender_id_fkey" FOREIGN KEY (sender_id) REFERENCES auth.users(id) ON DELETE CASCADE not valid;

alter table "public"."messages" validate constraint "messages_sender_id_fkey";

alter table "public"."order_items" add constraint "order_items_order_id_fkey" FOREIGN KEY (order_id) REFERENCES public.orders(id) ON DELETE CASCADE not valid;

alter table "public"."order_items" validate constraint "order_items_order_id_fkey";

alter table "public"."order_items" add constraint "order_items_product_id_fkey" FOREIGN KEY (product_id) REFERENCES public.products(id) ON DELETE SET NULL not valid;

alter table "public"."order_items" validate constraint "order_items_product_id_fkey";

alter table "public"."order_items" add constraint "order_items_shop_id_fkey" FOREIGN KEY (shop_id) REFERENCES public.shops(id) not valid;

alter table "public"."order_items" validate constraint "order_items_shop_id_fkey";

alter table "public"."order_items" add constraint "order_items_variant_id_fkey" FOREIGN KEY (variant_id) REFERENCES public.product_variants(id) ON DELETE SET NULL not valid;

alter table "public"."order_items" validate constraint "order_items_variant_id_fkey";

alter table "public"."orders" add constraint "orders_profiles_fkey" FOREIGN KEY (user_id) REFERENCES public.profiles(id) not valid;

alter table "public"."orders" validate constraint "orders_profiles_fkey";

alter table "public"."orders" add constraint "orders_shipping_address_id_fkey" FOREIGN KEY (shipping_address_id) REFERENCES public.user_addresses(id) ON DELETE SET NULL not valid;

alter table "public"."orders" validate constraint "orders_shipping_address_id_fkey";

alter table "public"."orders" add constraint "orders_shop_id_fkey" FOREIGN KEY (shop_id) REFERENCES public.shops(id) ON DELETE CASCADE not valid;

alter table "public"."orders" validate constraint "orders_shop_id_fkey";

alter table "public"."orders" add constraint "orders_status_check" CHECK ((status = ANY (ARRAY['pending'::text, 'processing'::text, 'shipped'::text, 'delivered'::text, 'cancelled'::text]))) not valid;

alter table "public"."orders" validate constraint "orders_status_check";

alter table "public"."orders" add constraint "orders_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE not valid;

alter table "public"."orders" validate constraint "orders_user_id_fkey";

alter table "public"."product_variants" add constraint "product_variants_product_id_fkey" FOREIGN KEY (product_id) REFERENCES public.products(id) ON DELETE CASCADE not valid;

alter table "public"."product_variants" validate constraint "product_variants_product_id_fkey";

alter table "public"."product_variants" add constraint "product_variants_sku_key" UNIQUE using index "product_variants_sku_key";

alter table "public"."products" add constraint "products_category_id_fkey" FOREIGN KEY (category_id) REFERENCES public.categories(id) not valid;

alter table "public"."products" validate constraint "products_category_id_fkey";

alter table "public"."products" add constraint "products_shop_id_fkey" FOREIGN KEY (shop_id) REFERENCES public.shops(id) ON DELETE CASCADE not valid;

alter table "public"."products" validate constraint "products_shop_id_fkey";

alter table "public"."profiles" add constraint "profiles_id_fkey" FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE not valid;

alter table "public"."profiles" validate constraint "profiles_id_fkey";

alter table "public"."profiles" add constraint "profiles_role_check" CHECK ((role = ANY (ARRAY['customer'::text, 'vendor'::text, 'admin'::text]))) not valid;

alter table "public"."profiles" validate constraint "profiles_role_check";

alter table "public"."profiles" add constraint "profiles_username_key" UNIQUE using index "profiles_username_key";

alter table "public"."quota_history" add constraint "quota_history_shop_id_fkey" FOREIGN KEY (shop_id) REFERENCES public.shops(id) ON DELETE CASCADE not valid;

alter table "public"."quota_history" validate constraint "quota_history_shop_id_fkey";

alter table "public"."quota_history" add constraint "quota_history_type_check" CHECK ((type = ANY (ARRAY['purchase'::text, 'code_redeem'::text, 'admin_set'::text]))) not valid;

alter table "public"."quota_history" validate constraint "quota_history_type_check";

alter table "public"."quota_settings" add constraint "quota_settings_id_check" CHECK ((id = 1)) not valid;

alter table "public"."quota_settings" validate constraint "quota_settings_id_check";

alter table "public"."reviews" add constraint "reviews_product_id_fkey" FOREIGN KEY (product_id) REFERENCES public.products(id) ON DELETE CASCADE not valid;

alter table "public"."reviews" validate constraint "reviews_product_id_fkey";

alter table "public"."reviews" add constraint "reviews_rating_check" CHECK (((rating >= 1) AND (rating <= 5))) not valid;

alter table "public"."reviews" validate constraint "reviews_rating_check";

alter table "public"."reviews" add constraint "reviews_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) not valid;

alter table "public"."reviews" validate constraint "reviews_user_id_fkey";

alter table "public"."shop_categories" add constraint "shop_categories_category_id_fkey" FOREIGN KEY (category_id) REFERENCES public.categories(id) ON DELETE CASCADE not valid;

alter table "public"."shop_categories" validate constraint "shop_categories_category_id_fkey";

alter table "public"."shop_categories" add constraint "shop_categories_shop_id_fkey" FOREIGN KEY (shop_id) REFERENCES public.shops(id) ON DELETE CASCADE not valid;

alter table "public"."shop_categories" validate constraint "shop_categories_shop_id_fkey";

alter table "public"."shop_followers" add constraint "shop_followers_shop_id_fkey" FOREIGN KEY (shop_id) REFERENCES public.shops(id) ON DELETE CASCADE not valid;

alter table "public"."shop_followers" validate constraint "shop_followers_shop_id_fkey";

alter table "public"."shop_followers" add constraint "shop_followers_shop_id_user_id_key" UNIQUE using index "shop_followers_shop_id_user_id_key";

alter table "public"."shop_followers" add constraint "shop_followers_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE not valid;

alter table "public"."shop_followers" validate constraint "shop_followers_user_id_fkey";

alter table "public"."shop_wallet_transactions" add constraint "shop_wallet_transactions_shop_id_fkey" FOREIGN KEY (shop_id) REFERENCES public.shops(id) ON DELETE CASCADE not valid;

alter table "public"."shop_wallet_transactions" validate constraint "shop_wallet_transactions_shop_id_fkey";

alter table "public"."shop_wallet_transactions" add constraint "shop_wallet_transactions_type_check" CHECK ((type = ANY (ARRAY['sale'::text, 'bonus'::text, 'withdrawal'::text]))) not valid;

alter table "public"."shop_wallet_transactions" validate constraint "shop_wallet_transactions_type_check";

alter table "public"."shops" add constraint "shops_owner_id_fkey" FOREIGN KEY (owner_id) REFERENCES public.profiles(id) ON DELETE CASCADE not valid;

alter table "public"."shops" validate constraint "shops_owner_id_fkey";

alter table "public"."store_quotas" add constraint "store_quotas_code_key" UNIQUE using index "store_quotas_code_key";

alter table "public"."store_quotas" add constraint "store_quotas_created_by_fkey" FOREIGN KEY (created_by) REFERENCES public.profiles(id) ON DELETE SET NULL not valid;

alter table "public"."store_quotas" validate constraint "store_quotas_created_by_fkey";

alter table "public"."store_quotas" add constraint "store_quotas_used_by_shop_id_fkey" FOREIGN KEY (used_by_shop_id) REFERENCES public.shops(id) ON DELETE SET NULL not valid;

alter table "public"."store_quotas" validate constraint "store_quotas_used_by_shop_id_fkey";

alter table "public"."user_addresses" add constraint "user_addresses_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE not valid;

alter table "public"."user_addresses" validate constraint "user_addresses_user_id_fkey";

alter table "public"."user_payment_methods" add constraint "user_payment_methods_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE not valid;

alter table "public"."user_payment_methods" validate constraint "user_payment_methods_user_id_fkey";

set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.add_free_categories(p_shop_id uuid, p_category_ids uuid[])
 RETURNS json
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
    v_shop_owner_id UUID;
    cat_id UUID;
    result JSON;
BEGIN
    SELECT owner_id INTO v_shop_owner_id
    FROM shops WHERE id = p_shop_id;
    
    IF v_shop_owner_id IS NULL THEN
        RAISE EXCEPTION 'Shop not found.';
    END IF;

    IF v_shop_owner_id != auth.uid() THEN
        RAISE EXCEPTION 'You do not have permission to modify this shop.';
    END IF;

    IF p_category_ids IS NOT NULL THEN
        FOREACH cat_id IN ARRAY p_category_ids
        LOOP
            INSERT INTO shop_categories (shop_id, category_id)
            VALUES (p_shop_id, cat_id)
            ON CONFLICT DO NOTHING;
        END LOOP;
    END IF;

    result := json_build_object(
        'success', true
    );

    RETURN result;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.admin_deduct_wallet(target_user_id uuid, amount numeric, is_token boolean)
 RETURNS json
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
    is_admin BOOLEAN;
    new_wallet NUMERIC;
    new_token NUMERIC;
    result JSON;
BEGIN
    -- 1. Check if caller is admin
    is_admin := EXISTS (
        SELECT 1 FROM public.profiles
        WHERE profiles.id = auth.uid()
        AND profiles.role = 'admin'
    );

    IF NOT is_admin THEN
        RAISE EXCEPTION 'Unauthorized: Only admins can perform this action.';
    END IF;

    -- 2. Validate input
    IF amount <= 0 THEN
        RAISE EXCEPTION 'Deduct amount must be greater than zero';
    END IF;

    -- 3. Lock and check if target user exists
    PERFORM 1 FROM public.profiles WHERE profiles.id = target_user_id FOR UPDATE;
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Target user not found';
    END IF;

    -- 4. Update the balance
    IF is_token THEN
        UPDATE public.profiles
        SET token_balance = GREATEST(token_balance - amount, 0)
        WHERE id = target_user_id
        RETURNING wallet_balance, token_balance INTO new_wallet, new_token;
    ELSE
        UPDATE public.profiles
        SET wallet_balance = GREATEST(wallet_balance - amount, 0)
        WHERE id = target_user_id
        RETURNING wallet_balance, token_balance INTO new_wallet, new_token;
    END IF;

    -- 5. Return updated balances
    result := json_build_object(
        'wallet_balance', new_wallet,
        'token_balance', new_token
    );

    RETURN result;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.admin_top_up_wallet(target_user_id uuid, amount numeric, is_token boolean)
 RETURNS json
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
    is_admin BOOLEAN;
    new_wallet NUMERIC;
    new_token NUMERIC;
    result JSON;
BEGIN
    -- 1. Check if caller is admin
    SELECT EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid()
        AND role = 'admin'
    ) INTO is_admin;

    IF NOT is_admin THEN
        RAISE EXCEPTION 'Unauthorized: Only admins can perform this action.';
    END IF;

    -- 2. Validate input
    IF amount <= 0 THEN
        RAISE EXCEPTION 'Top-up amount must be greater than zero';
    END IF;

    -- 3. Lock and check if target user exists
    PERFORM 1 FROM public.profiles WHERE id = target_user_id FOR UPDATE;
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Target user not found';
    END IF;

    -- 4. Update the balance
    IF is_token THEN
        UPDATE public.profiles
        SET token_balance = token_balance + amount
        WHERE id = target_user_id
        RETURNING wallet_balance, token_balance INTO new_wallet, new_token;
    ELSE
        UPDATE public.profiles
        SET wallet_balance = wallet_balance + amount
        WHERE id = target_user_id
        RETURNING wallet_balance, token_balance INTO new_wallet, new_token;
    END IF;

    -- 5. Return updated balances
    result := json_build_object(
        'wallet_balance', new_wallet,
        'token_balance', new_token
    );

    RETURN result;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.boost_frequency_to_interval(freq text)
 RETURNS interval
 LANGUAGE plpgsql
 IMMUTABLE
AS $function$
BEGIN
  RETURN CASE freq
    WHEN 'minute'      THEN INTERVAL '1 minute'
    WHEN '5_minutes'   THEN INTERVAL '5 minutes'
    WHEN '15_minutes'  THEN INTERVAL '15 minutes'
    WHEN '30_minutes'  THEN INTERVAL '30 minutes'
    WHEN 'hourly'      THEN INTERVAL '1 hour'
    WHEN 'daily'       THEN INTERVAL '1 day'
    WHEN 'weekly'      THEN INTERVAL '1 week'
    ELSE                    INTERVAL '1 hour'
  END;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.buy_custom_quota(p_shop_id uuid, p_limit_amount integer, p_duration_days integer, p_category_ids uuid[], p_cost_amount numeric)
 RETURNS json
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
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
    category_limit = LEAST(GREATEST(COALESCE(category_limit,0), 0) + COALESCE(array_length(p_category_ids, 1), 0), (SELECT count(*)::integer FROM categories)),
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
$function$
;

CREATE OR REPLACE FUNCTION public.buy_quota_package(p_shop_id uuid, p_package_id uuid)
 RETURNS json
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
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
  UPDATE shops SET product_limit = GREATEST(product_limit,0) + v_pkg.product_limit, category_limit = LEAST(GREATEST(COALESCE(category_limit,0),0) + COALESCE(v_pkg.category_limit,0), (SELECT count(*)::integer FROM categories)), quota_expires_at = v_expires WHERE id = p_shop_id;
  INSERT INTO quota_history (shop_id, type, amount, category_amount, duration_days, source, cost) VALUES (p_shop_id, 'purchase', v_pkg.product_limit, v_pkg.category_limit, v_pkg.duration_days, v_pkg.name, v_pkg.price);
  RETURN json_build_object('success', true, 'message', 'Quota purchased successfully.', 'expires_at', v_expires);
END;
$function$
;

CREATE OR REPLACE FUNCTION public.buy_shop_quota(p_shop_id uuid, p_limit_amount integer, p_duration_days integer, p_cost_amount numeric)
 RETURNS json
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
    current_wallet NUMERIC;
    v_shop_owner_id UUID;
    v_current_limit INTEGER;
    v_current_expires_at TIMESTAMP WITH TIME ZONE;
    new_wallet NUMERIC;
    new_expires_at TIMESTAMP WITH TIME ZONE;
    result JSON;
BEGIN
    IF p_limit_amount <= 0 OR p_cost_amount <= 0 THEN
        RAISE EXCEPTION 'Quota limit amount and cost must be greater than zero';
    END IF;

    -- 1. Check if the shop belongs to the current user
    SELECT owner_id, product_limit, quota_expires_at INTO v_shop_owner_id, v_current_limit, v_current_expires_at 
    FROM shops 
    WHERE id = p_shop_id;
    
    IF v_shop_owner_id IS NULL THEN
        RAISE EXCEPTION 'Shop not found.';
    END IF;

    IF v_shop_owner_id != auth.uid() THEN
        RAISE EXCEPTION 'You do not have permission to modify this shop.';
    END IF;

    -- 2. Lock the profile row for update to prevent race conditions
    SELECT wallet_balance INTO current_wallet
    FROM public.profiles
    WHERE id = auth.uid()
    FOR UPDATE;

    IF current_wallet IS NULL THEN
        RAISE EXCEPTION 'User not found or not authenticated';
    END IF;

    IF current_wallet < p_cost_amount THEN
        RAISE EXCEPTION 'Insufficient wallet balance. You need % but have %', p_cost_amount, current_wallet;
    END IF;

    -- 3. Calculate new expiration date
    IF p_duration_days IS NOT NULL THEN
        new_expires_at := timezone('utc'::text, now()) + (p_duration_days || ' days')::interval;
    ELSE
        new_expires_at := NULL;
    END IF;

    -- 4. Deduct wallet balance
    UPDATE public.profiles
    SET wallet_balance = wallet_balance - p_cost_amount
    WHERE id = auth.uid()
    RETURNING wallet_balance INTO new_wallet;

    -- 5. Update shop quota
    UPDATE shops
    SET 
        product_limit = p_limit_amount,
        quota_expires_at = new_expires_at
    WHERE id = p_shop_id;

    -- Return the updated data as JSON
    result := json_build_object(
        'wallet_balance', new_wallet,
        'new_limit', p_limit_amount,
        'expires_at', new_expires_at
    );

    RETURN result;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.buy_shop_quota(p_shop_id uuid, p_limit_amount integer, p_duration_days integer, p_cost_amount numeric, p_package_name text DEFAULT NULL::text, p_category_limit integer DEFAULT 0)
 RETURNS json
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
    current_wallet NUMERIC;
    v_shop_owner_id UUID;
    v_current_expires_at TIMESTAMP WITH TIME ZONE;
    v_current_limit INTEGER;
    v_current_category_limit INTEGER;
    new_wallet NUMERIC;
    new_expires_at TIMESTAMP WITH TIME ZONE;
    new_product_limit INTEGER;
    new_category_limit INTEGER;
    result JSON;
BEGIN
    IF p_limit_amount <= 0 OR p_cost_amount < 0 THEN
        RAISE EXCEPTION 'Quota limit amount must be greater than zero';
    END IF;

    SELECT owner_id, quota_expires_at, product_limit, category_limit
    INTO v_shop_owner_id, v_current_expires_at, v_current_limit, v_current_category_limit
    FROM shops WHERE id = p_shop_id;

    IF v_shop_owner_id IS NULL THEN
        RAISE EXCEPTION 'Shop not found';
    END IF;

    IF v_shop_owner_id != auth.uid() THEN
        RAISE EXCEPTION 'You do not have permission to modify this shop';
    END IF;

    SELECT wallet_balance INTO current_wallet
    FROM profiles WHERE id = auth.uid() FOR UPDATE;

    IF current_wallet < p_cost_amount THEN
        RAISE EXCEPTION 'Insufficient wallet balance';
    END IF;

    new_wallet := current_wallet - p_cost_amount;
    UPDATE profiles SET wallet_balance = new_wallet WHERE id = auth.uid();

    -- Determine Expiry
    IF p_duration_days IS NOT NULL THEN
        IF v_current_expires_at IS NOT NULL AND v_current_expires_at > timezone('utc'::text, now()) THEN
            new_expires_at := v_current_expires_at + (p_duration_days || ' days')::interval;
        ELSE
            new_expires_at := timezone('utc'::text, now()) + (p_duration_days || ' days')::interval;
        END IF;
    ELSE
        new_expires_at := NULL;
    END IF;

    -- Check if currently expired (reset limits if so)
    IF v_current_expires_at IS NOT NULL AND v_current_expires_at < timezone('utc'::text, now()) THEN
        v_current_limit := 0;
        v_current_category_limit := 0;
    END IF;

    new_product_limit := COALESCE(v_current_limit, 0) + p_limit_amount;
    new_category_limit := COALESCE(v_current_category_limit, 0) + p_category_limit;

    UPDATE shops
    SET product_limit    = new_product_limit,
        quota_expires_at = new_expires_at,
        category_limit   = new_category_limit
    WHERE id = p_shop_id;

    INSERT INTO quota_history (shop_id, type, amount, duration_days, source, cost)
    VALUES (p_shop_id, 'purchase', p_limit_amount, p_duration_days, COALESCE(p_package_name, 'Package'), p_cost_amount);

    result := json_build_object(
        'success', true,
        'new_wallet', new_wallet,
        'new_limit', new_product_limit,
        'expires_at', new_expires_at,
        'new_category_limit', new_category_limit
    );

    RETURN result;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.buy_tokens(token_amount numeric, cost_amount numeric)
 RETURNS json
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
    current_wallet NUMERIC;
    new_wallet NUMERIC;
    new_token NUMERIC;
    result JSON;
BEGIN
    IF token_amount <= 0 OR cost_amount <= 0 THEN
        RAISE EXCEPTION 'Token amount and cost must be greater than zero';
    END IF;

    -- Lock the row for update to prevent race conditions
    SELECT wallet_balance INTO current_wallet
    FROM public.profiles
    WHERE id = auth.uid()
    FOR UPDATE;

    IF current_wallet IS NULL THEN
        RAISE EXCEPTION 'User not found or not authenticated';
    END IF;

    IF current_wallet < cost_amount THEN
        RAISE EXCEPTION 'Insufficient wallet balance. You need % but have %', cost_amount, current_wallet;
    END IF;

    -- Proceed with the transaction
    UPDATE public.profiles
    SET 
        wallet_balance = wallet_balance - cost_amount,
        token_balance = token_balance + token_amount
    WHERE id = auth.uid()
    RETURNING wallet_balance, token_balance INTO new_wallet, new_token;

    -- Return the updated balances as JSON
    result := json_build_object(
        'wallet_balance', new_wallet,
        'token_balance', new_token
    );

    RETURN result;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.decrement_stock(p_variant_id uuid, p_product_id uuid, p_quantity integer)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
BEGIN
  -- 1. ตัดสต็อกที่ตาราง Product Variants (ตัวเลือกสินค้า)
  IF p_variant_id IS NOT NULL THEN
    UPDATE product_variants 
    SET stock_quantity = GREATEST(0, stock_quantity - p_quantity)
    WHERE id = p_variant_id;
  END IF;
  
  -- 2. ตัดสต็อกที่ตาราง Products (ยอดรวมสินค้าหลัก)
  UPDATE products
  SET stock_quantity = GREATEST(0, stock_quantity - p_quantity)
  WHERE id = p_product_id;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.delete_all_bots()
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
BEGIN
  -- Check if user is admin
  IF NOT EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'admin'
  ) THEN
    RAISE EXCEPTION 'Only admins can delete bots';
  END IF;

  -- Delete from auth.users where profile is_bot
  DELETE FROM auth.users 
  WHERE id IN (
    SELECT id FROM public.profiles WHERE is_bot = true
  );
END;
$function$
;

CREATE OR REPLACE FUNCTION public.delete_bot(p_bot_id uuid)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
BEGIN
  -- Check if user is admin
  IF NOT EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'admin'
  ) THEN
    RAISE EXCEPTION 'Only admins can delete bots';
  END IF;

  -- Ensure it's actually a bot
  IF NOT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = p_bot_id AND is_bot = true
  ) THEN
    RAISE EXCEPTION 'User is not a bot or does not exist';
  END IF;

  -- Delete from auth.users (this should cascade to profiles and other tables)
  DELETE FROM auth.users WHERE id = p_bot_id;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.enforce_shop_product_limit()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
DECLARE
  v_shop_limit INTEGER;
  v_shop_expires_at TIMESTAMP WITH TIME ZONE;
  v_current_product_count INTEGER;
  v_is_category_allowed BOOLEAN;
BEGIN
  -- 1. Get the shop's product limit and expiration
  SELECT product_limit, quota_expires_at 
  INTO v_shop_limit, v_shop_expires_at
  FROM shops 
  WHERE id = NEW.shop_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Shop not found.';
  END IF;

  -- 2. Check expiration if it is set
  IF v_shop_expires_at IS NOT NULL AND v_shop_expires_at < timezone('utc'::text, now()) THEN
    RAISE EXCEPTION 'Your store quota has expired. Please redeem a new quota code or top up your quota.';
  END IF;

  -- 3. Check Category Allowance
  -- If there are NO entries in shop_categories for this shop, we assume they are on the old system and can post anywhere?
  -- Or maybe we force everyone to buy categories now? Let's check if the shop has ANY categories purchased.
  -- Wait, if they haven't bought any, we shouldn't let them post if we enforce it. 
  -- But for backwards compatibility, maybe we just enforce it if there is at least 1 rule?
  -- Let's just enforce it strictly. If they want to post in a category, it must be in shop_categories.
  
  -- But actually, we don't want to break existing shops instantly. 
  -- Let's just do a direct check: is this category_id in shop_categories?
  SELECT EXISTS(
    SELECT 1 FROM shop_categories 
    WHERE shop_id = NEW.shop_id AND category_id = NEW.category_id
  ) INTO v_is_category_allowed;

  -- If we want to strictly enforce it:
  -- IF NOT v_is_category_allowed THEN
  --   RAISE EXCEPTION 'You are not authorized to list products in this category. Please purchase this category in your Quota Settings.';
  -- END IF;
  -- FOR NOW, we'll implement it softly: We'll allow it if shop_categories is EMPTY for this shop (legacy mode), 
  -- but if they have at least 1 category, they are in the new mode and MUST have the category.
  IF NOT v_is_category_allowed THEN
      IF EXISTS(SELECT 1 FROM shop_categories WHERE shop_id = NEW.shop_id) THEN
          RAISE EXCEPTION 'You have not unlocked this category. Please purchase access to this category.';
      END IF;
  END IF;


  -- 4. Get current active products count
  SELECT COUNT(*) 
  INTO v_current_product_count 
  FROM products 
  WHERE shop_id = NEW.shop_id;

  -- 5. Check limit
  IF v_current_product_count >= v_shop_limit THEN
    RAISE EXCEPTION 'You have reached your product limit of %. Please redeem a quota code to add more products.', v_shop_limit;
  END IF;

  RETURN NEW;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.get_db_stats()
 RETURNS json
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
  total_cluster_size bigint;
  wal_size bigint;
  active_conns int;
  max_conns int;
  recent_queries json;
BEGIN
  -- 1. ขนาด Database
  SELECT sum(pg_tablespace_size(oid)) INTO total_cluster_size FROM pg_tablespace;
  BEGIN
    SELECT COALESCE(sum(size), 0) INTO wal_size FROM pg_ls_waldir();
  EXCEPTION WHEN OTHERS THEN wal_size := 0; END;
  
  -- 2. Connections
  SELECT count(*) INTO active_conns FROM pg_stat_activity;
  SELECT setting::int INTO max_conns FROM pg_settings WHERE name = 'max_connections';
  
  -- 3. Live Queries (ประวัติการใช้งานจริง 15 รายการล่าสุด)
  SELECT json_agg(
    json_build_object(
      'pid', pid,
      'state', state,
      'query', substr(query, 1, 200),
      'state_change', state_change
    )
  ) INTO recent_queries
  FROM (
    SELECT pid, state, query, state_change
    FROM pg_stat_activity
    WHERE query IS NOT NULL 
      AND query NOT LIKE '%pg_stat_activity%' -- ไม่เอา query ที่เกิดจากการ poll หน้าจอนี้
      AND pid != pg_backend_pid()
    ORDER BY state_change DESC
    LIMIT 15
  ) q;

  RETURN json_build_object(
    'database_size_bytes', total_cluster_size + wal_size,
    'active_connections', active_conns,
    'total_connections', max_conns,
    'recent_queries', COALESCE(recent_queries, '[]'::json)
  );
END;
$function$
;

CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  INSERT INTO public.profiles (
    id,
    full_name,
    avatar_url,
    role,
    allow_credit_card,
    wallet_balance,
    token_balance
  )
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'avatar_url', ''),
    'customer',
    false,
    0,
    0
  )
  ON CONFLICT (id) DO NOTHING;

  -- อัปเดต email ถ้ามีคอลัมน์นี้ (safe update)
  UPDATE public.profiles
  SET email = COALESCE(NEW.email, '')
  WHERE id = NEW.id AND email IS NULL;

  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    RAISE WARNING '[handle_new_user] User % error: % (%)', NEW.id, SQLERRM, SQLSTATE;
    RETURN NEW;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.increment_view_count(product_id_input uuid)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
BEGIN
  UPDATE products
  SET view_count = COALESCE(view_count, 0) + 1
  WHERE id = product_id_input;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.is_admin()
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
END;
$function$
;

CREATE OR REPLACE FUNCTION public.is_item_vendor(p_shop_id uuid)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM shops 
    WHERE id = p_shop_id AND owner_id = auth.uid()
  );
END;
$function$
;

CREATE OR REPLACE FUNCTION public.is_order_buyer(p_order_id uuid)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM orders 
    WHERE id = p_order_id AND user_id = auth.uid()
  );
END;
$function$
;

CREATE OR REPLACE FUNCTION public.is_order_vendor(p_order_id uuid)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM order_items 
    WHERE order_id = p_order_id 
    AND shop_id IN (SELECT id FROM shops WHERE owner_id = auth.uid())
  );
END;
$function$
;

CREATE OR REPLACE FUNCTION public.mark_order_delivered(p_order_id uuid)
 RETURNS json
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
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
$function$
;

CREATE OR REPLACE FUNCTION public.pay_order_guarantee(p_shop_id uuid, p_item_ids uuid[])
 RETURNS json
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
  v_shop_owner_id UUID;
  v_total_amount NUMERIC := 0;
  v_wallet_balance NUMERIC;
  v_shipping_days INTEGER;
  v_item RECORD;
BEGIN
  SELECT owner_id INTO v_shop_owner_id FROM public.shops WHERE id = p_shop_id;
  IF v_shop_owner_id IS NULL THEN RETURN json_build_object('success', false, 'message', 'Shop not found.'); END IF;
  FOR v_item IN SELECT id, price, quantity FROM public.order_items WHERE id = ANY(p_item_ids) AND shop_id = p_shop_id AND guarantee_paid = false LOOP
    v_total_amount := v_total_amount + (v_item.price * v_item.quantity);
  END LOOP;
  IF v_total_amount = 0 THEN RETURN json_build_object('success', false, 'message', 'No valid items to pay for.'); END IF;
  SELECT wallet_balance INTO v_wallet_balance FROM public.profiles WHERE id = v_shop_owner_id;
  IF v_wallet_balance < v_total_amount THEN RETURN json_build_object('success', false, 'message', 'Insufficient wallet balance.'); END IF;
  UPDATE public.profiles SET wallet_balance = wallet_balance - v_total_amount WHERE id = v_shop_owner_id;
  UPDATE public.order_items SET guarantee_paid = true, guarantee_paid_at = NOW() WHERE id = ANY(p_item_ids) AND shop_id = p_shop_id;
  SELECT COALESCE(shipping_days, 3) INTO v_shipping_days FROM public.quota_settings WHERE id = 1;
  IF v_shipping_days IS NULL THEN v_shipping_days := 3; END IF;
  UPDATE public.orders SET status = 'processing', expected_delivery_date = timezone('utc', now()) + (v_shipping_days || ' days')::INTERVAL
  WHERE id IN (SELECT order_id FROM public.order_items WHERE id = ANY(p_item_ids) AND shop_id = p_shop_id);
  RETURN json_build_object('success', true, 'amount_deducted', v_total_amount);
END;
$function$
;

CREATE OR REPLACE FUNCTION public.pay_with_wallet(p_amount numeric)
 RETURNS json
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
    current_wallet NUMERIC;
    new_wallet NUMERIC;
BEGIN
    SELECT wallet_balance INTO current_wallet
    FROM public.profiles
    WHERE id = auth.uid()
    FOR UPDATE;

    IF current_wallet IS NULL THEN
        RAISE EXCEPTION 'User profile not found';
    END IF;

    IF current_wallet < p_amount THEN
        RAISE EXCEPTION 'Insufficient wallet balance. You need % but have %', p_amount, current_wallet;
    END IF;

    UPDATE public.profiles
    SET wallet_balance = wallet_balance - p_amount
    WHERE id = auth.uid()
    RETURNING wallet_balance INTO new_wallet;

    RETURN json_build_object('success', true, 'new_balance', new_wallet);
END;
$function$
;

CREATE OR REPLACE FUNCTION public.place_order(p_user_id uuid, p_total_amount numeric, p_shipping_address_id uuid, p_items jsonb)
 RETURNS json
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
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
$function$
;

CREATE OR REPLACE FUNCTION public.process_auto_boosts()
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  rec    RECORD;
  now_ts TIMESTAMP WITH TIME ZONE := NOW();
  v_prev TEXT;
BEGIN
  v_prev := current_setting('skip_audit', true);
  PERFORM set_config('skip_audit', 'true', true);

  BEGIN
    FOR rec IN
      SELECT p.id AS user_id, p.auto_boost_amount, p.auto_boost_frequency
      FROM profiles p
      WHERE p.auto_boost_enabled = true
        AND (
          p.last_auto_boost_at IS NULL
          OR (now_ts - p.last_auto_boost_at)
               >= public.boost_frequency_to_interval(p.auto_boost_frequency)
        )
    LOOP
      UPDATE products
      SET view_count = COALESCE(view_count, 0) + rec.auto_boost_amount
      WHERE shop_id IN (
        SELECT id FROM shops WHERE owner_id = rec.user_id
      );

      UPDATE profiles
      SET last_auto_boost_at = now_ts
      WHERE id = rec.user_id;
    END LOOP;

    FOR rec IN
      SELECT p.id AS user_id, p.auto_like_boost_amount, p.auto_like_boost_frequency
      FROM profiles p
      WHERE p.auto_like_boost_enabled = true
        AND (
          p.last_auto_like_boost_at IS NULL
          OR (now_ts - p.last_auto_like_boost_at)
               >= public.boost_frequency_to_interval(p.auto_like_boost_frequency)
        )
    LOOP
      UPDATE products
      SET like_count = COALESCE(like_count, 0) + rec.auto_like_boost_amount
      WHERE shop_id IN (
        SELECT id FROM shops WHERE owner_id = rec.user_id
      );

      UPDATE profiles
      SET last_auto_like_boost_at = now_ts
      WHERE id = rec.user_id;
    END LOOP;

  EXCEPTION WHEN OTHERS THEN
    PERFORM set_config('skip_audit', COALESCE(v_prev, ''), true);
    RAISE;
  END;

  PERFORM set_config('skip_audit', COALESCE(v_prev, ''), true);
END;
$function$
;

CREATE OR REPLACE FUNCTION public.process_auto_deliveries()
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE v_order RECORD;
BEGIN
  FOR v_order IN 
    SELECT DISTINCT o.id FROM public.orders o JOIN public.order_items oi ON oi.order_id = o.id
    WHERE o.status IN ('pending', 'processing', 'shipped') AND oi.guarantee_paid = true AND o.expected_delivery_date IS NOT NULL AND o.expected_delivery_date <= timezone('utc', now())
  LOOP PERFORM public.mark_order_delivered(v_order.id); END LOOP;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.process_bot_simulations()
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE job RECORD; v_bot_id UUID; v_product RECORD; v_order_id UUID; v_quantity INTEGER; v_price DECIMAL; v_total DECIMAL; v_address_id UUID; i INTEGER;
BEGIN
  FOR job IN SELECT * FROM bot_simulation_jobs WHERE status = 'active' AND (max_runs IS NULL OR max_runs > 0) AND (last_run_at IS NULL OR NOW() >= last_run_at + (interval_minutes * interval '1 minute')) LOOP
    FOR i IN 1..(floor(random() * (job.bot_count_max - job.bot_count_min + 1)) + job.bot_count_min) LOOP
      SELECT id INTO v_bot_id FROM profiles WHERE is_bot = true ORDER BY random() LIMIT 1;
      IF v_bot_id IS NULL THEN CONTINUE; END IF;
      SELECT id INTO v_address_id FROM user_addresses WHERE user_id = v_bot_id LIMIT 1;
      IF v_address_id IS NULL THEN
        INSERT INTO user_addresses (user_id, full_name, phone, province, city, district, postal_code, address_line, is_default)
        VALUES (v_bot_id, 'Bot Customer', '0800000000', 'Bangkok', 'Bangkok', 'Pathum Wan', '10330', '123 Bot St', true) RETURNING id INTO v_address_id;
      END IF;
      IF job.price_preference = 'cheap' THEN SELECT * INTO v_product FROM products WHERE shop_id = job.shop_id AND is_published = true AND stock_quantity > 0 ORDER BY price ASC LIMIT 1;
      ELSIF job.price_preference = 'expensive' THEN SELECT * INTO v_product FROM products WHERE shop_id = job.shop_id AND is_published = true AND stock_quantity > 0 ORDER BY price DESC LIMIT 1;
      ELSE SELECT * INTO v_product FROM products WHERE shop_id = job.shop_id AND is_published = true AND stock_quantity > 0 ORDER BY random() LIMIT 1; END IF;
      IF v_product IS NULL THEN CONTINUE; END IF;
      v_quantity := floor(random() * (job.items_per_order_max - job.items_per_order_min + 1)) + job.items_per_order_min;
      IF v_quantity > v_product.stock_quantity THEN v_quantity := v_product.stock_quantity; END IF;
      IF v_quantity <= 0 THEN CONTINUE; END IF;
      v_price := v_product.price; v_total := v_price * v_quantity;
      INSERT INTO orders (user_id, total_amount, status, shipping_address_id) VALUES (v_bot_id, v_total, 'pending', v_address_id) RETURNING id INTO v_order_id;
      INSERT INTO order_items (order_id, product_id, quantity, price, shop_id) VALUES (v_order_id, v_product.id, v_quantity, v_price, job.shop_id);
      UPDATE products SET stock_quantity = stock_quantity - v_quantity WHERE id = v_product.id;
    END LOOP;
    IF job.max_runs IS NOT NULL THEN UPDATE bot_simulation_jobs SET last_run_at = NOW(), max_runs = max_runs - 1, status = CASE WHEN (max_runs - 1) <= 0 THEN 'paused' ELSE 'active' END WHERE id = job.id;
    ELSE UPDATE bot_simulation_jobs SET last_run_at = NOW() WHERE id = job.id; END IF;
  END LOOP;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.process_promote_boosts()
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
    UPDATE public.products
    SET view_count = COALESCE(view_count, 0) + boost_per_minute
    WHERE is_promoted    = true
      AND promote_type   = 'views'
      AND promoted_until > NOW()
      AND boost_per_minute > 0;

    UPDATE public.products
    SET like_count = COALESCE(like_count, 0) + boost_per_minute
    WHERE is_promoted    = true
      AND promote_type   = 'likes'
      AND promoted_until > NOW()
      AND boost_per_minute > 0;

    UPDATE public.products
    SET is_promoted      = false,
        boost_per_minute = 0
    WHERE is_promoted    = true
      AND promoted_until <= NOW();
END;
$function$
;

CREATE OR REPLACE FUNCTION public.promote_product(p_product_id uuid, p_promote_type text, p_token_cost numeric)
 RETURNS json
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
    current_tokens NUMERIC;
    new_tokens NUMERIC;
    result JSON;
    v_shop_id UUID;
    v_vendor_id UUID;
BEGIN
    -- Verify the user owns the shop that owns this product
    SELECT shop_id INTO v_shop_id FROM public.products WHERE id = p_product_id;
    IF v_shop_id IS NULL THEN
        RAISE EXCEPTION 'Product not found';
    END IF;

    SELECT vendor_id INTO v_vendor_id FROM public.shops WHERE id = v_shop_id;
    IF v_vendor_id != auth.uid() THEN
        RAISE EXCEPTION 'Unauthorized to promote this product';
    END IF;

    -- Lock the profile row for update to prevent race conditions
    SELECT token_balance INTO current_tokens
    FROM public.profiles
    WHERE id = auth.uid()
    FOR UPDATE;

    IF current_tokens IS NULL THEN
        RAISE EXCEPTION 'User not found or not authenticated';
    END IF;

    IF current_tokens < p_token_cost THEN
        RAISE EXCEPTION 'Insufficient tokens. You need % but have %', p_token_cost, current_tokens;
    END IF;

    -- Deduct tokens
    UPDATE public.profiles
    SET token_balance = token_balance - p_token_cost
    WHERE id = auth.uid()
    RETURNING token_balance INTO new_tokens;

    -- Update the product status
    UPDATE public.products
    SET 
        is_promoted = true,
        promote_type = p_promote_type,
        promoted_at = NOW()
    WHERE id = p_product_id;

    -- Return the updated token balance as JSON
    result := json_build_object(
        'token_balance', new_tokens
    );

    RETURN result;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.promote_product(p_product_id uuid, p_promote_type text, p_token_cost numeric, p_promoted_until timestamp with time zone)
 RETURNS json
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
    current_tokens NUMERIC;
    new_tokens NUMERIC;
    result JSON;
    v_shop_id UUID;
    v_owner_id UUID;
BEGIN
    -- Verify the user owns the shop that owns this product
    SELECT shop_id INTO v_shop_id FROM public.products WHERE id = p_product_id;
    IF v_shop_id IS NULL THEN
        RAISE EXCEPTION 'Product not found';
    END IF;

    SELECT owner_id INTO v_owner_id FROM public.shops WHERE id = v_shop_id;
    IF v_owner_id != auth.uid() THEN
        RAISE EXCEPTION 'Unauthorized to promote this product';
    END IF;

    -- Lock the profile row for update to prevent race conditions
    SELECT token_balance INTO current_tokens
    FROM public.profiles
    WHERE id = auth.uid()
    FOR UPDATE;

    IF current_tokens IS NULL THEN
        RAISE EXCEPTION 'User not found or not authenticated';
    END IF;

    IF current_tokens < p_token_cost THEN
        RAISE EXCEPTION 'Insufficient tokens. You need % but have %', p_token_cost, current_tokens;
    END IF;

    -- Deduct tokens
    UPDATE public.profiles
    SET token_balance = token_balance - p_token_cost
    WHERE id = auth.uid()
    RETURNING token_balance INTO new_tokens;

    -- Update the product status with duration
    UPDATE public.products
    SET 
        is_promoted = true,
        promote_type = p_promote_type,
        promoted_at = NOW(),
        promoted_until = p_promoted_until
    WHERE id = p_product_id;

    -- Return the updated token balance as JSON
    result := json_build_object(
        'token_balance', new_tokens
    );

    RETURN result;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.promote_product(p_product_id uuid, p_promote_type text, p_token_cost numeric, p_promoted_until timestamp with time zone, p_boost_per_minute integer DEFAULT 1)
 RETURNS json
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
    current_wallet NUMERIC;
    new_wallet     NUMERIC;
    result         JSON;
    v_shop_id      UUID;
    v_owner_id     UUID;
BEGIN
    SELECT shop_id INTO v_shop_id FROM public.products WHERE id = p_product_id;
    IF v_shop_id IS NULL THEN
        RAISE EXCEPTION 'Product not found';
    END IF;

    SELECT owner_id INTO v_owner_id FROM public.shops WHERE id = v_shop_id;
    IF v_owner_id != auth.uid() THEN
        RAISE EXCEPTION 'Unauthorized to promote this product';
    END IF;

    SELECT wallet_balance INTO current_wallet
    FROM public.profiles
    WHERE id = auth.uid()
    FOR UPDATE;

    IF current_wallet IS NULL THEN
        RAISE EXCEPTION 'User not found or not authenticated';
    END IF;

    IF current_wallet < p_token_cost THEN
        RAISE EXCEPTION 'Insufficient wallet balance. You need % but have %', p_token_cost, current_wallet;
    END IF;

    UPDATE public.profiles
    SET wallet_balance = wallet_balance - p_token_cost
    WHERE id = auth.uid()
    RETURNING wallet_balance INTO new_wallet;

    UPDATE public.products
    SET
        is_promoted      = true,
        promote_type     = p_promote_type,
        promoted_at      = NOW(),
        promoted_until   = p_promoted_until,
        boost_per_minute = p_boost_per_minute
    WHERE id = p_product_id;

    result := json_build_object('wallet_balance', new_wallet);
    RETURN result;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.redeem_store_quota(p_quota_code text, p_shop_id uuid)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
  v_quota RECORD; v_owner UUID; v_shop shops%ROWTYPE; v_expires TIMESTAMP WITH TIME ZONE; v_special_expires TIMESTAMP WITH TIME ZONE;
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

  IF v_quota.is_special_quota THEN
    IF v_quota.duration_days IS NOT NULL THEN
      IF v_shop.special_quota_expires_at IS NOT NULL AND v_shop.special_quota_expires_at > now() THEN
        v_special_expires := v_shop.special_quota_expires_at + (v_quota.duration_days || ' days')::interval;
      ELSE
        v_special_expires := now() + (v_quota.duration_days || ' days')::interval;
      END IF;
    ELSE
      v_special_expires := NULL;
    END IF;
  ELSE
    v_special_expires := v_shop.special_quota_expires_at;
  END IF;

  UPDATE store_quotas SET is_used = true, used_by_shop_id = p_shop_id, used_at = now() WHERE id = v_quota.id;
  UPDATE shops SET 
    product_limit = GREATEST(product_limit,0) + v_quota.product_limit, 
    category_limit = LEAST(GREATEST(COALESCE(category_limit,0),0) + COALESCE(v_quota.category_limit,0), (SELECT count(*)::integer FROM categories)), 
    quota_expires_at = v_expires,
    sales_percentage = COALESCE(v_quota.sales_percentage, 0),
    has_special_quota = COALESCE(has_special_quota, false) OR v_quota.is_special_quota,
    special_quota_expires_at = v_special_expires
  WHERE id = p_shop_id;
  INSERT INTO quota_history (shop_id, type, amount, category_amount, duration_days, source, cost) VALUES (p_shop_id, 'code_redeem', v_quota.product_limit, COALESCE(v_quota.category_limit,0), v_quota.duration_days, p_quota_code, 0);
  RETURN json_build_object('success', true, 'message', 'Quota redeemed successfully.', 'new_limit', v_shop.product_limit + v_quota.product_limit, 'expires_at', v_expires)::jsonb;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.run_bot_job(p_job_id uuid)
 RETURNS json
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  job RECORD; v_bot_id UUID; v_product RECORD; v_order_id UUID;
  v_quantity INTEGER; v_price DECIMAL; v_total DECIMAL; v_address_id UUID;
  i INTEGER; v_bots_run INTEGER := 0; v_actual_runs INTEGER;
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

    IF job.price_preference = 'cheap' THEN SELECT * INTO v_product FROM products WHERE shop_id = job.shop_id AND is_published = true AND stock_quantity > 0 ORDER BY price ASC LIMIT 1;
    ELSIF job.price_preference = 'expensive' THEN SELECT * INTO v_product FROM products WHERE shop_id = job.shop_id AND is_published = true AND stock_quantity > 0 ORDER BY price DESC LIMIT 1;
    ELSE SELECT * INTO v_product FROM products WHERE shop_id = job.shop_id AND is_published = true AND stock_quantity > 0 ORDER BY random() LIMIT 1; END IF;

    IF v_product IS NULL THEN CONTINUE; END IF;
    v_quantity := floor(random() * (job.items_per_order_max - job.items_per_order_min + 1)) + job.items_per_order_min;
    IF v_quantity > v_product.stock_quantity THEN v_quantity := v_product.stock_quantity; END IF;
    IF v_quantity <= 0 THEN CONTINUE; END IF;

    v_price := v_product.price; v_total := v_price * v_quantity;
    INSERT INTO orders (user_id, total_amount, status, shipping_address_id) VALUES (v_bot_id, v_total, 'pending', v_address_id) RETURNING id INTO v_order_id;
    INSERT INTO order_items (order_id, product_id, quantity, price, shop_id) VALUES (v_order_id, v_product.id, v_quantity, v_price, job.shop_id);
    UPDATE products SET stock_quantity = stock_quantity - v_quantity WHERE id = v_product.id;
    v_bots_run := v_bots_run + 1;
  END LOOP;

  IF job.max_runs IS NOT NULL THEN
    UPDATE bot_simulation_jobs SET last_run_at = NOW(), max_runs = max_runs - 1, status = CASE WHEN (max_runs - 1) <= 0 THEN 'paused' ELSE 'active' END WHERE id = job.id;
  ELSE
    UPDATE bot_simulation_jobs SET last_run_at = NOW() WHERE id = job.id;
  END IF;

  RETURN json_build_object('success', true, 'bots_run', v_bots_run);
END;
$function$
;

CREATE OR REPLACE FUNCTION public.top_up_wallet(amount numeric)
 RETURNS numeric
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
    new_balance NUMERIC;
BEGIN
    IF amount <= 0 THEN
        RAISE EXCEPTION 'Top-up amount must be greater than zero';
    END IF;

    UPDATE public.profiles
    SET wallet_balance = wallet_balance + amount
    WHERE id = auth.uid()
    RETURNING wallet_balance INTO new_balance;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'User not found or not authenticated';
    END IF;

    RETURN new_balance;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.update_product_rating()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
  target_id UUID;
BEGIN
  -- ตรวจสอบว่าเป็นเคส ลบ หรือ เพิ่ม/แก้ไข
  IF (TG_OP = 'DELETE') THEN
    target_id := OLD.product_id;
  ELSE
    target_id := NEW.product_id;
  END IF;

  -- อัปเดตค่าลงในตาราง products
  UPDATE products
  SET 
    average_rating = (SELECT COALESCE(AVG(rating), 0) FROM reviews WHERE product_id = target_id),
    ratings_count = (SELECT COUNT(*) FROM reviews WHERE product_id = target_id)
  WHERE id = target_id;
  
  RETURN NULL;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.update_support_channels_updated_at()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
begin
  new.updated_at = now();
  return new;
end;
$function$
;

CREATE OR REPLACE FUNCTION public.withdraw_shop_wallet(p_shop_id uuid, p_amount numeric)
 RETURNS json
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
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
$function$
;

CREATE OR REPLACE FUNCTION public.update_background_jobs_updated_at()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$function$
;

grant delete on table "public"."addresses" to "anon";

grant insert on table "public"."addresses" to "anon";

grant references on table "public"."addresses" to "anon";

grant select on table "public"."addresses" to "anon";

grant trigger on table "public"."addresses" to "anon";

grant truncate on table "public"."addresses" to "anon";

grant update on table "public"."addresses" to "anon";

grant delete on table "public"."addresses" to "authenticated";

grant insert on table "public"."addresses" to "authenticated";

grant references on table "public"."addresses" to "authenticated";

grant select on table "public"."addresses" to "authenticated";

grant trigger on table "public"."addresses" to "authenticated";

grant truncate on table "public"."addresses" to "authenticated";

grant update on table "public"."addresses" to "authenticated";

grant delete on table "public"."addresses" to "service_role";

grant insert on table "public"."addresses" to "service_role";

grant references on table "public"."addresses" to "service_role";

grant select on table "public"."addresses" to "service_role";

grant trigger on table "public"."addresses" to "service_role";

grant truncate on table "public"."addresses" to "service_role";

grant update on table "public"."addresses" to "service_role";

grant delete on table "public"."admin_activity_log" to "anon";

grant insert on table "public"."admin_activity_log" to "anon";

grant references on table "public"."admin_activity_log" to "anon";

grant select on table "public"."admin_activity_log" to "anon";

grant trigger on table "public"."admin_activity_log" to "anon";

grant truncate on table "public"."admin_activity_log" to "anon";

grant update on table "public"."admin_activity_log" to "anon";

grant delete on table "public"."admin_activity_log" to "authenticated";

grant insert on table "public"."admin_activity_log" to "authenticated";

grant references on table "public"."admin_activity_log" to "authenticated";

grant select on table "public"."admin_activity_log" to "authenticated";

grant trigger on table "public"."admin_activity_log" to "authenticated";

grant truncate on table "public"."admin_activity_log" to "authenticated";

grant update on table "public"."admin_activity_log" to "authenticated";

grant delete on table "public"."admin_activity_log" to "service_role";

grant insert on table "public"."admin_activity_log" to "service_role";

grant references on table "public"."admin_activity_log" to "service_role";

grant select on table "public"."admin_activity_log" to "service_role";

grant trigger on table "public"."admin_activity_log" to "service_role";

grant truncate on table "public"."admin_activity_log" to "service_role";

grant update on table "public"."admin_activity_log" to "service_role";

grant delete on table "public"."api_keys" to "anon";

grant insert on table "public"."api_keys" to "anon";

grant references on table "public"."api_keys" to "anon";

grant select on table "public"."api_keys" to "anon";

grant trigger on table "public"."api_keys" to "anon";

grant truncate on table "public"."api_keys" to "anon";

grant update on table "public"."api_keys" to "anon";

grant delete on table "public"."api_keys" to "authenticated";

grant insert on table "public"."api_keys" to "authenticated";

grant references on table "public"."api_keys" to "authenticated";

grant select on table "public"."api_keys" to "authenticated";

grant trigger on table "public"."api_keys" to "authenticated";

grant truncate on table "public"."api_keys" to "authenticated";

grant update on table "public"."api_keys" to "authenticated";

grant delete on table "public"."api_keys" to "service_role";

grant insert on table "public"."api_keys" to "service_role";

grant references on table "public"."api_keys" to "service_role";

grant select on table "public"."api_keys" to "service_role";

grant trigger on table "public"."api_keys" to "service_role";

grant truncate on table "public"."api_keys" to "service_role";

grant update on table "public"."api_keys" to "service_role";

grant delete on table "public"."background_jobs" to "anon";

grant insert on table "public"."background_jobs" to "anon";

grant select on table "public"."background_jobs" to "anon";

grant update on table "public"."background_jobs" to "anon";

grant delete on table "public"."background_jobs" to "authenticated";

grant insert on table "public"."background_jobs" to "authenticated";

grant select on table "public"."background_jobs" to "authenticated";

grant update on table "public"."background_jobs" to "authenticated";

grant delete on table "public"."background_jobs" to "service_role";

grant insert on table "public"."background_jobs" to "service_role";

grant select on table "public"."background_jobs" to "service_role";

grant update on table "public"."background_jobs" to "service_role";

grant delete on table "public"."bot_simulation_jobs" to "anon";

grant insert on table "public"."bot_simulation_jobs" to "anon";

grant references on table "public"."bot_simulation_jobs" to "anon";

grant select on table "public"."bot_simulation_jobs" to "anon";

grant trigger on table "public"."bot_simulation_jobs" to "anon";

grant truncate on table "public"."bot_simulation_jobs" to "anon";

grant update on table "public"."bot_simulation_jobs" to "anon";

grant delete on table "public"."bot_simulation_jobs" to "authenticated";

grant insert on table "public"."bot_simulation_jobs" to "authenticated";

grant references on table "public"."bot_simulation_jobs" to "authenticated";

grant select on table "public"."bot_simulation_jobs" to "authenticated";

grant trigger on table "public"."bot_simulation_jobs" to "authenticated";

grant truncate on table "public"."bot_simulation_jobs" to "authenticated";

grant update on table "public"."bot_simulation_jobs" to "authenticated";

grant delete on table "public"."bot_simulation_jobs" to "service_role";

grant insert on table "public"."bot_simulation_jobs" to "service_role";

grant references on table "public"."bot_simulation_jobs" to "service_role";

grant select on table "public"."bot_simulation_jobs" to "service_role";

grant trigger on table "public"."bot_simulation_jobs" to "service_role";

grant truncate on table "public"."bot_simulation_jobs" to "service_role";

grant update on table "public"."bot_simulation_jobs" to "service_role";

grant delete on table "public"."categories" to "anon";

grant insert on table "public"."categories" to "anon";

grant references on table "public"."categories" to "anon";

grant select on table "public"."categories" to "anon";

grant trigger on table "public"."categories" to "anon";

grant truncate on table "public"."categories" to "anon";

grant update on table "public"."categories" to "anon";

grant delete on table "public"."categories" to "authenticated";

grant insert on table "public"."categories" to "authenticated";

grant references on table "public"."categories" to "authenticated";

grant select on table "public"."categories" to "authenticated";

grant trigger on table "public"."categories" to "authenticated";

grant truncate on table "public"."categories" to "authenticated";

grant update on table "public"."categories" to "authenticated";

grant delete on table "public"."categories" to "service_role";

grant insert on table "public"."categories" to "service_role";

grant references on table "public"."categories" to "service_role";

grant select on table "public"."categories" to "service_role";

grant trigger on table "public"."categories" to "service_role";

grant truncate on table "public"."categories" to "service_role";

grant update on table "public"."categories" to "service_role";

grant delete on table "public"."conversations" to "anon";

grant insert on table "public"."conversations" to "anon";

grant references on table "public"."conversations" to "anon";

grant select on table "public"."conversations" to "anon";

grant trigger on table "public"."conversations" to "anon";

grant truncate on table "public"."conversations" to "anon";

grant update on table "public"."conversations" to "anon";

grant delete on table "public"."conversations" to "authenticated";

grant insert on table "public"."conversations" to "authenticated";

grant references on table "public"."conversations" to "authenticated";

grant select on table "public"."conversations" to "authenticated";

grant trigger on table "public"."conversations" to "authenticated";

grant truncate on table "public"."conversations" to "authenticated";

grant update on table "public"."conversations" to "authenticated";

grant delete on table "public"."conversations" to "service_role";

grant insert on table "public"."conversations" to "service_role";

grant references on table "public"."conversations" to "service_role";

grant select on table "public"."conversations" to "service_role";

grant trigger on table "public"."conversations" to "service_role";

grant truncate on table "public"."conversations" to "service_role";

grant update on table "public"."conversations" to "service_role";

grant delete on table "public"."data_exports" to "anon";

grant insert on table "public"."data_exports" to "anon";

grant references on table "public"."data_exports" to "anon";

grant select on table "public"."data_exports" to "anon";

grant trigger on table "public"."data_exports" to "anon";

grant truncate on table "public"."data_exports" to "anon";

grant update on table "public"."data_exports" to "anon";

grant delete on table "public"."data_exports" to "authenticated";

grant insert on table "public"."data_exports" to "authenticated";

grant references on table "public"."data_exports" to "authenticated";

grant select on table "public"."data_exports" to "authenticated";

grant trigger on table "public"."data_exports" to "authenticated";

grant truncate on table "public"."data_exports" to "authenticated";

grant update on table "public"."data_exports" to "authenticated";

grant delete on table "public"."data_exports" to "service_role";

grant insert on table "public"."data_exports" to "service_role";

grant references on table "public"."data_exports" to "service_role";

grant select on table "public"."data_exports" to "service_role";

grant trigger on table "public"."data_exports" to "service_role";

grant truncate on table "public"."data_exports" to "service_role";

grant update on table "public"."data_exports" to "service_role";

grant delete on table "public"."generation_jobs" to "anon";

grant insert on table "public"."generation_jobs" to "anon";

grant references on table "public"."generation_jobs" to "anon";

grant select on table "public"."generation_jobs" to "anon";

grant trigger on table "public"."generation_jobs" to "anon";

grant truncate on table "public"."generation_jobs" to "anon";

grant update on table "public"."generation_jobs" to "anon";

grant delete on table "public"."generation_jobs" to "authenticated";

grant insert on table "public"."generation_jobs" to "authenticated";

grant references on table "public"."generation_jobs" to "authenticated";

grant select on table "public"."generation_jobs" to "authenticated";

grant trigger on table "public"."generation_jobs" to "authenticated";

grant truncate on table "public"."generation_jobs" to "authenticated";

grant update on table "public"."generation_jobs" to "authenticated";

grant delete on table "public"."generation_jobs" to "service_role";

grant insert on table "public"."generation_jobs" to "service_role";

grant references on table "public"."generation_jobs" to "service_role";

grant select on table "public"."generation_jobs" to "service_role";

grant trigger on table "public"."generation_jobs" to "service_role";

grant truncate on table "public"."generation_jobs" to "service_role";

grant update on table "public"."generation_jobs" to "service_role";

grant delete on table "public"."messages" to "anon";

grant insert on table "public"."messages" to "anon";

grant references on table "public"."messages" to "anon";

grant select on table "public"."messages" to "anon";

grant trigger on table "public"."messages" to "anon";

grant truncate on table "public"."messages" to "anon";

grant update on table "public"."messages" to "anon";

grant delete on table "public"."messages" to "authenticated";

grant insert on table "public"."messages" to "authenticated";

grant references on table "public"."messages" to "authenticated";

grant select on table "public"."messages" to "authenticated";

grant trigger on table "public"."messages" to "authenticated";

grant truncate on table "public"."messages" to "authenticated";

grant update on table "public"."messages" to "authenticated";

grant delete on table "public"."messages" to "service_role";

grant insert on table "public"."messages" to "service_role";

grant references on table "public"."messages" to "service_role";

grant select on table "public"."messages" to "service_role";

grant trigger on table "public"."messages" to "service_role";

grant truncate on table "public"."messages" to "service_role";

grant update on table "public"."messages" to "service_role";

grant delete on table "public"."order_items" to "anon";

grant insert on table "public"."order_items" to "anon";

grant references on table "public"."order_items" to "anon";

grant select on table "public"."order_items" to "anon";

grant trigger on table "public"."order_items" to "anon";

grant truncate on table "public"."order_items" to "anon";

grant update on table "public"."order_items" to "anon";

grant delete on table "public"."order_items" to "authenticated";

grant insert on table "public"."order_items" to "authenticated";

grant references on table "public"."order_items" to "authenticated";

grant select on table "public"."order_items" to "authenticated";

grant trigger on table "public"."order_items" to "authenticated";

grant truncate on table "public"."order_items" to "authenticated";

grant update on table "public"."order_items" to "authenticated";

grant delete on table "public"."order_items" to "service_role";

grant insert on table "public"."order_items" to "service_role";

grant references on table "public"."order_items" to "service_role";

grant select on table "public"."order_items" to "service_role";

grant trigger on table "public"."order_items" to "service_role";

grant truncate on table "public"."order_items" to "service_role";

grant update on table "public"."order_items" to "service_role";

grant delete on table "public"."orders" to "anon";

grant insert on table "public"."orders" to "anon";

grant references on table "public"."orders" to "anon";

grant select on table "public"."orders" to "anon";

grant trigger on table "public"."orders" to "anon";

grant truncate on table "public"."orders" to "anon";

grant update on table "public"."orders" to "anon";

grant delete on table "public"."orders" to "authenticated";

grant insert on table "public"."orders" to "authenticated";

grant references on table "public"."orders" to "authenticated";

grant select on table "public"."orders" to "authenticated";

grant trigger on table "public"."orders" to "authenticated";

grant truncate on table "public"."orders" to "authenticated";

grant update on table "public"."orders" to "authenticated";

grant delete on table "public"."orders" to "service_role";

grant insert on table "public"."orders" to "service_role";

grant references on table "public"."orders" to "service_role";

grant select on table "public"."orders" to "service_role";

grant trigger on table "public"."orders" to "service_role";

grant truncate on table "public"."orders" to "service_role";

grant update on table "public"."orders" to "service_role";

grant delete on table "public"."product_variants" to "anon";

grant insert on table "public"."product_variants" to "anon";

grant references on table "public"."product_variants" to "anon";

grant select on table "public"."product_variants" to "anon";

grant trigger on table "public"."product_variants" to "anon";

grant truncate on table "public"."product_variants" to "anon";

grant update on table "public"."product_variants" to "anon";

grant delete on table "public"."product_variants" to "authenticated";

grant insert on table "public"."product_variants" to "authenticated";

grant references on table "public"."product_variants" to "authenticated";

grant select on table "public"."product_variants" to "authenticated";

grant trigger on table "public"."product_variants" to "authenticated";

grant truncate on table "public"."product_variants" to "authenticated";

grant update on table "public"."product_variants" to "authenticated";

grant delete on table "public"."product_variants" to "service_role";

grant insert on table "public"."product_variants" to "service_role";

grant references on table "public"."product_variants" to "service_role";

grant select on table "public"."product_variants" to "service_role";

grant trigger on table "public"."product_variants" to "service_role";

grant truncate on table "public"."product_variants" to "service_role";

grant update on table "public"."product_variants" to "service_role";

grant delete on table "public"."products" to "anon";

grant insert on table "public"."products" to "anon";

grant references on table "public"."products" to "anon";

grant select on table "public"."products" to "anon";

grant trigger on table "public"."products" to "anon";

grant truncate on table "public"."products" to "anon";

grant update on table "public"."products" to "anon";

grant delete on table "public"."products" to "authenticated";

grant insert on table "public"."products" to "authenticated";

grant references on table "public"."products" to "authenticated";

grant select on table "public"."products" to "authenticated";

grant trigger on table "public"."products" to "authenticated";

grant truncate on table "public"."products" to "authenticated";

grant update on table "public"."products" to "authenticated";

grant delete on table "public"."products" to "service_role";

grant insert on table "public"."products" to "service_role";

grant references on table "public"."products" to "service_role";

grant select on table "public"."products" to "service_role";

grant trigger on table "public"."products" to "service_role";

grant truncate on table "public"."products" to "service_role";

grant update on table "public"."products" to "service_role";

grant delete on table "public"."profiles" to "anon";

grant insert on table "public"."profiles" to "anon";

grant references on table "public"."profiles" to "anon";

grant select on table "public"."profiles" to "anon";

grant trigger on table "public"."profiles" to "anon";

grant truncate on table "public"."profiles" to "anon";

grant update on table "public"."profiles" to "anon";

grant delete on table "public"."profiles" to "authenticated";

grant insert on table "public"."profiles" to "authenticated";

grant references on table "public"."profiles" to "authenticated";

grant select on table "public"."profiles" to "authenticated";

grant trigger on table "public"."profiles" to "authenticated";

grant truncate on table "public"."profiles" to "authenticated";

grant update on table "public"."profiles" to "authenticated";

grant delete on table "public"."profiles" to "service_role";

grant insert on table "public"."profiles" to "service_role";

grant references on table "public"."profiles" to "service_role";

grant select on table "public"."profiles" to "service_role";

grant trigger on table "public"."profiles" to "service_role";

grant truncate on table "public"."profiles" to "service_role";

grant update on table "public"."profiles" to "service_role";

grant delete on table "public"."quota_history" to "anon";

grant insert on table "public"."quota_history" to "anon";

grant references on table "public"."quota_history" to "anon";

grant select on table "public"."quota_history" to "anon";

grant trigger on table "public"."quota_history" to "anon";

grant truncate on table "public"."quota_history" to "anon";

grant update on table "public"."quota_history" to "anon";

grant delete on table "public"."quota_history" to "authenticated";

grant insert on table "public"."quota_history" to "authenticated";

grant references on table "public"."quota_history" to "authenticated";

grant select on table "public"."quota_history" to "authenticated";

grant trigger on table "public"."quota_history" to "authenticated";

grant truncate on table "public"."quota_history" to "authenticated";

grant update on table "public"."quota_history" to "authenticated";

grant delete on table "public"."quota_history" to "service_role";

grant insert on table "public"."quota_history" to "service_role";

grant references on table "public"."quota_history" to "service_role";

grant select on table "public"."quota_history" to "service_role";

grant trigger on table "public"."quota_history" to "service_role";

grant truncate on table "public"."quota_history" to "service_role";

grant update on table "public"."quota_history" to "service_role";

grant delete on table "public"."quota_packages" to "anon";

grant insert on table "public"."quota_packages" to "anon";

grant references on table "public"."quota_packages" to "anon";

grant select on table "public"."quota_packages" to "anon";

grant trigger on table "public"."quota_packages" to "anon";

grant truncate on table "public"."quota_packages" to "anon";

grant update on table "public"."quota_packages" to "anon";

grant delete on table "public"."quota_packages" to "authenticated";

grant insert on table "public"."quota_packages" to "authenticated";

grant references on table "public"."quota_packages" to "authenticated";

grant select on table "public"."quota_packages" to "authenticated";

grant trigger on table "public"."quota_packages" to "authenticated";

grant truncate on table "public"."quota_packages" to "authenticated";

grant update on table "public"."quota_packages" to "authenticated";

grant delete on table "public"."quota_packages" to "service_role";

grant insert on table "public"."quota_packages" to "service_role";

grant references on table "public"."quota_packages" to "service_role";

grant select on table "public"."quota_packages" to "service_role";

grant trigger on table "public"."quota_packages" to "service_role";

grant truncate on table "public"."quota_packages" to "service_role";

grant update on table "public"."quota_packages" to "service_role";

grant delete on table "public"."quota_settings" to "anon";

grant insert on table "public"."quota_settings" to "anon";

grant references on table "public"."quota_settings" to "anon";

grant select on table "public"."quota_settings" to "anon";

grant trigger on table "public"."quota_settings" to "anon";

grant truncate on table "public"."quota_settings" to "anon";

grant update on table "public"."quota_settings" to "anon";

grant delete on table "public"."quota_settings" to "authenticated";

grant insert on table "public"."quota_settings" to "authenticated";

grant references on table "public"."quota_settings" to "authenticated";

grant select on table "public"."quota_settings" to "authenticated";

grant trigger on table "public"."quota_settings" to "authenticated";

grant truncate on table "public"."quota_settings" to "authenticated";

grant update on table "public"."quota_settings" to "authenticated";

grant delete on table "public"."quota_settings" to "service_role";

grant insert on table "public"."quota_settings" to "service_role";

grant references on table "public"."quota_settings" to "service_role";

grant select on table "public"."quota_settings" to "service_role";

grant trigger on table "public"."quota_settings" to "service_role";

grant truncate on table "public"."quota_settings" to "service_role";

grant update on table "public"."quota_settings" to "service_role";

grant delete on table "public"."reviews" to "anon";

grant insert on table "public"."reviews" to "anon";

grant references on table "public"."reviews" to "anon";

grant select on table "public"."reviews" to "anon";

grant trigger on table "public"."reviews" to "anon";

grant truncate on table "public"."reviews" to "anon";

grant update on table "public"."reviews" to "anon";

grant delete on table "public"."reviews" to "authenticated";

grant insert on table "public"."reviews" to "authenticated";

grant references on table "public"."reviews" to "authenticated";

grant select on table "public"."reviews" to "authenticated";

grant trigger on table "public"."reviews" to "authenticated";

grant truncate on table "public"."reviews" to "authenticated";

grant update on table "public"."reviews" to "authenticated";

grant delete on table "public"."reviews" to "service_role";

grant insert on table "public"."reviews" to "service_role";

grant references on table "public"."reviews" to "service_role";

grant select on table "public"."reviews" to "service_role";

grant trigger on table "public"."reviews" to "service_role";

grant truncate on table "public"."reviews" to "service_role";

grant update on table "public"."reviews" to "service_role";

grant delete on table "public"."shop_categories" to "anon";

grant insert on table "public"."shop_categories" to "anon";

grant references on table "public"."shop_categories" to "anon";

grant select on table "public"."shop_categories" to "anon";

grant trigger on table "public"."shop_categories" to "anon";

grant truncate on table "public"."shop_categories" to "anon";

grant update on table "public"."shop_categories" to "anon";

grant delete on table "public"."shop_categories" to "authenticated";

grant insert on table "public"."shop_categories" to "authenticated";

grant references on table "public"."shop_categories" to "authenticated";

grant select on table "public"."shop_categories" to "authenticated";

grant trigger on table "public"."shop_categories" to "authenticated";

grant truncate on table "public"."shop_categories" to "authenticated";

grant update on table "public"."shop_categories" to "authenticated";

grant delete on table "public"."shop_categories" to "service_role";

grant insert on table "public"."shop_categories" to "service_role";

grant references on table "public"."shop_categories" to "service_role";

grant select on table "public"."shop_categories" to "service_role";

grant trigger on table "public"."shop_categories" to "service_role";

grant truncate on table "public"."shop_categories" to "service_role";

grant update on table "public"."shop_categories" to "service_role";

grant delete on table "public"."shop_followers" to "anon";

grant insert on table "public"."shop_followers" to "anon";

grant references on table "public"."shop_followers" to "anon";

grant select on table "public"."shop_followers" to "anon";

grant trigger on table "public"."shop_followers" to "anon";

grant truncate on table "public"."shop_followers" to "anon";

grant update on table "public"."shop_followers" to "anon";

grant delete on table "public"."shop_followers" to "authenticated";

grant insert on table "public"."shop_followers" to "authenticated";

grant references on table "public"."shop_followers" to "authenticated";

grant select on table "public"."shop_followers" to "authenticated";

grant trigger on table "public"."shop_followers" to "authenticated";

grant truncate on table "public"."shop_followers" to "authenticated";

grant update on table "public"."shop_followers" to "authenticated";

grant delete on table "public"."shop_followers" to "service_role";

grant insert on table "public"."shop_followers" to "service_role";

grant references on table "public"."shop_followers" to "service_role";

grant select on table "public"."shop_followers" to "service_role";

grant trigger on table "public"."shop_followers" to "service_role";

grant truncate on table "public"."shop_followers" to "service_role";

grant update on table "public"."shop_followers" to "service_role";

grant delete on table "public"."shop_wallet_transactions" to "anon";

grant insert on table "public"."shop_wallet_transactions" to "anon";

grant references on table "public"."shop_wallet_transactions" to "anon";

grant select on table "public"."shop_wallet_transactions" to "anon";

grant trigger on table "public"."shop_wallet_transactions" to "anon";

grant truncate on table "public"."shop_wallet_transactions" to "anon";

grant update on table "public"."shop_wallet_transactions" to "anon";

grant delete on table "public"."shop_wallet_transactions" to "authenticated";

grant insert on table "public"."shop_wallet_transactions" to "authenticated";

grant references on table "public"."shop_wallet_transactions" to "authenticated";

grant select on table "public"."shop_wallet_transactions" to "authenticated";

grant trigger on table "public"."shop_wallet_transactions" to "authenticated";

grant truncate on table "public"."shop_wallet_transactions" to "authenticated";

grant update on table "public"."shop_wallet_transactions" to "authenticated";

grant delete on table "public"."shop_wallet_transactions" to "service_role";

grant insert on table "public"."shop_wallet_transactions" to "service_role";

grant references on table "public"."shop_wallet_transactions" to "service_role";

grant select on table "public"."shop_wallet_transactions" to "service_role";

grant trigger on table "public"."shop_wallet_transactions" to "service_role";

grant truncate on table "public"."shop_wallet_transactions" to "service_role";

grant update on table "public"."shop_wallet_transactions" to "service_role";

grant delete on table "public"."shops" to "anon";

grant insert on table "public"."shops" to "anon";

grant references on table "public"."shops" to "anon";

grant select on table "public"."shops" to "anon";

grant trigger on table "public"."shops" to "anon";

grant truncate on table "public"."shops" to "anon";

grant update on table "public"."shops" to "anon";

grant delete on table "public"."shops" to "authenticated";

grant insert on table "public"."shops" to "authenticated";

grant references on table "public"."shops" to "authenticated";

grant select on table "public"."shops" to "authenticated";

grant trigger on table "public"."shops" to "authenticated";

grant truncate on table "public"."shops" to "authenticated";

grant update on table "public"."shops" to "authenticated";

grant delete on table "public"."shops" to "service_role";

grant insert on table "public"."shops" to "service_role";

grant references on table "public"."shops" to "service_role";

grant select on table "public"."shops" to "service_role";

grant trigger on table "public"."shops" to "service_role";

grant truncate on table "public"."shops" to "service_role";

grant update on table "public"."shops" to "service_role";

grant delete on table "public"."site_settings" to "anon";

grant insert on table "public"."site_settings" to "anon";

grant references on table "public"."site_settings" to "anon";

grant select on table "public"."site_settings" to "anon";

grant trigger on table "public"."site_settings" to "anon";

grant truncate on table "public"."site_settings" to "anon";

grant update on table "public"."site_settings" to "anon";

grant delete on table "public"."site_settings" to "authenticated";

grant insert on table "public"."site_settings" to "authenticated";

grant references on table "public"."site_settings" to "authenticated";

grant select on table "public"."site_settings" to "authenticated";

grant trigger on table "public"."site_settings" to "authenticated";

grant truncate on table "public"."site_settings" to "authenticated";

grant update on table "public"."site_settings" to "authenticated";

grant delete on table "public"."site_settings" to "service_role";

grant insert on table "public"."site_settings" to "service_role";

grant references on table "public"."site_settings" to "service_role";

grant select on table "public"."site_settings" to "service_role";

grant trigger on table "public"."site_settings" to "service_role";

grant truncate on table "public"."site_settings" to "service_role";

grant update on table "public"."site_settings" to "service_role";

grant delete on table "public"."store_quotas" to "anon";

grant insert on table "public"."store_quotas" to "anon";

grant references on table "public"."store_quotas" to "anon";

grant select on table "public"."store_quotas" to "anon";

grant trigger on table "public"."store_quotas" to "anon";

grant truncate on table "public"."store_quotas" to "anon";

grant update on table "public"."store_quotas" to "anon";

grant delete on table "public"."store_quotas" to "authenticated";

grant insert on table "public"."store_quotas" to "authenticated";

grant references on table "public"."store_quotas" to "authenticated";

grant select on table "public"."store_quotas" to "authenticated";

grant trigger on table "public"."store_quotas" to "authenticated";

grant truncate on table "public"."store_quotas" to "authenticated";

grant update on table "public"."store_quotas" to "authenticated";

grant delete on table "public"."store_quotas" to "service_role";

grant insert on table "public"."store_quotas" to "service_role";

grant references on table "public"."store_quotas" to "service_role";

grant select on table "public"."store_quotas" to "service_role";

grant trigger on table "public"."store_quotas" to "service_role";

grant truncate on table "public"."store_quotas" to "service_role";

grant update on table "public"."store_quotas" to "service_role";

grant delete on table "public"."support_channels" to "anon";

grant insert on table "public"."support_channels" to "anon";

grant references on table "public"."support_channels" to "anon";

grant select on table "public"."support_channels" to "anon";

grant trigger on table "public"."support_channels" to "anon";

grant truncate on table "public"."support_channels" to "anon";

grant update on table "public"."support_channels" to "anon";

grant delete on table "public"."support_channels" to "authenticated";

grant insert on table "public"."support_channels" to "authenticated";

grant references on table "public"."support_channels" to "authenticated";

grant select on table "public"."support_channels" to "authenticated";

grant trigger on table "public"."support_channels" to "authenticated";

grant truncate on table "public"."support_channels" to "authenticated";

grant update on table "public"."support_channels" to "authenticated";

grant delete on table "public"."support_channels" to "service_role";

grant insert on table "public"."support_channels" to "service_role";

grant references on table "public"."support_channels" to "service_role";

grant select on table "public"."support_channels" to "service_role";

grant trigger on table "public"."support_channels" to "service_role";

grant truncate on table "public"."support_channels" to "service_role";

grant update on table "public"."support_channels" to "service_role";

grant delete on table "public"."user_addresses" to "anon";

grant insert on table "public"."user_addresses" to "anon";

grant references on table "public"."user_addresses" to "anon";

grant select on table "public"."user_addresses" to "anon";

grant trigger on table "public"."user_addresses" to "anon";

grant truncate on table "public"."user_addresses" to "anon";

grant update on table "public"."user_addresses" to "anon";

grant delete on table "public"."user_addresses" to "authenticated";

grant insert on table "public"."user_addresses" to "authenticated";

grant references on table "public"."user_addresses" to "authenticated";

grant select on table "public"."user_addresses" to "authenticated";

grant trigger on table "public"."user_addresses" to "authenticated";

grant truncate on table "public"."user_addresses" to "authenticated";

grant update on table "public"."user_addresses" to "authenticated";

grant delete on table "public"."user_addresses" to "service_role";

grant insert on table "public"."user_addresses" to "service_role";

grant references on table "public"."user_addresses" to "service_role";

grant select on table "public"."user_addresses" to "service_role";

grant trigger on table "public"."user_addresses" to "service_role";

grant truncate on table "public"."user_addresses" to "service_role";

grant update on table "public"."user_addresses" to "service_role";

grant delete on table "public"."user_payment_methods" to "anon";

grant insert on table "public"."user_payment_methods" to "anon";

grant references on table "public"."user_payment_methods" to "anon";

grant select on table "public"."user_payment_methods" to "anon";

grant trigger on table "public"."user_payment_methods" to "anon";

grant truncate on table "public"."user_payment_methods" to "anon";

grant update on table "public"."user_payment_methods" to "anon";

grant delete on table "public"."user_payment_methods" to "authenticated";

grant insert on table "public"."user_payment_methods" to "authenticated";

grant references on table "public"."user_payment_methods" to "authenticated";

grant select on table "public"."user_payment_methods" to "authenticated";

grant trigger on table "public"."user_payment_methods" to "authenticated";

grant truncate on table "public"."user_payment_methods" to "authenticated";

grant update on table "public"."user_payment_methods" to "authenticated";

grant delete on table "public"."user_payment_methods" to "service_role";

grant insert on table "public"."user_payment_methods" to "service_role";

grant references on table "public"."user_payment_methods" to "service_role";

grant select on table "public"."user_payment_methods" to "service_role";

grant trigger on table "public"."user_payment_methods" to "service_role";

grant truncate on table "public"."user_payment_methods" to "service_role";

grant update on table "public"."user_payment_methods" to "service_role";


  create policy "Users can delete own addresses"
  on "public"."addresses"
  as permissive
  for delete
  to public
using ((auth.uid() = user_id));



  create policy "Users can insert own addresses"
  on "public"."addresses"
  as permissive
  for insert
  to public
with check ((auth.uid() = user_id));



  create policy "Users can update own addresses"
  on "public"."addresses"
  as permissive
  for update
  to public
using ((auth.uid() = user_id));



  create policy "Users can view own addresses"
  on "public"."addresses"
  as permissive
  for select
  to public
using ((auth.uid() = user_id));



  create policy "admins_can_insert_own_log"
  on "public"."admin_activity_log"
  as permissive
  for insert
  to public
with check ((admin_id = auth.uid()));



  create policy "admins_can_read_activity_log"
  on "public"."admin_activity_log"
  as permissive
  for select
  to public
using (true);



  create policy "Allow public read access for api_keys"
  on "public"."api_keys"
  as permissive
  for select
  to public
using (true);



  create policy "Enable ALL for authenticated users"
  on "public"."api_keys"
  as permissive
  for all
  to authenticated
using (true)
with check (true);



  create policy "bot_sim_admin_all"
  on "public"."bot_simulation_jobs"
  as permissive
  for all
  to public
using (public.is_admin());



  create policy "Categories are viewable by everyone"
  on "public"."categories"
  as permissive
  for select
  to public
using (true);



  create policy "Admins can update all conversations"
  on "public"."conversations"
  as permissive
  for update
  to public
using ((EXISTS ( SELECT 1
   FROM public.profiles
  WHERE ((profiles.id = auth.uid()) AND (profiles.role = 'admin'::text)))));



  create policy "Admins can view all conversations"
  on "public"."conversations"
  as permissive
  for select
  to public
using ((EXISTS ( SELECT 1
   FROM public.profiles
  WHERE ((profiles.id = auth.uid()) AND (profiles.role = 'admin'::text)))));



  create policy "Users can start conversations"
  on "public"."conversations"
  as permissive
  for insert
  to public
with check ((auth.uid() = user_id));



  create policy "Users can view their own conversations"
  on "public"."conversations"
  as permissive
  for select
  to public
using (((auth.uid() = user_id) OR (auth.uid() IN ( SELECT shops.owner_id
   FROM public.shops
  WHERE (shops.id = conversations.shop_id)))));



  create policy "Enable insert access for authenticated users"
  on "public"."data_exports"
  as permissive
  for insert
  to authenticated
with check (true);



  create policy "Enable read access for authenticated users"
  on "public"."data_exports"
  as permissive
  for select
  to authenticated
using (true);



  create policy "Enable ALL for generation_jobs"
  on "public"."generation_jobs"
  as permissive
  for all
  to authenticated
using (true)
with check (true);



  create policy "Admins can insert all messages"
  on "public"."messages"
  as permissive
  for insert
  to public
with check ((EXISTS ( SELECT 1
   FROM public.profiles
  WHERE ((profiles.id = auth.uid()) AND (profiles.role = 'admin'::text)))));



  create policy "Admins can update all messages"
  on "public"."messages"
  as permissive
  for update
  to public
using ((EXISTS ( SELECT 1
   FROM public.profiles
  WHERE ((profiles.id = auth.uid()) AND (profiles.role = 'admin'::text)))));



  create policy "Admins can view all messages"
  on "public"."messages"
  as permissive
  for select
  to public
using ((EXISTS ( SELECT 1
   FROM public.profiles
  WHERE ((profiles.id = auth.uid()) AND (profiles.role = 'admin'::text)))));



  create policy "Users can send messages"
  on "public"."messages"
  as permissive
  for insert
  to public
with check ((auth.uid() = sender_id));



  create policy "Users can update their own messages"
  on "public"."messages"
  as permissive
  for update
  to public
using (((auth.uid() = sender_id) OR (EXISTS ( SELECT 1
   FROM public.conversations
  WHERE ((conversations.id = messages.conversation_id) AND ((conversations.user_id = auth.uid()) OR (conversations.shop_id IN ( SELECT shops.id
           FROM public.shops
          WHERE (shops.owner_id = auth.uid())))))))));



  create policy "Users can view messages in their conversations"
  on "public"."messages"
  as permissive
  for select
  to public
using ((EXISTS ( SELECT 1
   FROM public.conversations
  WHERE ((conversations.id = messages.conversation_id) AND ((conversations.user_id = auth.uid()) OR (conversations.shop_id IN ( SELECT shops.id
           FROM public.shops
          WHERE (shops.owner_id = auth.uid()))))))));



  create policy "Users can insert own order items"
  on "public"."order_items"
  as permissive
  for insert
  to public
with check ((EXISTS ( SELECT 1
   FROM public.orders
  WHERE ((orders.id = order_items.order_id) AND (orders.user_id = auth.uid())))));



  create policy "View order items"
  on "public"."order_items"
  as permissive
  for select
  to public
using ((public.is_order_buyer(order_id) OR public.is_item_vendor(shop_id)));



  create policy "Users can create own orders"
  on "public"."orders"
  as permissive
  for insert
  to public
with check ((auth.uid() = user_id));



  create policy "View orders"
  on "public"."orders"
  as permissive
  for select
  to public
using (((auth.uid() = user_id) OR public.is_order_vendor(id)));



  create policy "Admins can delete product variants"
  on "public"."product_variants"
  as permissive
  for delete
  to public
using ((EXISTS ( SELECT 1
   FROM public.profiles
  WHERE ((profiles.id = auth.uid()) AND (profiles.role = 'admin'::text)))));



  create policy "Admins can insert product variants"
  on "public"."product_variants"
  as permissive
  for insert
  to public
with check ((EXISTS ( SELECT 1
   FROM public.profiles
  WHERE ((profiles.id = auth.uid()) AND (profiles.role = 'admin'::text)))));



  create policy "Admins can update product variants"
  on "public"."product_variants"
  as permissive
  for update
  to public
using ((EXISTS ( SELECT 1
   FROM public.profiles
  WHERE ((profiles.id = auth.uid()) AND (profiles.role = 'admin'::text)))));



  create policy "Allow delete variants"
  on "public"."product_variants"
  as permissive
  for delete
  to public
using (true);



  create policy "Allow insert variants"
  on "public"."product_variants"
  as permissive
  for insert
  to public
with check (true);



  create policy "Allow select variants"
  on "public"."product_variants"
  as permissive
  for select
  to public
using (true);



  create policy "Allow update variants"
  on "public"."product_variants"
  as permissive
  for update
  to public
using (true)
with check (true);



  create policy "Everyone can view product variants"
  on "public"."product_variants"
  as permissive
  for select
  to public
using (true);



  create policy "Variants are viewable by everyone"
  on "public"."product_variants"
  as permissive
  for select
  to public
using (true);



  create policy "Vendors can manage their own product variants"
  on "public"."product_variants"
  as permissive
  for all
  to public
using ((EXISTS ( SELECT 1
   FROM (public.products
     JOIN public.shops ON ((products.shop_id = shops.id)))
  WHERE ((products.id = product_variants.product_id) AND (shops.owner_id = auth.uid())))));



  create policy "Admins can delete products"
  on "public"."products"
  as permissive
  for delete
  to public
using ((EXISTS ( SELECT 1
   FROM public.profiles
  WHERE ((profiles.id = auth.uid()) AND (profiles.role = 'admin'::text)))));



  create policy "Admins can insert products"
  on "public"."products"
  as permissive
  for insert
  to public
with check ((EXISTS ( SELECT 1
   FROM public.profiles
  WHERE ((profiles.id = auth.uid()) AND (profiles.role = 'admin'::text)))));



  create policy "Admins can update any product"
  on "public"."products"
  as permissive
  for update
  to public
using (public.is_admin())
with check (public.is_admin());



  create policy "Admins can update products"
  on "public"."products"
  as permissive
  for update
  to public
using ((EXISTS ( SELECT 1
   FROM public.profiles
  WHERE ((profiles.id = auth.uid()) AND (profiles.role = 'admin'::text)))));



  create policy "Allow delete products"
  on "public"."products"
  as permissive
  for delete
  to public
using (true);



  create policy "Allow insert products"
  on "public"."products"
  as permissive
  for insert
  to public
with check (true);



  create policy "Allow select products"
  on "public"."products"
  as permissive
  for select
  to public
using (true);



  create policy "Allow update products"
  on "public"."products"
  as permissive
  for update
  to public
using (true)
with check (true);



  create policy "Products are viewable by everyone"
  on "public"."products"
  as permissive
  for select
  to public
using ((is_published = true));



  create policy "Vendors can manage their own products"
  on "public"."products"
  as permissive
  for all
  to public
using ((EXISTS ( SELECT 1
   FROM public.shops
  WHERE ((shops.id = products.shop_id) AND (shops.owner_id = auth.uid())))));



  create policy "Admins can update any profile"
  on "public"."profiles"
  as permissive
  for update
  to public
using (public.is_admin())
with check (public.is_admin());



  create policy "Public profiles are viewable by everyone"
  on "public"."profiles"
  as permissive
  for select
  to public
using (true);



  create policy "Users can update own profile"
  on "public"."profiles"
  as permissive
  for update
  to public
using ((auth.uid() = id));



  create policy "profiles_admin_update"
  on "public"."profiles"
  as permissive
  for update
  to public
using (public.is_admin())
with check (public.is_admin());



  create policy "profiles_insert_trigger"
  on "public"."profiles"
  as permissive
  for insert
  to public
with check (true);



  create policy "profiles_select_all"
  on "public"."profiles"
  as permissive
  for select
  to public
using (true);



  create policy "profiles_update_own"
  on "public"."profiles"
  as permissive
  for update
  to public
using ((auth.uid() = id));



  create policy "Admins can view all quota history"
  on "public"."quota_history"
  as permissive
  for select
  to public
using ((EXISTS ( SELECT 1
   FROM public.profiles
  WHERE ((profiles.id = auth.uid()) AND (profiles.role = 'admin'::text)))));



  create policy "Shop owners can view their quota history"
  on "public"."quota_history"
  as permissive
  for select
  to public
using ((shop_id IN ( SELECT shops.id
   FROM public.shops
  WHERE (shops.owner_id = auth.uid()))));



  create policy "Admins can manage packages"
  on "public"."quota_packages"
  as permissive
  for all
  to public
using ((EXISTS ( SELECT 1
   FROM public.profiles
  WHERE ((profiles.id = auth.uid()) AND (profiles.role = 'admin'::text)))))
with check ((EXISTS ( SELECT 1
   FROM public.profiles
  WHERE ((profiles.id = auth.uid()) AND (profiles.role = 'admin'::text)))));



  create policy "Anyone can view active packages"
  on "public"."quota_packages"
  as permissive
  for select
  to public
using (((is_active = true) OR (EXISTS ( SELECT 1
   FROM public.profiles
  WHERE ((profiles.id = auth.uid()) AND (profiles.role = 'admin'::text))))));



  create policy "Admins can manage quota settings"
  on "public"."quota_settings"
  as permissive
  for all
  to public
using ((EXISTS ( SELECT 1
   FROM public.profiles
  WHERE ((profiles.id = auth.uid()) AND (profiles.role = 'admin'::text)))))
with check ((EXISTS ( SELECT 1
   FROM public.profiles
  WHERE ((profiles.id = auth.uid()) AND (profiles.role = 'admin'::text)))));



  create policy "Anyone can view quota settings"
  on "public"."quota_settings"
  as permissive
  for select
  to public
using (true);



  create policy "Authenticated users can create reviews"
  on "public"."reviews"
  as permissive
  for insert
  to public
with check ((auth.role() = 'authenticated'::text));



  create policy "Reviews are viewable by everyone"
  on "public"."reviews"
  as permissive
  for select
  to public
using (true);



  create policy "Anyone can view shop categories"
  on "public"."shop_categories"
  as permissive
  for select
  to public
using (true);



  create policy "System can manage shop categories"
  on "public"."shop_categories"
  as permissive
  for all
  to public
using (((EXISTS ( SELECT 1
   FROM public.shops
  WHERE ((shops.id = shop_categories.shop_id) AND (shops.owner_id = auth.uid())))) OR (EXISTS ( SELECT 1
   FROM public.profiles
  WHERE ((profiles.id = auth.uid()) AND (profiles.role = 'admin'::text))))));



  create policy "shopcat_admin_all"
  on "public"."shop_categories"
  as permissive
  for all
  to public
using (public.is_admin());



  create policy "shopcat_select_all"
  on "public"."shop_categories"
  as permissive
  for select
  to public
using (true);



  create policy "shopcat_vendor_all"
  on "public"."shop_categories"
  as permissive
  for all
  to public
using ((shop_id IN ( SELECT shops.id
   FROM public.shops
  WHERE (shops.owner_id = auth.uid()))));



  create policy "Anyone can view followers"
  on "public"."shop_followers"
  as permissive
  for select
  to public
using (true);



  create policy "Users can follow/unfollow"
  on "public"."shop_followers"
  as permissive
  for all
  to public
using ((auth.uid() = user_id));



  create policy "shop_owner_read_wallet_tx"
  on "public"."shop_wallet_transactions"
  as permissive
  for select
  to public
using ((EXISTS ( SELECT 1
   FROM public.shops s
  WHERE ((s.id = shop_wallet_transactions.shop_id) AND (s.owner_id = auth.uid())))));



  create policy "Shops are viewable by everyone"
  on "public"."shops"
  as permissive
  for select
  to public
using (true);



  create policy "Vendors can create their shop"
  on "public"."shops"
  as permissive
  for insert
  to public
with check ((auth.uid() = owner_id));



  create policy "Vendors can update their own shop"
  on "public"."shops"
  as permissive
  for update
  to public
using ((auth.uid() = owner_id));



  create policy "shops_admin_all"
  on "public"."shops"
  as permissive
  for all
  to public
using (public.is_admin());



  create policy "shops_insert_own"
  on "public"."shops"
  as permissive
  for insert
  to public
with check ((auth.uid() = owner_id));



  create policy "shops_select_all"
  on "public"."shops"
  as permissive
  for select
  to public
using (true);



  create policy "shops_vendor_manage"
  on "public"."shops"
  as permissive
  for all
  to public
using ((auth.uid() = owner_id));



  create policy "Allow admin write access on site_settings"
  on "public"."site_settings"
  as permissive
  for all
  to public
using ((EXISTS ( SELECT 1
   FROM public.profiles
  WHERE ((profiles.id = auth.uid()) AND (profiles.role = 'admin'::text)))));



  create policy "Allow public read access on site_settings"
  on "public"."site_settings"
  as permissive
  for select
  to public
using (true);



  create policy "Admins can insert quotas"
  on "public"."store_quotas"
  as permissive
  for insert
  to public
with check ((EXISTS ( SELECT 1
   FROM public.profiles
  WHERE ((profiles.id = auth.uid()) AND (profiles.role = 'admin'::text)))));



  create policy "Admins can view all quotas"
  on "public"."store_quotas"
  as permissive
  for select
  to public
using ((EXISTS ( SELECT 1
   FROM public.profiles
  WHERE ((profiles.id = auth.uid()) AND (profiles.role = 'admin'::text)))));



  create policy "Shop owners can view their used quotas"
  on "public"."store_quotas"
  as permissive
  for select
  to public
using ((used_by_shop_id IN ( SELECT shops.id
   FROM public.shops
  WHERE (shops.owner_id = auth.uid()))));



  create policy "Admins can manage support channels"
  on "public"."support_channels"
  as permissive
  for all
  to public
using ((EXISTS ( SELECT 1
   FROM public.profiles
  WHERE ((profiles.id = auth.uid()) AND (profiles.role = 'admin'::text)))));



  create policy "Admins can read all support channels"
  on "public"."support_channels"
  as permissive
  for select
  to public
using ((EXISTS ( SELECT 1
   FROM public.profiles
  WHERE ((profiles.id = auth.uid()) AND (profiles.role = 'admin'::text)))));



  create policy "Public can read enabled support channels"
  on "public"."support_channels"
  as permissive
  for select
  to public
using ((is_enabled = true));



  create policy "Users can manage own addresses"
  on "public"."user_addresses"
  as permissive
  for all
  to public
using ((auth.uid() = user_id));



  create policy "addr_vendor_view"
  on "public"."user_addresses"
  as permissive
  for select
  to public
using ((id IN ( SELECT o.shipping_address_id
   FROM (public.orders o
     JOIN public.order_items oi ON ((o.id = oi.order_id)))
  WHERE ((oi.shop_id IN ( SELECT shops.id
           FROM public.shops
          WHERE (shops.owner_id = auth.uid()))) AND (o.shipping_address_id IS NOT NULL)))));



  create policy "Users can delete their own payment methods"
  on "public"."user_payment_methods"
  as permissive
  for delete
  to public
using ((auth.uid() = user_id));



  create policy "Users can insert their own payment methods"
  on "public"."user_payment_methods"
  as permissive
  for insert
  to public
with check ((auth.uid() = user_id));



  create policy "Users can update their own payment methods"
  on "public"."user_payment_methods"
  as permissive
  for update
  to public
using ((auth.uid() = user_id))
with check ((auth.uid() = user_id));



  create policy "Users can view their own payment methods"
  on "public"."user_payment_methods"
  as permissive
  for select
  to public
using ((auth.uid() = user_id));


CREATE TRIGGER trigger_generate_products AFTER INSERT ON public.generation_jobs FOR EACH ROW EXECUTE FUNCTION supabase_functions.http_request('https://phexhwtzbahttjgmzmow.supabase.co/functions/v1/generate-products', 'POST', '{"Content-type":"application/json"}', '{}', '5000');

CREATE TRIGGER trg_enforce_shop_product_limit BEFORE INSERT ON public.products FOR EACH ROW EXECUTE FUNCTION public.enforce_shop_product_limit();

CREATE TRIGGER tr_update_product_rating AFTER INSERT OR DELETE OR UPDATE ON public.reviews FOR EACH ROW EXECUTE FUNCTION public.update_product_rating();

CREATE TRIGGER support_channels_updated_at BEFORE UPDATE ON public.support_channels FOR EACH ROW EXECUTE FUNCTION public.update_support_channels_updated_at();


