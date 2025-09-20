-- Fix critical security vulnerabilities in RLS policies

-- 1. Fix scraped_jobs table - replace overly permissive policies with user-based restrictions
DROP POLICY IF EXISTS "Users can view all scraped jobs" ON public.scraped_jobs;
DROP POLICY IF EXISTS "Users can insert scraped jobs" ON public.scraped_jobs;
DROP POLICY IF EXISTS "Users can update scraped jobs" ON public.scraped_jobs;
DROP POLICY IF EXISTS "Users can delete scraped jobs" ON public.scraped_jobs;

-- Make user_id NOT NULL for scraped_jobs (after setting default values for existing records)
UPDATE public.scraped_jobs SET user_id = (SELECT id FROM auth.users LIMIT 1) WHERE user_id IS NULL;
ALTER TABLE public.scraped_jobs ALTER COLUMN user_id SET NOT NULL;

-- Create secure RLS policies for scraped_jobs
CREATE POLICY "Users can view their own scraped jobs" ON public.scraped_jobs
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own scraped jobs" ON public.scraped_jobs
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own scraped jobs" ON public.scraped_jobs
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own scraped jobs" ON public.scraped_jobs
  FOR DELETE USING (auth.uid() = user_id);

-- 2. Fix automation_logs table - remove overly permissive NULL user_id conditions
DROP POLICY IF EXISTS "Users can view their own automation logs" ON public.automation_logs;
DROP POLICY IF EXISTS "Users can insert their own automation logs" ON public.automation_logs;

-- Update existing NULL user_id records to have proper ownership
UPDATE public.automation_logs SET user_id = (SELECT id FROM auth.users LIMIT 1) WHERE user_id IS NULL;
ALTER TABLE public.automation_logs ALTER COLUMN user_id SET NOT NULL;

-- Create secure policies for automation_logs
CREATE POLICY "Users can view their own automation logs" ON public.automation_logs
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own automation logs" ON public.automation_logs
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 3. Fix automation_stats table - remove overly permissive NULL user_id conditions  
DROP POLICY IF EXISTS "Users can view their own stats" ON public.automation_stats;
DROP POLICY IF EXISTS "Users can insert their own stats" ON public.automation_stats;
DROP POLICY IF EXISTS "Users can update their own stats" ON public.automation_stats;

-- Update existing NULL user_id records
UPDATE public.automation_stats SET user_id = (SELECT id FROM auth.users LIMIT 1) WHERE user_id IS NULL;
ALTER TABLE public.automation_stats ALTER COLUMN user_id SET NOT NULL;

-- Create secure policies for automation_stats
CREATE POLICY "Users can view their own stats" ON public.automation_stats
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own stats" ON public.automation_stats
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own stats" ON public.automation_stats
  FOR UPDATE USING (auth.uid() = user_id);