import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useSupabase } from '@/hooks/useSupabase';
import { useToast } from '@/hooks/use-toast';

export const ResumeUpload = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [currentResume, setCurrentResume] = useState<any>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { supabase } = useSupabase();
  const { toast } = useToast();

  // Load existing resume on component mount
  useEffect(() => {
    const loadExistingResume = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          // Sign in anonymously if no user
          const { data: signInData, error: signInError } = await supabase.auth.signInAnonymously();
          if (signInError) {
            console.error('Error signing in:', signInError);
            return;
          }
        }

        // Get current user (after potential sign in)
        const { data: { user: currentUser } } = await supabase.auth.getUser();
        if (!currentUser) return;

        const { data, error } = await supabase
          .from('user_resumes')
          .select('*')
          .eq('user_id', currentUser.id)
          .eq('is_active', true)
          .order('uploaded_at', { ascending: false })
          .limit(1)
          .single();

        if (error && error.code !== 'PGRST116') {
          console.error('Error loading resume:', error);
        } else if (data) {
          setCurrentResume(data);
        }
      } catch (error) {
        console.error('Error loading resume:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadExistingResume();
  }, [supabase]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
    // Validate file type
    const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (!allowedTypes.includes(file.type)) {
      toast({
          title: "Invalid file type",
          description: "Please upload a PDF, DOC, or DOCX file.",
          variant: "destructive",
      });
      return;
    }

      // Validate file size (10MB limit)
      if (file.size > 10 * 1024 * 1024) {
      toast({
          title: "File too large",
          description: "Please upload a file smaller than 10MB.",
          variant: "destructive",
      });
      return;
    }

      setSelectedFile(file);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    setIsUploading(true);

    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "Authentication error",
          description: "Please refresh the page and try again.",
          variant: "destructive",
        });
        return;
      }

      // Convert file to base64
      const reader = new FileReader();
      
      reader.onload = async (e) => {
        try {
        const content = e.target?.result as string;
          const base64Content = content.split(',')[1];
          
          // Deactivate existing resumes
        await supabase
          .from('user_resumes')
          .update({ is_active: false })
          .eq('user_id', user.id);

          // Insert new resume
        const { data, error } = await supabase
          .from('user_resumes')
          .insert({
            user_id: user.id,
              filename: selectedFile.name,
            content: base64Content,
              file_type: selectedFile.type,
              file_size: selectedFile.size,
            is_active: true,
            uploaded_at: new Date().toISOString()
          })
          .select()
          .single();

        if (error) {
          throw error;
        }

          setCurrentResume(data);
          setSelectedFile(null);
          
          // Clear file input
          const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
          if (fileInput) fileInput.value = '';

          toast({
            title: "Resume uploaded successfully!",
            description: `${selectedFile.name} has been saved.`,
          });

        } catch (error) {
          console.error('Upload error:', error);
          toast({
            title: "Upload failed",
            description: "There was an error uploading your resume. Please try again.",
            variant: "destructive",
          });
        } finally {
          setIsUploading(false);
        }
      };

      reader.onerror = () => {
        toast({
          title: "File read error",
          description: "There was an error reading your file. Please try again.",
          variant: "destructive",
        });
        setIsUploading(false);
      };

      reader.readAsDataURL(selectedFile);
      
    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: "Upload failed",
        description: "There was an error uploading your resume. Please try again.",
        variant: "destructive",
      });
      setIsUploading(false);
    }
  };

  const handleDeleteResume = async () => {
    if (!currentResume) return;

    try {
      const { error } = await supabase
        .from('user_resumes')
        .delete()
        .eq('id', currentResume.id);

      if (error) {
        throw error;
      }

      setCurrentResume(null);
      toast({
        title: "Resume deleted",
        description: "Your resume has been removed.",
      });

    } catch (error) {
      console.error('Delete error:', error);
      toast({
        title: "Delete failed",
        description: "There was an error deleting your resume. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleDownloadResume = () => {
    if (!currentResume) return;

    try {
    const link = document.createElement('a');
      link.href = `data:${currentResume.file_type};base64,${currentResume.content}`;
      link.download = currentResume.filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    } catch (error) {
      console.error('Download error:', error);
      toast({
        title: "Download failed",
        description: "There was an error downloading your resume.",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
  return (
      <Card className="mb-4">
          <CardHeader>
          <CardTitle className="text-sm">Resume Upload</CardTitle>
          </CardHeader>
          <CardContent>
          <div className="text-center py-4">
            <div className="text-sm text-gray-500">Loading...</div>
            </div>
          </CardContent>
        </Card>
    );
  }

  return (
    <Card className="mb-4">
          <CardHeader>
        <CardTitle className="text-sm">Resume Upload</CardTitle>
          </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Current Resume Display */}
          {currentResume ? (
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="font-medium text-green-800 mb-2">✅ Current Resume:</div>
              <div className="text-sm text-green-700 mb-3">
                <p><strong>File:</strong> {currentResume.filename}</p>
                <p><strong>Type:</strong> {currentResume.file_type}</p>
                <p><strong>Size:</strong> {(currentResume.file_size / 1024).toFixed(1)} KB</p>
                <p><strong>Uploaded:</strong> {new Date(currentResume.uploaded_at).toLocaleString()}</p>
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={handleDownloadResume} 
                  size="sm" 
                  variant="outline"
                >
                  Download
                </Button>
                <Button
                  onClick={handleDeleteResume} 
                  size="sm"
                  variant="destructive"
                >
                  Delete
                </Button>
              </div>
            </div>
          ) : (
            <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
              <div className="text-sm text-gray-600 mb-3">No resume uploaded yet</div>
            </div>
          )}

          {/* File Selection */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Select Resume File:</label>
            <input
              type="file"
              accept=".pdf,.doc,.docx"
              onChange={handleFileChange}
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />
            {selectedFile && (
              <div className="p-3 bg-gray-100 rounded">
                <p><strong>Selected:</strong> {selectedFile.name}</p>
                <p><strong>Type:</strong> {selectedFile.type}</p>
                <p><strong>Size:</strong> {(selectedFile.size / 1024).toFixed(1)} KB</p>
              </div>
            )}
          </div>

          {/* Upload Button */}
          <Button 
            onClick={handleUpload} 
            disabled={!selectedFile || isUploading} 
            className="w-full"
          >
            {isUploading ? 'Uploading...' : 'Upload Resume'}
          </Button>
            </div>
          </CardContent>
        </Card>
  );
};
