const fetch = require("node-fetch");
const Job = require("../models/Job");

const SCRAPER_URL = process.env.JOB_SCRAPER_API_URL;
const SCRAPER_KEY = process.env.JOB_SCRAPER_API_KEY;

async function fetchJobsFromScraper() {
  const headers = {};
  if (SCRAPER_KEY) headers["Authorization"] = `Bearer ${SCRAPER_KEY}`;

  const res = await fetch(SCRAPER_URL, { headers });
  if (!res.ok) throw new Error(`Scraper fetch failed: ${res.status}`);
  
  const { jobs } = await res.json();
  return jobs;
}

async function syncJobs() {
  const jobs = await fetchJobsFromScraper();
  let count = 0;

  for (const job of jobs) {
    if (!job.title || !job.company || !job.url) continue;

    await Job.findOneAndUpdate(
      { url: job.url },
      { ...job, scraped_at: new Date() },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
    count++;
  }

  return count;
}

module.exports = { fetchJobsFromScraper, syncJobs };
