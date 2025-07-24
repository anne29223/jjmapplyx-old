-- Add user_id column to jobs table to tie jobs to users
ALTER TABLE public.jobs ADD COLUMN user_id UUID REFERENCES auth.users(id);

-- Update jobs table RLS policies to be user-specific
DROP POLICY IF EXISTS "Anyone can view jobs" ON public.jobs;
DROP POLICY IF EXISTS "Anyone can insert jobs" ON public.jobs;
DROP POLICY IF EXISTS "Anyone can update jobs" ON public.jobs;
DROP POLICY IF EXISTS "Anyone can delete jobs" ON public.jobs;

-- Create user-specific policies for jobs
CREATE POLICY "Users can view their own jobs" ON public.jobs
FOR SELECT USING (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Users can insert their own jobs" ON public.jobs
FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own jobs" ON public.jobs
FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own jobs" ON public.jobs
FOR DELETE USING (auth.uid() = user_id);

-- Add user_id column to automation_logs table
ALTER TABLE public.automation_logs ADD COLUMN user_id UUID REFERENCES auth.users(id);

-- Update automation_logs RLS policies to be user-specific
DROP POLICY IF EXISTS "Anyone can view automation_logs" ON public.automation_logs;
DROP POLICY IF EXISTS "Anyone can insert automation_logs" ON public.automation_logs;

-- Create user-specific policies for automation_logs
CREATE POLICY "Users can view their own automation logs" ON public.automation_logs
FOR SELECT USING (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Users can insert their own automation logs" ON public.automation_logs
FOR INSERT WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_jobs_user_id ON public.jobs(user_id);
CREATE INDEX IF NOT EXISTS idx_automation_logs_user_id ON public.automation_logs(user_id);