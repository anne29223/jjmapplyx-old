-- Setup script for job scraping database tables
-- Run this in your Supabase SQL editor

-- Create scraped_jobs table
CREATE TABLE IF NOT EXISTS scraped_jobs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  company TEXT NOT NULL,
  location TEXT,
  url TEXT NOT NULL,
  description TEXT,
  salary TEXT,
  job_type TEXT,
  source TEXT NOT NULL,
  posted_at TEXT,
  scraped_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'applied', 'rejected', 'interview')),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_scraped_jobs_source ON scraped_jobs(source);
CREATE INDEX IF NOT EXISTS idx_scraped_jobs_status ON scraped_jobs(status);
CREATE INDEX IF NOT EXISTS idx_scraped_jobs_scraped_at ON scraped_jobs(scraped_at);
CREATE INDEX IF NOT EXISTS idx_scraped_jobs_user_id ON scraped_jobs(user_id);
CREATE INDEX IF NOT EXISTS idx_scraped_jobs_url ON scraped_jobs(url);

-- Enable Row Level Security
ALTER TABLE scraped_jobs ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view all scraped jobs" ON scraped_jobs;
DROP POLICY IF EXISTS "Users can insert scraped jobs" ON scraped_jobs;
DROP POLICY IF EXISTS "Users can update scraped jobs" ON scraped_jobs;
DROP POLICY IF EXISTS "Users can delete scraped jobs" ON scraped_jobs;

-- Create RLS policies
CREATE POLICY "Users can view all scraped jobs" ON scraped_jobs
  FOR SELECT USING (true);

CREATE POLICY "Users can insert scraped jobs" ON scraped_jobs
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update scraped jobs" ON scraped_jobs
  FOR UPDATE USING (true);

CREATE POLICY "Users can delete scraped jobs" ON scraped_jobs
  FOR DELETE USING (true);

-- Create job_scraping_config table for storing scraping preferences
CREATE TABLE IF NOT EXISTS job_scraping_config (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  enabled_job_boards TEXT[] DEFAULT '{}',
  search_queries TEXT[] DEFAULT '{}',
  locations TEXT[] DEFAULT '{}',
  max_jobs_per_board INTEGER DEFAULT 50,
  scraping_frequency TEXT DEFAULT 'daily' CHECK (scraping_frequency IN ('hourly', 'daily', 'weekly')),
  last_scraped_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Enable RLS for job_scraping_config
ALTER TABLE job_scraping_config ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their own scraping config" ON job_scraping_config;
DROP POLICY IF EXISTS "Users can insert their own scraping config" ON job_scraping_config;
DROP POLICY IF EXISTS "Users can update their own scraping config" ON job_scraping_config;
DROP POLICY IF EXISTS "Users can delete their own scraping config" ON job_scraping_config;

-- Create RLS policies for job_scraping_config
CREATE POLICY "Users can view their own scraping config" ON job_scraping_config
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own scraping config" ON job_scraping_config
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own scraping config" ON job_scraping_config
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own scraping config" ON job_scraping_config
  FOR DELETE USING (auth.uid() = user_id);

-- Insert some sample data for testing (removed to avoid conflicts)
-- You can add real jobs by running the job scraper instead
