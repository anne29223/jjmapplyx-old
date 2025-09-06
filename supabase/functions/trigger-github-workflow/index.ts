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
    const { workflow, github_token, github_repo } = await req.json()

    if (!workflow || !github_token || !github_repo) {
      return new Response(
        JSON.stringify({ error: 'Missing required parameters: workflow, github_token, github_repo' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Initialize Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    )

    // Get user from auth
    const {
      data: { user },
      error: userError,
    } = await supabaseClient.auth.getUser()

    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { 
          status: 401, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Get user settings
    const { data: settings, error: settingsError } = await supabaseClient
      .from('user_settings')
      .select('*')
      .eq('user_id', user.id)
      .single()

    if (settingsError) {
      console.error('Failed to fetch user settings:', settingsError)
    }

    // Trigger GitHub Actions workflow
    const [owner, repo] = github_repo.split('/')
    if (!owner || !repo) {
      return new Response(
        JSON.stringify({ error: 'Invalid repository format. Use owner/repo' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    const workflowInputs = {
      user_id: user.id,
      search_query: 'hourly work',
      location: 'remote',
      job_boards: 'snagajob,indeedflex,ziprecruiter,instawork,veryable,bluecrew',
      max_applications: '10',
      email_provider: 'gmail'
    }

    const githubResponse = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/actions/workflows/${workflow}.yml/dispatches`,
      {
        method: 'POST',
        headers: {
          'Authorization': `token ${github_token}`,
          'Accept': 'application/vnd.github.v3+json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ref: 'main', // or 'master' depending on your default branch
          inputs: workflowInputs
        })
      }
    )

    if (!githubResponse.ok) {
      const errorText = await githubResponse.text()
      console.error('GitHub API error:', errorText)
      return new Response(
        JSON.stringify({ 
          error: 'Failed to trigger GitHub workflow',
          details: errorText
        }),
        { 
          status: githubResponse.status, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Log the action
    await supabaseClient
      .from('automation_logs')
      .insert({
        user_id: user.id,
        action: `Triggered GitHub ${workflow}`,
        status: 'success',
        details: `Triggered GitHub Actions workflow '${workflow}' in ${github_repo}`,
        metadata: { 
          workflow, 
          repository: github_repo,
          inputs: workflowInputs,
          timestamp: new Date().toISOString()
        }
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
          automation_runs: (currentStats.automation_runs || 0) + 1,
          last_updated: new Date().toISOString()
        })
        .eq('user_id', user.id)
        .eq('date', today)
    } else {
      await supabaseClient
        .from('automation_stats')
        .insert({
          user_id: user.id,
          date: today,
          automation_runs: 1,
          last_updated: new Date().toISOString()
        })
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `GitHub workflow '${workflow}' triggered successfully`,
        repository: github_repo,
        workflow_url: `https://github.com/${github_repo}/actions`
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Error triggering GitHub workflow:', error)
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error',
        details: error.message 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})
