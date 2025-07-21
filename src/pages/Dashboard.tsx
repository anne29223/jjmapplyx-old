import { useState } from "react";
import { StatsCards } from "@/components/dashboard/StatsCards";
import { JobCard } from "@/components/dashboard/JobCard";
import { ControlPanel } from "@/components/dashboard/ControlPanel";
import { SiteViewer } from "@/components/dashboard/SiteViewer";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Filter } from "lucide-react";

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
  }
];

const mockStats = {
  totalJobs: 47,
  applied: 12,
  pending: 8,
  successRate: 25
};

const mockSettings = {
  email: "user@example.com",
  phone: "+1 (555) 987-6543",
  runsPerDay: 2,
  autoApply: true
};

export const Dashboard = () => {
  const [viewingUrl, setViewingUrl] = useState<string | null>(null);
  const [isAgentRunning, setIsAgentRunning] = useState(false);
  const [settings, setSettings] = useState(mockSettings);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const filteredJobs = mockJobs.filter(job => {
    const matchesSearch = job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         job.company.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || job.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="min-h-screen bg-background">
      <SiteViewer url={viewingUrl} onClose={() => setViewingUrl(null)} />
      
      <div className="container mx-auto p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Job Ninja Dashboard
            </h1>
            <p className="text-muted-foreground">
              AI-powered job application automation
            </p>
          </div>
        </div>

        <StatsCards stats={mockStats} />

        <ControlPanel
          isRunning={isAgentRunning}
          onToggleBot={() => setIsAgentRunning(!isAgentRunning)}
          settings={settings}
          onUpdateSettings={setSettings}
        />

        <div className="space-y-4">
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
              />
            ))}
          </div>

          {filteredJobs.length === 0 && (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No jobs found matching your criteria.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};