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
  linkedin: {
    name: 'LinkedIn',
    baseUrl: 'https://www.linkedin.com',
    searchUrl: 'https://www.linkedin.com/jobs/search',
    selectors: {
      jobContainer: '.jobs-search-results__list-item',
      title: '.job-search-card__title a',
      company: '.job-search-card__subtitle a',
      location: '.job-search-card__location',
      url: '.job-search-card__title a',
      description: '.job-search-card__snippet',
      salary: '.job-search-card__salary',
      postedAt: '.job-search-card__listdate'
    }
  },
  glassdoor: {
    name: 'Glassdoor',
    baseUrl: 'https://www.glassdoor.com',
    searchUrl: 'https://www.glassdoor.com/Job/jobs.htm',
    selectors: {
      jobContainer: '[data-test="jobListing"]',
      title: '[data-test="job-title"] a',
      company: '[data-test="employer-name"] a',
      location: '[data-test="job-location"]',
      url: '[data-test="job-title"] a',
      description: '[data-test="job-description"]',
      salary: '[data-test="detailSalary"]',
      postedAt: '[data-test="job-age"]'
    }
  },
  naukri: {
    name: 'Naukri',
    baseUrl: 'https://www.naukri.com',
    searchUrl: 'https://www.naukri.com/jobs-in-india',
    selectors: {
      jobContainer: '.jobTuple',
      title: '.jobTupleHeader a',
      company: '.jobTupleHeader .companyName',
      location: '.jobTupleHeader .location',
      url: '.jobTupleHeader a',
      description: '.job-description',
      salary: '.salary',
      postedAt: '.jobTupleHeader .fleft .faded'
    }
  },
  monster: {
    name: 'Monster',
    baseUrl: 'https://www.monster.com',
    searchUrl: 'https://www.monster.com/jobs/search',
    selectors: {
      jobContainer: '[data-testid="job-card"]',
      title: '[data-testid="job-title"] a',
      company: '[data-testid="company-name"]',
      location: '[data-testid="job-location"]',
      url: '[data-testid="job-title"] a',
      description: '[data-testid="job-description"]',
      salary: '[data-testid="salary"]',
      postedAt: '[data-testid="posted-date"]'
    }
  },
  simplyhired: {
    name: 'SimplyHired',
    baseUrl: 'https://www.simplyhired.com',
    searchUrl: 'https://www.simplyhired.com/search',
    selectors: {
      jobContainer: '.SerpJob',
      title: '.SerpJob-title a',
      company: '.SerpJob-company',
      location: '.SerpJob-location',
      url: '.SerpJob-title a',
      description: '.SerpJob-description',
      salary: '.SerpJob-salary',
      postedAt: '.SerpJob-age'
    }
  },
  careercloud: {
    name: 'CareerCloud',
    baseUrl: 'https://www.careercloud.com',
    searchUrl: 'https://www.careercloud.com/jobs',
    selectors: {
      jobContainer: '.job-listing',
      title: '.job-listing h3 a',
      company: '.job-listing .company',
      location: '.job-listing .location',
      url: '.job-listing h3 a',
      description: '.job-listing .description',
      salary: '.job-listing .salary',
      postedAt: '.job-listing .date'
    }
  },
  flexjobs: {
    name: 'FlexJobs',
    baseUrl: 'https://www.flexjobs.com',
    searchUrl: 'https://www.flexjobs.com/search',
    selectors: {
      jobContainer: '.job',
      title: '.job-title a',
      company: '.job-company',
      location: '.job-location',
      url: '.job-title a',
      description: '.job-description',
      salary: '.job-salary',
      postedAt: '.job-date'
    }
  },
  careerbuilder: {
    name: 'CareerBuilder',
    baseUrl: 'https://www.careerbuilder.com',
    searchUrl: 'https://www.careerbuilder.com/jobs',
    selectors: {
      jobContainer: '.data-results-content-parent',
      title: '.data-results-content-parent h3 a',
      company: '.data-results-content-parent .data-details span',
      location: '.data-results-content-parent .data-details .job-location',
      url: '.data-results-content-parent h3 a',
      description: '.data-results-content-parent .data-snapshot',
      salary: '.data-results-content-parent .data-snapshot .salary',
      postedAt: '.data-results-content-parent .data-details .data-posted'
    }
  },
  careeronestop: {
    name: 'CareerOneStop',
    baseUrl: 'https://www.careeronestop.org',
    searchUrl: 'https://www.careeronestop.org/JobSearch/JobSearch.aspx',
    selectors: {
      jobContainer: '.job-result',
      title: '.job-result .job-title a',
      company: '.job-result .company-name',
      location: '.job-result .job-location',
      url: '.job-result .job-title a',
      description: '.job-result .job-description',
      salary: '.job-result .salary',
      postedAt: '.job-result .job-date'
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

async function scrapeLinkedIn(searchQuery: string, location: string): Promise<ScrapedJob[]> {
  try {
    const searchUrl = new URL('https://www.linkedin.com/jobs/search');
    searchUrl.searchParams.set('keywords', searchQuery);
    searchUrl.searchParams.set('location', location);

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

    // Simple regex-based parsing for LinkedIn
    const jobRegex = /<a[^>]*href="([^"]*)"[^>]*>.*?<span[^>]*class="job-search-card__title"[^>]*>([^<]*)<\/span>.*?<span[^>]*class="job-search-card__subtitle"[^>]*>([^<]*)<\/span>/g;
    let match;

    while ((match = jobRegex.exec(html)) !== null && jobs.length < 20) {
      const url = match[1].startsWith('/') ? `https://www.linkedin.com${match[1]}` : match[1];
      const title = match[2].trim();
      const company = match[3].trim();

      if (title && company && url) {
        jobs.push({
          title,
          company,
          location: location || 'Remote',
          url,
          source: 'LinkedIn',
          scraped_at: new Date().toISOString(),
          status: 'pending'
        });
      }
    }

    return jobs;
  } catch (error) {
    console.error('Error scraping LinkedIn:', error);
    return [];
  }
}

