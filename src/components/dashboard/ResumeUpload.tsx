import { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Upload, FileText, Trash2, Download, CheckCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useSupabase } from '@/hooks/useSupabase';

interface ResumeData {
  id?: string;
  filename: string;
  content: string;
  file_type: string;
  file_size: number;
  uploaded_at: string;
  is_active: boolean;
}

export const ResumeUpload = () => {
  const [resume, setResume] = useState<ResumeData | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
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
          setResume(data);
        }
      } catch (error) {
        console.error('Error loading resume:', error);
      }
    };

    loadActiveResume();
  }, [supabase]);

  const handleFileSelect = async (file: File) => {
    console.log('handleFileSelect called with file:', file.name, file.type, file.size);
    if (!file) {
      console.log('No file provided to handleFileSelect');
      return;
    }

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

        setResume(data);
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

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    
    console.log('File dropped:', e.dataTransfer.files);
    const files = e.dataTransfer.files;
    if (files && files[0]) {
      console.log('File dropped:', files[0].name, files[0].type, files[0].size);
      handleFileSelect(files[0]);
    } else {
      console.log('No file dropped');
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    console.log('File input changed:', e.target.files);
    const files = e.target.files;
    if (files && files[0]) {
      console.log('File selected:', files[0].name, files[0].type, files[0].size);
      handleFileSelect(files[0]);
    } else {
      console.log('No file selected');
    }
  };

  const handleDeleteResume = async () => {
    if (!resume?.id) return;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('User not authenticated');
      }

      const { error } = await supabase
        .from('user_resumes')
        .delete()
        .eq('id', resume.id)
        .eq('user_id', user.id);

      if (error) throw error;

      setResume(null);
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

  const handleDownloadResume = () => {
    if (!resume?.content) return;

    const link = document.createElement('a');
    link.href = `data:${resume.file_type};base64,${resume.content}`;
    link.download = resume.filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold">Resume Management</h2>
        <p className="text-muted-foreground">
          Upload your resume for automatic job applications
        </p>
      </div>

      {!resume ? (
        <Card>
          <CardHeader>
            <CardTitle>Upload Resume</CardTitle>
            <CardDescription>
              Upload your resume in PDF or Word format. This will be used for automatic job applications.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div
              className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer ${
                dragActive
                  ? 'border-primary bg-primary/5'
                  : 'border-muted-foreground/25 hover:border-primary/50'
              }`}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onClick={() => {
                console.log('Drag area clicked, fileInputRef:', fileInputRef.current);
                fileInputRef.current?.click();
              }}
            >
              <Upload className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <div className="space-y-2">
                <p className="text-lg font-medium">
                  {dragActive ? 'Drop your resume here' : 'Drag and drop your resume'}
                </p>
                <p className="text-sm text-muted-foreground">
                  or click to browse files
                </p>
                <p className="text-xs text-muted-foreground">
                  Supports PDF, DOC, DOCX (max 5MB)
                </p>
              </div>
              <div className="space-y-4">
                <Button
                  className="mt-4"
                  onClick={() => {
                    console.log('Button clicked, fileInputRef:', fileInputRef.current);
                    fileInputRef.current?.click();
                  }}
                  disabled={isUploading}
                >
                  {isUploading ? 'Uploading...' : 'Choose File'}
                </Button>
                
                {/* Direct file input - always visible for testing */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Or select file directly:</label>
                  <Input
                    type="file"
                    accept=".pdf,.doc,.docx"
                    onChange={handleFileInputChange}
                    className="w-full"
                    disabled={isUploading}
                  />
                </div>
                
                <Input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,.doc,.docx"
                  onChange={handleFileInputChange}
                  className="hidden"
                  id="resume-file-input"
                />
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Current Resume
                </CardTitle>
                <CardDescription>
                  Your resume is ready for automatic job applications
                </CardDescription>
              </div>
              <Badge variant="secondary" className="flex items-center gap-1">
                <CheckCircle className="h-3 w-3" />
                Active
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center gap-3">
                <FileText className="h-8 w-8 text-primary" />
                <div>
                  <p className="font-medium">{resume.filename}</p>
                  <p className="text-sm text-muted-foreground">
                    {(resume.file_size / 1024).toFixed(1)} KB • {resume.file_type.split('/')[1].toUpperCase()}
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleDownloadResume}
                >
                  <Download className="h-4 w-4 mr-1" />
                  Download
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleDeleteResume}
                >
                  <Trash2 className="h-4 w-4 mr-1" />
                  Delete
                </Button>
              </div>
            </div>

            <div className="p-4 bg-muted/50 rounded-lg">
              <h4 className="font-medium mb-2">Auto-Application Status</h4>
              <p className="text-sm text-muted-foreground">
                Your resume is ready to be automatically sent to job applications. 
                When you click "Apply" on any job in the scraped jobs list, your resume will be attached automatically.
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

