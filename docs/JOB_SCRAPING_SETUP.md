# Job Scraping Setup Guide

This guide explains how to set up and use the job scraping functionality in JJMapplyx.

## Overview

The job scraping system automatically collects job listings from multiple job boards and stores them in your Supabase database. You can then view, filter, and manage these jobs through the dashboard.

## Features

- **Multiple Job Boards**: Support for Indeed, RemoteOK, We Work Remotely, Glassdoor, and LinkedIn
- **Automated Scraping**: Schedule scraping sessions or trigger them manually
- **Smart Filtering**: Filter jobs by status, source, location, and keywords
- **Status Management**: Track application status for each job
- **Duplicate Detection**: Automatically removes duplicate job listings
- **Real-time Updates**: View scraped jobs in real-time

## Setup

### 1. Database Migration

First, run the database migration to create the necessary tables:

```sql
-- Run the migration file
-- supabase/migrations/003_scraped_jobs.sql
```

### 2. Environment Configuration

Create a `.env.local` file with the following variables:

```env
# Supabase Configuration
VITE_SUPABASE_URL=https://tzvzranspvtifnlgrkwi.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key_here
VITE_SUPABASE_SERVICE_KEY=your_service_key_here

# Job Scraper Configuration (optional)
VITE_JOB_SCRAPER_API_URL=https://your-replit-url/api/jobs
VITE_JOB_SCRAPER_API_KEY=supersecret
```

### 3. Install Dependencies

Make sure you have all the required dependencies installed:

```bash
npm install
```

## Usage

### 1. Accessing Scraped Jobs

1. Navigate to the Dashboard
2. Click on the "Scraped Jobs" tab
3. View all scraped jobs in a grid layout

### 2. Configuring Job Scraping

1. Click "Configure Scraping" button
2. Set your search parameters:
   - **Search Query**: Keywords to search for (e.g., "remote work", "software engineer")
   - **Location**: Location to search in (e.g., "remote", "New York")
   - **Max Jobs per Board**: Maximum number of jobs to scrape from each board
   - **Job Boards**: Select which job boards to scrape from

### 3. Starting a Scraping Session

1. Configure your scraping parameters
2. Click "Start Scraping" button
3. Wait for the scraping to complete
4. View the newly scraped jobs in the list

### 4. Managing Jobs

- **Update Status**: Use the dropdown to change job status (Pending, Applied, Interview, Rejected)
- **View Job**: Click the external link icon to open the job posting
- **Delete Job**: Remove jobs you're not interested in
- **Filter Jobs**: Use the search and filter options to find specific jobs

## Job Board Support

### Currently Supported

- **Indeed**: General job board with wide variety of positions
- **RemoteOK**: Remote-only job board
- **We Work Remotely**: Remote job board focused on tech positions

### Planned Support

- **Glassdoor**: Company reviews and job listings
- **LinkedIn**: Professional network job board

## API Endpoints

### Supabase Edge Functions

- `job-scraper`: Triggers job scraping for specified boards
- `trigger-n8n`: Triggers n8n automation workflows

### Database Tables

- `scraped_jobs`: Stores scraped job listings
- `job_scraping_config`: Stores user scraping preferences
- `automation_logs`: Logs scraping activities

## Configuration Options

### Scraping Frequency

- **Hourly**: Scrape every hour
- **Daily**: Scrape once per day (default: 9 AM)
- **Weekly**: Scrape once per week (default: Monday 9 AM)

### Job Board Settings

Each job board can be enabled/disabled individually. Some boards may require additional setup:

- **Indeed**: May require proxy or captcha solving for large-scale scraping
- **LinkedIn**: Requires authentication and may have rate limits
- **Glassdoor**: May require additional headers or authentication

## Troubleshooting

### Common Issues

1. **No Jobs Found**: Check your search query and location parameters
2. **Scraping Fails**: Verify your internet connection and try again
3. **Duplicate Jobs**: The system automatically removes duplicates based on title and company
4. **Rate Limiting**: Some job boards may limit requests; wait and try again

### Debug Mode

Enable debug mode by setting `VITE_DEBUG_SCRAPING=true` in your environment variables.

## Security Considerations

- Job scraping should be done responsibly and in compliance with each job board's terms of service
- Consider implementing rate limiting to avoid overwhelming job board servers
- Use proper user agents and respect robots.txt files
- Monitor your scraping activity to ensure it's not causing issues

## Performance Tips

1. **Limit Jobs per Board**: Don't scrape too many jobs at once
2. **Use Filters**: Filter jobs by relevant criteria to reduce noise
3. **Regular Cleanup**: Delete old or irrelevant jobs periodically
4. **Monitor Storage**: Keep an eye on database storage usage

## Support

For issues or questions about job scraping:

1. Check the troubleshooting section above
2. Review the automation logs in the dashboard
3. Check the browser console for error messages
4. Verify your Supabase configuration

## Future Enhancements

- **AI-Powered Job Matching**: Use AI to match jobs with your profile
- **Email Notifications**: Get notified when new relevant jobs are found
- **Advanced Filtering**: More sophisticated filtering options
- **Job Board Analytics**: Track which boards provide the best results
- **Automated Applications**: Automatically apply to jobs that match your criteria
