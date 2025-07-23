# JJMapplyx Dashboard

An AI-powered job application automation dashboard built with React, TypeScript, and modern UI components.

## ✨ Features

### 🤖 AI-Powered Automation
- **Auto-Apply**: Automatically apply to jobs based on your criteria
- **Job Scraping**: Scrape multiple job sites simultaneously with n8n workflows
- **Email Monitoring**: Detect interview requests and application responses
- **Smart Filtering**: Filter jobs by keywords, location, and requirements

### 📊 Analytics & Insights
- **Performance Metrics**: Track application success rates and response times
- **Visual Charts**: Weekly application trends and status distribution
- **Automation Stats**: Monitor webhook triggers and workflow executions
- **Real-time Logs**: View detailed automation activity logs

### ⚙️ Configuration & Management
- **Job Site Config**: Customize which job sites to scrape and monitor
- **Resume Manager**: Upload and manage resumes for different job types
- **Webhook Testing**: Test n8n connectivity and workflow triggers
- **Export/Import**: Backup and restore your job data and settings

### 🔗 n8n Integration
- **Workflow Templates**: Pre-built n8n workflows for job scraping, auto-apply, and email monitoring
- **Real-time Webhooks**: Bidirectional communication with n8n workflows
- **Status Updates**: Live job application status updates from automation workflows
- **Error Handling**: Comprehensive error handling and retry mechanisms

## 🚀 Quick Start

### Prerequisites
- Node.js 16+ and npm installed
- Supabase project connected via Lovable integration
- n8n instance (cloud or self-hosted)

### Setup Steps
1. **Clone and Install**
   ```bash
   git clone <YOUR_GIT_URL>
   cd <YOUR_PROJECT_NAME>
   npm install
   npm run dev
   ```

2. **Configure Supabase**
   - Connect your Supabase project via the Lovable integration
   - Database tables will be automatically created

3. **Setup n8n Workflows**
   - Import workflows from `/n8n-templates/` folder
   - Configure webhook URLs in dashboard settings
   - Test connectivity using the webhook testing feature

## 📁 Project Structure

```
src/
├── components/
│   ├── dashboard/
│   │   ├── StatsCards.tsx      # Performance metrics display
│   │   ├── ControlPanel.tsx    # Automation controls
│   │   ├── AutomationLogs.tsx  # Activity logs
│   │   ├── JobCard.tsx         # Individual job displays
│   │   ├── Analytics.tsx       # Charts and insights
│   │   ├── TestWebhook.tsx     # n8n connectivity testing
│   │   ├── JobSiteConfig.tsx   # Site configuration
│   │   ├── ResumeManager.tsx   # Resume upload/management
│   │   └── ExportImport.tsx    # Data backup/restore
│   └── ui/                     # Reusable UI components
├── hooks/
│   ├── useSupabase.ts         # Database operations
│   └── use-toast.ts           # Toast notifications
├── pages/
│   └── Dashboard.tsx          # Main dashboard page
└── lib/
    └── utils.ts               # Utility functions

supabase/
├── functions/
│   ├── n8n-webhook/           # Receives data from n8n
│   └── trigger-n8n/           # Triggers n8n workflows
└── migrations/
    └── 001_initial_schema.sql # Database schema

n8n-templates/
├── job-scraping-workflow.json
├── auto-apply-workflow.json
└── email-monitoring-workflow.json
```

## 🔧 Configuration

### Environment Variables
Set these in your Supabase project secrets:
- `VITE_SUPABASE_URL`: Your Supabase project URL
- `VITE_SUPABASE_ANON_KEY`: Your Supabase anonymous key

### n8n Webhook URLs
Configure in the dashboard Control Panel:
- Job Scraping webhook
- Auto Apply webhook  
- Email Monitoring webhook

## 📊 Database Schema

The application uses these Supabase tables:
- `jobs`: Job listings and application status
- `automation_logs`: Activity and error logs
- `user_settings`: User preferences and configuration
- `automation_stats`: Performance metrics and analytics

## 🛠️ Technologies Used

- **Frontend**: React 18, TypeScript, Tailwind CSS
- **UI Components**: shadcn/ui with Radix UI primitives
- **State Management**: TanStack Query for server state
- **Backend**: Supabase (Database, Auth, Edge Functions)
- **Automation**: n8n workflows with webhook integration
- **Charts**: Recharts for analytics visualization
- **Deployment**: Lovable platform

## 📖 Documentation

- [n8n Setup Guide](./docs/N8N_SETUP_GUIDE.md) - Complete n8n integration setup
- [API Documentation](./docs/API.md) - Webhook and database API reference
- [Deployment Guide](./docs/DEPLOY.md) - Production deployment instructions

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

- Check the [troubleshooting guide](./docs/TROUBLESHOOTING.md)
- Review automation logs in the dashboard
- Test n8n webhooks using the built-in testing tools
- Report issues on GitHub

---

Built with ❤️ using [Lovable](https://lovable.dev)