-- Drop parameterless overload so PostgREST resolves the single function with defaults
DROP FUNCTION IF EXISTS public.process_auto_boosts();
