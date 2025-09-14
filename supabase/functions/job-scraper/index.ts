import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface ScrapedJob {
  title: string;
  company: string;
  location?: string;
  url: string;
  description?: string;
  salary?: string;
  job_type?: string;
  source: string;
  posted_at?: string;
  scraped_at: string;
  status: 'pending' | 'applied' | 'rejected' | 'interview';
  user_id?: string;
}

const JOB_BOARD_CONFIGS = {
  indeed: {
    name: 'Indeed',
    baseUrl: 'https://www.indeed.com',
    searchUrl: 'https://www.indeed.com/jobs',
    selectors: {
      jobContainer: '[data-testid="job-title"]',
      title: 'h2 a span[title]',
      company: '[data-testid="company-name"] a span',
      location: '[data-testid="job-location"] span',
      url: 'h2 a',
      description: '[data-testid="job-snippet"]',
      salary: '[data-testid="attribute_snippet_testid"]',
      postedAt: '[data-testid="myJobsStateDate"]'
    }
  },
  remoteok: {
    name: 'RemoteOK',
    baseUrl: 'https://remoteok.com',
    searchUrl: 'https://remoteok.com/api',
    selectors: {
      jobContainer: '.job',
      title: '.company_and_position h2',
      company: '.company_and_position h3',
      location: '.location',
      url: '.company_and_position a',
      description: '.job_description',
      salary: '.salary',
      postedAt: '.time'
    }
  },
  weworkremotely: {
    name: 'We Work Remotely',
    baseUrl: 'https://weworkremotely.com',
    searchUrl: 'https://weworkremotely.com/categories/remote-programming-jobs',
    selectors: {
      jobContainer: '.jobs li',
      title: '.title a',
      company: '.company',
      location: '.region',
      url: '.title a',
      description: '.description',
      salary: '.salary',
      postedAt: '.date'
    }
  }
};

