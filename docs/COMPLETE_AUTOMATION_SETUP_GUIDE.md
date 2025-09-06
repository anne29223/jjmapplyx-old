# JJMapplyx Complete Automation Setup Guide

## 🚀 Overview

JJMapplyx is a powerful job application automation platform that integrates with n8n workflows to automatically find, apply to, and track job applications. This guide will walk you through the complete setup process.

**Tagline**: "Land Jobs. No Interviews. All Auto."
**Supporting**: Remote • Hourly • Temp • No-Interview

---

## 📋 Prerequisites

Before starting, ensure you have:
- ✅ JJMapplyx account and dashboard access
- ✅ n8n instance (cloud or self-hosted)
- ✅ Email account for job applications
- ✅ Resume(s) ready for upload
- ✅ Target job sites identified (Indeed, LinkedIn, etc.)

---

## 🏗️ Part 1: Platform Setup

### 1.1 Account Setup
1. Access your JJMapplyx dashboard
2. Complete your profile information
3. Upload your contact details (email, phone)

### 1.2 Resume Management
1. Navigate to **Control Panel** → **Resume Manager**
2. Upload your primary resume
3. Create specialized versions for different job types:
   - Tech Resume (for technical roles)
   - General Resume (for general positions)
   - Remote Resume (for remote-specific applications)

### 1.3 Contact Settings
1. Go to **Control Panel** → **Contact Settings**
2. Enter your primary email for applications
3. Add phone number for recruiter contact
4. Verify email accessibility for response monitoring

---

## 🔧 Part 2: n8n Installation & Configuration

