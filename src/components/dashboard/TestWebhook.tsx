import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { TestTube, CheckCircle, XCircle, Loader2 } from "lucide-react";
import { useTriggerN8N } from "@/hooks/useSupabase";
import { useToast } from "@/hooks/use-toast";

export const TestWebhook = () => {
  const [testResults, setTestResults] = useState<Record<string, 'success' | 'error' | 'testing'>>({});
  const triggerN8N = useTriggerN8N();
  const { toast } = useToast();

  const testWorkflow = async (workflow: string) => {
    setTestResults(prev => ({ ...prev, [workflow]: 'testing' }));
    
    try {
      await triggerN8N.mutateAsync({ 
        workflow, 
        jobData: { 
          test: true, 
          jobId: 'test-123',
          title: 'Test Job',
          company: 'Test Company',
          url: 'https://example.com/job'
        } 
      });
      
      setTestResults(prev => ({ ...prev, [workflow]: 'success' }));
      toast({
        title: "Test successful",
        description: `${workflow} workflow test completed`,
      });
    } catch (error) {
      console.error(`Test failed for ${workflow}:`, error);
      setTestResults(prev => ({ ...prev, [workflow]: 'error' }));
      
      let errorMessage = 'Unknown error';
      if (error instanceof Error) {
        errorMessage = error.message;
      } else if (typeof error === 'string') {
        errorMessage = error;
      }
      
      toast({
        title: "Test failed",
        description: `${workflow} workflow test failed: ${errorMessage}`,
        variant: "destructive",
      });
    }
  };

  const workflows = [
    { id: 'job-scraping', name: 'Job Scraping', description: 'Test job site scraping' },
    { id: 'auto-apply', name: 'Auto Apply', description: 'Test application submission' },
    { id: 'email-monitoring', name: 'Email Monitor', description: 'Test email parsing' }
  ];

  const getStatusIcon = (status: 'success' | 'error' | 'testing' | undefined) => {
    switch (status) {
      case 'testing':
        return <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />;
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'error':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return null;
    }
  };

  const getStatusBadge = (status: 'success' | 'error' | 'testing' | undefined) => {
    switch (status) {
      case 'testing':
        return <Badge variant="secondary">Testing...</Badge>;
      case 'success':
        return <Badge className="bg-green-100 text-green-800">Passed</Badge>;
      case 'error':
        return <Badge variant="destructive">Failed</Badge>;
      default:
        return null;
    }
  };

  return (
    <Card className="border-border">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TestTube className="h-5 w-5" />
          Webhook Testing
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {workflows.map((workflow) => (
          <div key={workflow.id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
            <div className="flex items-center gap-3">
              {getStatusIcon(testResults[workflow.id])}
              <div>
                <p className="text-sm font-medium">{workflow.name}</p>
                <p className="text-xs text-muted-foreground">{workflow.description}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {getStatusBadge(testResults[workflow.id])}
              <Button
                size="sm"
                variant="outline"
                onClick={() => testWorkflow(workflow.id)}
                disabled={testResults[workflow.id] === 'testing'}
              >
                Test
              </Button>
            </div>
          </div>
        ))}
        
        <div className="text-xs text-muted-foreground mt-4">
          <p>• Tests send sample data to verify webhook connectivity</p>
          <p>• Check automation logs for detailed results</p>
        </div>
      </CardContent>
    </Card>
  );
};