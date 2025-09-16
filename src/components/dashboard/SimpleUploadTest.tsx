import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useSupabase } from '@/hooks/useSupabase';
import { FileText, Trash2, Download } from 'lucide-react';

interface ResumeData {
  id: string;
  filename: string;
  content: string;
  file_type: string;
  file_size: number;
  uploaded_at: string;
  is_active: boolean;
}

export const SimpleUploadTest = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [currentResume, setCurrentResume] = useState<ResumeData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const { supabase } = useSupabase();

  // Load existing resume on component mount
  useEffect(() => {
    const loadCurrentResume = async () => {
      console.log('🔄 Loading current resume...');
      try {
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        console.log('👤 User check result:', { user: user?.id, error: userError });
        
        if (userError) {
          console.error('❌ User auth error:', userError);
          setIsLoading(false);
          return;
        }
        
        if (!user) {
          console.log('❌ No user found, skipping resume load');
          setIsLoading(false);
          return;
        }

        console.log('✅ User authenticated, loading resumes for user:', user.id);
        
        const { data, error } = await supabase
          .from('user_resumes')
          .select('*')
          .eq('user_id', user.id)
          .eq('is_active', true)
          .order('uploaded_at', { ascending: false })
          .limit(1)
          .single();

        console.log('📄 Resume query result:', { data, error });

        if (error && error.code !== 'PGRST116') {
          console.error('❌ Error loading resume:', error);
        } else if (data) {
          console.log('✅ Loaded existing resume:', data.filename);
          setCurrentResume(data);
        } else {
          console.log('ℹ️ No resume found for user');
        }
      } catch (error) {
        console.error('❌ Error loading resume:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadCurrentResume();
  }, [supabase]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    console.log('File selected:', file);
    
    if (file) {
      setSelectedFile(file);
      toast({
        title: "File Selected",
        description: `Selected: ${file.name} (${file.type}, ${file.size} bytes)`,
      });
    } else {
      setSelectedFile(null);
      toast({
        title: "No File",
        description: "No file selected",
        variant: "destructive"
      });
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      toast({
        title: "No File",
        description: "Please select a file first",
        variant: "destructive"
      });
      return;
    }

    // Validate file type
    const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (!allowedTypes.includes(selectedFile.type)) {
      toast({
        title: "Invalid File Type",
        description: "Please upload a PDF or Word document (.pdf, .doc, .docx)",
        variant: "destructive"
      });
      return;
    }

    // Validate file size (5MB limit)
    if (selectedFile.size > 5 * 1024 * 1024) {
      toast({
        title: "File Too Large",
        description: "Please upload a file smaller than 5MB",
        variant: "destructive"
      });
      return;
    }

    setIsUploading(true);

    try {
      console.log('🚀 Starting upload process...');
      
      // Check authentication first
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      console.log('👤 Auth check result:', { user: user?.id, error: authError });
      
      if (authError) {
        console.error('❌ Auth error:', authError);
        throw new Error(`Authentication error: ${authError.message}`);
      }
      
      if (!user) {
        console.error('❌ No user found');
        throw new Error('User not authenticated. Please sign in first.');
      }

      console.log('✅ User authenticated:', user.id);

      // Convert file to base64
      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          const content = e.target?.result as string;
          const base64Content = content.split(',')[1]; // Remove data:application/pdf;base64, prefix

          console.log('📄 File converted to base64, length:', base64Content.length);

          // Deactivate all existing resumes first
          console.log('🔄 Deactivating existing resumes...');
          const { error: deactivateError } = await supabase
            .from('user_resumes')
            .update({ is_active: false })
            .eq('user_id', user.id);

          if (deactivateError) {
            console.warn('⚠️ Warning deactivating existing resumes:', deactivateError);
            // Don't throw here, just log the warning
          } else {
            console.log('✅ Existing resumes deactivated');
          }

          // Save to database
          console.log('💾 Saving resume to database...');
          const resumeData = {
            user_id: user.id,
            filename: selectedFile.name,
            content: base64Content,
            file_type: selectedFile.type,
            file_size: selectedFile.size,
            is_active: true,
            uploaded_at: new Date().toISOString()
          };
          
          console.log('📝 Resume data to insert:', {
            user_id: resumeData.user_id,
            filename: resumeData.filename,
            file_type: resumeData.file_type,
            file_size: resumeData.file_size,
            content_length: resumeData.content.length
          });

          const { data, error } = await supabase
            .from('user_resumes')
            .insert(resumeData)
            .select()
            .single();

          console.log('💾 Database insert result:', { data, error });

          if (error) {
            console.error('❌ Database error:', error);
            throw error;
          }

          console.log('✅ Resume saved to database:', data);
          setCurrentResume(data);
          setSelectedFile(null); // Clear the selected file
          toast({
            title: "Resume Uploaded Successfully!",
            description: `Your resume "${selectedFile.name}" has been uploaded and is ready for auto-application.`,
          });
        } catch (innerError) {
          console.error('Error in file reader callback:', innerError);
          toast({
            title: "Upload Failed",
            description: `Failed to upload resume: ${innerError.message}`,
            variant: "destructive"
          });
        } finally {
          setIsUploading(false);
        }
      };

      reader.onerror = () => {
        console.error('FileReader error');
        toast({
          title: "File Read Error",
          description: "Failed to read the file. Please try again.",
          variant: "destructive"
        });
        setIsUploading(false);
      };

      reader.readAsDataURL(selectedFile);
    } catch (error) {
      console.error('Error uploading resume:', error);
      toast({
        title: "Upload Failed",
        description: `Failed to upload resume: ${error.message}`,
        variant: "destructive"
      });
      setIsUploading(false);
    }
  };

  const handleDeleteResume = async () => {
    if (!currentResume?.id) return;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('User not authenticated');
      }

      const { error } = await supabase
        .from('user_resumes')
        .delete()
        .eq('id', currentResume.id)
        .eq('user_id', user.id);

      if (error) throw error;

      setCurrentResume(null);
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
    if (!currentResume?.content) return;

    const link = document.createElement('a');
    link.href = `data:${currentResume.file_type};base64,${currentResume.content}`;
    link.download = currentResume.filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Resume Upload</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-center text-muted-foreground">Loading...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Resume Upload</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {currentResume ? (
          // Show current resume
          <div className="space-y-4">
            <div className="p-4 border rounded-lg bg-green-50">
              <div className="flex items-center gap-3 mb-3">
                <FileText className="h-8 w-8 text-green-600" />
                <div>
                  <p className="font-medium text-green-800">Current Resume</p>
                  <p className="text-sm text-green-600">Ready for auto-application</p>
                </div>
              </div>
              <div className="space-y-2">
                <p><strong>File:</strong> {currentResume.filename}</p>
                <p><strong>Type:</strong> {currentResume.file_type.split('/')[1].toUpperCase()}</p>
                <p><strong>Size:</strong> {(currentResume.file_size / 1024).toFixed(1)} KB</p>
                <p><strong>Uploaded:</strong> {new Date(currentResume.uploaded_at).toLocaleDateString()}</p>
              </div>
              <div className="flex gap-2 mt-4">
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
                  className="text-red-600 hover:text-red-700"
                >
                  <Trash2 className="h-4 w-4 mr-1" />
                  Delete
                </Button>
              </div>
            </div>
            
            <div className="border-t pt-4">
              <p className="text-sm text-muted-foreground mb-3">Upload a new resume to replace the current one:</p>
              <input
                type="file"
                accept=".pdf,.doc,.docx"
                onChange={handleFileChange}
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              />
              
              {selectedFile && (
                <div className="p-3 bg-gray-100 rounded mt-3">
                  <p><strong>New File:</strong> {selectedFile.name}</p>
                  <p><strong>Type:</strong> {selectedFile.type}</p>
                  <p><strong>Size:</strong> {selectedFile.size} bytes</p>
                </div>
              )}
              
              <Button 
                onClick={handleUpload} 
                disabled={!selectedFile || isUploading}
                className="mt-3"
              >
                {isUploading ? 'Uploading...' : 'Replace Resume'}
              </Button>
            </div>
          </div>
        ) : (
          // Show upload form when no resume
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Upload your resume in PDF or Word format. This will be used for automatic job applications.
            </p>
            
            <input
              type="file"
              accept=".pdf,.doc,.docx"
              onChange={handleFileChange}
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />
            
            {selectedFile && (
              <div className="p-3 bg-gray-100 rounded">
                <p><strong>Selected File:</strong> {selectedFile.name}</p>
                <p><strong>Type:</strong> {selectedFile.type}</p>
                <p><strong>Size:</strong> {selectedFile.size} bytes</p>
              </div>
            )}
            
            <Button onClick={handleUpload} disabled={!selectedFile || isUploading}>
              {isUploading ? 'Uploading...' : 'Upload Resume'}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
