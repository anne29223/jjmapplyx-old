
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UploadCloud, Play, CheckCircle, XCircle, User, MapPin } from "lucide-react";

// Placeholder data
const metrics = {
  totalApplied: 42,
  interviews: 7,
  offers: 3,
  rejections: 10,
  successRate: "7%"
};

const jobs = [
  {
    id: 1,
    title: "Frontend Developer",
    company: "Acme Corp",
    location: "Remote",
    contact: "hr@acme.com",
    interview: true,
    chosen: false,
    rejected: false
  },
  {
    id: 2,
    title: "Data Entry",
    company: "DataWorks",
    location: "New York, NY",
    contact: "jobs@dataworks.com",
    interview: false,
    chosen: false,
    rejected: true
  },
  // ...more jobs
];

export default function Dashboard() {
  const [uploading, setUploading] = useState(false);
  const [jobBoardFile, setJobBoardFile] = useState<File | null>(null);
  const [triggerStatus, setTriggerStatus] = useState<string>("");

  // Simulate GitHub Action trigger
  const handleTrigger = async () => {
    setTriggerStatus("Running...");
    setTimeout(() => setTriggerStatus("Success!"), 2000);
  };

  // Simulate job board upload
  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    setUploading(true);
    setTimeout(() => {
      setUploading(false);
      setJobBoardFile(null);
      alert("Job board uploaded!");
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="bg-red-500 text-white p-4 mb-4">Test Render: If you see this, the dashboard is rendering!</div>
      <h1 className="text-3xl font-bold mb-4">Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardTitle>Total Applied</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl">{metrics.totalApplied}</CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Interviews</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl">{metrics.interviews}</CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Offers</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl">{metrics.offers}</CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Rejections</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl">{metrics.rejections}</CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Success Rate</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl">{metrics.successRate}</CardContent>
        </Card>
      </div>

      <div className="mb-8 flex gap-6 flex-wrap">
        <form onSubmit={handleUpload} className="flex items-center gap-3">
          <Input type="file" accept=".csv,.json" onChange={e => setJobBoardFile(e.target.files?.[0] || null)} />
          <Button type="submit" disabled={uploading || !jobBoardFile}>
            <UploadCloud className="mr-2 h-4 w-4" />
            {uploading ? "Uploading..." : "Upload Job Board"}
          </Button>
        </form>
        <Button onClick={handleTrigger} variant="secondary">
          <Play className="mr-2 h-4 w-4" /> Trigger GitHub Action
        </Button>
        {triggerStatus && <span className="ml-2 text-green-600 font-semibold">{triggerStatus}</span>}
      </div>

      <Tabs defaultValue="jobs">
        <TabsList>
          <TabsTrigger value="jobs">Jobs Applied</TabsTrigger>
          <TabsTrigger value="interviews">Interviews</TabsTrigger>
          <TabsTrigger value="chosen">Chosen</TabsTrigger>
          <TabsTrigger value="rejected">Not Chosen</TabsTrigger>
        </TabsList>
        <TabsContent value="jobs">
          <div className="grid gap-4">
            {jobs.map(job => (
              <Card key={job.id} className="p-4">
                <div className="flex flex-col md:flex-row md:items-center gap-4">
                  <div className="flex-1">
                    <div className="font-bold text-lg">{job.title}</div>
                    <div className="text-muted-foreground">{job.company}</div>
                    <div className="flex gap-2 items-center text-sm mt-1">
                      <MapPin className="h-4 w-4" /> {job.location}
                      <User className="h-4 w-4 ml-4" /> {job.contact}
                    </div>
                  </div>
                  <div className="flex gap-2 items-center">
                    {job.interview && <CheckCircle className="text-green-500" title="Interview" />}
                    {job.chosen && <CheckCircle className="text-blue-500" title="Chosen" />}
                    {job.rejected && <XCircle className="text-red-500" title="Not Chosen" />}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </TabsContent>
        <TabsContent value="interviews">
          <div className="grid gap-4">
            {jobs.filter(j => j.interview).map(job => (
              <Card key={job.id} className="p-4">
                <div className="font-bold text-lg">{job.title}</div>
                <div className="text-muted-foreground">{job.company}</div>
                <div className="flex gap-2 items-center text-sm mt-1">
                  <MapPin className="h-4 w-4" /> {job.location}
                  <User className="h-4 w-4 ml-4" /> {job.contact}
                </div>
              </Card>
            ))}
          </div>
        </TabsContent>
        <TabsContent value="chosen">
          <div className="grid gap-4">
            {jobs.filter(j => j.chosen).map(job => (
              <Card key={job.id} className="p-4">
                <div className="font-bold text-lg">{job.title}</div>
                <div className="text-muted-foreground">{job.company}</div>
                <div className="flex gap-2 items-center text-sm mt-1">
                  <MapPin className="h-4 w-4" /> {job.location}
                  <User className="h-4 w-4 ml-4" /> {job.contact}
                </div>
              </Card>
            ))}
          </div>
        </TabsContent>
        <TabsContent value="rejected">
          <div className="grid gap-4">
            {jobs.filter(j => j.rejected).map(job => (
              <Card key={job.id} className="p-4">
                <div className="font-bold text-lg">{job.title}</div>
                <div className="text-muted-foreground">{job.company}</div>
                <div className="flex gap-2 items-center text-sm mt-1">
                  <MapPin className="h-4 w-4" /> {job.location}
                  <User className="h-4 w-4 ml-4" /> {job.contact}
                </div>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

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
    company: "The Work at Home Woman"
  }
];

export default function Dashboard() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [viewingUrl, setViewingUrl] = useState<string | null>(null);
  const { toast } = useToast();
  const { data: jobs = [], isLoading: jobsLoading } = useJobs();
  const { data: stats = {} } = useAutomationStats();
  const { data: settings = {} } = useUserSettings();
  const filteredJobs = (jobs.length > 0 ? jobs : mockJobs).filter((job: any) => {
    const matchesSearch = job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.company.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || job.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleJobApply = async (jobId: string) => {
    // ...existing code for handleJobApply...
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
              isRunning={false}
              onToggleBot={() => {}}
              settings={settings}
              onUpdateSettings={() => {}}
            />
          </div>
          <div className="space-y-6">
            <AutomationLogs />
            <TestWebhook />
          </div>
        </div>
        <Tabs defaultValue="jobs" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="jobs">Job Applications</TabsTrigger>
            <TabsTrigger value="applications">Applications</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="settings">Site Config</TabsTrigger>
            <TabsTrigger value="data">Export/Import</TabsTrigger>
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
          <TabsContent value="applications" className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-semibold">Applications</h2>
            </div>
            <ApplicationsTable />
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
  );
}
