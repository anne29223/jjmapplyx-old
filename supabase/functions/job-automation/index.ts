import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    );

    // Validate user authentication
    const authHeader = req.headers.get('Authorization')!;
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(token);

    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized: Valid authentication required' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 401 }
      );
    }

    // Get request parameters (user_id is now from authenticated user)
    const { search_query = 'software engineer', location = 'remote', experience_level = 'mid' } = await req.json();

    // Simulate job scraping (replace with real scraping logic or API calls)
    const jobs = [
      {
        title: 'Software Engineer',
        company: 'Acme Corp',
        url: 'https://example.com/job/1',
        location,
        experience_level,
        user_id: user.id,
        found_at: new Date().toISOString(),
        resume_required: false,
      },
      {
        title: 'Frontend Developer',
        company: 'Beta LLC',
        url: 'https://example.com/job/2',
        location,
        experience_level,
        user_id: user.id,
        found_at: new Date().toISOString(),
        resume_required: true,
      }
    ];

    // Store jobs in Supabase (example table: jobs)
    const { error } = await supabaseClient.from('jobs').insert(jobs);
    if (error) throw error;

    // Log the automation run with proper user context
    await supabaseClient.from('automation_logs').insert({
      user_id: user.id,
      action: 'job-automation',
      status: 'success',
      details: `Inserted ${jobs.length} jobs for user ${user.id}`,
      metadata: { search_query, location, experience_level }
    });

    return new Response(
      JSON.stringify({ success: true, jobs }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
    );
  }
});
