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
    console.log('Looking for user settings for user ID:', user.id)
    const { data: settings, error: settingsError } = await supabaseClient
      .from('user_settings')
      .select('n8n_webhook_url, email, phone')
      .eq('user_id', user.id)
      .maybeSingle()

    console.log('User settings query result:', { settings, settingsError })

    if (settingsError) {
      console.error('Settings query error:', settingsError)
      throw new Error(`Failed to fetch user settings: ${settingsError.message}`)
    }

    if (!settings) {
      console.error('No user settings found for user:', user.id)
      throw new Error('User settings not found. Please configure your settings in the dashboard first.')
    }

    if (!settings.n8n_webhook_url) {
      console.error('No n8n webhook URL found for user:', user.id)
      throw new Error('n8n webhook URL not configured. Please set it in the dashboard settings.')
    }

    // Load enabled job sites for user
    const { data: dbSites, error: sitesError } = await supabaseClient
      .from('job_sites')
      .select('name, url, keywords, location')
      .eq('user_id', user.id)
      .eq('enabled', true)
      .order('created_at', { ascending: true })

    if (sitesError) {
      console.error('Failed to fetch job sites:', sitesError)
    }

    const jobSites = dbSites || []

    const payloadBase = {
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

    let sentCount = 0

    if (jobSites.length > 0) {
      // Iterate over enabled job sites and trigger n8n per site
      for (const site of jobSites) {
        const response = await fetch(settings.n8n_webhook_url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...payloadBase, site })
        })
        if (!response.ok) {
          throw new Error(`n8n webhook failed for ${site.name}: ${response.statusText}`)
        }
        sentCount++
      }
    } else {
      // Fallback: trigger once without site-specific data
      const response = await fetch(settings.n8n_webhook_url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payloadBase)
      })
      if (!response.ok) {
        throw new Error(`n8n webhook failed: ${response.statusText}`)
      }
      sentCount = 1
    }

    // Log the action
    await supabaseClient
      .from('automation_logs')
      .insert({
        action: `Triggered n8n ${workflow}`,
        status: 'success',
        details: `Triggered n8n workflow '${workflow}' for ${sentCount} site(s)`,
        metadata: { workflow, jobId: jobData?.id, sitesCount: sentCount }
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
          webhooks_triggered: currentStats.webhooks_triggered + sentCount
        })
        .eq('id', currentStats.id)
    } else {
      await supabaseClient
        .from('automation_stats')
        .insert({
          user_id: user.id,
          automation_runs: 1,
          webhooks_triggered: sentCount,
          date: today
        })
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `n8n ${workflow} workflow triggered for ${sentCount} site(s)` 
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