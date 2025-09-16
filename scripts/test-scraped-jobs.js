#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL || 'your-supabase-url';
const supabaseKey = process.env.SUPABASE_ANON_KEY || 'your-supabase-key';
const supabase = createClient(supabaseUrl, supabaseKey);

const USER_ID = process.env.USER_ID || 'test-user-id';

async function insertTestJobs() {
  const testJobs = [
    {
      title: 'Software Engineer - Remote',
      company: 'Tech Corp',
      url: 'https://example.com/job1',
      source: 'RemoteOK',
      user_id: USER_ID,
      scraped_at: new Date().toISOString(),
      salary: '$80,000 - $120,000',
      job_type: 'full-time',
      status: 'pending',
      description: 'Test job for debugging purposes'
    },
    {
      title: 'Frontend Developer',
      company: 'Web Solutions Inc',
      url: 'https://example.com/job2',
      source: 'Indeed',
      user_id: USER_ID,
      scraped_at: new Date().toISOString(),
      salary: '$70,000 - $100,000',
      job_type: 'full-time',
      status: 'pending',
      description: 'Another test job for debugging'
    },
    {
      title: 'Data Analyst',
      company: 'Analytics Co',
      url: 'https://example.com/job3',
      source: 'LinkedIn',
      user_id: USER_ID,
      scraped_at: new Date().toISOString(),
      salary: '$60,000 - $90,000',
      job_type: 'contract',
      status: 'pending',
      description: 'Third test job for debugging'
    }
  ];

  try {
    console.log('Inserting test jobs...');
    const { data, error } = await supabase
      .from('scraped_jobs')
      .insert(testJobs);

    if (error) {
      console.error('Error inserting test jobs:', error);
      return;
    }

    console.log('Successfully inserted test jobs!');
    console.log('You should now see these jobs in your dashboard.');
  } catch (error) {
    console.error('Error:', error);
  }
}

insertTestJobs();
