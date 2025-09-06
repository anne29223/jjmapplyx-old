#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js');
const { google } = require('googleapis');

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

const USER_ID = process.env.USER_ID || 'default-user';
const EMAIL_PROVIDER = process.env.EMAIL_PROVIDER || 'gmail';

// Gmail API configuration
const GMAIL_CLIENT_ID = process.env.GMAIL_CLIENT_ID;
const GMAIL_CLIENT_SECRET = process.env.GMAIL_CLIENT_SECRET;
const GMAIL_REFRESH_TOKEN = process.env.GMAIL_REFRESH_TOKEN;

async function getGmailClient() {
  const oauth2Client = new google.auth.OAuth2(
    GMAIL_CLIENT_ID,
    GMAIL_CLIENT_SECRET,
    'urn:ietf:wg:oauth:2.0:oob'
  );

  oauth2Client.setCredentials({
    refresh_token: GMAIL_REFRESH_TOKEN
  });

  return google.gmail({ version: 'v1', auth: oauth2Client });
}

async function getRecentEmails(gmail, maxResults = 10) {
  try {
    const response = await gmail.users.messages.list({
      userId: 'me',
      maxResults,
      q: 'is:unread newer_than:1d'
    });

    const messages = response.data.messages || [];
    const emailDetails = [];

    for (const message of messages) {
      try {
        const email = await gmail.users.messages.get({
          userId: 'me',
          id: message.id,
          format: 'full'
        });

        const headers = email.data.payload.headers;
        const subject = headers.find(h => h.name === 'Subject')?.value || '';
        const from = headers.find(h => h.name === 'From')?.value || '';
        const date = headers.find(h => h.name === 'Date')?.value || '';
        
        // Extract email body
        let body = '';
        if (email.data.payload.body && email.data.payload.body.data) {
          body = Buffer.from(email.data.payload.body.data, 'base64').toString();
        } else if (email.data.payload.parts) {
          for (const part of email.data.payload.parts) {
            if (part.mimeType === 'text/plain' && part.body && part.body.data) {
              body = Buffer.from(part.body.data, 'base64').toString();
              break;
            }
          }
        }

        emailDetails.push({
          id: message.id,
          subject,
          from,
          date,
          body: body.substring(0, 1000), // Limit body length
          threadId: message.threadId
        });
      } catch (error) {
        console.error(`Error fetching email ${message.id}:`, error.message);
      }
    }

    return emailDetails;
  } catch (error) {
    console.error('Error fetching emails:', error);
    return [];
  }
}

function analyzeEmailForJobResponse(email) {
  const jobKeywords = [
    'interview', 'hiring', 'position', 'job', 'application', 'resume',
    'schedule', 'meeting', 'phone call', 'video call', 'next steps',
    'congratulations', 'welcome', 'offer', 'employment', 'start date'
  ];

  const rejectionKeywords = [
    'unfortunately', 'not selected', 'not moving forward', 'other candidates',
    'not a good fit', 'decline', 'rejected', 'not chosen'
  ];

  const interviewKeywords = [
    'interview', 'schedule', 'meeting', 'phone call', 'video call',
    'zoom', 'teams', 'google meet', 'next steps', 'availability'
  ];

  const offerKeywords = [
    'offer', 'congratulations', 'welcome', 'employment', 'start date',
    'salary', 'benefits', 'contract', 'agreement'
  ];

  const subject = email.subject.toLowerCase();
  const body = email.body.toLowerCase();
  const from = email.from.toLowerCase();

  // Check if it's from a job board or company
  const isJobRelated = jobKeywords.some(keyword => 
    subject.includes(keyword) || body.includes(keyword)
  );

  if (!isJobRelated) {
    return { type: 'not_job_related', confidence: 0 };
  }

  // Check for rejection
  const isRejection = rejectionKeywords.some(keyword => 
    subject.includes(keyword) || body.includes(keyword)
  );

  if (isRejection) {
    return { type: 'rejection', confidence: 0.8 };
  }

  // Check for interview request
  const isInterview = interviewKeywords.some(keyword => 
    subject.includes(keyword) || body.includes(keyword)
  );

  if (isInterview) {
    return { type: 'interview_request', confidence: 0.9 };
  }

  // Check for job offer
  const isOffer = offerKeywords.some(keyword => 
    subject.includes(keyword) || body.includes(keyword)
  );

  if (isOffer) {
    return { type: 'job_offer', confidence: 0.95 };
  }

  // General job-related response
  return { type: 'job_response', confidence: 0.6 };
}

