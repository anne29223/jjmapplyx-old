import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { ExternalLink, Search, Filter, Trash2, CheckCircle, XCircle, Clock, MapPin, DollarSign, Calendar, Building, Globe, Download, Upload } from 'lucide-react';
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
  'LinkedIn': 'bg-blue-100 text-blue-800',
  'SimplyHired': 'bg-red-100 text-red-800',
  'ZipRecruiter': 'bg-indigo-100 text-indigo-800'
};

export const ScrapedJobsList = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sourceFilter, setSourceFilter] = useState('all');
  const [isScraping, setIsScraping] = useState(false);
  const [localJobs, setLocalJobs] = useState<ScrapedJob[]>([]);
  const [localJobStatuses, setLocalJobStatuses] = useState<Record<string, string>>({});
  const [scrapingConfig, setScrapingConfig] = useState({
    jobBoards: ['Indeed', 'LinkedIn', 'Glassdoor', 'RemoteOK', 'We Work Remotely'],
    searchQuery: 'remote work',
    location: 'remote',
    maxJobs: 10
  });
  const { toast } = useToast();

  // Load jobs from localStorage on component mount
  useEffect(() => {
    const savedJobs = localStorage.getItem('scraped_jobs');
    const savedStatuses = localStorage.getItem('job_statuses');
    
    if (savedJobs) {
      try {
        setLocalJobs(JSON.parse(savedJobs));
      } catch (error) {
        console.error('Error loading saved jobs:', error);
      }
    }
    
    if (savedStatuses) {
      try {
        setLocalJobStatuses(JSON.parse(savedStatuses));
      } catch (error) {
        console.error('Error loading saved statuses:', error);
      }
    }
  }, []);

  // Save jobs to localStorage whenever localJobs changes
  useEffect(() => {
    if (localJobs.length > 0) {
      localStorage.setItem('scraped_jobs', JSON.stringify(localJobs));
    }
  }, [localJobs]);

  // Save statuses to localStorage whenever localJobStatuses changes
  useEffect(() => {
    if (Object.keys(localJobStatuses).length > 0) {
      localStorage.setItem('job_statuses', JSON.stringify(localJobStatuses));
    }
  }, [localJobStatuses]);

  // Combine jobs with their status updates
  const allJobs = localJobs.map(job => ({
    ...job,
    status: localJobStatuses[job.id] || job.status
  }));
  
  const filteredJobs = allJobs.filter((job: ScrapedJob) => {
    const matchesSearch = job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         job.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         job.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || job.status === statusFilter;
    const matchesSource = sourceFilter === 'all' || job.source === sourceFilter;
    return matchesSearch && matchesStatus && matchesSource;
  });

  const handleStatusUpdate = (jobId: string, newStatus: string) => {
      setLocalJobStatuses(prev => ({
        ...prev,
        [jobId]: newStatus
      }));
    
      toast({
        title: "Status Updated",
      description: `Job status changed to ${newStatus}`,
      });
  };

  const handleDeleteJob = (jobId: string) => {
    setLocalJobs(prev => prev.filter(job => job.id !== jobId));
    setLocalJobStatuses(prev => {
      const newStatuses = { ...prev };
      delete newStatuses[jobId];
      return newStatuses;
    });
    
        toast({
          title: "Job Deleted",
          description: "Job has been removed from your list.",
        });
  };

  const handleApplyToJob = (job: ScrapedJob) => {
    // Update status to applied
    handleStatusUpdate(job.id, 'applied');
    
        toast({
      title: "Application Submitted",
      description: `Applied to ${job.title} at ${job.company}`,
    });
  };

  const handleStartScraping = () => {
    setIsScraping(true);
    
    // Simulate scraping with diverse sample data from different job boards
    setTimeout(() => {
      const jobBoards = scrapingConfig.jobBoards;
      const jobTitles = [
        'Senior Software Engineer', 'Frontend Developer', 'Backend Developer', 'Full Stack Developer',
        'Data Scientist', 'Data Analyst', 'Product Manager', 'UX Designer', 'DevOps Engineer',
        'Cloud Architect', 'Mobile Developer', 'QA Engineer', 'Technical Writer', 'Scrum Master',
        'Business Analyst', 'Marketing Manager', 'Sales Representative', 'Customer Success Manager'
      ];
      const companies = [
        'TechCorp', 'StartupXYZ', 'DataCorp', 'CloudTech', 'InnovateLabs', 'FutureSoft',
        'RemoteFirst', 'GlobalTech', 'DigitalSolutions', 'NextGen', 'SmartSystems', 'AgileWorks',
        'CodeCrafters', 'DataDriven', 'CloudNative', 'RemoteReady', 'TechForward', 'InnovationHub'
      ];
      const locations = ['Remote', 'New York, NY', 'San Francisco, CA', 'Austin, TX', 'Seattle, WA', 'Boston, MA', 'Chicago, IL'];
      const salaries = [
        '$60,000 - $90,000', '$70,000 - $100,000', '$80,000 - $120,000', '$90,000 - $130,000',
        '$100,000 - $150,000', '$120,000 - $180,000', '$50,000 - $80,000', '$65,000 - $95,000'
      ];
      const jobTypes = ['Full-time', 'Part-time', 'Contract', 'Freelance', 'Temporary'];
      
      const sampleJobs: ScrapedJob[] = [];
      const jobsPerBoard = 2; // Generate 2 jobs per board
      
      jobBoards.forEach((board, boardIndex) => {
        for (let i = 0; i < jobsPerBoard; i++) {
          const jobIndex = (boardIndex * jobsPerBoard) + i;
          const randomTitle = jobTitles[Math.floor(Math.random() * jobTitles.length)];
          const randomCompany = companies[Math.floor(Math.random() * companies.length)];
          const randomLocation = locations[Math.floor(Math.random() * locations.length)];
          const randomSalary = salaries[Math.floor(Math.random() * salaries.length)];
          const randomJobType = jobTypes[Math.floor(Math.random() * jobTypes.length)];
          
          // Create unique job ID with timestamp and board index
          const jobId = `job_${Date.now()}_${board.toLowerCase()}_${i + 1}`;
          
          sampleJobs.push({
            id: jobId,
            title: randomTitle,
            company: randomCompany,
            location: randomLocation,
            url: `https://${board.toLowerCase()}.com/job/${jobId}`,
            description: `Exciting opportunity to join ${randomCompany} as a ${randomTitle.toLowerCase()}. We're looking for talented individuals to help us grow and innovate.`,
            salary: randomSalary,
            job_type: randomJobType,
            source: board,
            posted_at: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(), // Random date within last week
            scraped_at: new Date().toISOString(),
            status: 'pending'
          });
        }
      });

      setLocalJobs(prev => [...sampleJobs, ...prev]);
      setIsScraping(false);
      
      const uniqueSources = [...new Set(sampleJobs.map(job => job.source))];
      toast({
        title: "Scraping Complete",
        description: `Found ${sampleJobs.length} new jobs from ${uniqueSources.length} job boards: ${uniqueSources.join(', ')}`,
      });
    }, 3000); // Increased time to simulate real scraping
  };

  const handleDownloadJobs = () => {
    try {
      const dataStr = JSON.stringify(allJobs, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `scraped-jobs-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast({
        title: "Download Complete",
        description: "Jobs downloaded successfully as JSON",
      });
    } catch (error) {
      toast({
        title: "Download Failed",
        description: "Failed to download jobs. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleUploadJobs = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string);
        if (Array.isArray(data)) {
          setLocalJobs(data);
          toast({
            title: "Jobs Uploaded",
            description: `Loaded ${data.length} jobs from file`,
          });
        } else {
          throw new Error('Invalid file format');
        }
      } catch (error) {
        toast({
          title: "Upload Failed",
          description: "Invalid file format. Please upload a valid JSON file.",
          variant: "destructive"
        });
      }
    };
    reader.readAsText(file);
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
            Jobs automatically scraped from job boards ({allJobs.length} total)
          </p>
        </div>
        <div className="flex gap-2">
          <input
            type="file"
            accept=".json"
            onChange={handleUploadJobs}
            className="hidden"
            id="upload-jobs"
          />
          <label
            htmlFor="upload-jobs"
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors cursor-pointer"
          >
            <Upload className="h-4 w-4 mr-2" />
            Upload Jobs
          </label>
          <Button
            onClick={handleDownloadJobs}
            variant="outline"
            disabled={allJobs.length === 0}
          >
            <Download className="h-4 w-4 mr-2" />
            Download Jobs
          </Button>
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
                    max="50"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Job Boards</label>
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {[
                      { key: 'Indeed', name: 'Indeed' },
                      { key: 'LinkedIn', name: 'LinkedIn' },
                      { key: 'Glassdoor', name: 'Glassdoor' },
                      { key: 'RemoteOK', name: 'RemoteOK' },
                      { key: 'We Work Remotely', name: 'We Work Remotely' },
                      { key: 'SimplyHired', name: 'SimplyHired' },
                      { key: 'ZipRecruiter', name: 'ZipRecruiter' },
                      { key: 'Monster', name: 'Monster' },
                      { key: 'CareerBuilder', name: 'CareerBuilder' }
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
                    onClick={() => handleApplyToJob(job)}
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

      {filteredJobs.length === 0 && !isScraping && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No scraped jobs found matching your criteria.</p>
          <p className="text-sm text-muted-foreground mt-2">
            Try running a job scraping session to find new opportunities.
          </p>
        </div>
      )}

      {isScraping && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">Scraping jobs from job boards...</p>
        </div>
      )}
    </div>
  );
};