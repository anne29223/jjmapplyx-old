import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useSupabase } from '@/hooks/useSupabase';

export const SimpleTest = () => {
  const [testResults, setTestResults] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { supabase } = useSupabase();

  const addResult = (message: string) => {
    setTestResults(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  const runBasicTest = async () => {
    setIsLoading(true);
    setTestResults([]);
    
    try {
      addResult('🚀 Starting basic Supabase test...');
      
      // Test 1: Basic connection
      addResult('📡 Testing basic connection...');
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      addResult(`👤 User check: ${user ? `Found user ${user.id.substring(0, 8)}...` : 'No user'} (Error: ${userError?.message || 'None'})`);
      
      // Test 2: Try to sign in anonymously
      if (!user) {
        addResult('🔐 Attempting anonymous sign in...');
        const { data: signInData, error: signInError } = await supabase.auth.signInAnonymously();
        if (signInError) {
          addResult(`❌ Sign in failed: ${signInError.message}`);
        } else {
          addResult(`✅ Signed in anonymously: ${signInData.user?.id.substring(0, 8)}...`);
        }
      }
      
      // Test 3: Test database access
      addResult('💾 Testing database access...');
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      if (currentUser) {
        const { data, error } = await supabase
          .from('user_resumes')
          .select('count')
          .limit(1);
        
        if (error) {
          addResult(`❌ Database error: ${error.message}`);
        } else {
          addResult('✅ Database connection successful');
        }
      } else {
        addResult('❌ No user for database test');
      }
      
      addResult('🎉 Basic test completed!');
      
    } catch (error) {
      addResult(`❌ Unexpected error: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const clearResults = () => {
    setTestResults([]);
  };

  return (
    <Card className="mb-4">
      <CardHeader>
        <CardTitle className="text-sm">Basic Supabase Test</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="flex gap-2">
            <Button onClick={runBasicTest} disabled={isLoading} size="sm">
              {isLoading ? 'Testing...' : 'Run Basic Test'}
            </Button>
            <Button onClick={clearResults} variant="outline" size="sm">
              Clear
            </Button>
          </div>
          
          {testResults.length > 0 && (
            <div className="bg-gray-100 p-3 rounded max-h-60 overflow-y-auto">
              <pre className="text-xs whitespace-pre-wrap">
                {testResults.join('\n')}
              </pre>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