async function saveEmailResponse(email, analysis) {
  try {
    const { error } = await supabase
      .from('email_responses')
      .insert({
        user_id: USER_ID,
        email_id: email.id,
        subject: email.subject,
        from: email.from,
        date: email.date,
        body: email.body,
        response_type: analysis.type,
        confidence: analysis.confidence,
        thread_id: email.threadId,
        processed_at: new Date().toISOString()
      });

    if (error) {
      throw error;
    }

    console.log(`Saved email response: ${analysis.type} (confidence: ${analysis.confidence})`);
  } catch (error) {
    console.error('Error saving email response:', error);
  }
}

async function updateJobStatusFromEmail(email, analysis) {
  try {
    // Try to match email to a job based on company name or subject
    const companyName = email.from.split('@')[1]?.split('.')[0] || '';
    const subject = email.subject.toLowerCase();
    
    let query = supabase
      .from('jobs')
      .select('*')
      .eq('user_id', USER_ID)
      .or(`company.ilike.%${companyName}%,title.ilike.%${subject.split(' ')[0]}%`);

    const { data: jobs, error } = await query;

    if (error) {
      throw error;
    }

    if (jobs && jobs.length > 0) {
      const job = jobs[0]; // Take the first match
      let newStatus = 'pending';

      switch (analysis.type) {
        case 'interview_request':
          newStatus = 'interview_scheduled';
          break;
        case 'job_offer':
          newStatus = 'offer_received';
          break;
        case 'rejection':
          newStatus = 'rejected';
          break;
        case 'job_response':
          newStatus = 'response_received';
          break;
      }

      await supabase
        .from('jobs')
        .update({ 
          status: newStatus,
          notes: `Email response: ${analysis.type} - ${email.subject}`,
          lastUpdated: new Date().toISOString()
        })
        .eq('id', job.id);

      console.log(`Updated job ${job.title} status to ${newStatus}`);
    }
  } catch (error) {
    console.error('Error updating job status from email:', error);
  }
}

async function main() {
  console.log('Starting email monitoring workflow...');
  console.log(`User ID: ${USER_ID}`);
  console.log(`Email Provider: ${EMAIL_PROVIDER}`);

  if (EMAIL_PROVIDER === 'gmail') {
    if (!GMAIL_CLIENT_ID || !GMAIL_CLIENT_SECRET || !GMAIL_REFRESH_TOKEN) {
      console.error('Gmail API credentials not configured');
      return;
    }

    try {
      const gmail = await getGmailClient();
      const emails = await getRecentEmails(gmail);

      console.log(`Found ${emails.length} recent emails`);

      for (const email of emails) {
        console.log(`\nProcessing email: ${email.subject}`);
        
        const analysis = analyzeEmailForJobResponse(email);
        console.log(`Analysis: ${analysis.type} (confidence: ${analysis.confidence})`);

        if (analysis.confidence > 0.5) {
          await saveEmailResponse(email, analysis);
          await updateJobStatusFromEmail(email, analysis);
        }
      }

      console.log('\nEmail monitoring workflow completed successfully');
    } catch (error) {
      console.error('Error in email monitoring:', error);
    }
  } else {
    console.log(`Email provider ${EMAIL_PROVIDER} not yet implemented`);
  }
}

main().catch(console.error);
