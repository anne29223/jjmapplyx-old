
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ExternalLink, Clock, CheckCircle, XCircle, User, Mail, Phone, Zap } from "lucide-react";

interface JobCardProps {
  job: {
    id: string;
    title: string;
    company: string;
    url: string;
    status: "pending" | "applied" | "rejected" | "no-response";
    appliedAt?: Date;
    payRange?: string;
    type?: string;
    contact?: {
      name?: string;
      email?: string;
      phone?: string;
    };
    resumeRequired: boolean;
    notes?: string;
  };
  onViewSite: (url: string) => void;
  onApply?: (jobId: string) => void;
}

export const JobCard = ({ job, onViewSite, onApply }: JobCardProps) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "applied": return "success";
      case "rejected": return "destructive";
      case "no-response": return "warning";
      default: return "secondary";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "applied": return <CheckCircle className="h-4 w-4" />;
      case "rejected": return <XCircle className="h-4 w-4" />;
      case "no-response": return <Clock className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  return (
    <Card className="border-border hover:shadow-md transition-all duration-200">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <CardTitle className="text-lg">{job.title}</CardTitle>
            <p className="text-muted-foreground font-medium">{job.company}</p>
          </div>
          <Badge 
            variant={getStatusColor(job.status) as any}
            className="flex items-center gap-1"
          >
            {getStatusIcon(job.status)}
            {job.status.charAt(0).toUpperCase() + job.status.slice(1)}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="pt-0 space-y-4">
        <div className="flex gap-2">
          {job.payRange && (
            <Badge variant="outline">{job.payRange}</Badge>
          )}
          {job.type && (
            <Badge variant="secondary">{job.type}</Badge>
          )}
        </div>

        {job.appliedAt && (
          <p className="text-sm text-muted-foreground">
            Applied: {job.appliedAt.toLocaleDateString()}
          </p>
        )}
        
        {job.contact && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium flex items-center gap-2">
              <User className="h-4 w-4" />
              Contact Info
            </h4>
            <div className="text-sm space-y-1 pl-6">
              {job.contact.name && <p>{job.contact.name}</p>}
              {job.contact.email && (
                <p className="flex items-center gap-2">
                  <Mail className="h-3 w-3" />
                  {job.contact.email}
                </p>
              )}
              {job.contact.phone && (
                <p className="flex items-center gap-2">
                  <Phone className="h-3 w-3" />
                  {job.contact.phone}
                </p>
              )}
            </div>
          </div>
        )}
        
        <div className="flex items-center gap-2">
          <Badge variant={job.resumeRequired ? "warning" : "info"}>
            {job.resumeRequired ? "Resume Required" : "No Resume"}
          </Badge>
        </div>
        
        {job.notes && (
          <p className="text-sm text-muted-foreground bg-muted p-2 rounded">
            {job.notes}
          </p>
        )}
        
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => onViewSite(job.url)}
            className="flex items-center gap-2"
          >
            <ExternalLink className="h-4 w-4" />
            View Site
          </Button>
          
          {job.status === "pending" && onApply && (
            <Button
              size="sm"
              onClick={() => onApply(job.id)}
              className="flex items-center gap-2"
            >
              <Zap className="h-4 w-4" />
              Auto Apply
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
