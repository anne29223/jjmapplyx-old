-- Fix critical security issue: Enable RLS on scraped_jobs table
-- This table has policies but RLS was disabled, creating a security vulnerability

ALTER TABLE public.scraped_jobs ENABLE ROW LEVEL SECURITY;

-- Also add basic RLS policies for applications table which has RLS enabled but no policies
CREATE POLICY "Users can view their own applications" ON public.applications
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own applications" ON public.applications
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own applications" ON public.applications
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own applications" ON public.applications
  FOR DELETE USING (auth.uid() = user_id);