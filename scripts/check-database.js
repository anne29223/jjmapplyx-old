#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL || 'your-supabase-url';
const supabaseKey = process.env.SUPABASE_ANON_KEY || 'your-supabase-key';
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkDatabase() {
  try {
    console.log('Checking jobs table...');
    const { data: jobsData, error: jobsError } = await supabase
      .from('jobs')
      .select('*')
      .limit(5);

    if (jobsError) {
      console.error('Error fetching from jobs table:', jobsError);
    } else {
      console.log('Jobs table:', jobsData?.length || 0, 'records');
      if (jobsData && jobsData.length > 0) {
        console.log('Sample job:', jobsData[0]);
      }
    }

    console.log('\nChecking scraped_jobs table...');
    const { data: scrapedJobsData, error: scrapedJobsError } = await supabase
      .from('scraped_jobs')
      .select('*')
      .limit(5);

    if (scrapedJobsError) {
      console.error('Error fetching from scraped_jobs table:', scrapedJobsError);
    } else {
      console.log('Scraped jobs table:', scrapedJobsData?.length || 0, 'records');
      if (scrapedJobsData && scrapedJobsData.length > 0) {
        console.log('Sample scraped job:', scrapedJobsData[0]);
      }
    }

  } catch (error) {
    console.error('Error:', error);
  }
}

checkDatabase();
