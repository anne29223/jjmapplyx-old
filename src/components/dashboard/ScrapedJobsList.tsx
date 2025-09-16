import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { ExternalLink, Search, Filter, Trash2, CheckCircle, XCircle, Clock, MapPin, DollarSign, Calendar, Building, Globe, Download } from 'lucide-react';
import { useScrapedJobs, useUpdateScrapedJobStatus, useDeleteScrapedJob, useTriggerJobScraping, useJobScrapingConfig, useApplyToJob, useActiveResume } from '@/hooks/useSupabase';
import { useToast } from '@/hooks/use-toast';
import { formatDistanceToNow } from 'date-fns';

interface ScrapedJob {
  id: string;
  title: string;
  company: string;
  location?: string;
  url: string;
  description?: string;
  salary?: string;
  job_type?: string;
  source: string;
  posted_at?: string;
  scraped_at: string;
  status: 'pending' | 'applied' | 'rejected' | 'interview';
}

const statusColors = {
  pending: 'bg-yellow-100 text-yellow-800',
  applied: 'bg-blue-100 text-blue-800',
  rejected: 'bg-red-100 text-red-800',
  interview: 'bg-green-100 text-green-800'
};

const sourceColors = {
  'Indeed': 'bg-purple-100 text-purple-800',
  'RemoteOK': 'bg-green-100 text-green-800',
  'We Work Remotely': 'bg-blue-100 text-blue-800',
  'Glassdoor': 'bg-orange-100 text-orange-800',
  'LinkedIn': 'bg-blue-100 text-blue-800'
};

