import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useSupabase } from '@/hooks/useSupabase';

export const SimpleUpload = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState<string>('');
  const { toast } = useToast();
  const { supabase } = useSupabase();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    console.log('File selected:', file);
    setSelectedFile(file);
    setUploadResult('');
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

    setIsUploading(true);
    setUploadResult('Starting upload...');

    try {
      console.log('🚀 Starting simple upload...');
      setUploadResult('🚀 Starting upload process...');
      
      // Step 1: Check auth
      setUploadResult('📡 Checking authentication...');
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      console.log('Auth check result:', { user: user?.id, error: authError });
      
      if (authError) {
        console.error('Auth error:', authError);
        setUploadResult(`❌ Auth error: ${authError.message}`);
        throw new Error(`Auth error: ${authError.message}`);
      }
      
      if (!user) {
        setUploadResult('🔐 No user found, signing in anonymously...');
        console.log('Attempting anonymous sign in...');
        
        const { data: signInData, error: signInError } = await supabase.auth.signInAnonymously();
        
        console.log('Sign in result:', { data: signInData, error: signInError });
        
        if (signInError) {
          console.error('Sign in error:', signInError);
          setUploadResult(`❌ Sign in error: ${signInError.message}`);
          throw new Error(`Sign in error: ${signInError.message}`);
        }
        
        console.log('✅ Signed in anonymously:', signInData.user?.id);
        setUploadResult(`✅ Signed in successfully! User: ${signInData.user?.id.substring(0, 8)}...`);
      } else {
        console.log('✅ User found:', user.id);
        setUploadResult(`✅ User authenticated! User: ${user.id.substring(0, 8)}...`);
      }

      // Step 2: Convert file to base64
      setUploadResult('📄 Converting file to base64...');
      const reader = new FileReader();
      
      reader.onload = async (e) => {
        try {
          const content = e.target?.result as string;
          const base64Content = content.split(',')[1];
          
          console.log('📄 File converted, length:', base64Content.length);
          setUploadResult('✅ File converted successfully!');

          // Step 3: Get current user (after potential sign in)
          setUploadResult('👤 Getting current user...');
          const { data: { user: currentUser }, error: userError } = await supabase.auth.getUser();
          
          console.log('Current user check:', { user: currentUser?.id, error: userError });
          
          if (userError) {
            throw new Error(`User check error: ${userError.message}`);
          }
          
          if (!currentUser) {
            throw new Error('No user after sign in');
          }
          
          setUploadResult(`✅ User confirmed: ${currentUser.id.substring(0, 8)}...`);

          // Step 4: Save to database
          setUploadResult('💾 Saving to database...');
          const resumeData = {
            user_id: currentUser.id,
            filename: selectedFile.name,
            content: base64Content,
            file_type: selectedFile.type,
            file_size: selectedFile.size,
            is_active: true,
            uploaded_at: new Date().toISOString()
          };

          console.log('💾 Saving resume data:', {
            user_id: resumeData.user_id,
            filename: resumeData.filename,
            file_type: resumeData.file_type,
            file_size: resumeData.file_size
          });

          const { data, error } = await supabase
            .from('user_resumes')
            .insert(resumeData)
            .select()
            .single();

          console.log('Database insert result:', { data, error });

          if (error) {
            console.error('❌ Database error:', error);
            setUploadResult(`❌ Database error: ${error.message}`);
            throw new Error(`Database error: ${error.message}`);
          }

          console.log('✅ Resume saved:', data);
          setUploadResult('🎉 Resume uploaded successfully!');
          
          toast({
            title: "Success!",
            description: `Resume "${selectedFile.name}" uploaded successfully!`,
          });

          // Clear the file input
          setSelectedFile(null);
          const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
          if (fileInput) fileInput.value = '';

        } catch (innerError) {
          console.error('❌ Error in file reader:', innerError);
          setUploadResult(`❌ Error: ${innerError.message}`);
          toast({
            title: "Upload Failed",
            description: innerError.message,
            variant: "destructive"
          });
        } finally {
          setIsUploading(false);
        }
      };

      reader.onerror = (error) => {
        console.error('FileReader error:', error);
        setUploadResult('❌ Error reading file');
        toast({
          title: "File Read Error",
          description: "Failed to read the file. Please try again.",
          variant: "destructive"
        });
        setIsUploading(false);
      };

      setUploadResult('📖 Reading file...');
      reader.readAsDataURL(selectedFile);

    } catch (error) {
      console.error('❌ Upload error:', error);
      const errorMessage = error instanceof Error ? error.message : String(error);
      setUploadResult(`❌ Upload failed: ${errorMessage}`);
      toast({
        title: "Upload Failed",
        description: errorMessage,
        variant: "destructive"
      });
      setIsUploading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Simple Resume Upload</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-3">
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
              <p><strong>Size:</strong> {selectedFile.size} bytes</p>
            </div>
          )}
          
          <Button 
            onClick={handleUpload} 
            disabled={!selectedFile || isUploading}
            className="w-full"
          >
            {isUploading ? 'Uploading...' : 'Upload Resume'}
          </Button>
          
          {uploadResult && (
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg text-sm">
              <div className="font-medium text-blue-800 mb-2">Upload Status:</div>
              <pre className="whitespace-pre-wrap text-blue-700">{uploadResult}</pre>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
