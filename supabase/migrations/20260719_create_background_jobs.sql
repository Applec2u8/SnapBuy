CREATE TABLE public.background_jobs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    type TEXT NOT NULL CHECK (type IN ('export', 'restore')),
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'running', 'completed', 'failed')),
    progress INTEGER NOT NULL DEFAULT 0,
    total_items INTEGER NOT NULL DEFAULT 0,
    processed_items INTEGER NOT NULL DEFAULT 0,
    message TEXT,
    result_url TEXT,
    metadata JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- RLS Policies for background_jobs (assuming admin only)
ALTER TABLE public.background_jobs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow authenticated users to read jobs"
ON public.background_jobs FOR SELECT
TO authenticated
USING (true);

-- Allow authenticated users to insert jobs (triggers)
CREATE POLICY "Allow authenticated users to insert jobs"
ON public.background_jobs FOR INSERT
TO authenticated
WITH CHECK (true);

-- Allow Edge Functions (service role) to update jobs
CREATE POLICY "Allow service role to manage jobs"
ON public.background_jobs FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- Function to auto-update updated_at
CREATE OR REPLACE FUNCTION update_background_jobs_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_background_jobs
BEFORE UPDATE ON public.background_jobs
FOR EACH ROW
EXECUTE FUNCTION update_background_jobs_updated_at();
