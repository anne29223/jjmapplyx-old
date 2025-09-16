import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Upload, FileText, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useSupabase } from "@/hooks/useSupabase";

interface ResumeManagerProps {
  onResumeUpload: (file: File) => void;
}

interface ResumeData {
  id?: string;
  filename: string;
  content: string;
  file_type: string;
  file_size: number;
  uploaded_at: string;
  is_active: boolean;
}

export const ResumeManager = ({ onResumeUpload }: ResumeManagerProps) => {
  const [uploadedResume, setUploadedResume] = useState<ResumeData | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();
  const { supabase } = useSupabase();

  // Load existing active resume on component mount
  useEffect(() => {
    const loadActiveResume = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data, error } = await supabase
          .from('user_resumes')
          .select('*')
          .eq('user_id', user.id)
          .eq('is_active', true)
          .order('uploaded_at', { ascending: false })
          .limit(1)
          .single();

        if (error && error.code !== 'PGRST116') {
          console.error('Error loading resume:', error);
          return;
        }

        if (data) {
          setUploadedResume(data);
        }
      } catch (error) {
        console.error('Error loading resume:', error);
      }
    };

    loadActiveResume();
  }, [supabase]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (!allowedTypes.includes(file.type)) {
      toast({
        title: "Invalid File Type",
        description: "Please upload a PDF or Word document (.pdf, .doc, .docx)",
        variant: "destructive"
      });
      return;
    }

    // Validate file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File Too Large",
        description: "Please upload a file smaller than 5MB",
        variant: "destructive"
      });
      return;
    }

    setIsUploading(true);

    try {
      // Convert file to base64
      const reader = new FileReader();
      reader.onload = async (e) => {
        const content = e.target?.result as string;
        const base64Content = content.split(',')[1]; // Remove data:application/pdf;base64, prefix

        // Get current user
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          throw new Error('User not authenticated');
        }

        // Deactivate all existing resumes first
        await supabase
          .from('user_resumes')
          .update({ is_active: false })
          .eq('user_id', user.id);

        // Save to database
        const { data, error } = await supabase
          .from('user_resumes')
          .insert({
            user_id: user.id,
            filename: file.name,
            content: base64Content,
            file_type: file.type,
            file_size: file.size,
            is_active: true,
            uploaded_at: new Date().toISOString()
          })
          .select()
          .single();

        if (error) {
          throw error;
        }

        setUploadedResume(data);
        onResumeUpload(file);
        toast({
          title: "Resume Uploaded",
          description: "Your resume has been uploaded successfully and is ready for auto-application.",
        });
      };

      reader.readAsDataURL(file);
    } catch (error) {
      console.error('Error uploading resume:', error);
      toast({
        title: "Upload Failed",
        description: "Failed to upload resume. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsUploading(false);
    }
  };

  const removeResume = async () => {
    if (!uploadedResume?.id) return;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('User not authenticated');
      }

      const { error } = await supabase
        .from('user_resumes')
        .delete()
        .eq('id', uploadedResume.id)
        .eq('user_id', user.id);

      if (error) throw error;

      setUploadedResume(null);
      toast({
        title: "Resume Deleted",
        description: "Your resume has been deleted.",
      });
    } catch (error) {
      console.error('Error deleting resume:', error);
      toast({
        title: "Delete Failed",
        description: "Failed to delete resume. Please try again.",
        variant: "destructive"
      });
    }
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
              accept=".pdf,.doc,.docx"
              onChange={handleFileUpload}
              className="hidden"
              id="resume-upload"
              disabled={isUploading}
            />
            <Button asChild variant="outline" disabled={isUploading}>
              <label htmlFor="resume-upload" className="cursor-pointer">
                {isUploading ? 'Uploading...' : 'Choose File'}
              </label>
            </Button>
          </div>
        ) : (
          <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              <div>
                <span className="text-sm font-medium">{uploadedResume.filename}</span>
                <p className="text-xs text-muted-foreground">
                  {(uploadedResume.file_size / 1024).toFixed(1)} KB • {uploadedResume.file_type.split('/')[1].toUpperCase()}
                </p>
              </div>
              <Badge variant="secondary">Ready</Badge>
            </div>
            <Button size="sm" variant="ghost" onClick={removeResume}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        )}
        
        <div className="text-xs text-muted-foreground">
          <p>• Bot will automatically skip resume upload for jobs marked "No Resume"</p>
          <p>• Supports PDF, DOC, DOCX formats, max 5MB</p>
        </div>
      </CardContent>
    </Card>
  );
};