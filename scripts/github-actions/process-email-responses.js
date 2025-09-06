#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

const USER_ID = process.env.USER_ID || 'default-user';

async function processEmailResponses() {
  try {
    console.log('Processing email responses...');

    // Get unprocessed email responses
    const { data: emailResponses, error: fetchError } = await supabase
      .from('email_responses')
      .select('*')
      .eq('user_id', USER_ID)
      .eq('processed', false)
      .order('processed_at', { ascending: true });

    if (fetchError) {
      throw fetchError;
    }

    if (!emailResponses || emailResponses.length === 0) {
      console.log('No unprocessed email responses found');
      return;
    }

    console.log(`Found ${emailResponses.length} unprocessed email responses`);

    for (const response of emailResponses) {
      console.log(`Processing email: ${response.subject} (${response.response_type})`);

      // Update job status based on email response
      await updateJobFromEmailResponse(response);

      // Mark email as processed
      const { error: updateError } = await supabase
        .from('email_responses')
        .update({ processed: true, processed_at: new Date().toISOString() })
        .eq('id', response.id);

      if (updateError) {
        console.error(`Error marking email ${response.id} as processed:`, updateError);
      } else {
        console.log(`Email ${response.id} marked as processed`);
      }
    }

    console.log('Email response processing completed');

  } catch (error) {
    console.error('Error processing email responses:', error);
  }
}

async function updateJobFromEmailResponse(emailResponse) {
  try {
    // Try to find matching job based on company or subject
    const companyName = emailResponse.from.split('@')[1]?.split('.')[0] || '';
    const subject = emailResponse.subject.toLowerCase();
    
    let query = supabase
      .from('jobs')
      .select('*')
      .eq('user_id', USER_ID);

    // Try to match by company name first
    if (companyName) {
      query = query.ilike('company', `%${companyName}%`);
    }

    const { data: jobs, error: jobError } = await query;

    if (jobError) {
      throw jobError;
    }

    if (!jobs || jobs.length === 0) {
      // Try matching by subject keywords
      const subjectWords = subject.split(' ').filter(word => word.length > 3);
      if (subjectWords.length > 0) {
        const { data: subjectJobs, error: subjectError } = await supabase
          .from('jobs')
          .select('*')
          .eq('user_id', USER_ID)
          .or(subjectWords.map(word => `title.ilike.%${word}%`).join(','));

        if (!subjectError && subjectJobs && subjectJobs.length > 0) {
          jobs = subjectJobs;
        }
      }
    }

    if (jobs && jobs.length > 0) {
      const job = jobs[0]; // Take the first match
      let newStatus = job.status;
      let notes = job.notes || '';

      switch (emailResponse.response_type) {
        case 'interview_request':
          newStatus = 'interview_scheduled';
          notes += `\nInterview scheduled via email: ${emailResponse.subject}`;
          break;
        case 'job_offer':
          newStatus = 'offer_received';
          notes += `\nJob offer received via email: ${emailResponse.subject}`;
          break;
        case 'rejection':
          newStatus = 'rejected';
          notes += `\nRejection received via email: ${emailResponse.subject}`;
          break;
        case 'job_response':
          newStatus = 'response_received';
          notes += `\nResponse received via email: ${emailResponse.subject}`;
          break;
      }

      // Update job status
      const { error: updateError } = await supabase
        .from('jobs')
        .update({ 
          status: newStatus,
          notes: notes.trim(),
          lastUpdated: new Date().toISOString()
        })
        .eq('id', job.id);

      if (updateError) {
        throw updateError;
      }

      console.log(`Updated job ${job.title} status to ${newStatus}`);

      // Log the status change
      await supabase
        .from('automation_logs')
        .insert({
          user_id: USER_ID,
          action: 'email_response_processed',
          status: 'success',
          details: `Updated job ${job.title} to ${newStatus} based on email: ${emailResponse.subject}`,
          metadata: { 
            jobId: job.id, 
            emailId: emailResponse.id,
            responseType: emailResponse.response_type,
            timestamp: new Date().toISOString()
          }
        });

    } else {
      console.log(`No matching job found for email: ${emailResponse.subject}`);
      
      // Log that no job was matched
      await supabase
        .from('automation_logs')
        .insert({
          user_id: USER_ID,
          action: 'email_response_no_match',
          status: 'info',
          details: `No matching job found for email: ${emailResponse.subject}`,
          metadata: { 
            emailId: emailResponse.id,
            responseType: emailResponse.response_type,
            timestamp: new Date().toISOString()
          }
        });
    }

  } catch (error) {
    console.error('Error updating job from email response:', error);
  }
}

async function main() {
  console.log('Starting email response processing...');
  await processEmailResponses();
  console.log('Email response processing completed');
}

main().catch(console.error);
