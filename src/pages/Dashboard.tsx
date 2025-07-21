import { useState } from "react";
import { StatsCards } from "@/components/dashboard/StatsCards";
import { JobCard } from "@/components/dashboard/JobCard";
import { ControlPanel } from "@/components/dashboard/ControlPanel";
import { SiteViewer } from "@/components/dashboard/SiteViewer";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Filter } from "lucide-react";

// Mock data - replace with real data later
const mockJobs = [
  {
    id: "1",
    title: "Frontend Developer",
    company: "TechStart Inc",
    url: "https://example.com/job1",
    status: "applied" as const,
    appliedAt: new Date("2024-01-15"),
    contact: {
      name: "Sarah Johnson",
      email: "sarah@techstart.com",
      phone: "+1 (555) 123-4567"
    },
    resumeRequired: false,
    notes: "No interview process, perfect match for skills"
  },
  {
    id: "2",
    title: "React Developer",
    company: "BuildCorp",
    url: "https://example.com/job2",
    status: "pending" as const,
    contact: {
      email: "hr@buildcorp.com"
    },
    resumeRequired: true,
    notes: "Found via automated scan, needs review"
  },
  {
    id: "3",
    title: "Full Stack Developer",
    company: "GrowthLabs",
    url: "https://example.com/job3",
    status: "no-response" as const,
    appliedAt: new Date("2024-01-10"),
    resumeRequired: false,
    notes: "Applied 5 days ago, no response yet"
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