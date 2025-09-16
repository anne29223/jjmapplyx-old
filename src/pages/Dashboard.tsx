
import { useState } from "react";
import { StatsCards } from "@/components/dashboard/StatsCards";
import { JobCard } from "@/components/dashboard/JobCard";
import { ControlPanel } from "@/components/dashboard/ControlPanel";
import { SiteViewer } from "@/components/dashboard/SiteViewer";
import { AutomationLogs } from "@/components/dashboard/AutomationLogs";
import { TestWebhook } from "@/components/dashboard/TestWebhook";
import { JobSiteConfig } from "@/components/dashboard/JobSiteConfig";
import { Analytics } from "@/components/dashboard/Analytics";
import { ExportImport } from "@/components/dashboard/ExportImport";
import { ScrapedJobsList } from "@/components/dashboard/ScrapedJobsList";
import { ScrapedJobsTest } from "@/components/dashboard/ScrapedJobsTest";
import { ResumeUpload } from "@/components/dashboard/ResumeUpload";
import { ResumeUploadTest } from "@/components/dashboard/ResumeUploadTest";
import { SimpleUploadTest } from "@/components/dashboard/SimpleUploadTest";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Filter } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useJobs, useAutomationStats, useUserSettings, useTriggerN8N } from "@/hooks/useSupabase";

const mockJobs = [
  {
    id: "1",
    title: "Typing Jobs From Home",
    company: "Remote Work From Home / Data Entry",
    url: "https://typingjobsfromhome.com",
    status: "pending" as const,
    payRange: "$27–$53/hr",
    type: "Full-time or Part-time",
    resumeRequired: false,
    notes: "Data entry position, no resume required"
  },
  {
    id: "2", 
    title: "Flexible Data Entry",
    company: "OneGoodGig",
    url: "https://onegoodgig.com",
    status: "pending" as const,
    payRange: "$100–$400/week",
    type: "Part-time",
    resumeRequired: false,
    notes: "Flexible schedule, weekly pay"
  },
  {
    id: "3",
    title: "Entry-Level Data Entry", 
    company: "Sky Limits Remote Jobs",
    url: "https://skylimitsremotejobs.com",
    status: "pending" as const,
    payRange: "$16.50–$34.25/hr",
    type: "Part-time",
    resumeRequired: false,
    notes: "Entry level position"
  },
  {
    id: "4",
    title: "Focus Group & Survey Tasks",
    company: "JobConversion.net",
    url: "https://jobconversion.net",
    status: "pending" as const,
    payRange: "Varies",
    type: "Gig-based",
    resumeRequired: false,
    notes: "Survey and focus group tasks"
  },
  {
    id: "5",
    title: "Transcription & Captioning",
    company: "TranscribeMe",
    url: "https://transcribeme.com",
    status: "pending" as const,
    payRange: "$15–$22/audio hr",
    type: "Freelance",
    resumeRequired: false,
    notes: "Audio transcription work"
  },
  {
    id: "6",
    title: "Tutoring (English)",
    company: "Cambly", 
    url: "https://cambly.com",
    status: "pending" as const,
    payRange: "$10–$12/hr",
    type: "Flexible",
    resumeRequired: false,
    notes: "English tutoring, flexible hours"
  },
  {
    id: "7",
    title: "Proofreading",
    company: "ProofreadingServices.com",
    url: "https://proofreadingservices.com",
    status: "pending" as const,
    payRange: "$19–$46/hr", 
    type: "Freelance",
    resumeRequired: false,
    notes: "Freelance proofreading work"
  },
  {
    id: "8",
    title: "AI Training Tasks",
    company: "DataAnnotation Tech",
    url: "https://dataannotation.tech",
    status: "pending" as const,
    payRange: "$20/hr",
    type: "Freelance", 
    resumeRequired: false,
    notes: "AI model training tasks"
  },
  {
    id: "9",
    title: "Remote Job Listings",
    company: "ZipRecruiter",
    url: "https://ziprecruiter.com",
    status: "pending" as const,
    payRange: "Varies",
    type: "Various",
    resumeRequired: true,
    notes: "Major job board, may require resume"
  },
  {
    id: "10",
    title: "Hourly Jobs",
    company: "Snagajob",
    url: "https://snagajob.com",
    status: "pending" as const,
    payRange: "Varies",
    type: "Part-time/Hourly",
    resumeRequired: false,
    notes: "Hourly positions, usually no resume needed"
  },
  {
    id: "11",
    title: "Gig Work Opportunities",
    company: "Gig.fish",
    url: "https://gig.fish",
    status: "pending" as const,
    payRange: "Varies",
    type: "Gig-based",
    resumeRequired: false,
    notes: "Gig economy jobs"
  },
  {
    id: "12",
    title: "Work From Home Jobs",
    company: "The Work at Home Woman",
    url: "https://theworkathomewoman.com",
    status: "pending" as const,
    payRange: "Varies",
    type: "Remote",
    resumeRequired: false,
    notes: "Curated remote job listings"
  }
];