### Option A: n8n Cloud (Recommended)
1. Sign up at [n8n.cloud](https://n8n.cloud)
2. Create a new workspace
3. Import the provided workflow templates
4. Note your webhook URLs for each workflow

### Option B: Self-Hosted n8n
1. Install n8n: `npm install -g n8n`
2. Start n8n: `n8n start`
3. Access at `http://localhost:5678`
4. Configure authentication and security

### 2.1 Import Workflow Templates
Import these workflows from the `n8n-templates/` folder:

1. **Job Scraping Workflow** (`job-scraping-workflow.json`)
   - Scrapes job sites automatically
   - Filters based on your criteria
   - Sends new jobs to JJMapplyx

2. **Auto Apply Workflow** (`auto-apply-workflow.json`)
   - Analyzes job application pages
   - Automatically fills and submits applications
   - Updates status in JJMapplyx

3. **Email Monitoring Workflow** (`email-monitoring-workflow.json`)
   - Monitors inbox for interview requests
   - Detects application responses
   - Updates job status automatically

4. **Complete Automation Workflow** (`complete-job-automation-workflow.json`)
   - Full end-to-end automation
   - Combines all workflows
   - Handles errors and retries

---

## 🔗 Part 3: Webhook Integration

### 3.1 Configure JJMapplyx Webhooks
1. In your dashboard, go to **Control Panel**
2. Set these webhook URLs:

**n8n Webhook URL**: `https://your-n8n-instance.com/webhook/YOUR_WORKFLOW_ID`
- This is where JJMapplyx sends triggers to n8n

**JJMapplyx Receiver URL**: `https://tzvzranspvtifnlgrkwi.supabase.co/functions/v1/n8n-webhook`
- This is where n8n sends results back to JJMapplyx

### 3.2 Test Webhook Connectivity
1. Use the **Test Webhook** feature in Control Panel
2. Test each workflow individually:
   - Job Scraping Test
   - Auto Apply Test
   - Email Monitor Test
3. Verify successful connections in automation logs

---

## ⚙️ Part 4: Job Site Configuration

### 4.1 Configure Target Sites
1. Navigate to **Site Config** tab
2. Configure search parameters:
   - **Keywords**: "software engineer", "remote developer", "frontend"
   - **Locations**: "Remote", "San Francisco", "New York"
   - **Experience Level**: Entry, Mid, Senior
   - **Job Types**: Full-time, Part-time, Contract

### 4.2 Site-Specific Settings
Configure for each job site:

**Indeed**:
- Search terms: Your target roles
- Location radius: 25 miles or "Remote"
- Salary range: Your minimum requirements

**LinkedIn**:
- Job function filters
- Industry preferences
- Company size preferences

**RemoteOK**:
- Tech stack preferences
- Timezone requirements
- Company type (startup, enterprise)

---

## 🤖 Part 5: Automation Configuration

### 5.1 AI Agent Settings
1. Enable **Auto Apply** mode
2. Set **Runs Per Day**: Start with 5-10
3. Configure **Application Filters**:
   - Minimum salary requirements
   - Required keywords in job description
   - Excluded keywords (avoid certain roles)
   - Company blacklist

### 5.2 Application Preferences
Configure what types of applications to automate:
- ✅ One-click applications
- ✅ Simple form applications
- ❌ Applications requiring cover letters
- ❌ Applications with complex assessments

---

## 📧 Part 6: Email Integration

### 6.1 Email Monitoring Setup
1. Connect your primary job search email
2. Configure IMAP settings in n8n Email node:
   - **Host**: `imap.gmail.com` (for Gmail)
   - **Port**: 993
   - **Security**: SSL/TLS
   - **Authentication**: OAuth2 (recommended)

### 6.2 Email Filters
Set up automatic detection for:
- Interview invitations
- Application confirmations
- Rejection notifications
- Follow-up requests

---

## 📊 Part 7: Analytics & Monitoring

### 7.1 Dashboard Monitoring
Monitor your automation through:
- **Analytics Tab**: Track application success rates
- **Automation Logs**: View detailed activity logs
- **Stats Cards**: Quick overview of performance

### 7.2 Key Metrics to Watch
- **Applications per day**: Target 5-15 daily
- **Success rate**: Aim for >80% successful submissions
- **Response rate**: Track interview requests
- **Error rate**: Keep below 10%

---

## 🛠️ Part 8: Troubleshooting

### 8.1 Common Issues

**"Web server down" Error**:
- Check n8n instance is running
- Verify webhook URL is correct
- Test URL directly in browser

**Applications Not Submitting**:
- Check job site compatibility
- Verify form field mapping
- Review automation logs for errors

**Email Monitoring Not Working**:
- Verify IMAP credentials
- Check email permissions
- Test email node separately

### 8.2 Testing Workflows
1. **Test Individual Workflows**:
   - Use n8n's manual execution
   - Check each node's output
   - Verify data flow

2. **Test End-to-End**:
   - Start with test job posting
   - Monitor full automation cycle
   - Verify updates in dashboard

---

## 🚀 Part 9: Launch & Optimization

### 9.1 Gradual Rollout
1. **Week 1**: Test with 2-3 applications daily
2. **Week 2**: Increase to 5-7 daily
3. **Week 3+**: Scale to optimal volume (10-15 daily)

### 9.2 Optimization Tips
- **Monitor success rates** and adjust filters
- **Refine keywords** based on results
- **Update resume** for better match rates
- **Adjust timing** for peak job posting hours

### 9.3 Advanced Features
Once comfortable with basic automation:
- Set up **multiple resume targeting**
- Configure **industry-specific workflows**
- Enable **smart scheduling** for peak times
- Add **custom notification channels**

---

## 📈 Part 10: Scaling Your Automation

### 10.1 Advanced Workflows
Create specialized workflows for:
- **High-priority companies**
- **Specific job types** (remote, contract, etc.)
- **Geographic targeting**
- **Salary-based filtering**

### 10.2 Multi-Platform Strategy
Expand beyond basic job sites:
- Company career pages
- Industry-specific job boards
- Networking platform automation
- Social media job alerts

---

## 🔒 Security & Best Practices

### Security Guidelines
- ✅ Use OAuth2 for email connections
- ✅ Store API keys securely in n8n
- ✅ Regular webhook URL rotation
- ✅ Monitor for suspicious activity

### Best Practices
- ✅ Regular resume updates
- ✅ Personalize applications when possible
- ✅ Monitor application quality
- ✅ Maintain professional online presence

---

## 📞 Support & Resources

### Getting Help
1. **Dashboard Logs**: First check automation logs
2. **Test Webhooks**: Use built-in testing tools
3. **n8n Community**: Access n8n documentation and forums
4. **Workflow Templates**: Use provided JSON templates

### Useful Links
- n8n Documentation: [docs.n8n.io](https://docs.n8n.io)
- Webhook Testing: Built into JJMapplyx dashboard
- Template Library: `/n8n-templates/` folder

---

## 🎯 Success Metrics

### Target KPIs
- **Daily Applications**: 10-15 successful submissions
- **Success Rate**: >85% completion rate
- **Interview Rate**: 2-5% of applications
- **Error Rate**: <5% failed submissions

### Weekly Review Checklist
- [ ] Review application success rates
- [ ] Check for new error patterns
- [ ] Update job search keywords
- [ ] Analyze interview feedback
- [ ] Optimize targeting criteria

---

**🎉 Congratulations!** You've successfully set up JJMapplyx automation. Your job search is now running on autopilot!

**Remember**: "Land Jobs. No Interviews. All Auto." 💼🚀📬

---

*This guide covers the complete setup process. For specific technical issues, refer to the automation logs in your dashboard or test individual webhook connections.*