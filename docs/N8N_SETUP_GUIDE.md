# n8n Integration Setup Guide for JJMapplyx

This guide will help you set up n8n automation workflows to power your job application automation.

## 1. n8n Installation & Setup

### Option A: Cloud (Recommended)
1. Sign up at [n8n.cloud](https://n8n.cloud)
2. Create a new workflow
3. Copy your webhook URL

### Option B: Self-hosted
1. Install n8n: `npm install -g n8n`
2. Run: `n8n start`
3. Access at `http://localhost:5678`

## 2. Dashboard Configuration

1. In JJMapplyx dashboard, go to Control Panel
2. Enter your n8n webhook URL in "n8n Webhook URL" field
3. Save settings

## 3. Required n8n Workflows

### Workflow 1: Job Scraping
**Purpose**: Automatically scrape job sites and send new jobs to JJMapplyx

**Nodes needed**:
1. **Webhook Trigger** - Receives scraping requests from dashboard
2. **HTTP Request** - Scrape job sites (RemoteOK, Indeed, etc.)
3. **Code** - Parse and filter job data
4. **HTTP Request** - Send jobs back to JJMapplyx via webhook

**Webhook URL**: `https://your-supabase-project.supabase.co/functions/v1/n8n-webhook`

**Example payload to send back**:
```json
{
  "action": "job-found",
  "data": {
    "title": "Software Engineer",
    "company": "TechCorp",
    "url": "https://company.com/jobs/123",
    "payRange": "$80k-$120k",
    "type": "Full-time",
    "contactEmail": "hr@company.com",
    "resumeRequired": true,
    "notes": "Found via n8n automation"
  }
}
```

### Workflow 2: Job Application
**Purpose**: Automatically fill and submit job applications

**Nodes needed**:
1. **Webhook Trigger** - Receives apply requests from dashboard
2. **Browser Automation** (Playwright/Puppeteer) - Navigate to job site
3. **Code** - Fill application forms with user data
4. **HTTP Request** - Submit application
5. **HTTP Request** - Update JJMapplyx with status

**Status update payload**:
```json
{
  "action": "application-submitted",
  "data": {
    "jobId": "uuid-here",
    "userId": "user-uuid",
    "notes": "Applied successfully via n8n"
  }
}
```

### Workflow 3: Email Monitoring
**Purpose**: Monitor emails for interview requests and responses

**Nodes needed**:
1. **Schedule Trigger** - Run every 15 minutes
2. **Gmail/Email** - Fetch new emails
3. **Code** - Parse emails for interview keywords
4. **HTTP Request** - Update job status in JJMapplyx

**Interview detection payload**:
```json
{
  "action": "interview-detected",
  "data": {
    "jobId": "uuid-here",
    "company": "TechCorp",
    "interviewType": "phone",
    "scheduledDate": "2024-01-15T10:00:00Z"
  }
}
```

## 4. Webhook Endpoints

JJMapplyx provides these webhook endpoints for n8n integration:

### Receive from n8n: `/functions/v1/n8n-webhook`
- Receives job data, application status, interview notifications
- Automatically updates database and logs

### Send to n8n: `/functions/v1/trigger-n8n`
- Triggers n8n workflows from dashboard
- Sends job data and user settings

## 5. Data Flow

```
1. User clicks "Auto Apply" → JJMapplyx calls trigger-n8n
2. n8n receives webhook → Scrapes job details
3. n8n applies to job → Updates application status
4. n8n monitors emails → Detects interview requests
5. All updates sent back → JJMapplyx via n8n-webhook
```

## 6. Security & API Keys

Store sensitive data in n8n environment variables:
- Email credentials
- Browser automation tokens
- API keys for job sites

## 7. Testing

1. Test webhook connectivity in n8n
2. Use dashboard "Start Job Scraping" button
3. Check automation logs for errors
4. Verify job data appears in dashboard

## 8. Monitoring

- Check automation logs in dashboard
- Monitor n8n execution history
- Set up alerts for failed workflows

## Example n8n Workflow Templates

See the `/n8n-templates/` folder for:
- `job-scraper.json` - Complete job scraping workflow
- `auto-apply.json` - Browser automation for applications
- `email-monitor.json` - Interview detection system

## Support

For issues with n8n integration:
1. Check webhook URLs are correct
2. Verify n8n workflows are active
3. Review automation logs in dashboard
4. Test individual n8n nodes