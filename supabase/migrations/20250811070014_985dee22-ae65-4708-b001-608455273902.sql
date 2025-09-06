-- 1) Create job_sites table
CREATE TABLE IF NOT EXISTS public.job_sites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  url TEXT NOT NULL,
  enabled BOOLEAN NOT NULL DEFAULT true,
  keywords TEXT[] NOT NULL DEFAULT '{}',
  location TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2) Enable RLS
ALTER TABLE public.job_sites ENABLE ROW LEVEL SECURITY;

-- 3) RLS policies (CRUD for own rows)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'job_sites' AND policyname = 'Users can view their own job sites'
  ) THEN
    CREATE POLICY "Users can view their own job sites"
    ON public.job_sites
    FOR SELECT
    USING (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'job_sites' AND policyname = 'Users can insert their own job sites'
  ) THEN
    CREATE POLICY "Users can insert their own job sites"
    ON public.job_sites
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'job_sites' AND policyname = 'Users can update their own job sites'
  ) THEN
    CREATE POLICY "Users can update their own job sites"
    ON public.job_sites
    FOR UPDATE
    USING (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'job_sites' AND policyname = 'Users can delete their own job sites'
  ) THEN
    CREATE POLICY "Users can delete their own job sites"
    ON public.job_sites
    FOR DELETE
    USING (auth.uid() = user_id);
  END IF;
END $$;

-- 4) Updated at trigger
DROP TRIGGER IF EXISTS update_job_sites_updated_at ON public.job_sites;
CREATE TRIGGER update_job_sites_updated_at
BEFORE UPDATE ON public.job_sites
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 5) Prevent duplicates per user by URL
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes WHERE schemaname = 'public' AND tablename = 'job_sites' AND indexname = 'uniq_job_sites_user_url'
  ) THEN
    CREATE UNIQUE INDEX uniq_job_sites_user_url ON public.job_sites (user_id, url);
  END IF;
END $$;