# GitHub Actions Setup Guide for JJMapplyx

This guide will help you set up GitHub Actions automation workflows to power your job application automation system.

## Overview

JJMapplyx now uses GitHub Actions for reliable, scalable job automation. The system includes three main workflows:

1. **Job Scraping** - Automatically scrapes job boards for hourly work opportunities
2. **Auto Apply** - Automatically applies to jobs that don't require resumes
3. **Email Monitoring** - Monitors emails for interview requests and responses

## Prerequisites

- GitHub account
- GitHub repository for your automation workflows
- Supabase project with JJMapplyx database
- Gmail account (for email monitoring)

## Step 1: Create GitHub Repository

1. Create a new repository on GitHub (e.g., `your-username/jjmapplyx-automation`)
2. Clone the repository locally
3. Copy the workflow files from this project to your repository

## Step 2: Set Up Repository Secrets

In your GitHub repository, go to Settings > Secrets and variables > Actions, and add these secrets:

### Required Secrets

```
SUPABASE_URL=your_supabase_project_url
SUPABASE_ANON_KEY=your_supabase_anon_key
```

### Optional Secrets (for email monitoring)

```
GMAIL_CLIENT_ID=your_gmail_client_id
GMAIL_CLIENT_SECRET=your_gmail_client_secret
GMAIL_REFRESH_TOKEN=your_gmail_refresh_token
```

## Step 3: Configure GitHub Personal Access Token

1. Go to GitHub Settings > Developer settings > Personal access tokens > Tokens (classic)
2. Click "Generate new token (classic)"
3. Give it a descriptive name like "JJMapplyx Automation"
4. Select the following scopes:
   - `repo` (Full control of private repositories)
   - `workflow` (Update GitHub Action workflows)
5. Copy the generated token

## Step 4: Configure JJMapplyx Dashboard

1. Open your JJMapplyx dashboard
2. Go to the Control Panel
3. In the "GitHub Actions Automation" section:
   - Enter your GitHub Personal Access Token
   - Enter your repository in the format `owner/repo` (e.g., `username/jjmapplyx-automation`)
4. Save your settings

## Step 5: Deploy Workflow Files

Copy these files to your GitHub repository:

### `.github/workflows/job-scraping.yml`
```yaml
name: Job Scraping Workflow

on:
  workflow_dispatch:
    inputs:
      user_id:
        description: 'User ID for the automation'
        required: true
        type: string
      search_query:
        description: 'Job search query'
        required: false
        type: string
        default: 'hourly work'
      location:
        description: 'Job location'
        required: false
        type: string
        default: 'remote'
      job_boards:
        description: 'Comma-separated list of job boards to scrape'
        required: false
        type: string
        default: 'snagajob,indeedflex,ziprecruiter,instawork,veryable,bluecrew'
  schedule:
    # Run every 6 hours
    - cron: '0 */6 * * *'

jobs:
  scrape-jobs:
    runs-on: ubuntu-latest
    
    steps:
    - name: Checkout code
      uses: actions/checkout@v4
      
    - name: Setup Node.js
      uses: actions/setup-node@v4
      with:
        node-version: '18'
        cache: 'npm'
        
    - name: Install dependencies
      run: npm install
      
    - name: Scrape Job Boards
      env:
        SUPABASE_URL: ${{ secrets.SUPABASE_URL }}
        SUPABASE_ANON_KEY: ${{ secrets.SUPABASE_ANON_KEY }}
        USER_ID: ${{ github.event.inputs.user_id || 'default-user' }}
        SEARCH_QUERY: ${{ github.event.inputs.search_query || 'hourly work' }}
        LOCATION: ${{ github.event.inputs.location || 'remote' }}
        JOB_BOARDS: ${{ github.event.inputs.job_boards || 'snagajob,indeedflex,ziprecruiter,instawork,veryable,bluecrew' }}
      run: |
        node scripts/github-actions/scrape-jobs.js
        
    - name: Update Job Statistics
      env:
        SUPABASE_URL: ${{ secrets.SUPABASE_URL }}
        SUPABASE_ANON_KEY: ${{ secrets.SUPABASE_ANON_KEY }}
        USER_ID: ${{ github.event.inputs.user_id || 'default-user' }}
      run: |
        node scripts/github-actions/update-stats.js
```

### `.github/workflows/auto-apply.yml`
```yaml
name: Auto Apply Workflow

on:
  workflow_dispatch:
    inputs:
      user_id:
        description: 'User ID for the automation'
        required: true
        type: string
      job_id:
        description: 'Specific job ID to apply to (optional)'
        required: false
        type: string
      max_applications:
        description: 'Maximum number of applications to submit'
        required: false
        type: string
        default: '10'
  schedule:
    # Run every 4 hours
    - cron: '0 */4 * * *'

jobs:
  auto-apply:
    runs-on: ubuntu-latest
    
    steps:
    - name: Checkout code
      uses: actions/checkout@v4
      
    - name: Setup Node.js
      uses: actions/setup-node@v4
      with:
        node-version: '18'
        cache: 'npm'
        
    - name: Install dependencies
      run: npm install
      
    - name: Setup Playwright
      run: npx playwright install chromium
      
    - name: Auto Apply to Jobs
      env:
        SUPABASE_URL: ${{ secrets.SUPABASE_URL }}
        SUPABASE_ANON_KEY: ${{ secrets.SUPABASE_ANON_KEY }}
        USER_ID: ${{ github.event.inputs.user_id || 'default-user' }}
        JOB_ID: ${{ github.event.inputs.job_id || '' }}
        MAX_APPLICATIONS: ${{ github.event.inputs.max_applications || '10' }}
      run: |
        node scripts/github-actions/auto-apply.js
        
    - name: Update Application Statistics
      env:
        SUPABASE_URL: ${{ secrets.SUPABASE_URL }}
        SUPABASE_ANON_KEY: ${{ secrets.SUPABASE_ANON_KEY }}
        USER_ID: ${{ github.event.inputs.user_id || 'default-user' }}
      run: |
        node scripts/github-actions/update-application-stats.js
```

