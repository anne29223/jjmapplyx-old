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

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
    )

    const authHeader = req.headers.get('Authorization')!
    const token = authHeader.replace('Bearer ', '')
    const { data: { user } } = await supabaseClient.auth.getUser(token)

    if (!user) {
      throw new Error('Unauthorized')
    }

    const { workflow, jobData } = await req.json()

    // Get user settings for n8n webhook URL
    const { data: settings } = await supabaseClient
      .from('user_settings')
      .select('n8n_webhook_url, email, phone')
      .eq('user_id', user.id)
      .single()

    if (!settings?.n8n_webhook_url) {
      throw new Error('n8n webhook URL not configured')
    }

    // Prepare payload for n8n
    const payload = {
      workflow,
      user: {
        id: user.id,
        email: settings.email,
        phone: settings.phone
      },
      jobData,
      timestamp: new Date().toISOString(),
      source: 'jjmapplyx-dashboard'
    }

    // Trigger n8n workflow
    const response = await fetch(settings.n8n_webhook_url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload)
    })

    if (!response.ok) {
      throw new Error(`n8n webhook failed: ${response.statusText}`)
    }

    // Log the action
    await supabaseClient
      .from('automation_logs')
      .insert({
        action: `Triggered n8n ${workflow}`,
        status: 'success',
        details: `Successfully triggered n8n workflow: ${workflow}`,
        metadata: { workflow, jobId: jobData?.id }
      })

    // Update stats
    const today = new Date().toISOString().split('T')[0]
    const { data: currentStats } = await supabaseClient
      .from('automation_stats')
      .select('*')
      .eq('user_id', user.id)
      .eq('date', today)
      .single()

    if (currentStats) {
      await supabaseClient
        .from('automation_stats')
        .update({
          automation_runs: currentStats.automation_runs + 1,
          webhooks_triggered: currentStats.webhooks_triggered + 1
        })
        .eq('id', currentStats.id)
    } else {
      await supabaseClient
        .from('automation_stats')
        .insert({
          user_id: user.id,
          automation_runs: 1,
          webhooks_triggered: 1,
          date: today
        })
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `n8n ${workflow} workflow triggered successfully` 
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    )

  } catch (error) {
    console.error('Trigger n8n error:', error)
    
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      },
    )
  }
})