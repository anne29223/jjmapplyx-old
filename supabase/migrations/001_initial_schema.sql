-- Create jobs table
CREATE TABLE jobs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  company TEXT NOT NULL,
  url TEXT NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'applied', 'rejected', 'interview')),
  pay_range TEXT,
  job_type TEXT,
  contact_email TEXT,
  contact_phone TEXT,
  resume_required BOOLEAN DEFAULT false,
  notes TEXT,
  applied_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create automation_logs table
CREATE TABLE automation_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  action TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('success', 'error', 'pending')),
  details TEXT,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create user_settings table
CREATE TABLE user_settings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  auto_apply BOOLEAN DEFAULT false,
  runs_per_day INTEGER DEFAULT 5,
  webhook_make TEXT,
  webhook_power_automate TEXT,
  n8n_webhook_url TEXT,
  email TEXT,
  phone TEXT,
  resume_file_path TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Create stats table for dashboard metrics
CREATE TABLE automation_stats (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  total_jobs INTEGER DEFAULT 0,
  applied INTEGER DEFAULT 0,
  pending INTEGER DEFAULT 0,
  success_rate DECIMAL(5,2) DEFAULT 0,
  automation_runs INTEGER DEFAULT 0,
  webhooks_triggered INTEGER DEFAULT 0,
  date DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, date)
);

-- Create indexes for better performance
CREATE INDEX idx_jobs_status ON jobs(status);
CREATE INDEX idx_jobs_created_at ON jobs(created_at);
CREATE INDEX idx_automation_logs_created_at ON automation_logs(created_at);
CREATE INDEX idx_automation_stats_user_date ON automation_stats(user_id, date);

-- Enable Row Level Security
ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE automation_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE automation_stats ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view all jobs" ON jobs
  FOR SELECT USING (true);

CREATE POLICY "Users can insert jobs" ON jobs
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update jobs" ON jobs
  FOR UPDATE USING (true);

CREATE POLICY "Users can view all automation logs" ON automation_logs
  FOR SELECT USING (true);

CREATE POLICY "Users can insert automation logs" ON automation_logs
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can view their own settings" ON user_settings
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own settings" ON user_settings
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own settings" ON user_settings
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own stats" ON automation_stats
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own stats" ON automation_stats
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own stats" ON automation_stats
  FOR UPDATE USING (auth.uid() = user_id);