async function scrapeGlassdoor(searchQuery: string, location: string): Promise<ScrapedJob[]> {
  try {
    const searchUrl = new URL('https://www.glassdoor.com/Job/jobs.htm');
    searchUrl.searchParams.set('sc.keyword', searchQuery);
    searchUrl.searchParams.set('locT', 'C');
    searchUrl.searchParams.set('locId', '1');

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

    // Simple regex-based parsing for Glassdoor
    const jobRegex = /<a[^>]*href="([^"]*)"[^>]*>.*?<span[^>]*class="jobTitle"[^>]*>([^<]*)<\/span>.*?<span[^>]*class="employerName"[^>]*>([^<]*)<\/span>/g;
    let match;

    while ((match = jobRegex.exec(html)) !== null && jobs.length < 20) {
      const url = match[1].startsWith('/') ? `https://www.glassdoor.com${match[1]}` : match[1];
      const title = match[2].trim();
      const company = match[3].trim();

      if (title && company && url) {
        jobs.push({
          title,
          company,
          location: location || 'Remote',
          url,
          source: 'Glassdoor',
          scraped_at: new Date().toISOString(),
          status: 'pending'
        });
      }
    }

    return jobs;
  } catch (error) {
    console.error('Error scraping Glassdoor:', error);
    return [];
  }
}

// Placeholder functions for other job boards
async function scrapeNaukri(searchQuery: string, location: string): Promise<ScrapedJob[]> {
  return []; // Placeholder - would need specific implementation
}

async function scrapeMonster(searchQuery: string, location: string): Promise<ScrapedJob[]> {
  return []; // Placeholder - would need specific implementation
}

async function scrapeSimplyHired(searchQuery: string, location: string): Promise<ScrapedJob[]> {
  return []; // Placeholder - would need specific implementation
}

async function scrapeCareerCloud(searchQuery: string, location: string): Promise<ScrapedJob[]> {
  return []; // Placeholder - would need specific implementation
}

async function scrapeFlexJobs(searchQuery: string, location: string): Promise<ScrapedJob[]> {
  return []; // Placeholder - would need specific implementation
}

async function scrapeCareerBuilder(searchQuery: string, location: string): Promise<ScrapedJob[]> {
  return []; // Placeholder - would need specific implementation
}

async function scrapeCareerOneStop(searchQuery: string, location: string): Promise<ScrapedJob[]> {
  return []; // Placeholder - would need specific implementation
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
        case 'indeed':
          jobs = await scrapeIndeed(searchQuery || 'remote work', location || 'remote')
          break
        case 'linkedin':
          jobs = await scrapeLinkedIn(searchQuery || 'remote work', location || 'remote')
          break
        case 'glassdoor':
          jobs = await scrapeGlassdoor(searchQuery || 'remote work', location || 'remote')
          break
        case 'naukri':
          jobs = await scrapeNaukri(searchQuery || 'remote work', location || 'remote')
          break
        case 'monster':
          jobs = await scrapeMonster(searchQuery || 'remote work', location || 'remote')
          break
        case 'simplyhired':
          jobs = await scrapeSimplyHired(searchQuery || 'remote work', location || 'remote')
          break
        case 'careercloud':
          jobs = await scrapeCareerCloud(searchQuery || 'remote work', location || 'remote')
          break
        case 'flexjobs':
          jobs = await scrapeFlexJobs(searchQuery || 'remote work', location || 'remote')
          break
        case 'careerbuilder':
          jobs = await scrapeCareerBuilder(searchQuery || 'remote work', location || 'remote')
          break
        case 'careeronestop':
          jobs = await scrapeCareerOneStop(searchQuery || 'remote work', location || 'remote')
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
