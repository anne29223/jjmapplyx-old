-- Add user_profile table for resumes and work history
CREATE TABLE user_profile (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  phone TEXT,
  resume_url TEXT, -- URL or path to resume file
  work_history TEXT, -- JSON or plain text
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Add RLS policies
ALTER TABLE user_profile ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own profile" ON user_profile
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own profile" ON user_profile
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own profile" ON user_profile
  FOR UPDATE USING (auth.uid() = user_id);
