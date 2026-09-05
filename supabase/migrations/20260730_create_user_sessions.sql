-- ============================================================
-- Migration: Create user_sessions table
-- Purpose: Track real login/logout history per user
-- ============================================================

-- Create the user_sessions table
CREATE TABLE IF NOT EXISTS "public"."user_sessions" (
  "id"                uuid NOT NULL DEFAULT gen_random_uuid(),
  "user_id"           uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  "session_id"        text,                         -- Supabase JWT session ID (for revocation)
  "device_name"       text NOT NULL DEFAULT 'Unknown Device',
  "browser"           text NOT NULL DEFAULT 'Unknown Browser',
  "os"                text,
  "ip_address"        text,
  "is_revoked"        boolean NOT NULL DEFAULT false,
  "logged_in_at"      timestamp with time zone NOT NULL DEFAULT now(),
  "last_active_at"    timestamp with time zone NOT NULL DEFAULT now(),
  "logged_out_at"     timestamp with time zone,     -- null = still active
  "created_at"        timestamp with time zone NOT NULL DEFAULT now()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_user_sessions_user_id ON "public"."user_sessions" (user_id);
CREATE INDEX IF NOT EXISTS idx_user_sessions_logged_in ON "public"."user_sessions" (user_id, logged_in_at DESC);

-- Enable Row Level Security
ALTER TABLE "public"."user_sessions" ENABLE ROW LEVEL SECURITY;

-- Policy: Users can read only their own sessions
CREATE POLICY "Users can view own sessions"
  ON "public"."user_sessions"
  FOR SELECT
  USING (auth.uid() = user_id);

-- Policy: Users can insert their own sessions
CREATE POLICY "Users can insert own sessions"
  ON "public"."user_sessions"
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Policy: Users can update their own sessions (for logout timestamp, last_active)
CREATE POLICY "Users can update own sessions"
  ON "public"."user_sessions"
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Policy: Users can delete their own sessions (for cleanup)
CREATE POLICY "Users can delete own sessions"
  ON "public"."user_sessions"
  FOR DELETE
  USING (auth.uid() = user_id);
