-- =====================================================================
-- SnapBuy — Complete Database Setup (Rebuilt, Single File)
-- Run this ONCE on a fresh Supabase project.
-- =====================================================================

CREATE EXTENSION IF NOT EXISTS uuid-ossp;
CREATE EXTENSION IF NOT EXISTS pg_cron;
GRANT USAGE ON SCHEMA cron TO postgres;

-- =====================================================================
-- TABLES
-- =====================================================================
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT NOT NULL, full_name TEXT, avatar_url TEXT, is_bot BOOLEAN DEFAULT false,
  role TEXT DEFAULT 'customer' CHECK (role IN ('customer', 'vendor', 'admin')),
  allow_credit_card BOOLEAN DEFAULT false,
  wallet_balance NUMERIC DEFAULT 0 CHECK (wallet_balance >= 0),
  token_balance NUMERIC DEFAULT 0 CHECK (token_balance >= 0),
  auto_boost_enabled BOOLEAN DEFAULT false, auto_boost_amount INTEGER DEFAULT 100,
  auto_boost_frequency TEXT DEFAULT 'hourly', auto_like_boost_enabled BOOLEAN DEFAULT false,
  auto_like_boost_amount INTEGER DEFAULT 100, auto_like_boost_frequency TEXT DEFAULT 'hourly',
  last_auto_boost_at TIMESTAMPTZ, last_auto_like_boost_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);