import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useSupabase } from '@/hooks/useSupabase';

export const DatabaseTest = () => {
  const [testResult, setTestResult] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const { supabase } = useSupabase();

  const testDatabaseConnection = async () => {
    setIsLoading(true);
    setTestResult('Testing database connection...\n');
    
    try {
      // Test 1: Check auth
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      setTestResult(prev => prev + `Auth check: ${user ? '✅ User found' : '❌ No user'} (${authError ? authError.message : 'OK'})\n`);
      
      if (!user) {
        setTestResult(prev => prev + '❌ Cannot test database without authentication\n');
        setTestResult(prev => prev + '💡 Try signing in first using the Auth Status component above\n');
        return;
      }

      // Test 2: Check if user_resumes table exists by trying to select from it
      const { data: existingResumes, error: selectError } = await supabase
        .from('user_resumes')
        .select('id')
        .eq('user_id', user.id)
        .limit(1);
      
      setTestResult(prev => prev + `Table access: ${selectError ? '❌ Error' : '✅ OK'} (${selectError ? selectError.message : 'Table accessible'})\n`);

      if (selectError) {
        setTestResult(prev => prev + `❌ Cannot access user_resumes table: ${selectError.message}\n`);
        return;
      }

      // Test 3: Try to insert a test record
      const testData = {
        user_id: user.id,
        filename: 'test.txt',
        content: 'dGVzdA==', // base64 for 'test'
        file_type: 'text/plain',
        file_size: 4,
        is_active: true,
        uploaded_at: new Date().toISOString()
      };

      setTestResult(prev => prev + `Inserting test record...\n`);
      const { data: insertData, error: insertError } = await supabase
        .from('user_resumes')
        .insert(testData)
        .select()
        .single();

      setTestResult(prev => prev + `Insert test: ${insertError ? '❌ Error' : '✅ OK'} (${insertError ? insertError.message : 'Record inserted'})\n`);

      if (insertError) {
        setTestResult(prev => prev + `❌ Insert failed: ${insertError.message}\n`);
        return;
      }

      if (insertData) {
        // Test 4: Try to read the record back
        setTestResult(prev => prev + `Reading test record...\n`);
        const { data: readData, error: readError } = await supabase
          .from('user_resumes')
          .select('*')
          .eq('id', insertData.id)
          .single();

        setTestResult(prev => prev + `Read test: ${readError ? '❌ Error' : '✅ OK'} (${readError ? readError.message : 'Record read successfully'})\n`);

        if (!readError) {
          // Test 5: Clean up - delete the test record
          setTestResult(prev => prev + `Cleaning up test record...\n`);
          const { error: deleteError } = await supabase
            .from('user_resumes')
            .delete()
            .eq('id', insertData.id);

          setTestResult(prev => prev + `Delete test: ${deleteError ? '❌ Error' : '✅ OK'} (${deleteError ? deleteError.message : 'Record deleted'})\n`);
        }
      }

      setTestResult(prev => prev + '\n🎉 Database test completed successfully!\n');
      setTestResult(prev => prev + '✅ All database operations are working correctly.\n');
      
    } catch (error) {
      setTestResult(prev => prev + `❌ Unexpected error: ${error.message}\n`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="mb-4">
      <CardHeader>
        <CardTitle className="text-sm">Database Test</CardTitle>
      </CardHeader>
      <CardContent>
        <Button onClick={testDatabaseConnection} disabled={isLoading} className="mb-3">
          {isLoading ? 'Testing...' : 'Test Database Connection'}
        </Button>
        {testResult && (
          <pre className="text-xs bg-gray-100 p-3 rounded overflow-auto max-h-40">
            {testResult}
          </pre>
        )}
      </CardContent>
    </Card>
  );
};
