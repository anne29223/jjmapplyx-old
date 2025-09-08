import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Download, CheckCircle, ExternalLink } from "lucide-react";
import { toast } from "sonner";

interface Application {
  id: string;
  job_title: string;
  company?: string;
  status: string;
  applied_at: string;
  created_at: string;
}

export const AppliedJobsList = () => {
  const applications: Application[] = [];

  const downloadCSV = () => {
    if (!applications || applications.length === 0) {
      toast.error("No applications to download");
      return;
    }

    const headers = ['Job Title', 'Company', 'Status', 'Applied Date'];
    const csvContent = [
      headers.join(','),
      ...applications.map(app => [
        `"${app.job_title || 'N/A'}"`,
        `"${app.company || 'N/A'}"`,
        `"${app.status}"`,
        `"${new Date(app.applied_at).toLocaleDateString()}"`
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `job-applications-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
    
    toast.success("Application list downloaded successfully");
  };

  const getStatusText = (status: string) => {
    switch (status.toLowerCase()) {
      case 'applied':
        return 'Application sent';
      case 'interviewing':
      case 'interview_scheduled':
        return 'Interview scheduled';
      case 'offer_received':
        return 'Offer received';
      case 'rejected':
        return 'Application rejected';
      case 'failed':
        return 'Failed to apply';
      case 'pending':
        return 'Pending';
      default:
        return 'Status unknown';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'applied':
        return 'default';
      case 'interviewing':
      case 'interview_scheduled':
        return 'success';
      case 'rejected':
        return 'destructive';
      default:
        return 'secondary';
    }
  };

  return (
    <Card className="border-border">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <CheckCircle className="h-5 w-5" />
          Applied Jobs ({applications?.length || 0})
        </CardTitle>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={downloadCSV}
          disabled={!applications || applications.length === 0}
        >
          <Download className="h-4 w-4 mr-2" />
          Download CSV
        </Button>
      </CardHeader>
      <CardContent>
        {!applications || applications.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground space-y-3">
            <p>Job applications are now managed by GitHub Actions automation.</p>
            <p>Check your GitHub repository's Actions tab to view automation runs and results.</p>
            <Button 
              variant="outline" 
              onClick={() => window.open('https://github.com', '_blank')}
              className="mt-2"
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              View GitHub Actions
            </Button>
          </div>
        ) : (
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {applications.map((app) => (
              <div
                key={app.id}
                className="flex items-center justify-between p-3 border border-border rounded-lg hover:bg-accent/50 transition-colors"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-medium truncate">{app.job_title}</h4>
                    {app.company && (
                      <span className="text-sm text-muted-foreground">
                        at {app.company}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <span>Applied {new Date(app.applied_at).toLocaleDateString()}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge 
                    variant={getStatusColor(app.status) as any}
                    className="flex items-center gap-1"
                  >
                    {getStatusText(app.status)}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};