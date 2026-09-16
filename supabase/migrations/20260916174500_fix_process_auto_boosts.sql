-- =====================================================================
-- Migration: Fix and Upgrade public.process_auto_boosts()
-- 1. Removes invalid set_config('skip_audit') calls that crashed PostgreSQL (Error 42704).
-- 2. Adds optional parameters: p_user_id (to target a specific user)
--    and p_force (to bypass frequency check for immediate on-demand boosting).
-- 3. Only boosts published products (is_published = true).
-- 4. Updates last_auto_boost_at and last_auto_like_boost_at timestamps.
-- 5. Runs as SECURITY DEFINER to bypass RLS restrictions safely.
-- =====================================================================

-- Drop existing function signatures to avoid parameter signature conflicts
DROP FUNCTION IF EXISTS public.process_auto_boosts();
DROP FUNCTION IF EXISTS public.process_auto_boosts(uuid, boolean);

CREATE OR REPLACE FUNCTION public.process_auto_boosts(
  p_user_id UUID DEFAULT NULL,
  p_force BOOLEAN DEFAULT false
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  rec             RECORD;
  now_ts          TIMESTAMP WITH TIME ZONE := NOW();
  v_boosted_views INTEGER := 0;
  v_boosted_likes INTEGER := 0;
BEGIN
  -- ── 1. Process Auto View Boosts ──
  FOR rec IN
    SELECT 
      p.id AS user_id, 
      COALESCE(p.auto_boost_amount, 100) AS auto_boost_amount, 
      COALESCE(p.auto_boost_frequency, 'hourly') AS auto_boost_frequency
    FROM profiles p
    WHERE p.auto_boost_enabled = true
      AND (p_user_id IS NULL OR p.id = p_user_id)
      AND (
        p_force = true
        OR p.last_auto_boost_at IS NULL
        OR (now_ts - p.last_auto_boost_at) >= public.boost_frequency_to_interval(p.auto_boost_frequency)
      )
  LOOP
    -- Update view counts only for published products belonging to this user's shops
    UPDATE products
    SET view_count = COALESCE(view_count, 0) + rec.auto_boost_amount
    WHERE is_published = true
      AND shop_id IN (
        SELECT id FROM shops WHERE owner_id = rec.user_id
      );

    v_boosted_views := v_boosted_views + 1;

    -- Update last timestamp
    UPDATE profiles
    SET last_auto_boost_at = now_ts
    WHERE id = rec.user_id;
  END LOOP;

  -- ── 2. Process Auto Like Boosts ──
  FOR rec IN
    SELECT 
      p.id AS user_id, 
      COALESCE(p.auto_like_boost_amount, 100) AS auto_like_boost_amount, 
      COALESCE(p.auto_like_boost_frequency, 'hourly') AS auto_like_boost_frequency
    FROM profiles p
    WHERE p.auto_like_boost_enabled = true
      AND (p_user_id IS NULL OR p.id = p_user_id)
      AND (
        p_force = true
        OR p.last_auto_like_boost_at IS NULL
        OR (now_ts - p.last_auto_like_boost_at) >= public.boost_frequency_to_interval(p.auto_like_boost_frequency)
      )
  LOOP
    -- Update like counts only for published products belonging to this user's shops
    UPDATE products
    SET like_count = COALESCE(like_count, 0) + rec.auto_like_boost_amount
    WHERE is_published = true
      AND shop_id IN (
        SELECT id FROM shops WHERE owner_id = rec.user_id
      );

    v_boosted_likes := v_boosted_likes + 1;

    -- Update last timestamp
    UPDATE profiles
    SET last_auto_like_boost_at = now_ts
    WHERE id = rec.user_id;
  END LOOP;

  RETURN json_build_object(
    'success', true,
    'boosted_views_users', v_boosted_views,
    'boosted_likes_users', v_boosted_likes,
    'timestamp', now_ts
  );
END;
$function$;

-- Parameterless wrapper for backward compatibility and simple triggers / pg_cron
CREATE OR REPLACE FUNCTION public.process_auto_boosts()
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  RETURN public.process_auto_boosts(NULL, false);
END;
$function$;

-- Grant execute to authenticated and anon roles so the frontend can trigger it
GRANT EXECUTE ON FUNCTION public.process_auto_boosts(UUID, BOOLEAN) TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.process_auto_boosts() TO anon, authenticated, service_role;

-- ── Register with pg_cron if pg_cron extension is available ──
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'pg_cron') THEN
    PERFORM cron.unschedule('process-auto-boosts-cron');
  END IF;
EXCEPTION WHEN OTHERS THEN
  NULL;
END $$;

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'pg_cron') THEN
    PERFORM cron.schedule(
      'process-auto-boosts-cron',
      '* * * * *',
      'SELECT public.process_auto_boosts()'
    );
  END IF;
EXCEPTION WHEN OTHERS THEN
  NULL;
END $$;
