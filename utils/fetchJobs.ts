import fetch from "node-fetch";
import Job from "../models/Job";

const SCRAPER_URL = process.env.JOB_SCRAPER_API_URL!;
const SCRAPER_KEY = process.env.JOB_SCRAPER_API_KEY;

export interface ScraperJob {
  title: string;
  company: string;
  location?: string;
  url: string;
  description?: string;
  posted_at?: string;
}

export async function fetchJobsFromScraper(): Promise<ScraperJob[]> {
  const headers: Record<string, string> = {};
  if (SCRAPER_KEY) headers["Authorization"] = `Bearer ${SCRAPER_KEY}`;

  const res = await fetch(SCRAPER_URL, { headers });
  if (!res.ok) throw new Error(`Scraper fetch failed: ${res.status}`);
  
  const data = await res.json();
  if (!data.jobs || !Array.isArray(data.jobs)) throw new Error("Invalid scraper response");
  
  return data.jobs as ScraperJob[];
}

export async function syncJobs(): Promise<number> {
  const jobs = await fetchJobsFromScraper();
  let count = 0;

  for (const job of jobs) {
    if (!job.title || !job.company || !job.url) continue;

    await Job.upsert({
      title: job.title,
      company: job.company,
      location: job.location || null,
      url: job.url,
      description: job.description || null,
      posted_at: job.posted_at ? new Date(job.posted_at) : null,
      scraped_at: new Date()
    });

    count++;
  }

  return count;
}
