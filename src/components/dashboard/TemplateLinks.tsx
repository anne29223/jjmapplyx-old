import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Download, ExternalLink, FileText } from 'lucide-react';

export function TemplateLinks() {
  const templates = [
    {
      id: 'job-scraping',
      name: 'Job Scraping Workflow',
      description: 'Automated job discovery from Indeed, LinkedIn, and Jobs2Careers',
      file: '/generated_workflows/job-scraping-workflow.json',
      features: ['Multi-site scraping', 'Job filtering', 'Duplicate detection']
    },
    {
      id: 'auto-apply',
      name: 'Auto Apply Workflow', 
      description: 'Intelligent job application submission with resume upload',
      file: '/generated_workflows/auto-apply-workflow.json',
      features: ['Resume upload', 'Form filling', 'Application tracking']
    },
    {
      id: 'email-monitoring',
      name: 'Email Monitoring Workflow',
      description: 'Monitor inbox for interview invitations and responses',
      file: '/generated_workflows/email-monitoring-workflow.json',
      features: ['Email parsing', 'Response detection', 'Status updates']
    },
    {
      id: 'complete-automation',
      name: 'Complete Job Automation',
      description: 'End-to-end job search automation combining all workflows',
      file: '/generated_workflows/complete-job-automation-workflow.json',
      features: ['Full automation', 'Analytics', 'Multi-platform support']
    }
  ];

  const handleDownload = (template: typeof templates[0]) => {
    const link = document.createElement('a');
    link.href = template.file;
    link.download = `${template.id}.json`;
    link.click();
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold mb-2">N8N Workflow Templates</h2>
        <p className="text-muted-foreground">
          Download and import these pre-configured workflows into your N8N instance
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {templates.map((template) => (
          <Card key={template.id} className="border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <FileText className="h-5 w-5" />
                {template.name}
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                {template.description}
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap gap-1">
                {template.features.map((feature, index) => (
                  <Badge key={index} variant="secondary" className="text-xs">
                    {feature}
                  </Badge>
                ))}
              </div>
              
              <div className="flex gap-2">
                <Button 
                  size="sm" 
                  onClick={() => handleDownload(template)}
                  className="flex items-center gap-2"
                >
                  <Download className="h-3 w-3" />
                  Download
                </Button>
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => window.open('https://docs.n8n.io/workflows/share/', '_blank')}
                  className="flex items-center gap-2"
                >
                  <ExternalLink className="h-3 w-3" />
                  Import Guide
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="bg-muted/50">
        <CardContent className="pt-6">
          <h3 className="font-semibold mb-2">Setup Instructions</h3>
          <div className="text-sm text-muted-foreground space-y-2">
            <p>1. Download the workflow JSON files above</p>
            <p>2. In N8N, go to Workflows → Import from File</p>
            <p>3. Upload the JSON files to import the workflows</p>
            <p>4. Configure your webhook URLs in the JJMApplyX settings</p>
            <p>5. Set up your N8N_WEBHOOK_SECRET for security</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}