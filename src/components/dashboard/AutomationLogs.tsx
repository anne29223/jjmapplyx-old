
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, CheckCircle, XCircle, Zap } from "lucide-react";

const mockLogs = [
  {
    id: "1",
    timestamp: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
    action: "Job Scraping",
    status: "success",
    details: "Found 5 new jobs from RemoteOK API",
    jobsFound: 5
  },
  {
    id: "2", 
    timestamp: new Date(Date.now() - 1000 * 60 * 45), // 45 minutes ago
    action: "Auto Apply",
    status: "pending",
    details: "Power Automate flow triggered for 3 applications",
    applicationsSubmitted: 3
  },
  {
    id: "3",
    timestamp: new Date(Date.now() - 1000 * 60 * 60), // 1 hour ago
    action: "Email Monitoring",
    status: "success", 
    details: "Scanned inbox, no interview requests detected",
    emailsProcessed: 12
  }
];

export const AutomationLogs = () => {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case "success": return <CheckCircle className="h-4 w-4 text-success" />;
      case "error": return <XCircle className="h-4 w-4 text-destructive" />;
      default: return <Clock className="h-4 w-4 text-warning" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "success": return "success";
      case "error": return "destructive";
      default: return "warning";
    }
  };

  return (
    <Card className="border-border">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Zap className="h-5 w-5" />
          Automation Activity
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {mockLogs.map((log) => (
            <div key={log.id} className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
              <div className="flex-shrink-0 mt-0.5">
                {getStatusIcon(log.status)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <p className="font-medium text-sm">{log.action}</p>
                  <Badge variant={getStatusColor(log.status) as any} className="text-xs">
                    {log.status}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">{log.details}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {log.timestamp.toLocaleTimeString()}
                </p>
              </div>
            </div>
          ))}
          
          {mockLogs.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <Zap className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>No automation activity yet</p>
              <p className="text-sm">Start the bot to see logs here</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
