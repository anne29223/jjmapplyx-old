import { supabase } from '../db/supabaseClient.js';
import { fetchJobs, applyToJob } from './jobBoards.js';

async function run() {
  console.log('Starting job automation runner...');
  
  try {
    // 1. Load users + preferences
    const { data: users, error: usersError } = await supabase.from('users').select('*');
    
    if (usersError) {
      console.error('Error fetching users:', usersError);
      return;
    }

    if (!users || users.length === 0) {
      console.log('No users found');
      return;
    }

    for (const user of users) {
      console.log(`Processing user: ${user.name || user.email}`);
      
      const { site, filter, profile } = user;

      // 2. Get available jobs
      const jobs = await fetchJobs(site, filter);
      console.log(`Found ${jobs.length} jobs for ${site}`);

      for (const job of jobs) {
        // 3. Check if already applied
        const { data: existing } = await supabase
          .from('applications')
          .select('*')
          .eq('user_id', user.id)
          .eq('job_id', job.id)
          .single();

        if (existing) {
          console.log(`⏭️  Skipping ${job.title} - already applied`);
          continue; // skip duplicate
        }

        // 4. Apply
        console.log(`🔄 Applying to ${job.title} at ${job.company}`);
        const success = await applyToJob(site, job, profile);

        // 5. Save log
        if (success) {
          await supabase.from('applications').insert({
            user_id: user.id,
            job_id: job.id,
            job_title: job.title,
            company: job.company,
            applied_at: new Date().toISOString(),
            status: 'applied'
          });
          console.log(`✅ Applied to ${job.title} for ${user.name}`);
        } else {
          console.log(`❌ Failed to apply to ${job.title}`);
        }
      }
    }
    
    console.log('Job automation runner completed');
  } catch (error) {
    console.error('Error in job automation runner:', error);
  }
}

<<<<<<< HEAD
// Run if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  run();
}

export { run };
=======
run();
>>>>>>> 8f07a84086daaf29b201ff33d5dc6d8008191e39