export const ScrapedJobsList = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sourceFilter, setSourceFilter] = useState('all');
  const [selectedJob, setSelectedJob] = useState<ScrapedJob | null>(null);
  const [isScraping, setIsScraping] = useState(false);
  const [scrapingConfig, setScrapingConfig] = useState({
    jobBoards: ['indeed', 'linkedin', 'glassdoor'],
    searchQuery: 'remote work',
    location: 'remote',
    maxJobs: 50
  });

  const { data: jobs = [], isLoading } = useScrapedJobs();
  const { data: config } = useJobScrapingConfig();
  const { data: activeResume } = useActiveResume();
  const { mutate: updateStatus } = useUpdateScrapedJobStatus();
  const { mutate: deleteJob } = useDeleteScrapedJob();
  const { mutate: triggerScraping } = useTriggerJobScraping();
  const { mutate: applyToJob } = useApplyToJob();
  const { toast } = useToast();

  // Check if jobs.json file exists and load jobs from it
  const [jsonFileExists, setJsonFileExists] = useState(false);
  const [jsonJobs, setJsonJobs] = useState([]);
  const [localJobStatuses, setLocalJobStatuses] = useState({});
  
  useEffect(() => {
    fetch('/jobs.json')
      .then(response => {
        if (response.ok) {
          setJsonFileExists(true);
          return response.json();
        }
        throw new Error('File not found');
      })
      .then(data => {
        setJsonJobs(data.jobs || []);
      })
      .catch(() => {
        setJsonFileExists(false);
        setJsonJobs([]);
      });
  }, []);

  // Combine database jobs and JSON jobs with local status updates
  const allJobs = [...jobs, ...jsonJobs.map(job => ({
    ...job,
    status: localJobStatuses[job.id] || job.status
  }))];
  
  const filteredJobs = allJobs.filter((job: ScrapedJob) => {
    const matchesSearch = job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         job.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         job.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || job.status === statusFilter;
    const matchesSource = sourceFilter === 'all' || job.source === sourceFilter;
    return matchesSearch && matchesStatus && matchesSource;
  });

  const handleStatusUpdate = (jobId: string, newStatus: string) => {
    // Check if this is a database job or JSON job
    const isDatabaseJob = jobs.some(job => job.id === jobId);
    
    if (isDatabaseJob) {
      // Update database job
      updateStatus({ jobId, status: newStatus }, {
        onSuccess: () => {
          toast({
            title: "Status Updated",
            description: "Job status has been updated successfully.",
          });
        },
        onError: () => {
          toast({
            title: "Error",
            description: "Failed to update job status.",
            variant: "destructive"
          });
        }
      });
    } else {
      // Update local JSON job status
      setLocalJobStatuses(prev => ({
        ...prev,
        [jobId]: newStatus
      }));
      toast({
        title: "Status Updated",
        description: "Job status has been updated locally.",
      });
    }
  };

  const handleDeleteJob = (jobId: string) => {
    deleteJob(jobId, {
      onSuccess: () => {
        toast({
          title: "Job Deleted",
          description: "Job has been removed from your list.",
        });
      },
      onError: () => {
        toast({
          title: "Error",
          description: "Failed to delete job.",
          variant: "destructive"
        });
      }
    });
  };

  const handleStartScraping = () => {
    setIsScraping(true);
    triggerScraping(scrapingConfig, {
      onSuccess: (data) => {
        toast({
          title: "Scraping Complete",
          description: `Found ${data.jobs_scraped} new jobs from ${data.job_boards.join(', ')}`,
        });
        setIsScraping(false);
      },
      onError: (error) => {
        toast({
          title: "Scraping Failed",
          description: error.message || "Failed to scrape jobs. Please try again.",
          variant: "destructive"
        });
        setIsScraping(false);
      }
    });
  };

  const handleApplyToJob = (jobId: string) => {
    if (!activeResume) {
      toast({
        title: "No Resume Uploaded",
        description: "Please upload your resume first before applying to jobs.",
        variant: "destructive"
      });
      return;
    }

    applyToJob({
      jobId,
      resumeId: activeResume.id,
      notes: `Applied via ${jobs.find((j: ScrapedJob) => j.id === jobId)?.source || 'job board'}`
    }, {
      onSuccess: () => {
        toast({
          title: "Application Submitted",
          description: "Your application has been submitted successfully!",
        });
      },
      onError: (error) => {
        toast({
          title: "Application Failed",
          description: error.message || "Failed to submit application. Please try again.",
          variant: "destructive"
        });
      }
    });
  };

  const handleDownloadJobs = async (format: 'json' | 'csv') => {
    try {
      const { createClient } = await import('@supabase/supabase-js');
      const supabase = createClient(
        import.meta.env.VITE_SUPABASE_URL,
        import.meta.env.VITE_SUPABASE_ANON_KEY
      );

      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast({
          title: "Authentication Required",
          description: "Please log in to download jobs.",
          variant: "destructive"
        });
        return;
      }

      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/download-jobs?format=${format}&limit=1000`, {
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to download jobs');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      
      const filename = response.headers.get('Content-Disposition')?.split('filename=')[1]?.replace(/"/g, '') || 
                     `scraped-jobs-${new Date().toISOString().split('T')[0]}.${format}`;
      
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast({
        title: "Download Complete",
        description: `Jobs downloaded successfully as ${format.toUpperCase()}`,
      });
    } catch (error) {
      console.error('Download error:', error);
      toast({
        title: "Download Failed",
        description: error instanceof Error ? error.message : "Failed to download jobs. Please try again.",
        variant: "destructive"
      });
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'applied':
        return <CheckCircle className="h-4 w-4" />;
      case 'rejected':
        return <XCircle className="h-4 w-4" />;
      case 'interview':
        return <Clock className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const sources = [...new Set(allJobs.map((job: ScrapedJob) => job.source))];

  return (
    <div className="space-y-6">
      {/* Header with Controls */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold">Scraped Jobs</h2>
          <p className="text-muted-foreground">
            Jobs automatically scraped from job boards
          </p>
        </div>
        <div className="flex gap-2">
          <a 
            href="/jobs.json" 
            download="jobs.json"
            className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
          >
            <Download className="h-4 w-4 mr-2" />
            Download Job Listings
          </a>
          {jsonFileExists && (
            <span className="text-sm text-green-600 flex items-center">
              ✓ JSON file available ({jsonJobs.length} jobs)
            </span>
          )}
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline">
                Configure Scraping
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Job Scraping Configuration</DialogTitle>
                <DialogDescription>
                  Configure which job boards to scrape and search parameters
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Search Query</label>
                  <Input
                    value={scrapingConfig.searchQuery}
                    onChange={(e) => setScrapingConfig({ ...scrapingConfig, searchQuery: e.target.value })}
                    placeholder="e.g., remote work, software engineer"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Location</label>
                  <Input
                    value={scrapingConfig.location}
                    onChange={(e) => setScrapingConfig({ ...scrapingConfig, location: e.target.value })}
                    placeholder="e.g., remote, New York, San Francisco"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Max Jobs per Board</label>
                  <Input
                    type="number"
                    value={scrapingConfig.maxJobs}
                    onChange={(e) => setScrapingConfig({ ...scrapingConfig, maxJobs: parseInt(e.target.value) })}
                    min="1"
                    max="100"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Job Boards</label>
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {[
                      { key: 'indeed', name: 'Indeed' },
                      { key: 'linkedin', name: 'LinkedIn' },
                      { key: 'glassdoor', name: 'Glassdoor' },
                      { key: 'naukri', name: 'Naukri' },
                      { key: 'monster', name: 'Monster' },
                      { key: 'simplyhired', name: 'SimplyHired' },
                      { key: 'careercloud', name: 'CareerCloud' },
                      { key: 'flexjobs', name: 'FlexJobs' },
                      { key: 'careerbuilder', name: 'CareerBuilder' },
                      { key: 'careeronestop', name: 'CareerOneStop' }
                    ].map((board) => (
                      <label key={board.key} className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={scrapingConfig.jobBoards.includes(board.key)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setScrapingConfig({
                                ...scrapingConfig,
                                jobBoards: [...scrapingConfig.jobBoards, board.key]
                              });
                            } else {
                              setScrapingConfig({
                                ...scrapingConfig,
                                jobBoards: scrapingConfig.jobBoards.filter(b => b !== board.key)
                              });
                            }
                          }}
                        />
                        <span className="text-sm">{board.name}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </DialogContent>
          </Dialog>
          <Button 
            onClick={handleStartScraping} 
            disabled={isScraping}
            className="bg-primary hover:bg-primary/90"
          >
            {isScraping ? 'Scraping...' : 'Start Scraping'}
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search jobs..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-40">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="applied">Applied</SelectItem>
            <SelectItem value="interview">Interview</SelectItem>
            <SelectItem value="rejected">Rejected</SelectItem>
          </SelectContent>
        </Select>
        <Select value={sourceFilter} onValueChange={setSourceFilter}>
          <SelectTrigger className="w-48">
            <Globe className="h-4 w-4 mr-2" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Sources</SelectItem>
            {sources.map((source) => (
              <SelectItem key={source} value={source}>{source}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Job List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
        {filteredJobs.map((job: ScrapedJob) => (
          <Card key={job.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-lg line-clamp-2">{job.title}</CardTitle>
                  <CardDescription className="flex items-center gap-2 mt-1">
                    <Building className="h-4 w-4" />
                    {job.company}
                  </CardDescription>
                </div>
                <div className="flex gap-1">
                  <Badge className={sourceColors[job.source as keyof typeof sourceColors] || 'bg-gray-100 text-gray-800'}>
                    {job.source}
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {job.location && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <MapPin className="h-4 w-4" />
                  {job.location}
                </div>
              )}
              {job.salary && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <DollarSign className="h-4 w-4" />
                  {job.salary}
                </div>
              )}
              {job.posted_at && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  {formatDistanceToNow(new Date(job.posted_at), { addSuffix: true })}
                </div>
              )}
              {job.description && (
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {job.description}
                </p>
              )}
              
              <div className="flex items-center justify-between pt-2">
                <div className="flex gap-2">
                  <Select
                    value={job.status}
                    onValueChange={(value) => handleStatusUpdate(job.id, value)}
                  >
                    <SelectTrigger className="w-32 h-8">
                      <div className="flex items-center gap-1">
                        {getStatusIcon(job.status)}
                        <span className="text-xs capitalize">{job.status}</span>
                      </div>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="applied">Applied</SelectItem>
                      <SelectItem value="interview">Interview</SelectItem>
                      <SelectItem value="rejected">Rejected</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="flex gap-1">
                  <Button
                    variant="default"
                    size="sm"
                    onClick={() => handleApplyToJob(job.id)}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    Apply
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => window.open(job.url, '_blank')}
                  >
                    <ExternalLink className="h-4 w-4" />
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete Job</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to delete this job? This action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={() => handleDeleteJob(job.id)}>
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredJobs.length === 0 && !isLoading && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No scraped jobs found matching your criteria.</p>
          <p className="text-sm text-muted-foreground mt-2">
            Try running a job scraping session to find new opportunities.
          </p>
        </div>
      )}

      {isLoading && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">Loading scraped jobs...</p>
        </div>
      )}
    </div>
  );
};
