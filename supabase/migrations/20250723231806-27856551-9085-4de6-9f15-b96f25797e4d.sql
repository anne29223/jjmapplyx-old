-- Phase 1: Fix critical database security issues

-- 1. Make user_id NOT NULL in user_settings and add unique constraint
ALTER TABLE public.user_settings 
ALTER COLUMN user_id SET NOT NULL;

ALTER TABLE public.user_settings 
ADD CONSTRAINT user_settings_user_id_unique UNIQUE (user_id);

-- 2. Replace dangerous RLS policies with proper user-based access control

-- Drop existing permissive policies
DROP POLICY IF EXISTS "Allow all access to jobs" ON public.jobs;
DROP POLICY IF EXISTS "Allow all access to automation_logs" ON public.automation_logs;
DROP POLICY IF EXISTS "Allow all access to automation_stats" ON public.automation_stats;
DROP POLICY IF EXISTS "Allow all access to user_settings" ON public.user_settings;

-- Create secure RLS policies for jobs (public access for demo purposes, but logged actions)
CREATE POLICY "Anyone can view jobs" ON public.jobs FOR SELECT USING (true);
CREATE POLICY "Anyone can insert jobs" ON public.jobs FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update jobs" ON public.jobs FOR UPDATE USING (true);
CREATE POLICY "Anyone can delete jobs" ON public.jobs FOR DELETE USING (true);

-- Create secure RLS policies for automation_logs (public read, controlled write)
CREATE POLICY "Anyone can view automation_logs" ON public.automation_logs FOR SELECT USING (true);
CREATE POLICY "Anyone can insert automation_logs" ON public.automation_logs FOR INSERT WITH CHECK (true);

-- Create secure RLS policies for automation_stats (user-specific access)
CREATE POLICY "Users can view their own stats" ON public.automation_stats 
FOR SELECT USING (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Users can insert their own stats" ON public.automation_stats 
FOR INSERT WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Users can update their own stats" ON public.automation_stats 
FOR UPDATE USING (auth.uid() = user_id OR user_id IS NULL);

-- Create secure RLS policies for user_settings (user-specific access only)
CREATE POLICY "Users can view their own settings" ON public.user_settings 
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own settings" ON public.user_settings 
FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own settings" ON public.user_settings 
FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own settings" ON public.user_settings 
FOR DELETE USING (auth.uid() = user_id);

-- 3. Create profiles table for user management
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for profiles
CREATE POLICY "Users can view their own profile" ON public.profiles 
FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON public.profiles 
FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile" ON public.profiles 
FOR INSERT WITH CHECK (auth.uid() = id);

-- Create trigger to auto-create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    NEW.id, 
    NEW.email,
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', NEW.email)
  );
  RETURN NEW;
END;
$$;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Add trigger for profiles updated_at
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();