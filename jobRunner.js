import { supabase } from '../db/supabaseClient.js';
import { fetchJobs, applyToJob } from './jobBoards.js';

async function run() {
  // 1. Load users + preferences
  const { data: users } = await supabase.from('users').select('*');

  for (const user of users) {
    const { site, filter, profile } = user;

    // 2. Get available jobs
    const jobs = await fetchJobs(site, filter);

    for (const job of jobs) {
      // 3. Check if already applied
      const { data: existing } = await supabase
        .from('applications')
        .select('*')
        .eq('user_id', user.id)
        .eq('job_id', job.id)
        .single();

      if (existing) continue; // skip duplicate

      // 4. Apply
      const success = await applyToJob(site, job, profile);

      // 5. Save log
      if (success) {
        await supabase.from('applications').insert({
          user_id: user.id,
          job_id: job.id,
          job_title: job.title,
          applied_at: new Date(),
        });
        console.log(`✅ Applied to ${job.title} for ${user.name}`);
      }
    }
  }
}

run();