const mockStats = {
  totalJobs: 12,
  applied: 0,
  pending: 12,
  successRate: 0,
  automationRuns: 0,
  webhooksTriggered: 0
};

const mockSettings = {
  email: "user@example.com",
  phone: "+1 (555) 987-6543",
  runsPerDay: 2,
  autoApply: true,
  makeWebhook: "",
  powerAutomateFlow: ""
};

export const Dashboard = () => {
  const [viewingUrl, setViewingUrl] = useState<string | null>(null);
  const [isAgentRunning, setIsAgentRunning] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const { toast } = useToast();

  // Use real Supabase data
  const { data: jobs = [], isLoading: jobsLoading } = useJobs();
  const { data: stats = mockStats } = useAutomationStats();
  const { data: settings = mockSettings } = useUserSettings();
  const { mutate: triggerN8N } = useTriggerN8N();

  const filteredJobs = (jobs.length > 0 ? jobs : mockJobs).filter((job: any) => {
    const matchesSearch = job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         job.company.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || job.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleJobApply = async (jobId: string) => {
    console.log("Triggering n8n auto-apply for job:", jobId);
    
    const job = (jobs.length > 0 ? jobs : mockJobs).find((j: any) => j.id === jobId);
    if (!job) return;

    try {
      await triggerN8N({
        workflow: 'job-application',
        jobData: job
      });

      toast({
        title: "n8n Workflow Triggered",
        description: `Auto-apply workflow started for ${job.title} at ${job.company}`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to trigger n8n workflow. Check your settings.",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <SiteViewer url={viewingUrl} onClose={() => setViewingUrl(null)} />
      
      <div className="container mx-auto p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              JJMapplyx Dashboard
            </h1>
            <p className="text-muted-foreground">
              AI-powered job application automation
            </p>
          </div>
        </div>

        <StatsCards stats={stats} />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <ControlPanel
              isRunning={isAgentRunning}
              onToggleBot={() => setIsAgentRunning(!isAgentRunning)}
              settings={settings}
              onUpdateSettings={() => {}} // Handled in ControlPanel via useUpdateSettings
            />
          </div>
          <div className="space-y-6">
            <AutomationLogs />
            <TestWebhook />
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-blue-50 p-4 rounded-lg border">
            <h3 className="text-lg font-semibold text-blue-800">Dashboard Tabs</h3>
            <p className="text-blue-600">Click on any tab below to navigate between different sections:</p>
          </div>
          
          <Tabs defaultValue="jobs" className="space-y-6">
            <TabsList className="inline-flex h-10 items-center justify-start rounded-md bg-muted p-1 text-muted-foreground w-full overflow-x-auto">
              <TabsTrigger value="jobs" className="whitespace-nowrap">Job Applications</TabsTrigger>
              <TabsTrigger value="scraped" className="whitespace-nowrap">Scraped Jobs</TabsTrigger>
              <TabsTrigger value="resume" className="whitespace-nowrap">Resume</TabsTrigger>
              <TabsTrigger value="analytics" className="whitespace-nowrap">Analytics</TabsTrigger>
              <TabsTrigger value="settings" className="whitespace-nowrap">Site Config</TabsTrigger>
              <TabsTrigger value="data" className="whitespace-nowrap">Export/Import</TabsTrigger>
            </TabsList>

          <TabsContent value="jobs" className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-semibold">Job Applications</h2>
            <div className="flex gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Search jobs..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-64"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-40">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-popover border-border">
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="applied">Applied</SelectItem>
                  <SelectItem value="no-response">No Response</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
            {filteredJobs.map((job) => (
              <JobCard
                key={job.id}
                job={job}
                onViewSite={(url) => setViewingUrl(url)}
                onApply={() => handleJobApply(job.id)}
              />
            ))}
          </div>

          {filteredJobs.length === 0 && (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No jobs found matching your criteria.</p>
            </div>
          )}
          </TabsContent>

          <TabsContent value="scraped">
            <ScrapedJobsList />
          </TabsContent>

          <TabsContent value="resume">
            <div className="space-y-6">
              <SimpleUploadTest />
              <ResumeUploadTest />
              <ResumeUpload />
            </div>
          </TabsContent>

          <TabsContent value="analytics">
            <Analytics />
          </TabsContent>

          <TabsContent value="settings">
            <JobSiteConfig />
          </TabsContent>

          <TabsContent value="data">
            <ExportImport />
          </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};
