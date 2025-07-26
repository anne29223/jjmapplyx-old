import { ReactNode } from 'react';
import { useHasRole } from '@/hooks/useUserRole';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Shield } from 'lucide-react';

interface AdminGuardProps {
  children: ReactNode;
  requiredRole?: 'admin' | 'moderator';
  fallback?: ReactNode;
}

export function AdminGuard({ 
  children, 
  requiredRole = 'admin',
  fallback 
}: AdminGuardProps) {
  const hasRole = useHasRole(requiredRole);

  if (!hasRole) {
    if (fallback) return <>{fallback}</>;
    
    return (
      <Alert>
        <Shield className="h-4 w-4" />
        <AlertDescription>
          You need {requiredRole} privileges to access this feature.
        </AlertDescription>
      </Alert>
    );
  }

  return <>{children}</>;
}