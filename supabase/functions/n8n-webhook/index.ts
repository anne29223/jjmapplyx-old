import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  // Shared secret for n8n webhook
  const SHARED_SECRET = Deno.env.get('N8N_WEBHOOK_SECRET') ?? ''
  const incomingSecret = req.headers.get('x-n8n-secret')
  if (!SHARED_SECRET || incomingSecret !== SHARED_SECRET) {
    return new Response(
      JSON.stringify({ error: 'Unauthorized: invalid or missing secret' }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 401,
      },
    )
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
    )

    const { action, data } = await req.json()

    // Log the webhook action
    await supabaseClient
      .from('automation_logs')
      .insert({
        action: `n8n-${action}`,
        status: 'success',
        details: `Received n8n webhook for ${action}`,
        metadata: data
      })

    console.log(`n8n webhook received: ${action}`, data)

    switch (action) {
      case 'job-found':
        // Insert new job from n8n scraping workflow
        const { error: jobError } = await supabaseClient
          .from('jobs')
          .insert({
            title: data.title,
            company: data.company,
            url: data.url,
            pay_range: data.payRange,
            job_type: data.type,
            contact_email: data.contactEmail,
            contact_phone: data.contactPhone,
            resume_required: data.resumeRequired,
            notes: data.notes || `Found via n8n automation`
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