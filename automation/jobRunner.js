
import { supabase } from '../db/supabaseClient.js';
import { fetchJobs, applyToJob } from './jobBoards.js';



// New function: apply to a single job for a user
export async function runAutomationForJob(jobId, jobData) {
  // Find the user for this job (assume jobData has user_id or similar)
  const userId = jobData.user_id;
  if (!userId) throw new Error('Missing user_id in jobData');
  const { data: user, error: userError } = await supabase.from('users').select('*').eq('id', userId).single();
  if (userError || !user) throw new Error('User not found');

  // Check if already applied
  const { data: existing } = await supabase
    .from('applications')
    .select('*')
    .eq('user_id', userId)
    .eq('job_id', jobId)
    .single();
  if (existing) return { alreadyApplied: true };

  // Apply
  const success = await applyToJob(user.site, jobData, user.profile);
  if (success) {
    await supabase.from('applications').insert({
      user_id: userId,
      job_id: jobId,
      job_title: jobData.title,
      applied_at: new Date(),
    });
    return { applied: true };
  }
  return { applied: false };
}