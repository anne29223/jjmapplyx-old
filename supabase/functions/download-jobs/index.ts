import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface ScrapedJob {
  id?: string;
  title: string;
  company: string;
  url: string;
  source: string;
  user_id: string;
  dateFound: string;
  payRange?: string;
  type?: string;
  resumeRequired?: boolean;
  status: 'pending' | 'applied' | 'rejected' | 'interview';
  notes?: string;
  description?: string;
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

    // Get query parameters
    const url = new URL(req.url)
    const format = url.searchParams.get('format') || 'json' // json or csv
    const limit = parseInt(url.searchParams.get('limit') || '1000')

    // Fetch jobs from database
    const { data: jobs, error } = await supabaseClient
      .from('jobs')
      .select('*')
      .eq('user_id', user.id)
      .order('dateFound', { ascending: false })
      .limit(limit)

    if (error) {
      throw new Error(`Failed to fetch jobs: ${error.message}`)
    }

    if (!jobs || jobs.length === 0) {
      return new Response(JSON.stringify({ 
        error: 'No jobs found',
        message: 'No scraped jobs available for download. Run the job scraper first.'
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 404,
      })
    }

    // Prepare metadata
    const metadata = {
      totalJobs: jobs.length,
      downloadedAt: new Date().toISOString(),
      userId: user.id,
      format: format
    }

    if (format === 'csv') {
      // Convert to CSV
      const csvHeaders = ['Title', 'Company', 'URL', 'Source', 'Pay Range', 'Type', 'Status', 'Date Found', 'Notes']
      const csvRows = jobs.map(job => [
        `"${(job.title || '').replace(/"/g, '""')}"`,
        `"${(job.company || '').replace(/"/g, '""')}"`,
        `"${(job.url || '').replace(/"/g, '""')}"`,
        `"${(job.source || '').replace(/"/g, '""')}"`,
        `"${(job.payRange || '').replace(/"/g, '""')}"`,
        `"${(job.type || '').replace(/"/g, '""')}"`,
        `"${(job.status || '').replace(/"/g, '""')}"`,
        `"${(job.dateFound || '').replace(/"/g, '""')}"`,
        `"${(job.notes || '').replace(/"/g, '""')}"`
      ])

      const csvContent = [
        csvHeaders.join(','),
        ...csvRows.map(row => row.join(','))
      ].join('\n')

      const filename = `scraped-jobs-${new Date().toISOString().split('T')[0]}.csv`
      
      return new Response(csvContent, {
        headers: {
          ...corsHeaders,
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename="${filename}"`
        }
      })
    } else {
      // Return JSON
      const jsonData = {
        jobs: jobs,
        metadata: metadata
      }

      const filename = `scraped-jobs-${new Date().toISOString().split('T')[0]}.json`
      
      return new Response(JSON.stringify(jsonData, null, 2), {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
          'Content-Disposition': `attachment; filename="${filename}"`
        }
      })
    }

  } catch (error) {
    console.error('Download jobs error:', error)
    return new Response(JSON.stringify({ 
      error: 'Internal server error',
      message: error.message 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    })
  }
})