async function scrapeRemoteOK(searchQuery: string, location: string): Promise<ScrapedJob[]> {
  try {
    const response = await fetch('https://remoteok.com/api', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    const jobs: ScrapedJob[] = [];

    data.forEach((job: any) => {
      if (job.position && job.company && job.url) {
        // Filter by search query if provided
        const titleMatch = job.position.toLowerCase().includes(searchQuery.toLowerCase());
        const companyMatch = job.company.toLowerCase().includes(searchQuery.toLowerCase());
        const descriptionMatch = job.description?.toLowerCase().includes(searchQuery.toLowerCase());
        
        if (titleMatch || companyMatch || descriptionMatch) {
          jobs.push({
            title: job.position,
            company: job.company,
            location: job.location || 'Remote',
            url: job.url,
            description: job.description,
            salary: job.salary || undefined,
            job_type: job.contract ? 'Contract' : 'Full-time',
            source: 'RemoteOK',
            posted_at: job.date ? new Date(job.date).toISOString() : undefined,
            scraped_at: new Date().toISOString(),
            status: 'pending'
          });
        }
      }
    });

    return jobs;
  } catch (error) {
    console.error('Error scraping RemoteOK:', error);
    return [];
  }
}

async function scrapeIndeed(searchQuery: string, location: string): Promise<ScrapedJob[]> {
  // For Indeed, we'll use a simplified approach since it requires more complex scraping
  // In a real implementation, you might want to use a service like ScrapingBee or similar
  try {
    const searchUrl = new URL('https://www.indeed.com/jobs');
    searchUrl.searchParams.set('q', searchQuery);
    searchUrl.searchParams.set('l', location);
    searchUrl.searchParams.set('fromage', '7');
    searchUrl.searchParams.set('limit', '50');

    const response = await fetch(searchUrl.toString(), {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const html = await response.text();
    const jobs: ScrapedJob[] = [];

    // Simple regex-based parsing (in production, use a proper HTML parser)
    const jobRegex = /<h2[^>]*>.*?<a[^>]*href="([^"]*)"[^>]*>.*?<span[^>]*>([^<]*)<\/span>.*?<span[^>]*class="companyName"[^>]*>.*?<a[^>]*>([^<]*)<\/a>/g;
    let match;

    while ((match = jobRegex.exec(html)) !== null && jobs.length < 20) {
      const url = match[1].startsWith('/') ? `https://www.indeed.com${match[1]}` : match[1];
      const title = match[2].trim();
      const company = match[3].trim();

      if (title && company && url) {
        jobs.push({
          title,
          company,
          location: location || 'Remote',
          url,
          source: 'Indeed',
          scraped_at: new Date().toISOString(),
          status: 'pending'
        });
      }
    }

    return jobs;
  } catch (error) {
    console.error('Error scraping Indeed:', error);
    return [];
  }
}

async function scrapeWeWorkRemotely(searchQuery: string, location: string): Promise<ScrapedJob[]> {
  try {
    const response = await fetch('https://weworkremotely.com/categories/remote-programming-jobs', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const html = await response.text();
    const jobs: ScrapedJob[] = [];

    // Simple regex-based parsing
    const jobRegex = /<li[^>]*>.*?<a[^>]*href="([^"]*)"[^>]*>.*?<span[^>]*class="title"[^>]*>([^<]*)<\/span>.*?<span[^>]*class="company"[^>]*>([^<]*)<\/span>/g;
    let match;

    while ((match = jobRegex.exec(html)) !== null && jobs.length < 20) {
      const url = match[1].startsWith('/') ? `https://weworkremotely.com${match[1]}` : match[1];
      const title = match[2].trim();
      const company = match[3].trim();

      if (title && company && url) {
        jobs.push({
          title,
          company,
          location: 'Remote',
          url,
          source: 'We Work Remotely',
          scraped_at: new Date().toISOString(),
          status: 'pending'
        });
      }
    }

    return jobs;
  } catch (error) {
    console.error('Error scraping We Work Remotely:', error);
    return [];
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    )

    const { jobBoards, searchQuery, location, maxJobs } = await req.json()

    if (!jobBoards || !Array.isArray(jobBoards)) {
      return new Response(
        JSON.stringify({ error: 'jobBoards is required and must be an array' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const allJobs: ScrapedJob[] = []

    // Scrape each job board
    for (const board of jobBoards) {
      let jobs: ScrapedJob[] = []

      switch (board) {
        case 'remoteok':
          jobs = await scrapeRemoteOK(searchQuery || 'remote work', location || 'remote')
          break
        case 'indeed':
          jobs = await scrapeIndeed(searchQuery || 'remote work', location || 'remote')
          break
        case 'weworkremotely':
          jobs = await scrapeWeWorkRemotely(searchQuery || 'remote work', location || 'remote')
          break
        default:
          console.log(`Unknown job board: ${board}`)
          continue
      }

      // Limit jobs per board
      const limitedJobs = jobs.slice(0, maxJobs || 50)
      allJobs.push(...limitedJobs)
    }

    // Remove duplicates based on title and company
    const uniqueJobs = allJobs.filter((job, index, self) => 
      index === self.findIndex(j => j.title === job.title && j.company === job.company)
    )

    // Get user ID from auth (allow anonymous for testing)
    const { data: { user } } = await supabaseClient.auth.getUser()
    const userId = user?.id || '00000000-0000-0000-0000-000000000000' // Default user for testing

    // Add user_id to all jobs
    const jobsWithUserId = uniqueJobs.map(job => ({ ...job, user_id: userId }))

    // Save to database
    const { data, error } = await supabaseClient
      .from('scraped_jobs')
      .insert(jobsWithUserId)

    if (error) {
      throw error
    }

    // Log the scraping activity
    await supabaseClient
      .from('automation_logs')
      .insert({
        action: 'job_scraping',
        status: 'success',
        details: `Scraped ${uniqueJobs.length} jobs from ${jobBoards.join(', ')}`,
        metadata: {
          job_boards: jobBoards,
          search_query: searchQuery,
          location: location,
          jobs_found: uniqueJobs.length
        }
      })

    return new Response(
      JSON.stringify({ 
        success: true, 
        jobs_scraped: uniqueJobs.length,
        job_boards: jobBoards,
        jobs: uniqueJobs.slice(0, 10) // Return first 10 jobs for preview
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Error in job scraper function:', error)
    
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
