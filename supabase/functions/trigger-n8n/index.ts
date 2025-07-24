import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-csrf-token',
  'Content-Security-Policy': "default-src 'none'; frame-ancestors 'none';",
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'Referrer-Policy': 'no-referrer'
}

// Rate limiting
interface RateLimit {
  count: number;
  resetTime: number;
}

const rateLimits = new Map<string, RateLimit>();
const MAX_REQUESTS_PER_HOUR = 100;
const RATE_LIMIT_WINDOW = 60 * 60 * 1000; // 1 hour

function checkRateLimit(userId: string): boolean {
  const now = Date.now();
  const key = `rate_limit:${userId}`;
  const limit = rateLimits.get(key);
  
  if (!limit || now > limit.resetTime) {
    rateLimits.set(key, { count: 1, resetTime: now + RATE_LIMIT_WINDOW });
    return true;
  }
  
  if (limit.count >= MAX_REQUESTS_PER_HOUR) {
    return false;
  }
  
  limit.count++;
  return true;
}

serve(async (req) => {
  // Security headers for all responses
  const secureHeaders = {
    ...corsHeaders,
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'Content-Type': 'application/json'
  };

  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: secureHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
    )

    // Enhanced authentication check
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Missing authorization header' }),
        { status: 401, headers: secureHeaders }
      );
    }

    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(token)

    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Invalid or expired token' }),
        { status: 401, headers: secureHeaders }
      );
    }

    // Rate limiting per user
    if (!checkRateLimit(user.id)) {
      return new Response(
        JSON.stringify({ error: 'Rate limit exceeded. Please try again later.' }),
        { status: 429, headers: secureHeaders }
      );
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
      { headers: secureHeaders, status: 200 }
    )

  } catch (error) {
    console.error('Trigger n8n error:', error)
    
    // Don't expose internal error details
    const errorMessage = error instanceof Error ? 
      (error.message.includes('Missing') || error.message.includes('Invalid') || error.message.includes('not configured') ? 
        error.message : 'Internal server error') : 
      'Internal server error';
    
    const statusCode = error instanceof Error && 
      (error.message.includes('Missing') || error.message.includes('Invalid')) ? 400 : 500;
    
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { headers: secureHeaders, status: statusCode }
    )
  }
})