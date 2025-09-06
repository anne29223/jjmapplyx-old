# JJMapplyx GitHub Actions Scripts

This directory contains the automation scripts that run in GitHub Actions workflows for job application automation.

## Scripts Overview

### Core Automation Scripts

- **`scrape-jobs.js`** - Scrapes job boards for hourly work opportunities
- **`auto-apply.js`** - Automatically applies to jobs that don't require resumes
- **`monitor-emails.js`** - Monitors Gmail for interview requests and responses
- **`process-email-responses.js`** - Processes and categorizes email responses

### Statistics Scripts

- **`update-stats.js`** - Updates job statistics in the database
- **`update-application-stats.js`** - Updates application statistics

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Set up environment variables:
   ```bash
   export SUPABASE_URL="your_supabase_url"
   export SUPABASE_ANON_KEY="your_supabase_anon_key"
   export USER_ID="your_user_id"
   ```

3. For email monitoring, also set:
   ```bash
   export GMAIL_CLIENT_ID="your_gmail_client_id"
   export GMAIL_CLIENT_SECRET="your_gmail_client_secret"
   export GMAIL_REFRESH_TOKEN="your_gmail_refresh_token"
   ```

## Usage

### Job Scraping
```bash
npm run scrape-jobs
```

### Auto Apply
```bash
npm run auto-apply
```

### Email Monitoring
```bash
npm run monitor-emails
```

### Process Email Responses
```bash
npm run process-emails
```

### Update Statistics
```bash
npm run update-stats
npm run update-app-stats
```

## Configuration

The scripts use environment variables for configuration:

- `SUPABASE_URL` - Your Supabase project URL
- `SUPABASE_ANON_KEY` - Your Supabase anonymous key
- `USER_ID` - The user ID for the automation
- `SEARCH_QUERY` - Job search query (default: "hourly work")
- `LOCATION` - Job location (default: "remote")
- `JOB_BOARDS` - Comma-separated list of job boards to scrape
- `MAX_APPLICATIONS` - Maximum number of applications to submit
- `EMAIL_PROVIDER` - Email provider (default: "gmail")

## Job Boards Supported

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

## Database Schema

The scripts interact with these Supabase tables:

- `jobs` - Stores job listings
- `automation_logs` - Logs automation activities
- `automation_stats` - Stores automation statistics
- `application_stats` - Stores application statistics
- `email_responses` - Stores email monitoring data
- `user_settings` - Stores user configuration

## Error Handling

All scripts include comprehensive error handling and logging:

- Database errors are logged to `automation_logs`
- Failed job applications are marked with appropriate status
- Email processing errors are logged with details
- Statistics updates include error recovery

## Security

- All sensitive data is passed via environment variables
- GitHub Secrets are used for production deployments
- Database connections use secure authentication
- Email API credentials are encrypted

## Monitoring

Check the GitHub Actions logs for detailed execution information:

1. Go to your repository on GitHub
2. Click "Actions" tab
3. Select the workflow run
4. Click on individual job steps to see logs

## Troubleshooting

### Common Issues

1. **Database Connection Errors**
   - Verify Supabase credentials
   - Check network connectivity
   - Ensure database tables exist

2. **Job Scraping Failures**
   - Check job board URLs
   - Verify scraping patterns
   - Monitor rate limiting

3. **Auto-Apply Issues**
   - Verify Playwright installation
   - Check job page structure
   - Monitor browser automation logs

4. **Email Monitoring Problems**
   - Verify Gmail API credentials
   - Check OAuth token validity
   - Monitor API rate limits

### Debug Mode

Set `DEBUG=true` environment variable for verbose logging:

```bash
export DEBUG=true
npm run scrape-jobs
```

## Contributing

When modifying these scripts:

1. Test locally with sample data
2. Update error handling as needed
3. Add logging for new functionality
4. Update documentation
5. Test in GitHub Actions environment

## License

MIT License - see LICENSE file for details
