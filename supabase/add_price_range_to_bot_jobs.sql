-- Migration: Add price_min and price_max columns to bot_simulation_jobs
-- Run this in Supabase SQL Editor > New Query

ALTER TABLE bot_simulation_jobs
  ADD COLUMN IF NOT EXISTS price_min numeric(12, 2) DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS price_max numeric(12, 2) DEFAULT NULL;

-- Verify
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'bot_simulation_jobs'
  AND column_name IN ('price_min', 'price_max');
