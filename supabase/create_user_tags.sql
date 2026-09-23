-- ============================================================
--  user_tags — เก็บ admin tag สำหรับแต่ละ user
-- ============================================================
CREATE TABLE IF NOT EXISTS public.user_tags (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  tag         text NOT NULL,
  created_by  uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at  timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_user_tags_user_id ON public.user_tags(user_id);
CREATE INDEX IF NOT EXISTS idx_user_tags_tag     ON public.user_tags(tag);

ALTER TABLE public.user_tags ENABLE ROW LEVEL SECURITY;

CREATE POLICY "admin_all_user_tags" ON public.user_tags
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );
