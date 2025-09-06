#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

const USER_ID = process.env.USER_ID || 'default-user';

async function updateJobStatistics() {
  try {
    console.log('Updating job statistics...');

    // Get job counts by status
    const { data: jobStats, error: jobError } = await supabase
      .from('jobs')
      .select('status')
      .eq('user_id', USER_ID);

    if (jobError) {
      throw jobError;
    }

    const stats = {
      totalJobs: jobStats.length,
      applied: jobStats.filter(job => job.status === 'applied').length,
      pending: jobStats.filter(job => job.status === 'pending').length,
      rejected: jobStats.filter(job => job.status === 'rejected').length,
      interview_scheduled: jobStats.filter(job => job.status === 'interview_scheduled').length,
      offer_received: jobStats.filter(job => job.status === 'offer_received').length,
      no_response: jobStats.filter(job => job.status === 'no-response').length
    };

    // Calculate success rate
    const totalProcessed = stats.applied + stats.rejected + stats.no_response;
    stats.successRate = totalProcessed > 0 ? Math.round((stats.applied / totalProcessed) * 100) : 0;

    // Get automation run count for today
    const today = new Date().toISOString().split('T')[0];
    const { data: automationLogs, error: logError } = await supabase
      .from('automation_logs')
      .select('id')
      .eq('user_id', USER_ID)
      .gte('created_at', today);

    if (logError) {
      throw logError;
    }

    stats.automationRuns = automationLogs.length;

    // Update or insert stats
    const { error: upsertError } = await supabase
      .from('automation_stats')
      .upsert({
        user_id: USER_ID,
        ...stats,
        last_updated: new Date().toISOString()
      });

    if (upsertError) {
      throw upsertError;
    }

    console.log('Job statistics updated successfully:');
    console.log(`- Total Jobs: ${stats.totalJobs}`);
    console.log(`- Applied: ${stats.applied}`);
    console.log(`- Pending: ${stats.pending}`);
    console.log(`- Rejected: ${stats.rejected}`);
    console.log(`- Interview Scheduled: ${stats.interview_scheduled}`);
    console.log(`- Offer Received: ${stats.offer_received}`);
    console.log(`- Success Rate: ${stats.successRate}%`);
    console.log(`- Automation Runs Today: ${stats.automationRuns}`);

  } catch (error) {
    console.error('Error updating job statistics:', error);
  }
}

async function main() {
  console.log('Starting statistics update...');
  await updateJobStatistics();
  console.log('Statistics update completed');
}

main().catch(console.error);
