#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js');
const fetch = require('node-fetch');

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

const USER_ID = process.env.USER_ID || 'default-user';
const SEARCH_QUERY = process.env.SEARCH_QUERY || 'hourly work';
const LOCATION = process.env.LOCATION || 'remote';
const JOB_BOARDS = process.env.JOB_BOARDS ? process.env.JOB_BOARDS.split(',') : [
  'snagajob', 'indeedflex', 'ziprecruiter', 'instawork', 'veryable', 'bluecrew', 'remoteok', 'indeed'
];

// Job board configurations
const JOB_BOARD_CONFIGS = {
  snagajob: {
    name: 'Snagajob',
    baseUrl: 'https://www.snagajob.com/jobs/search',
    params: {
      q: SEARCH_QUERY,
      l: LOCATION,
      radius: '25'
    }
  },
  indeedflex: {
    name: 'Indeed Flex',
    baseUrl: 'https://www.indeed.com/jobs',
    params: {
      q: `${SEARCH_QUERY} immediate hire`,
      l: LOCATION,
      fromage: '3',
      limit: '50'
    }
  },
  ziprecruiter: {
    name: 'ZipRecruiter',
    baseUrl: 'https://www.ziprecruiter.com/Jobs/Immediate-Hire-No-Interview',
    params: {
      q: SEARCH_QUERY,
      l: LOCATION
    }
  },
  instawork: {
    name: 'Instawork',
    baseUrl: 'https://instawork.com/jobs',
    params: {
      search: SEARCH_QUERY,
      location: LOCATION
    }
  },
  veryable: {
    name: 'Veryable',
    baseUrl: 'https://veryableops.com/jobs',
    params: {
      search: SEARCH_QUERY,
      location: LOCATION
    }
  },
  bluecrew: {
    name: 'BlueCrew',
    baseUrl: 'https://www.bluecrewjobs.com/jobs',
    params: {
      q: SEARCH_QUERY,
      l: LOCATION
    }
  },
  remoteok: {
    name: 'RemoteOK',
    baseUrl: 'https://remoteok.com/api',
    params: {}
  },
  indeed: {
    name: 'Indeed',
    baseUrl: 'https://www.indeed.com/jobs',
    params: {
      q: `${SEARCH_QUERY} immediate hire`,
      l: LOCATION,
      fromage: '3',
      limit: '50'
    }
  }
};

async function scrapeJobBoard(boardKey, config) {
  console.log(`Scraping ${config.name}...`);
  
  try {
    let jobs = [];
    if (boardKey === 'remoteok') {
      const response = await fetch(config.baseUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        },
        timeout: 15000
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      const data = await response.json();
      jobs = data.map(job => ({
        title: job.position,
        company: job.company,
        url: job.url,
        source: 'RemoteOK',
        user_id: USER_ID,
        dateFound: new Date().toISOString(),
        payRange: job.salary || 'Varies',
        type: 'remote',
        resumeRequired: false,
        status: 'pending',
        notes: `Found via GitHub Actions automation from RemoteOK`
      }));
      console.log(`Found ${jobs.length} jobs from RemoteOK`);
      return jobs;
    } else if (boardKey === 'indeed') {
      const url = new URL(config.baseUrl);
      Object.entries(config.params).forEach(([key, value]) => {
        url.searchParams.append(key, value);
      });
      const response = await fetch(url.toString(), {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        },
        timeout: 15000
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      const html = await response.text();
      // Basic HTML parsing for Indeed jobs (improve as needed)
      const jobRegex = /<a[^>]*href="([^"]*)"[^>]*>.*?<span[^>]*>([^<]*)<\/span>.*?<span[^>]*class="companyName"[^>]*>.*?<a[^>]*>([^<]*)<\/a>/g;
      let match;
      while ((match = jobRegex.exec(html)) !== null) {
        jobs.push({
          title: match[2].trim(),
          company: match[3].trim(),
          url: match[1].startsWith('/') ? `https://www.indeed.com${match[1]}` : match[1],
          source: 'Indeed',
          user_id: USER_ID,
          dateFound: new Date().toISOString(),
          payRange: 'Varies',
          type: 'hourly',
          resumeRequired: true,
          status: 'pending',
          notes: `Found via GitHub Actions automation from Indeed`
        });
      }
      console.log(`Found ${jobs.length} jobs from Indeed`);
      return jobs;
    } else {
      const url = new URL(config.baseUrl);
      Object.entries(config.params).forEach(([key, value]) => {
        url.searchParams.append(key, value);
      });
      const response = await fetch(url.toString(), {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        },
        timeout: 15000
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      const html = await response.text();
      jobs = parseJobBoard(boardKey, html, config.name);
      console.log(`Found ${jobs.length} jobs from ${config.name}`);
      return jobs;
    }
  } catch (error) {
    console.error(`Error scraping ${config.name}:`, error.message);
    return [];
  }
}

