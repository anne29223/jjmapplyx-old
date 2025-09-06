#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

const USER_ID = process.env.USER_ID || 'default-user';

async function updateApplicationStatistics() {
  try {
    console.log('Updating application statistics...');

    // Get application counts by status for today
    const today = new Date().toISOString().split('T')[0];
    
    const { data: todayJobs, error: todayError } = await supabase
      .from('jobs')
      .select('status')
      .eq('user_id', USER_ID)
      .gte('lastUpdated', today);

    if (todayError) {
      throw todayError;
    }

    const todayStats = {
      applied_today: todayJobs.filter(job => job.status === 'applied').length,
      rejected_today: todayJobs.filter(job => job.status === 'rejected').length,
      no_response_today: todayJobs.filter(job => job.status === 'no-response').length
    };

    // Get total application statistics
    const { data: allJobs, error: allError } = await supabase
      .from('jobs')
      .select('status, dateFound')
      .eq('user_id', USER_ID);

    if (allError) {
      throw allError;
    }

    const totalStats = {
      total_applied: allJobs.filter(job => job.status === 'applied').length,
      total_rejected: allJobs.filter(job => job.status === 'rejected').length,
      total_pending: allJobs.filter(job => job.status === 'pending').length,
      total_interview_scheduled: allJobs.filter(job => job.status === 'interview_scheduled').length,
      total_offer_received: allJobs.filter(job => job.status === 'offer_received').length
    };

    // Calculate application rate for today
    const totalProcessedToday = todayStats.applied_today + todayStats.rejected_today + todayStats.no_response_today;
    const applicationRateToday = totalProcessedToday > 0 ? 
      Math.round((todayStats.applied_today / totalProcessedToday) * 100) : 0;

    // Calculate overall success rate
    const totalProcessed = totalStats.total_applied + totalStats.total_rejected;
    const overallSuccessRate = totalProcessed > 0 ? 
      Math.round((totalStats.total_applied / totalProcessed) * 100) : 0;

    // Update application stats
    const { error: upsertError } = await supabase
      .from('application_stats')
      .upsert({
        user_id: USER_ID,
        date: today,
        ...todayStats,
        ...totalStats,
        application_rate_today: applicationRateToday,
        overall_success_rate: overallSuccessRate,
        last_updated: new Date().toISOString()
      });

    if (upsertError) {
      throw upsertError;
    }

    console.log('Application statistics updated successfully:');
    console.log(`Today's Applications:`);
    console.log(`- Applied: ${todayStats.applied_today}`);
    console.log(`- Rejected: ${todayStats.rejected_today}`);
    console.log(`- No Response: ${todayStats.no_response_today}`);
    console.log(`- Application Rate: ${applicationRateToday}%`);
    console.log(`\nOverall Statistics:`);
    console.log(`- Total Applied: ${totalStats.total_applied}`);
    console.log(`- Total Rejected: ${totalStats.total_rejected}`);
    console.log(`- Total Pending: ${totalStats.total_pending}`);
    console.log(`- Interview Scheduled: ${totalStats.total_interview_scheduled}`);
    console.log(`- Offer Received: ${totalStats.total_offer_received}`);
    console.log(`- Overall Success Rate: ${overallSuccessRate}%`);

  } catch (error) {
    console.error('Error updating application statistics:', error);
  }
}

async function main() {
  console.log('Starting application statistics update...');
  await updateApplicationStatistics();
  console.log('Application statistics update completed');
}

main().catch(console.error);
