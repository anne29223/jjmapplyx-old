import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Upload, FileText } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useSupabase } from '@/hooks/useSupabase';

export const ResumeUploadTest = () => {
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();
  const { supabase } = useSupabase();

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    console.log('File selected:', file);
    
    if (!file) {
      console.log('No file selected');
      return;
    }

    console.log('File details:', {
      name: file.name,
      type: file.type,
      size: file.size
    });

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
    console.log('Starting upload process...');

    try {
      // Convert file to base64
      const reader = new FileReader();
      reader.onload = async (e) => {
        const content = e.target?.result as string;
        const base64Content = content.split(',')[1]; // Remove data:application/pdf;base64, prefix

        console.log('File converted to base64, length:', base64Content.length);

        // Get current user
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          throw new Error('User not authenticated');
        }

        console.log('User authenticated:', user.id);

        // Deactivate all existing resumes first
        await supabase
          .from('user_resumes')
          .update({ is_active: false })
          .eq('user_id', user.id);

        console.log('Deactivated existing resumes');

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
          console.error('Database error:', error);
          throw error;
        }

        console.log('Resume saved to database:', data);
        toast({
          title: "Resume Uploaded",
          description: "Your resume has been uploaded successfully!",
        });
      };

      reader.readAsDataURL(file);
    } catch (error) {
      console.error('Error uploading resume:', error);
      toast({
        title: "Upload Failed",
        description: `Failed to upload resume: ${error.message}`,
        variant: "destructive"
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Resume Upload Test
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">
            This is a simplified test version to debug the upload issue.
          </p>
          <Input
            type="file"
            accept=".pdf,.doc,.docx"
            onChange={handleFileChange}
            disabled={isUploading}
          />
          <Button
            onClick={() => {
              const input = document.querySelector('input[type="file"]') as HTMLInputElement;
              input?.click();
            }}
            disabled={isUploading}
          >
            {isUploading ? 'Uploading...' : 'Choose File (Button)'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
