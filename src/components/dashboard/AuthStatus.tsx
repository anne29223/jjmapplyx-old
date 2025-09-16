import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useSupabase } from '@/hooks/useSupabase';

export const AuthStatus = () => {
  const [authStatus, setAuthStatus] = useState<'checking' | 'authenticated' | 'not_authenticated'>('checking');
  const [user, setUser] = useState<any>(null);
  const { supabase } = useSupabase();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data: { user }, error } = await supabase.auth.getUser();
        console.log('AuthStatus - User check:', { user: user?.id, error });
        
        if (error) {
          setAuthStatus('not_authenticated');
        } else if (user) {
          setAuthStatus('authenticated');
          setUser(user);
        } else {
          setAuthStatus('not_authenticated');
        }
      } catch (error) {
        console.error('AuthStatus - Error:', error);
        setAuthStatus('not_authenticated');
      }
    };
    
    checkAuth();

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('AuthStatus - Auth state changed:', { event, session: session?.user?.id });
      if (session?.user) {
        setAuthStatus('authenticated');
        setUser(session.user);
      } else {
        setAuthStatus('not_authenticated');
        setUser(null);
      }
    });

    return () => subscription.unsubscribe();
  }, [supabase]);

  const handleSignInAnonymously = async () => {
    try {
      const { data, error } = await supabase.auth.signInAnonymously();
      console.log('Sign in result:', { data, error });
      
      if (error) {
        console.error('Sign in error:', error);
      } else {
        setAuthStatus('authenticated');
        setUser(data.user);
      }
    } catch (error) {
      console.error('Sign in error:', error);
    }
  };

  const handleRefresh = async () => {
    setAuthStatus('checking');
    try {
      const { data: { user }, error } = await supabase.auth.getUser();
      console.log('AuthStatus - Refresh check:', { user: user?.id, error });
      
      if (error) {
        setAuthStatus('not_authenticated');
      } else if (user) {
        setAuthStatus('authenticated');
        setUser(user);
      } else {
        setAuthStatus('not_authenticated');
      }
    } catch (error) {
      console.error('AuthStatus - Refresh error:', error);
      setAuthStatus('not_authenticated');
    }
  };

  return (
    <Card className="mb-4">
      <CardHeader>
        <CardTitle className="text-sm">Authentication Status</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between">
          <div>
            <p className={`text-sm ${
              authStatus === 'authenticated' ? 'text-green-600' : 
              authStatus === 'not_authenticated' ? 'text-red-600' : 
              'text-yellow-600'
            }`}>
              {authStatus === 'checking' && 'Checking...'}
              {authStatus === 'authenticated' && `✅ Authenticated (${user?.id?.substring(0, 8)}...)`}
              {authStatus === 'not_authenticated' && '❌ Not Authenticated'}
            </p>
          </div>
          <div className="flex gap-2">
            <Button size="sm" variant="outline" onClick={handleRefresh}>
              Refresh
            </Button>
            {authStatus === 'not_authenticated' && (
              <Button size="sm" onClick={handleSignInAnonymously}>
                Sign In
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
