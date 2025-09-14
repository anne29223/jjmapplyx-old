import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://tzvzranspvtifnlgrkwi.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR6dnpyYW5zcHZ0aWZubGdya3dpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMyOTkxODcsImV4cCI6MjA2ODg3NTE4N30.oMG8VGPew29xAoaKPal0rsSs8aVmvyjXsyErC45jcfg';

const supabase = createClient(supabaseUrl, supabaseKey);

async function setupDatabase() {
  console.log('🚀 Setting up database tables for job scraping...');

  try {
    // Test database connection first
    console.log('Testing database connection...');
    const { data: testData, error: testError } = await supabase
      .from('jobs')
      .select('count')
      .limit(1);

    if (testError) {
      console.error('❌ Database connection failed:', testError);
      return;
    }

    console.log('✅ Database connection successful');

    // Now test the scraped_jobs table
    console.log('Testing scraped_jobs table...');
    const { data: scrapedJobs, error: scrapedError } = await supabase
      .from('scraped_jobs')
      .select('count')
      .limit(1);

    if (scrapedError) {
      console.log('❌ scraped_jobs table does not exist yet');
      console.log('📋 Please run the SQL migration manually:');
      console.log('1. Go to: https://supabase.com/dashboard/project/tzvzranspvtifnlgrkwi');
      console.log('2. Navigate to SQL Editor');
      console.log('3. Copy and paste the contents of setup-database.sql');
      console.log('4. Execute the script');
      return;
    }

    console.log('✅ scraped_jobs table exists');

    // Test scraping some real jobs
    console.log('🔍 Testing real job scraping...');
    const { data: scrapingResult, error: scrapingError } = await supabase.functions.invoke('job-scraper', {
      body: {
        jobBoards: ['remoteok'],
        searchQuery: 'remote work',
        location: 'remote',
        maxJobs: 5
      }
    });

    if (scrapingError) {
      console.error('❌ Job scraping failed:', scrapingError);
      return;
    }

    console.log('✅ Job scraping successful!');
    console.log(`📊 Found ${scrapingResult.jobs_scraped} jobs`);
    console.log('Sample jobs:', scrapingResult.jobs?.slice(0, 2));

    // Check if jobs were saved to database
    const { data: savedJobs, error: savedError } = await supabase
      .from('scraped_jobs')
      .select('*')
      .order('scraped_at', { ascending: false })
      .limit(5);

    if (savedError) {
      console.error('❌ Error fetching saved jobs:', savedError);
      return;
    }

    console.log(`✅ ${savedJobs.length} jobs saved to database`);
    console.log('Recent jobs:');
    savedJobs.forEach((job, index) => {
      console.log(`${index + 1}. ${job.title} at ${job.company} (${job.source})`);
    });

  } catch (error) {
    console.error('❌ Setup failed:', error);
  }
}

setupDatabase();
