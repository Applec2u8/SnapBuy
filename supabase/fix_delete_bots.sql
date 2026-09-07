CREATE OR REPLACE FUNCTION public.delete_bot(p_bot_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
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
$$;

CREATE OR REPLACE FUNCTION public.delete_all_bots()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
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
$$;
