#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js');
const { chromium } = require('playwright');

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

const USER_ID = process.env.USER_ID || 'default-user';
const JOB_ID = process.env.JOB_ID || '';
const MAX_APPLICATIONS = parseInt(process.env.MAX_APPLICATIONS || '10');

async function getPendingJobs() {
  try {
    let query = supabase
      .from('jobs')
      .select('*')
      .eq('user_id', USER_ID)
      .eq('status', 'pending')
      .eq('resumeRequired', false)
      .order('dateFound', { ascending: false });

    if (JOB_ID) {
      query = query.eq('id', JOB_ID);
    } else {
      query = query.limit(MAX_APPLICATIONS);
    }

    const { data, error } = await query;

    if (error) {
      throw error;
    }

    return data || [];
  } catch (error) {
    console.error('Error fetching pending jobs:', error);
    return [];
  }
}

async function getUserProfile() {
  try {
    const { data, error } = await supabase
      .from('user_settings')
      .select('*')
      .eq('user_id', USER_ID)
      .single();

    if (error) {
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error fetching user profile:', error);
    return {
      email: 'user@example.com',
      phone: '+1 (555) 123-4567',
      name: 'Job Seeker'
    };
  }
}

async function applyToJob(job, profile, browser) {
  console.log(`Attempting to apply to: ${job.title} at ${job.company}`);
  
  try {
    const page = await browser.newPage();
    
    // Set user agent
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');
    
    // Navigate to job page
    await page.goto(job.url, { waitUntil: 'networkidle', timeout: 30000 });
    
    // Wait for page to load
    await page.waitForTimeout(2000);
    
    // Look for application buttons
    const applySelectors = [
      'button[data-testid*="apply"]',
      'button:has-text("Apply")',
      'button:has-text("Apply Now")',
      'button:has-text("Quick Apply")',
      'a[href*="apply"]',
      '.apply-button',
      '[data-apply-button]'
    ];
    
    let applyButton = null;
    for (const selector of applySelectors) {
      try {
        applyButton = await page.$(selector);
        if (applyButton) break;
      } catch (e) {
        // Continue to next selector
      }
    }
    
    if (!applyButton) {
      console.log(`No apply button found for ${job.title}`);
      await page.close();
      return { success: false, reason: 'No apply button found' };
    }
    
    // Click apply button
    await applyButton.click();
    await page.waitForTimeout(2000);
    
    // Look for form fields and fill them
    const formFields = {
      email: ['input[type="email"]', 'input[name*="email"]', 'input[id*="email"]'],
      phone: ['input[type="tel"]', 'input[name*="phone"]', 'input[id*="phone"]'],
      name: ['input[name*="name"]', 'input[id*="name"]', 'input[name*="first"]'],
      lastName: ['input[name*="last"]', 'input[id*="last"]']
    };
    
    for (const [field, selectors] of Object.entries(formFields)) {
      for (const selector of selectors) {
        try {
          const input = await page.$(selector);
          if (input) {
            await input.fill(profile[field] || profile.email);
            break;
          }
        } catch (e) {
          // Continue to next selector
        }
      }
    }
    
    // Look for submit button
    const submitSelectors = [
      'button[type="submit"]',
      'button:has-text("Submit")',
      'button:has-text("Apply")',
      'input[type="submit"]'
    ];
    
    let submitButton = null;
    for (const selector of submitSelectors) {
      try {
        submitButton = await page.$(selector);
        if (submitButton) break;
      } catch (e) {
        // Continue to next selector
      }
    }
    
    if (submitButton) {
      await submitButton.click();
      await page.waitForTimeout(3000);
    }
    
    await page.close();
    
    console.log(`Successfully applied to ${job.title}`);
    return { success: true, reason: 'Application submitted' };
    
  } catch (error) {
    console.error(`Error applying to ${job.title}:`, error.message);
    return { success: false, reason: error.message };
  }
}

async function updateJobStatus(jobId, status, notes = '') {
  try {
    const { error } = await supabase
      .from('jobs')
      .update({ 
        status, 
        notes: notes || `Updated via GitHub Actions: ${new Date().toISOString()}`,
        lastUpdated: new Date().toISOString()
      })
      .eq('id', jobId);

    if (error) {
      throw error;
    }
  } catch (error) {
    console.error('Error updating job status:', error);
  }
}

async function logApplicationAttempt(jobId, success, reason) {
  try {
    const { error } = await supabase
      .from('automation_logs')
      .insert({
        user_id: USER_ID,
        action: 'auto-apply',
        status: success ? 'success' : 'failed',
        details: reason,
        metadata: { jobId, timestamp: new Date().toISOString() }
      });

    if (error) {
      throw error;
    }
  } catch (error) {
    console.error('Error logging application attempt:', error);
  }
}

async function main() {
  console.log('Starting auto-apply workflow...');
  console.log(`User ID: ${USER_ID}`);
  console.log(`Max Applications: ${MAX_APPLICATIONS}`);
  
  if (JOB_ID) {
    console.log(`Specific Job ID: ${JOB_ID}`);
  }

  // Get user profile
  const profile = await getUserProfile();
  console.log(`User Profile: ${profile.name} (${profile.email})`);

  // Get pending jobs
  const jobs = await getPendingJobs();
  console.log(`Found ${jobs.length} pending jobs`);

  if (jobs.length === 0) {
    console.log('No pending jobs to apply to');
    return;
  }

  // Launch browser
  const browser = await chromium.launch({ 
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  let successCount = 0;
  let failureCount = 0;

  // Apply to each job
  for (const job of jobs) {
    console.log(`\nProcessing job ${jobs.indexOf(job) + 1}/${jobs.length}: ${job.title}`);
    
    const result = await applyToJob(job, profile, browser);
    
    if (result.success) {
      await updateJobStatus(job.id, 'applied', 'Auto-applied via GitHub Actions');
      await logApplicationAttempt(job.id, true, result.reason);
      successCount++;
    } else {
      await updateJobStatus(job.id, 'no-response', `Auto-apply failed: ${result.reason}`);
      await logApplicationAttempt(job.id, false, result.reason);
      failureCount++;
    }
    
    // Wait between applications to avoid being rate-limited
    await new Promise(resolve => setTimeout(resolve, 5000));
  }

  await browser.close();

  console.log(`\nAuto-apply workflow completed:`);
  console.log(`- Successful applications: ${successCount}`);
  console.log(`- Failed applications: ${failureCount}`);
  console.log(`- Total processed: ${jobs.length}`);
}

main().catch(console.error);
