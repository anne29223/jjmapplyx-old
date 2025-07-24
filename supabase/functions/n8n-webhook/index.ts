import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-webhook-signature, x-forwarded-for',
  'Content-Security-Policy': "default-src 'none'; frame-ancestors 'none';",
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'Referrer-Policy': 'no-referrer'
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
              .replace(/on\w+\s*=/gi, '')
              .trim();
}

// Advanced rate limiting
interface RateLimit {
  count: number;
  resetTime: number;
}

const rateLimits = new Map<string, RateLimit>();
const MAX_REQUESTS_PER_MINUTE = 60;
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const key = `rate_limit:${ip}`;
  const limit = rateLimits.get(key);
  
  if (!limit || now > limit.resetTime) {
    rateLimits.set(key, { count: 1, resetTime: now + RATE_LIMIT_WINDOW });
    return true;
  }
  
  if (limit.count >= MAX_REQUESTS_PER_MINUTE) {
    return false;
  }
  
  limit.count++;
  return true;
}

// Webhook signature verification
async function verifyWebhookSignature(
  payload: string,
  signature: string,
  secret: string
): Promise<boolean> {
  if (!signature || !secret) return false;
  
  try {
    const encoder = new TextEncoder();
    const keyData = encoder.encode(secret);
    const dataToSign = encoder.encode(payload);
    
    const cryptoKey = await crypto.subtle.importKey(
      'raw',
      keyData,
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign']
    );
    
    const signatureBuffer = await crypto.subtle.sign('HMAC', cryptoKey, dataToSign);
    const expectedSignature = Array.from(new Uint8Array(signatureBuffer))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
    
    const cleanSignature = signature.replace(/^sha256=/, '');
    return cleanSignature === expectedSignature;
  } catch (error) {
    console.error('Webhook signature verification failed:', error);
    return false;
  }
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
    // Rate limiting
    const clientIP = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown';
    if (!checkRateLimit(clientIP)) {
      return new Response(
        JSON.stringify({ error: 'Rate limit exceeded' }),
        { status: 429, headers: secureHeaders }
      );
    }

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    )

    // Get raw body for signature verification
    const body = await req.text();
    let requestData;
    
    try {
      requestData = JSON.parse(body);
    } catch (parseError) {
      throw new Error('Invalid JSON payload');
    }

    const { action, data } = requestData;

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

    // Webhook signature verification (if secret is provided)
    const webhookSecret = Deno.env.get('N8N_WEBHOOK_SECRET');
    const signature = req.headers.get('x-webhook-signature');
    
    if (webhookSecret && signature) {
      const isValidSignature = await verifyWebhookSignature(body, signature, webhookSecret);
      if (!isValidSignature) {
        console.error('Invalid webhook signature');
        return new Response(
          JSON.stringify({ error: 'Invalid webhook signature' }),
          { status: 401, headers: secureHeaders }
        );
      }
    }
    
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
      { headers: secureHeaders, status: 200 }
    )

  } catch (error) {
    console.error('n8n webhook error:', error)
    
    // Don't expose internal error details
    const errorMessage = error instanceof Error ? 
      (error.message.includes('Invalid') ? error.message : 'Internal server error') : 
      'Internal server error';
    
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { headers: secureHeaders, status: error.message.includes('Invalid') ? 400 : 500 }
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