// Environment configuration for job scraping
export const config = {
  // Supabase Configuration
  supabase: {
    url: import.meta.env.VITE_SUPABASE_URL || 'https://tzvzranspvtifnlgrkwi.supabase.co',
    anonKey: import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR6dnpyYW5zcHZ0aWZubGdya3dpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMyOTkxODcsImV4cCI6MjA2ODg3NTE4N30.oMG8VGPew29xAoaKPal0rsSs8aVmvyjXsyErC45jcfg',
    serviceKey: import.meta.env.VITE_SUPABASE_SERVICE_KEY || ''
  },

  // Job Scraper Configuration
  jobScraper: {
    apiUrl: import.meta.env.VITE_JOB_SCRAPER_API_URL || 'https://your-replit-url/api/jobs',
    apiKey: import.meta.env.VITE_JOB_SCRAPER_API_KEY || 'supersecret',
    defaultMaxJobs: 50,
    defaultSearchQuery: 'remote work',
    defaultLocation: 'remote'
  },

  // Available Job Boards
  jobBoards: [
    { key: 'indeed', name: 'Indeed', enabled: true },
    { key: 'remoteok', name: 'RemoteOK', enabled: true },
    { key: 'weworkremotely', name: 'We Work Remotely', enabled: true },
    { key: 'glassdoor', name: 'Glassdoor', enabled: false },
    { key: 'linkedin', name: 'LinkedIn', enabled: false }
  ],

  // Scraping Configuration
  scraping: {
    frequency: {
      hourly: '0 * * * *', // Every hour
      daily: '0 9 * * *',  // Every day at 9 AM
      weekly: '0 9 * * 1'  // Every Monday at 9 AM
    },
    maxJobsPerBoard: 50,
    maxTotalJobs: 200,
    timeout: 30000, // 30 seconds
    retryAttempts: 3
  },

  // UI Configuration
  ui: {
    itemsPerPage: 20,
    refreshInterval: 30000, // 30 seconds
    showPreview: true,
    enableFilters: true
  }
};

export default config;
