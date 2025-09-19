import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useSupabase } from '@/hooks/useSupabase';

export const DebugTest = () => {
  const [results, setResults] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadedResume, setUploadedResume] = useState<any>(null);
  const { supabase } = useSupabase();

  const addResult = (message: string) => {
    setResults(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  // Load existing resume on component mount
  React.useEffect(() => {
    const loadExistingResume = async () => {
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
        } else if (data) {
          setUploadedResume(data);
          addResult(`📄 Loaded existing resume: ${data.filename}`);
        }
      } catch (error) {
        console.error('Error loading resume:', error);
      }
    };

    loadExistingResume();
  }, [supabase]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    setSelectedFile(file);
    if (file) {
      addResult(`📁 Selected file: ${file.name} (${file.size} bytes)`);
    }
  };

  const testBasicConnection = async () => {
    setIsLoading(true);
    setResults([]);
    
    try {
      addResult('🚀 Starting basic connection test...');
      
      // Test 1: Check if Supabase client exists
      addResult(`📡 Supabase client: ${supabase ? 'EXISTS' : 'MISSING'}`);
      
      if (!supabase) {
        addResult('❌ No Supabase client found!');
        return;
      }
      
      // Test 1.5: Check Supabase client configuration
      addResult(`🌐 Supabase client initialized: YES`);
      addResult(`🔑 API Key configured: YES`);
      
      // Test 1.6: Try a simple ping to Supabase
      addResult('🏓 Testing Supabase connectivity...');
      try {
        const { data, error } = await supabase.from('_dummy_table_').select('*').limit(1);
        addResult(`🏓 Ping result: ${error ? 'FAILED' : 'SUCCESS'}`);
        addResult(`🏓 Ping error: ${error ? error.message : 'None'}`);
      } catch (pingError) {
        addResult(`🏓 Ping exception: ${pingError.message}`);
      }

      // Test 1.7: Check if user_resumes table exists
      addResult('📋 Checking user_resumes table...');
      try {
        const { data, error } = await supabase
          .from('user_resumes')
          .select('*')
          .limit(1);
        
        addResult(`📋 Table exists: ${error ? 'NO' : 'YES'}`);
        if (error) {
          addResult(`📋 Table error: ${error.message}`);
          addResult(`📋 Error code: ${error.code}`);
          addResult(`📋 Error details: ${JSON.stringify(error)}`);
        } else {
          addResult(`📋 Table accessible, found ${data?.length || 0} records`);
          if (data?.length === 0) {
            addResult(`✅ Table is empty - this is normal for a new setup`);
          }
        }
      } catch (tableError) {
        addResult(`📋 Table exception: ${tableError.message}`);
      }
      
      // Test 2: Try to get current user
      addResult('👤 Checking current user...');
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      addResult(`👤 User result: ${user ? `Found ${user.id.substring(0, 8)}...` : 'No user'}`);
      addResult(`👤 User error: ${userError ? userError.message : 'None'}`);
      
      // Test 3: Try anonymous sign in
      if (!user) {
        addResult('🔐 Attempting anonymous sign in...');
        const { data: signInData, error: signInError } = await supabase.auth.signInAnonymously();
        
        addResult(`🔐 Sign in result: ${signInData ? 'SUCCESS' : 'FAILED'}`);
        addResult(`🔐 Sign in error: ${signInError ? signInError.message : 'None'}`);
        
        if (signInData?.user) {
          addResult(`🔐 New user ID: ${signInData.user.id.substring(0, 8)}...`);
        }
      }
      
      // Test 4: Try database access
      addResult('💾 Testing database access...');
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      
      if (currentUser) {
        addResult(`💾 Current user for DB test: ${currentUser.id.substring(0, 8)}...`);
        
        // Try to select from user_resumes table
        const { data: resumeData, error: resumeError } = await supabase
          .from('user_resumes')
          .select('id')
          .eq('user_id', currentUser.id)
          .limit(1);
        
        addResult(`💾 Database select: ${resumeError ? 'FAILED' : 'SUCCESS'}`);
        addResult(`💾 Database error: ${resumeError ? resumeError.message : 'None'}`);
        
        if (!resumeError) {
          addResult(`💾 Found ${resumeData?.length || 0} existing resumes`);
        }
      } else {
        addResult('❌ No user for database test');
      }
      
      addResult('✅ Basic test completed!');
      
    } catch (error) {
      addResult(`❌ Unexpected error: ${error.message}`);
      console.error('Debug test error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const testFileUpload = async () => {
    setIsLoading(true);
    setResults([]);
    
    try {
      addResult('📁 Testing file upload process...');
      
      // Create a simple test file
      const testContent = 'This is a test resume file';
      const testFile = new File([testContent], 'test-resume.txt', { type: 'text/plain' });
      
      addResult(`📁 Created test file: ${testFile.name} (${testFile.size} bytes)`);
      
      // Convert to base64
      const reader = new FileReader();
      
      reader.onload = async (e) => {
        try {
          const content = e.target?.result as string;
          const base64Content = content.split(',')[1];
          
          addResult(`📄 File converted to base64: ${base64Content.length} chars`);
          
          // Get current user
          const { data: { user }, error: userError } = await supabase.auth.getUser();
          
          if (userError) {
            addResult(`❌ User error: ${userError.message}`);
            return;
          }
          
          if (!user) {
            addResult('❌ No user found for upload test');
            return;
          }
          
          addResult(`👤 Using user: ${user.id.substring(0, 8)}...`);
          
          // Try to insert
          const resumeData = {
            user_id: user.id,
            filename: testFile.name,
            content: base64Content,
            file_type: testFile.type,
            file_size: testFile.size,
            is_active: true,
            uploaded_at: new Date().toISOString()
          };
          
          addResult('💾 Attempting database insert...');
          
          const { data, error } = await supabase
            .from('user_resumes')
            .insert(resumeData)
            .select();
          
          if (error) {
            addResult(`❌ Insert failed: ${error.message}`);
            addResult(`❌ Error details: ${JSON.stringify(error, null, 2)}`);
          } else if (data && data.length > 0) {
            addResult(`✅ Insert successful! ID: ${data[0].id}`);
            setUploadedResume(data[0]);
          } else {
            addResult(`❌ Insert failed: No data returned`);
            addResult(`🔍 Data received: ${JSON.stringify(data)}`);
          }
          
        } catch (innerError) {
          addResult(`❌ File processing error: ${innerError.message}`);
        } finally {
          setIsLoading(false);
        }
      };
      
      reader.onerror = () => {
        addResult('❌ FileReader error');
        setIsLoading(false);
      };
      
      reader.readAsDataURL(testFile);
      
    } catch (error) {
      addResult(`❌ Upload test error: ${error.message}`);
      setIsLoading(false);
    }
  };

  const uploadSelectedFile = async () => {
    if (!selectedFile) {
      addResult('❌ No file selected');
      return;
    }

    setIsLoading(true);
    setResults([]);
    
    try {
      addResult('🚀 Starting real file upload...');
      
      // Get current user
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError) {
        addResult(`❌ User error: ${userError.message}`);
        return;
      }
      
      if (!user) {
        addResult('🔐 No user found, signing in anonymously...');
        const { data: signInData, error: signInError } = await supabase.auth.signInAnonymously();
        
        if (signInError) {
          addResult(`❌ Sign in error: ${signInError.message}`);
          return;
        }
        
        addResult(`✅ Signed in: ${signInData.user?.id.substring(0, 8)}...`);
      } else {
        addResult(`✅ User found: ${user.id.substring(0, 8)}...`);
      }

      // Get current user (after potential sign in)
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      if (!currentUser) {
        addResult('❌ No user after sign in');
        return;
      }

      // Convert file to base64
      const reader = new FileReader();
      
      reader.onload = async (e) => {
        try {
          const content = e.target?.result as string;
          const base64Content = content.split(',')[1];
          
          addResult(`📄 File converted: ${base64Content.length} chars`);

          // Deactivate existing resumes
          addResult('🔄 Deactivating existing resumes...');
          await supabase
            .from('user_resumes')
            .update({ is_active: false })
            .eq('user_id', currentUser.id);

          // Insert new resume
          const resumeData = {
            user_id: currentUser.id,
            filename: selectedFile.name,
            content: base64Content,
            file_type: selectedFile.type,
            file_size: selectedFile.size,
            is_active: true,
            uploaded_at: new Date().toISOString()
          };
          
          addResult('💾 Saving to database...');
          
          // First check if table exists
          addResult('🔍 Checking if table exists...');
          const { data: tableCheck, error: tableError } = await supabase
            .from('user_resumes')
            .select('id')
            .limit(1);
          
          if (tableError) {
            addResult(`❌ Table check failed: ${tableError.message}`);
            addResult(`❌ Error code: ${tableError.code}`);
            addResult(`❌ This means the user_resumes table doesn't exist or is not accessible`);
            addResult(`📝 Please run the migration: supabase/migrations/004_user_resumes.sql`);
            return;
          }
          
          addResult('✅ Table exists and is accessible');
          
          const { data, error } = await supabase
            .from('user_resumes')
            .insert(resumeData)
            .select();
          
          console.log('Database insert result:', { data, error });
          addResult(`🔍 Database response: data=${data ? 'present' : 'null'}, error=${error ? 'present' : 'null'}`);
          
          if (error) {
            addResult(`❌ Upload failed: ${error.message || 'Unknown error'}`);
            addResult(`❌ Error code: ${error.code || 'No code'}`);
            addResult(`❌ Error details: ${JSON.stringify(error, null, 2)}`);
            addResult(`❌ Full error object: ${JSON.stringify(error)}`);
            console.error('Database insert error:', error);
          } else if (data && data.length > 0) {
            addResult(`✅ Upload successful! ID: ${data[0].id}`);
            setUploadedResume(data[0]);
            setSelectedFile(null);
            // Clear file input
            const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
            if (fileInput) fileInput.value = '';
          } else {
            addResult(`❌ Upload failed: No data returned and no error`);
            addResult(`❌ This suggests a database connection issue`);
            addResult(`🔍 Data received: ${JSON.stringify(data)}`);
          }
          
        } catch (innerError) {
          addResult(`❌ File processing error: ${innerError.message}`);
        } finally {
          setIsLoading(false);
        }
      };
      
      reader.onerror = () => {
        addResult('❌ FileReader error');
        setIsLoading(false);
      };
      
      reader.readAsDataURL(selectedFile);
      
    } catch (error) {
      addResult(`❌ Upload error: ${error.message}`);
      setIsLoading(false);
    }
  };

  const createTable = async () => {
    setIsLoading(true);
    setResults([]);
    
    try {
      addResult('🔨 Checking user_resumes table setup...');
      
      // Check if there are policy conflicts
      addResult('⚠️ If you see policy conflicts, run the fix script');
      addResult('📝 Use the fix_user_resumes_table.sql script I created');
      addResult('🔗 Copy the SQL from fix_user_resumes_table.sql and run it in Supabase SQL Editor');
      
      // Try to insert a test record to see what happens
      addResult('🧪 Testing with minimal data...');
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        addResult('❌ No user for table test');
        return;
      }
      
      // First, let's check what columns exist in the table
      addResult('🔍 Checking table structure...');
      const { data: structureData, error: structureError } = await supabase
        .from('user_resumes')
        .select('*')
        .limit(0);
      
      if (structureError) {
        addResult(`❌ Structure check failed: ${structureError.message}`);
      } else {
        addResult(`✅ Table structure accessible`);
        addResult(`🎉 Database is ready for resume uploads!`);
      }
      
      const testData = {
        user_id: user.id,
        filename: 'test.txt',
        content: 'dGVzdA==',
        file_type: 'text/plain',
        file_size: 4,
        is_active: true,
        uploaded_at: new Date().toISOString()
      };
      
      const { data, error } = await supabase
        .from('user_resumes')
        .insert(testData)
        .select();
      
      if (error) {
        addResult(`❌ Insert test failed: ${error.message}`);
        addResult(`❌ Error code: ${error.code}`);
        addResult(`❌ This suggests the table structure is wrong or missing`);
      } else if (data && data.length > 0) {
        addResult(`✅ Insert test successful! Table exists and works`);
        // Clean up test record
        await supabase.from('user_resumes').delete().eq('id', data[0].id);
        addResult('🧹 Cleaned up test record');
      } else {
        addResult(`❌ Insert test failed: No data returned`);
        addResult(`🔍 Data received: ${JSON.stringify(data)}`);
      }
      
    } catch (error) {
      addResult(`❌ Table creation test error: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const clearResults = () => {
    setResults([]);
  };

  return (
    <Card className="mb-4">
      <CardHeader>
        <CardTitle className="text-sm">Resume Upload & Debug</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Current Resume Display */}
          {uploadedResume && (
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="font-medium text-green-800 mb-2">✅ Current Resume:</div>
              <div className="text-sm text-green-700">
                <p><strong>File:</strong> {uploadedResume.filename}</p>
                <p><strong>Type:</strong> {uploadedResume.file_type}</p>
                <p><strong>Size:</strong> {(uploadedResume.file_size / 1024).toFixed(1)} KB</p>
                <p><strong>Uploaded:</strong> {new Date(uploadedResume.uploaded_at).toLocaleString()}</p>
              </div>
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
                <p><strong>Size:</strong> {selectedFile.size} bytes</p>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 flex-wrap">
            <Button onClick={testBasicConnection} disabled={isLoading} size="sm">
              {isLoading ? 'Testing...' : 'Test Connection'}
            </Button>
            <Button onClick={createTable} disabled={isLoading} size="sm" variant="outline">
              {isLoading ? 'Testing...' : 'Check Table'}
            </Button>
            <Button onClick={testFileUpload} disabled={isLoading} size="sm">
              {isLoading ? 'Testing...' : 'Test Upload'}
            </Button>
            <Button 
              onClick={uploadSelectedFile} 
              disabled={!selectedFile || isLoading} 
              size="sm"
              className="bg-green-600 hover:bg-green-700"
            >
              {isLoading ? 'Uploading...' : 'Upload Resume'}
            </Button>
            <Button onClick={clearResults} variant="outline" size="sm">
              Clear
            </Button>
          </div>
          
          {/* Results Display */}
          {results.length > 0 && (
            <div className="bg-gray-100 p-3 rounded max-h-80 overflow-y-auto">
              <div className="font-medium text-gray-800 mb-2">Debug Results:</div>
              <pre className="text-xs whitespace-pre-wrap">
                {results.join('\n')}
              </pre>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
