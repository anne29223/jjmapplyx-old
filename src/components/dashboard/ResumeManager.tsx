import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Upload, FileText, X } from "lucide-react";

interface ResumeManagerProps {
  onResumeUpload: (file: File) => void;
}

export const ResumeManager = ({ onResumeUpload }: ResumeManagerProps) => {
  const [uploadedResume, setUploadedResume] = useState<File | null>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && (file.type === 'application/pdf' || file.name.endsWith('.pdf'))) {
      setUploadedResume(file);
      onResumeUpload(file);
    }
  };

  const removeResume = () => {
    setUploadedResume(null);
  };

  return (
    <Card className="border-border">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Resume Management
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {!uploadedResume ? (
          <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center">
            <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
            <p className="text-sm text-muted-foreground mb-3">
              Upload resume for jobs that require it
            </p>
            <Input
              type="file"
              accept=".pdf"
              onChange={handleFileUpload}
              className="hidden"
              id="resume-upload"
            />
            <Button asChild variant="outline">
              <label htmlFor="resume-upload" className="cursor-pointer">
                Choose PDF File
              </label>
            </Button>
          </div>
        ) : (
          <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              <span className="text-sm font-medium">{uploadedResume.name}</span>
              <Badge variant="secondary">Ready</Badge>
            </div>
            <Button size="sm" variant="ghost" onClick={removeResume}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        )}
        
        <div className="text-xs text-muted-foreground">
          <p>• Bot will automatically skip resume upload for jobs marked "No Resume"</p>
          <p>• PDF format only, max 5MB</p>
        </div>
      </CardContent>
    </Card>
  );
};