function parseJobBoard(boardKey, html, boardName) {
  const jobs = [];
  
  // Common job parsing patterns
  const patterns = {
    snagajob: {
      jobRegex: /<div[^>]*class="[^"]*job[^"]*"[^>]*>.*?<a[^>]*href="([^"]*)"[^>]*>.*?<h3[^>]*>([^<]*)<\/h3>.*?<div[^>]*class="[^"]*company[^"]*"[^>]*>([^<]*)<\/div>/g,
      payRegex: /\$(\d+(?:,\d{3})*(?:\.\d{2})?)\s*(?:-|to|–)\s*\$(\d+(?:,\d{3})*(?:\.\d{2})?)\s*(?:per\s+)?(hour|hr|day|week|month)/gi
    },
    indeedflex: {
      jobRegex: /<h2[^>]*>.*?<a[^>]*href="([^"]*)"[^>]*>.*?<span[^>]*>([^<]*)<\/span>.*?<span[^>]*class="companyName"[^>]*>.*?<a[^>]*>([^<]*)<\/a>/g,
      payRegex: /\$(\d+(?:,\d{3})*(?:\.\d{2})?)\s*(?:-|to|–)\s*\$(\d+(?:,\d{3})*(?:\.\d{2})?)\s*(?:per\s+)?(hour|hr|day|week|month)/gi
    },
    ziprecruiter: {
      jobRegex: /<a[^>]*href="([^"]*)"[^>]*>.*?<h3[^>]*>([^<]*)<\/h3>.*?<div[^>]*class="[^"]*company[^"]*"[^>]*>([^<]*)<\/div>/g,
      payRegex: /\$(\d+(?:,\d{3})*(?:\.\d{2})?)\s*(?:-|to|–)\s*\$(\d+(?:,\d{3})*(?:\.\d{2})?)\s*(?:per\s+)?(hour|hr|day|week|month)/gi
    },
    instawork: {
      jobRegex: /<div[^>]*class="[^"]*job[^"]*"[^>]*>.*?<a[^>]*href="([^"]*)"[^>]*>.*?<h3[^>]*>([^<]*)<\/h3>.*?<div[^>]*class="[^"]*company[^"]*"[^>]*>([^<]*)<\/div>/g,
      payRegex: /\$(\d+(?:,\d{3})*(?:\.\d{2})?)\s*(?:-|to|–)\s*\$(\d+(?:,\d{3})*(?:\.\d{2})?)\s*(?:per\s+)?(hour|hr|day|week|month)/gi
    },
    veryable: {
      jobRegex: /<div[^>]*class="[^"]*job[^"]*"[^>]*>.*?<a[^>]*href="([^"]*)"[^>]*>.*?<h3[^>]*>([^<]*)<\/h3>.*?<div[^>]*class="[^"]*company[^"]*"[^>]*>([^<]*)<\/div>/g,
      payRegex: /\$(\d+(?:,\d{3})*(?:\.\d{2})?)\s*(?:-|to|–)\s*\$(\d+(?:,\d{3})*(?:\.\d{2})?)\s*(?:per\s+)?(hour|hr|day|week|month)/gi
    },
    bluecrew: {
      jobRegex: /<div[^>]*class="[^"]*job[^"]*"[^>]*>.*?<a[^>]*href="([^"]*)"[^>]*>.*?<h3[^>]*>([^<]*)<\/h3>.*?<div[^>]*class="[^"]*company[^"]*"[^>]*>([^<]*)<\/div>/g,
      payRegex: /\$(\d+(?:,\d{3})*(?:\.\d{2})?)\s*(?:-|to|–)\s*\$(\d+(?:,\d{3})*(?:\.\d{2})?)\s*(?:per\s+)?(hour|hr|day|week|month)/gi
    }
  };

  const pattern = patterns[boardKey] || patterns.snagajob;
  let match;
  let jobCount = 0;

  while ((match = pattern.jobRegex.exec(html)) !== null && jobCount < 20) {
    const url = match[1].startsWith('/') ? `https://${boardKey}.com${match[1]}` : match[1];
    const title = match[2].trim();
    const company = match[3].trim();

    // Extract pay information
    const payMatch = pattern.payRegex.exec(html);
    const payRange = payMatch ? `$${payMatch[1]}-$${payMatch[2]}/${payMatch[3]}` : 'Varies';

    const job = {
      title,
      company,
      url,
      source: boardName,
      user_id: USER_ID,
      dateFound: new Date().toISOString(),
      payRange,
      type: 'hourly',
      resumeRequired: false,
      status: 'pending',
      notes: `Found via GitHub Actions automation from ${boardName}`
    };

    // Validate job data
    if (job.title && job.company && job.url && job.title.length > 3) {
      jobs.push(job);
      jobCount++;
    }
  }

  return jobs;
}

async function saveJobsToDatabase(jobs) {
  if (jobs.length === 0) {
    console.log('No jobs to save');
    return;
  }

  try {
    const { data, error } = await supabase
      .from('jobs')
      .insert(jobs);

    if (error) {
      throw error;
    }

    console.log(`Successfully saved ${jobs.length} jobs to database`);
  } catch (error) {
    console.error('Error saving jobs to database:', error);
  }
}

async function main() {
  console.log('Starting job scraping workflow...');
  console.log(`User ID: ${USER_ID}`);
  console.log(`Search Query: ${SEARCH_QUERY}`);
  console.log(`Location: ${LOCATION}`);
  console.log(`Job Boards: ${JOB_BOARDS.join(', ')}`);

  const allJobs = [];

  // Scrape each job board
  for (const boardKey of JOB_BOARDS) {
    const config = JOB_BOARD_CONFIGS[boardKey];
    if (config) {
      const jobs = await scrapeJobBoard(boardKey, config);
      allJobs.push(...jobs);
    }
  }

  // Remove duplicates based on title and company
  const uniqueJobs = allJobs.filter((job, index, self) => 
    index === self.findIndex(j => j.title === job.title && j.company === job.company)
  );

  console.log(`Total unique jobs found: ${uniqueJobs.length}`);

  // Save to database
  await saveJobsToDatabase(uniqueJobs);

  console.log('Job scraping workflow completed successfully');
}

main().catch(console.error);
