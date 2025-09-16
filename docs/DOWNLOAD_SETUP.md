# Download Setup Guide

## Overview
This guide explains how to download scraped jobs data from your JJMapplyx dashboard.

## Download Locations

### 1. Scraped Jobs Tab
- Navigate to the "Scraped Jobs" tab in your dashboard
- Click the green "Download JSON" or blue "Download CSV" buttons
- Files will be downloaded with timestamp in filename

### 2. Export/Import Tab
- Navigate to the "Export/Import" tab in your dashboard
- Scroll to the "Download Scraped Jobs" section
- Click the download buttons for your preferred format

## File Formats

### JSON Format
- Contains complete job data with metadata
- Includes scraping timestamp, search parameters, and job board sources
- Best for data analysis and integration with other tools

### CSV Format
- Spreadsheet-compatible format
- Includes: Title, Company, URL, Source, Pay Range, Type, Status, Date Found, Notes
- Best for viewing in Excel or Google Sheets

## GitHub Actions Artifacts

After running the job scraping workflow, you can also download the raw JSON files from GitHub Actions:

1. Go to your GitHub repository
2. Click on "Actions" tab
3. Find the latest "Daily Job Scraper" workflow run
4. Click on the workflow run
5. Scroll down to "Artifacts" section
6. Download:
   - `scraped-jobs-json` - Complete scraped jobs with metadata
   - `all-jobs` - Combined jobs from all scrapers
   - `scraped-jobs` - Basic jobs data

## API Endpoint

You can also access the download API directly:

```
GET /functions/v1/download-jobs?format=json&limit=1000
GET /functions/v1/download-jobs?format=csv&limit=1000
```

**Headers Required:**
- `Authorization: Bearer <your-session-token>`
- `Content-Type: application/json`

## Troubleshooting

### No Jobs Found
- Ensure you have run the job scraper at least once
- Check that jobs exist in your database
- Verify you're logged in with the correct account

### Download Fails
- Check your internet connection
- Ensure you're logged in to the dashboard
- Try refreshing the page and logging in again
- Check browser console for error messages

### File Not Downloading
- Check if your browser is blocking downloads
- Ensure popup blockers are disabled for this site
- Try using a different browser
- Check if you have sufficient disk space