### `.github/workflows/email-monitoring.yml`
```yaml
name: Email Monitoring Workflow

on:
  workflow_dispatch:
    inputs:
      user_id:
        description: 'User ID for the automation'
        required: true
        type: string
      email_provider:
        description: 'Email provider (gmail, outlook, etc.)'
        required: false
        type: string
        default: 'gmail'
  schedule:
    # Run every 2 hours
    - cron: '0 */2 * * *'

jobs:
  monitor-emails:
    runs-on: ubuntu-latest
    
    steps:
    - name: Checkout code
      uses: actions/checkout@v4
      
    - name: Setup Node.js
      uses: actions/setup-node@v4
      with:
        node-version: '18'
        cache: 'npm'
        
    - name: Install dependencies
      run: npm install
      
    - name: Monitor Emails
      env:
        SUPABASE_URL: ${{ secrets.SUPABASE_URL }}
        SUPABASE_ANON_KEY: ${{ secrets.SUPABASE_ANON_KEY }}
        USER_ID: ${{ github.event.inputs.user_id || 'default-user' }}
        EMAIL_PROVIDER: ${{ github.event.inputs.email_provider || 'gmail' }}
        GMAIL_CLIENT_ID: ${{ secrets.GMAIL_CLIENT_ID }}
        GMAIL_CLIENT_SECRET: ${{ secrets.GMAIL_CLIENT_SECRET }}
        GMAIL_REFRESH_TOKEN: ${{ secrets.GMAIL_REFRESH_TOKEN }}
      run: |
        node scripts/github-actions/monitor-emails.js
        
    - name: Process Email Responses
      env:
        SUPABASE_URL: ${{ secrets.SUPABASE_URL }}
        SUPABASE_ANON_KEY: ${{ secrets.SUPABASE_ANON_KEY }}
        USER_ID: ${{ github.event.inputs.user_id || 'default-user' }}
      run: |
        node scripts/github-actions/process-email-responses.js
```

## Step 6: Add Automation Scripts

Create a `scripts/github-actions/` directory in your repository and add the automation scripts:

- `scrape-jobs.js` - Scrapes job boards for opportunities
- `auto-apply.js` - Automatically applies to jobs
- `monitor-emails.js` - Monitors emails for responses
- `process-email-responses.js` - Processes email responses
- `update-stats.js` - Updates job statistics
- `update-application-stats.js` - Updates application statistics

## Step 7: Add Package.json

Create a `package.json` file in your repository root:

```json
{
  "name": "jjmapplyx-automation",
  "version": "1.0.0",
  "description": "GitHub Actions automation for JJMapplyx",
  "main": "index.js",
  "scripts": {
    "test": "echo \"Error: no test specified\" && exit 1"
  },
  "dependencies": {
    "@supabase/supabase-js": "^2.52.1",
    "node-fetch": "^3.3.2",
    "playwright": "^1.40.0",
    "googleapis": "^128.0.0"
  },
  "keywords": ["automation", "jobs", "github-actions"],
  "author": "Your Name",
  "license": "MIT"
}
```

## Step 8: Test Your Setup

1. Go to your GitHub repository
2. Click on "Actions" tab
3. You should see your three workflows listed
4. Click on "job-scraping" workflow
5. Click "Run workflow" button
6. Enter your user ID and click "Run workflow"

## Step 9: Configure Dashboard

1. Open your JJMapplyx dashboard
2. Go to Control Panel
3. Enter your GitHub token and repository
4. Click "Start Job Scraping" to test the integration

## Supported Job Boards

The automation currently supports these job boards:

### Hourly Work
- Snagajob
- Indeed Flex
- ZipRecruiter

### Shift Work
- Instawork
- Veryable
- BlueCrew
- JobStack

### Gig Work
- SwipeJobs
- Fiverr
- Upwork

## Workflow Schedules

- **Job Scraping**: Runs every 6 hours
- **Auto Apply**: Runs every 4 hours
- **Email Monitoring**: Runs every 2 hours

You can modify these schedules by editing the cron expressions in the workflow files.

## Troubleshooting

### Common Issues

1. **Workflow not triggering**: Check that your GitHub token has the correct permissions
2. **Jobs not being scraped**: Verify your Supabase credentials are correct
3. **Auto-apply failing**: Check that Playwright is properly installed
4. **Email monitoring not working**: Verify your Gmail API credentials

### Debugging

1. Check the GitHub Actions logs for detailed error messages
2. Verify all secrets are properly set
3. Test individual scripts locally before running in GitHub Actions
4. Check Supabase logs for database errors

## Security Notes

- Never commit your GitHub token or Supabase credentials to your repository
- Use GitHub Secrets for all sensitive information
- Regularly rotate your GitHub Personal Access Token
- Monitor your GitHub Actions usage to avoid hitting rate limits

## Support

For additional help:
1. Check the GitHub Actions documentation
2. Review the Supabase documentation
3. Check the JJMapplyx dashboard logs
4. Contact support if issues persist

## Migration from n8n

If you're migrating from n8n to GitHub Actions:

1. Export your n8n workflows
2. Set up the GitHub Actions workflows as described above
3. Update your dashboard settings to use GitHub Actions
4. Test the new workflows thoroughly
5. Disable your old n8n workflows once everything is working

The GitHub Actions approach provides better reliability, scalability, and cost-effectiveness compared to external automation services.
