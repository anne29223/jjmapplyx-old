import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

// Mock data for testing the UI
const mockScrapedJobs = [
  {
    id: '1',
    title: 'Senior Software Engineer',
    company: 'Tech Corp',
    location: 'Remote',
    url: 'https://example.com/job1',
    description: 'We are looking for a senior software engineer...',
    salary: '$120k - $150k',
    source: 'RemoteOK',
    status: 'pending',
    scraped_at: new Date().toISOString()
  },
  {
    id: '2',
    title: 'Frontend Developer',
    company: 'Startup Inc',
    location: 'San Francisco, CA',
    url: 'https://example.com/job2',
    description: 'Join our growing team as a frontend developer...',
    salary: '$90k - $110k',
    source: 'Indeed',
    status: 'pending',
    scraped_at: new Date().toISOString()
  },
  {
    id: '3',
    title: 'Full Stack Developer',
    company: 'Remote Company',
    location: 'Remote',
    url: 'https://example.com/job3',
    description: 'Full stack developer position...',
    salary: '$100k - $130k',
    source: 'We Work Remotely',
    status: 'applied',
    scraped_at: new Date().toISOString()
  }
];

export const ScrapedJobsTest = () => {
  const [jobs, setJobs] = useState(mockScrapedJobs);
  const [isLoading, setIsLoading] = useState(false);

  const handleScrapeJobs = async () => {
    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      const newJobs = [
        ...jobs,
        {
          id: Date.now().toString(),
          title: 'New Job ' + Date.now(),
          company: 'New Company',
          location: 'Remote',
          url: 'https://example.com/new-job',
          description: 'This is a newly scraped job',
          salary: '$80k - $100k',
          source: 'RemoteOK',
          status: 'pending',
          scraped_at: new Date().toISOString()
        }
      ];
      setJobs(newJobs);
      setIsLoading(false);
    }, 2000);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold">Scraped Jobs (Test Mode)</h2>
          <p className="text-muted-foreground">
            Testing the scraped jobs display functionality
          </p>
        </div>
        <Button 
          onClick={handleScrapeJobs} 
          disabled={isLoading}
          className="bg-primary hover:bg-primary/90"
        >
          {isLoading ? 'Scraping...' : 'Test Scrape Jobs'}
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
        {jobs.map((job) => (
          <Card key={job.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-lg line-clamp-2">{job.title}</CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">{job.company}</p>
                </div>
                <Badge variant="secondary">{job.source}</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="text-sm text-muted-foreground">
                📍 {job.location}
              </div>
              {job.salary && (
                <div className="text-sm text-muted-foreground">
                  💰 {job.salary}
                </div>
              )}
              <p className="text-sm text-muted-foreground line-clamp-2">
                {job.description}
              </p>
              <div className="flex items-center justify-between pt-2">
                <Badge 
                  className={
                    job.status === 'applied' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-yellow-100 text-yellow-800'
                  }
                >
                  {job.status}
                </Badge>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => window.open(job.url, '_blank')}
                >
                  View Job
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {jobs.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No scraped jobs found.</p>
          <p className="text-sm text-muted-foreground mt-2">
            Click "Test Scrape Jobs" to add some sample jobs.
          </p>
        </div>
      )}
    </div>
  );
};
