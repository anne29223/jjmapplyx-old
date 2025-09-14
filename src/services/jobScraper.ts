import { createClient } from '@supabase/supabase-js';
import * as cheerio from 'cheerio';
import puppeteer from 'puppeteer';

const supabaseUrl = 'https://tzvzranspvtifnlgrkwi.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR6dnpyYW5zcHZ0aWZubGdya3dpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMyOTkxODcsImV4cCI6MjA2ODg3NTE4N30.oMG8VGPew29xAoaKPal0rsSs8aVmvyjXsyErC45jcfg';

export const supabase = createClient(supabaseUrl, supabaseKey);

export interface ScrapedJob {
  id?: string;
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

export interface JobBoardConfig {
  name: string;
  baseUrl: string;
  searchUrl: string;
  selectors: {
    jobContainer: string;
    title: string;
    company: string;
    location?: string;
    url: string;
    description?: string;
    salary?: string;
    postedAt?: string;
  };
  pagination?: {
    nextPage: string;
    maxPages: number;
  };
  requiresPuppeteer?: boolean;
}

const JOB_BOARD_CONFIGS: Record<string, JobBoardConfig> = {
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
    },
    pagination: {
      nextPage: 'a[aria-label="Next Page"]',
      maxPages: 5
    },
    requiresPuppeteer: true
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
    },
    pagination: {
      nextPage: '.jobs-search-pagination__next-button',
      maxPages: 3
    },
    requiresPuppeteer: true
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
    },
    pagination: {
      nextPage: '[data-test="pagination-next"]',
      maxPages: 3
    },
    requiresPuppeteer: true
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
    },
    pagination: {
      nextPage: '.pagination .next',
      maxPages: 3
    },
    requiresPuppeteer: true
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
    },
    pagination: {
      nextPage: '[data-testid="pagination-next"]',
      maxPages: 3
    },
    requiresPuppeteer: true
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
    },
    pagination: {
      nextPage: '.pagination .next',
      maxPages: 3
    },
    requiresPuppeteer: true
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
    },
    pagination: {
      nextPage: '.pagination .next',
      maxPages: 3
    },
    requiresPuppeteer: true
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
    },
    pagination: {
      nextPage: '.pagination .next',
      maxPages: 3
    },
    requiresPuppeteer: true
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
    },
    pagination: {
      nextPage: '.pagination .next',
      maxPages: 3
    },
    requiresPuppeteer: true
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
    },
    pagination: {
      nextPage: '.pagination .next',
      maxPages: 3
    },
    requiresPuppeteer: true
  }
};

export class JobScraperService {
  private browser: puppeteer.Browser | null = null;

