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

    // Require authenticated user
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 401,
      })
    }
    const token = authHeader.replace('Bearer ', '')
    const { data: { user } } = await supabaseClient.auth.getUser(token)
    if (!user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 401,
      })
    }

    const { workflow, limit = 5 } = await req.json()

    const log = async (action: string, status: 'success' | 'error', details: string, metadata: any = {}) => {
      await supabaseClient.from('automation_logs').insert({ action, status, details, metadata })
    }

    const updateStats = async (userId: string, appliedDelta = 0, webhooksDelta = 0) => {
      const today = new Date().toISOString().split('T')[0]
      const { data: currentStats } = await supabaseClient
        .from('automation_stats')
        .select('*')
        .eq('user_id', userId)
        .eq('date', today)
        .maybeSingle()

      if (currentStats) {
        await supabaseClient
          .from('automation_stats')
          .update({
            applied: (currentStats.applied || 0) + appliedDelta,
            automation_runs: (currentStats.automation_runs || 0) + 1,
            webhooks_triggered: (currentStats.webhooks_triggered || 0) + webhooksDelta,
          })
          .eq('id', currentStats.id)
      } else {
        await supabaseClient
          .from('automation_stats')
          .insert({
            user_id: userId,
            applied: appliedDelta,
            automation_runs: 1,
            webhooks_triggered: webhooksDelta,
            date: today
          })
      }
    }

    if (workflow === 'job-scraping') {
      // Simple, free built-in scraper: RemoteOK public API
      const res = await fetch('https://remoteok.com/api', {
        headers: { 'Accept': 'application/json', 'User-Agent': 'jjmapplyx-builtin-automation/1.0' }
      })
      if (!res.ok) throw new Error(`Failed to fetch RemoteOK: ${res.status} ${res.statusText}`)
      const data = await res.json()
      const items = Array.isArray(data) ? data.slice(1).slice(0, limit) : []

      const payload = items.map((j: any) => ({
        title: j?.position || j?.title || 'Untitled role',
        company: j?.company || 'Unknown',
        url: j?.url || j?.apply_url || null,
        pay_range: j?.salary || null,
        job_type: Array.isArray(j?.tags) ? j.tags.join(', ') : (j?.type || null),
        contact_email: null,
        contact_phone: null,
        resume_required: false,
        notes: 'Imported via built-in automation (RemoteOK)'
      }))

      if (payload.length > 0) {
        const { error } = await supabaseClient.from('jobs').insert(payload)
        if (error) throw error
      }

      await log('built-in-job-scraping', 'success', `Imported ${payload.length} jobs from RemoteOK`, { count: payload.length })
      await updateStats(user.id, 0, 0)

      return new Response(JSON.stringify({ success: true, imported: payload.length }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      })
    }

    if (workflow === 'auto-apply') {
      // Find some recent jobs without status and mark as applied
      const { data: candidatesNull } = await supabaseClient
        .from('jobs')
        .select('id, status')
        .is('status', null)
        .order('created_at', { ascending: false })
        .limit(limit)

      let candidates = candidatesNull || []

      if (candidates.length === 0) {
        const { data: candidatesNew } = await supabaseClient
          .from('jobs')
          .select('id, status')
          .in('status', ['new', 'open', 'pending'])
          .order('created_at', { ascending: false })
          .limit(limit)
        candidates = candidatesNew || []
      }

      let applied = 0
      for (const c of candidates) {
        const { error } = await supabaseClient
          .from('jobs')
          .update({
            status: 'applied',
            applied_at: new Date().toISOString(),
            notes: 'Applied via built-in automation'
          })
          .eq('id', c.id)
        if (!error) applied++
      }

      await log('built-in-auto-apply', 'success', `Applied to ${applied} job(s)`, { applied })
      await updateStats(user.id, applied, 0)

      return new Response(JSON.stringify({ success: true, applied }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      })
    }

    await log('built-in-unknown-workflow', 'error', `Unknown workflow: ${workflow}`)
    return new Response(JSON.stringify({ error: `Unknown workflow: ${workflow}` }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    })
  } catch (error) {
    console.error('run-automation error:', error)
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    })
  }
})
