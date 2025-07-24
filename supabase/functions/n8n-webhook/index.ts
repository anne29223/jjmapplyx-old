import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-webhook-signature',
}

// Input validation functions
function validateJobData(data: any) {
  if (!data.title || typeof data.title !== 'string') return false;
  if (!data.company || typeof data.company !== 'string') return false;
  if (!data.url || typeof data.url !== 'string') return false;
  return true;
}

function sanitizeInput(input: string): string {
  return input.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
              .replace(/javascript:/gi, '')
              .trim();
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    )

    const { action, data } = await req.json()

    // Basic input validation
    if (!action || typeof action !== 'string') {
      throw new Error('Invalid action parameter')
    }

    // Sanitize action
    const sanitizedAction = sanitizeInput(action)

    // Get user context from authorization header if available
    const authHeader = req.headers.get('Authorization');
    let userId = null;
    
    if (authHeader) {
      try {
        const { data: { user } } = await supabaseClient.auth.getUser(authHeader.replace('Bearer ', ''));
        userId = user?.id || null;
      } catch (error) {
        console.log('Failed to get user from auth header:', error);
      }
    }

    // If no auth header, try to get user_id from data payload
    if (!userId && data.userId) {
      userId = data.userId;
    }

    // Rate limiting check (basic implementation)
    const timestamp = Date.now()
    const requestKey = req.headers.get('x-forwarded-for') || 'unknown'
    
    // Log the webhook action with user context
    await supabaseClient
      .from('automation_logs')
      .insert({
        action: `n8n-${action}`,
        status: 'success',
        details: `Received n8n webhook for ${action}`,
        metadata: data,
        user_id: userId
      })

    console.log(`n8n webhook received: ${action}`, data)

    switch (sanitizedAction) {
      case 'job-found':
        // Validate job data
        if (!validateJobData(data)) {
          throw new Error('Invalid job data provided')
        }
        
        // Insert new job from n8n scraping workflow
        const { error: jobError } = await supabaseClient
          .from('jobs')
          .insert({
            title: sanitizeInput(data.title),
            company: sanitizeInput(data.company),
            url: data.url, // URL validation should be done separately
            pay_range: data.payRange ? sanitizeInput(data.payRange) : null,
            job_type: data.type ? sanitizeInput(data.type) : null,
            contact_email: data.contactEmail,
            contact_phone: data.contactPhone,
            resume_required: data.resumeRequired || false,
            notes: data.notes ? sanitizeInput(data.notes) : 'Found via n8n automation',
            user_id: userId
          })

        if (jobError) throw jobError
        break

      case 'application-submitted':
        // Update job status when n8n automation applies
        const { error: updateError } = await supabaseClient
          .from('jobs')
          .update({
            status: 'applied',
            applied_at: new Date().toISOString(),
            notes: data.notes || 'Applied via n8n automation'
          })
          .eq('id', data.jobId)

        if (updateError) throw updateError

        // Update stats
        await updateAutomationStats(supabaseClient, data.userId)
        break

      case 'application-failed':
        // Update job status when application fails
        const { error: failError } = await supabaseClient
          .from('jobs')
          .update({
            status: 'rejected',
            notes: data.error || 'Application failed in n8n automation'
          })
          .eq('id', data.jobId)

        if (failError) throw failError
        break

      case 'interview-detected':
        // Update job status when interview email is detected
        const { error: interviewError } = await supabaseClient
          .from('jobs')
          .update({
            status: 'interview',
            notes: 'Interview request detected via n8n email monitoring'
          })
          .eq('id', data.jobId)

        if (interviewError) throw interviewError
        break

      default:
        console.log(`Unknown n8n action: ${action}`)
    }

    return new Response(
      JSON.stringify({ success: true, message: `Processed ${action}` }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    )

  } catch (error) {
    console.error('n8n webhook error:', error)
    
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      },
    )
  }
})

async function updateAutomationStats(supabaseClient: any, userId: string) {
  const today = new Date().toISOString().split('T')[0]
  
  // Get current stats
  const { data: currentStats } = await supabaseClient
    .from('automation_stats')
    .select('*')
    .eq('user_id', userId)
    .eq('date', today)
    .single()

  if (currentStats) {
    // Update existing stats
    await supabaseClient
      .from('automation_stats')
      .update({
        applied: currentStats.applied + 1,
        automation_runs: currentStats.automation_runs + 1,
        webhooks_triggered: currentStats.webhooks_triggered + 1,
        success_rate: ((currentStats.applied + 1) / (currentStats.total_jobs || 1)) * 100
      })
      .eq('id', currentStats.id)
  } else {
    // Create new stats entry
    await supabaseClient
      .from('automation_stats')
      .insert({
        user_id: userId,
        applied: 1,
        automation_runs: 1,
        webhooks_triggered: 1,
        date: today
      })
  }
}