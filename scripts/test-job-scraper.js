#!/usr/bin/env node

/**
 * Test script for job scraper functionality
 * Run with: node scripts/test-job-scraper.js
 */

import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabaseUrl = 'https://tzvzranspvtifnlgrkwi.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR6dnpyYW5zcHZ0aWZubGdya3dpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMyOTkxODcsImV4cCI6MjA2ODg3NTE4N30.oMG8VGPew29xAoaKPal0rsSs8aVmvyjXsyErC45jcfg';
const supabase = createClient(supabaseUrl, supabaseKey);

async function testRemoteOKScraping() {
  console.log('Testing RemoteOK scraping...');
  
  try {
    const response = await fetch('https://remoteok.com/api', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    console.log(`Found ${data.length} jobs from RemoteOK API`);

    // Process first 5 jobs as example
    const sampleJobs = data.slice(0, 5).map(job => ({
      title: job.position,
      company: job.company,
      location: job.location || 'Remote',
      url: job.url,
      description: job.description,
      salary: job.salary || undefined,
      job_type: job.contract ? 'Contract' : 'Full-time',
      source: 'RemoteOK',
      posted_at: job.date ? new Date(job.date).toISOString() : undefined,
      scraped_at: new Date().toISOString(),
      status: 'pending',
      user_id: 'test-user-id'
    }));

    console.log('Sample jobs:', JSON.stringify(sampleJobs, null, 2));

    // Test database insertion (commented out to avoid actual insertion)
    /*
    const { data: insertedJobs, error } = await supabase
      .from('scraped_jobs')
      .insert(sampleJobs);

    if (error) {
      console.error('Database error:', error);
    } else {
      console.log('Successfully inserted jobs into database');
    }
    */

    return sampleJobs.length;
  } catch (error) {
    console.error('Error testing RemoteOK scraping:', error);
    return 0;
  }
}

async function testDatabaseConnection() {
  console.log('Testing database connection...');
  
  try {
    const { data, error } = await supabase
      .from('scraped_jobs')
      .select('count')
      .limit(1);

    if (error) {
      console.error('Database connection error:', error);
      return false;
    }

    console.log('Database connection successful');
    return true;
  } catch (error) {
    console.error('Database connection error:', error);
    return false;
  }
}

async function testJobScraperFunction() {
  console.log('Testing job scraper Edge Function...');
  
  try {
    const response = await supabase.functions.invoke('job-scraper', {
      body: {
        jobBoards: ['remoteok'],
        searchQuery: 'remote work',
        location: 'remote',
        maxJobs: 10
      }
    });

    if (response.error) {
      console.error('Edge Function error:', response.error);
      return false;
    }

    console.log('Edge Function response:', response.data);
    return true;
  } catch (error) {
    console.error('Edge Function error:', error);
    return false;
  }
}

async function main() {
  console.log('🚀 Starting job scraper tests...\n');

  // Test 1: Database connection
  const dbConnected = await testDatabaseConnection();
  console.log(`Database connection: ${dbConnected ? '✅' : '❌'}\n`);

  // Test 2: RemoteOK scraping
  const jobsScraped = await testRemoteOKScraping();
  console.log(`RemoteOK scraping: ${jobsScraped > 0 ? '✅' : '❌'} (${jobsScraped} jobs)\n`);

  // Test 3: Edge Function (commented out as it requires authentication)
  /*
  const functionWorking = await testJobScraperFunction();
  console.log(`Edge Function: ${functionWorking ? '✅' : '❌'}\n`);
  */

  console.log('🎉 Job scraper tests completed!');
  console.log('\nNext steps:');
  console.log('1. Run the database migration: supabase/migrations/003_scraped_jobs.sql');
  console.log('2. Deploy the Edge Function: supabase functions deploy job-scraper');
  console.log('3. Test the scraping functionality in the dashboard');
}

main().catch(console.error);