  async initialize() {
    if (!this.browser) {
      this.browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
      });
    }
  }

  async close() {
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
    }
  }

  async scrapeJobBoard(
    boardKey: string,
    searchQuery: string = 'remote work',
    location: string = 'remote',
    maxJobs: number = 50
  ): Promise<ScrapedJob[]> {
    const config = JOB_BOARD_CONFIGS[boardKey];
    if (!config) {
      throw new Error(`Unknown job board: ${boardKey}`);
    }

    console.log(`Scraping ${config.name} for "${searchQuery}" in ${location}`);

    if (config.requiresPuppeteer) {
      return this.scrapeWithPuppeteer(config, searchQuery, location, maxJobs);
    } else {
      return this.scrapeWithFetch(config, searchQuery, location, maxJobs);
    }
  }

  private async scrapeWithPuppeteer(
    config: JobBoardConfig,
    searchQuery: string,
    location: string,
    maxJobs: number
  ): Promise<ScrapedJob[]> {
    await this.initialize();
    if (!this.browser) throw new Error('Browser not initialized');

    const page = await this.browser.newPage();
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');
    
    const jobs: ScrapedJob[] = [];
    let currentPage = 1;
    const maxPages = config.pagination?.maxPages || 3;

    try {
      // Navigate to search page
      const searchUrl = new URL(config.searchUrl);
      searchUrl.searchParams.set('q', searchQuery);
      searchUrl.searchParams.set('l', location);
      
      await page.goto(searchUrl.toString(), { waitUntil: 'networkidle2' });
      await page.waitForTimeout(2000);

      while (jobs.length < maxJobs && currentPage <= maxPages) {
        console.log(`Scraping page ${currentPage} of ${config.name}`);

        // Wait for job listings to load
        await page.waitForSelector(config.selectors.jobContainer, { timeout: 10000 });

        // Extract jobs from current page
        const pageJobs = await page.evaluate((selectors, source) => {
          const jobElements = document.querySelectorAll(selectors.jobContainer);
          const jobs: ScrapedJob[] = [];

          jobElements.forEach((element) => {
            try {
              const titleEl = element.querySelector(selectors.title);
              const companyEl = element.querySelector(selectors.company);
              const locationEl = element.querySelector(selectors.location);
              const urlEl = element.querySelector(selectors.url);
              const descriptionEl = element.querySelector(selectors.description);
              const salaryEl = element.querySelector(selectors.salary);
              const postedAtEl = element.querySelector(selectors.postedAt);

              if (titleEl && companyEl && urlEl) {
                const title = titleEl.textContent?.trim() || '';
                const company = companyEl.textContent?.trim() || '';
                const location = locationEl?.textContent?.trim() || '';
                const url = urlEl.getAttribute('href') || '';
                const description = descriptionEl?.textContent?.trim() || '';
                const salary = salaryEl?.textContent?.trim() || '';
                const postedAt = postedAtEl?.textContent?.trim() || '';

                // Make URL absolute
                const absoluteUrl = url.startsWith('http') ? url : `${window.location.origin}${url}`;

                if (title && company && absoluteUrl) {
                  jobs.push({
                    title,
                    company,
                    location: location || undefined,
                    url: absoluteUrl,
                    description: description || undefined,
                    salary: salary || undefined,
                    source,
                    posted_at: postedAt || undefined,
                    scraped_at: new Date().toISOString(),
                    status: 'pending'
                  });
                }
              }
            } catch (error) {
              console.error('Error parsing job element:', error);
            }
          });

          return jobs;
        }, config.selectors, config.name);

        jobs.push(...pageJobs);

        // Check if there's a next page
        if (config.pagination && currentPage < maxPages) {
          const nextPageExists = await page.$(config.pagination.nextPage);
          if (nextPageExists) {
            await page.click(config.pagination.nextPage);
            await page.waitForTimeout(3000);
            currentPage++;
          } else {
            break;
          }
        } else {
          break;
        }
      }

      console.log(`Found ${jobs.length} jobs from ${config.name}`);
      return jobs.slice(0, maxJobs);

    } catch (error) {
      console.error(`Error scraping ${config.name}:`, error);
      return [];
    } finally {
      await page.close();
    }
  }

  private async scrapeWithFetch(
    config: JobBoardConfig,
    searchQuery: string,
    location: string,
    maxJobs: number
  ): Promise<ScrapedJob[]> {
    try {
      const response = await fetch(config.searchUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const html = await response.text();
      const $ = cheerio.load(html);
      const jobs: ScrapedJob[] = [];

      $(config.selectors.jobContainer).each((index, element) => {
        if (jobs.length >= maxJobs) return false;

        try {
          const title = $(element).find(config.selectors.title).text().trim();
          const company = $(element).find(config.selectors.company).text().trim();
          const location = $(element).find(config.selectors.location).text().trim();
          const url = $(element).find(config.selectors.url).attr('href') || '';
          const description = $(element).find(config.selectors.description).text().trim();
          const salary = $(element).find(config.selectors.salary).text().trim();
          const postedAt = $(element).find(config.selectors.postedAt).text().trim();

          if (title && company && url) {
            const absoluteUrl = url.startsWith('http') ? url : `${config.baseUrl}${url}`;
            
            jobs.push({
              title,
              company,
              location: location || undefined,
              url: absoluteUrl,
              description: description || undefined,
              salary: salary || undefined,
              source: config.name,
              posted_at: postedAt || undefined,
              scraped_at: new Date().toISOString(),
              status: 'pending'
            });
          }
        } catch (error) {
          console.error('Error parsing job element:', error);
        }
      });

      console.log(`Found ${jobs.length} jobs from ${config.name}`);
      return jobs;

    } catch (error) {
      console.error(`Error scraping ${config.name}:`, error);
      return [];
    }
  }

  async saveJobsToDatabase(jobs: ScrapedJob[], userId?: string): Promise<number> {
    if (jobs.length === 0) return 0;

    try {
      // Add user_id to all jobs if provided
      const jobsWithUserId = userId ? jobs.map(job => ({ ...job, user_id: userId })) : jobs;

      const { data, error } = await supabase
        .from('scraped_jobs')
        .insert(jobsWithUserId);

      if (error) {
        throw error;
      }

      console.log(`Successfully saved ${jobs.length} scraped jobs to database`);
      return jobs.length;

    } catch (error) {
      console.error('Error saving scraped jobs to database:', error);
      throw error;
    }
  }

  async getScrapedJobs(userId?: string, limit: number = 100): Promise<ScrapedJob[]> {
    try {
      let query = supabase
        .from('scraped_jobs')
        .select('*')
        .order('scraped_at', { ascending: false })
        .limit(limit);

      if (userId) {
        query = query.eq('user_id', userId);
      }

      const { data, error } = await query;

      if (error) {
        throw error;
      }

      return data || [];

    } catch (error) {
      console.error('Error fetching scraped jobs:', error);
      return [];
    }
  }

  async updateJobStatus(jobId: string, status: ScrapedJob['status']): Promise<void> {
    try {
      const { error } = await supabase
        .from('scraped_jobs')
        .update({ status })
        .eq('id', jobId);

      if (error) {
        throw error;
      }

    } catch (error) {
      console.error('Error updating job status:', error);
      throw error;
    }
  }

  async deleteScrapedJob(jobId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('scraped_jobs')
        .delete()
        .eq('id', jobId);

      if (error) {
        throw error;
      }

    } catch (error) {
      console.error('Error deleting scraped job:', error);
      throw error;
    }
  }

  getAvailableJobBoards(): string[] {
    return Object.keys(JOB_BOARD_CONFIGS);
  }

  getJobBoardConfig(boardKey: string): JobBoardConfig | undefined {
    return JOB_BOARD_CONFIGS[boardKey];
  }
}

export const jobScraperService = new JobScraperService();
