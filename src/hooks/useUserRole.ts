import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export type UserRole = 'admin' | 'moderator' | 'user';

export function useUserRole() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['user-role', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      
      const { data, error } = await supabase
        .rpc('get_user_role', { _user_id: user.id });
      
      if (error) {
        console.error('Error fetching user role:', error);
        return 'user' as UserRole; // Default to user role
      }
      
      return (data || 'user') as UserRole;
    },
    enabled: !!user?.id,
  });
}

export function useHasRole(requiredRole: UserRole) {
  const { data: userRole } = useUserRole();
  
  if (!userRole) return false;
  
  // Role hierarchy: admin > moderator > user
  const roleHierarchy = { admin: 3, moderator: 2, user: 1 };
  
  return roleHierarchy[userRole] >= roleHierarchy[requiredRole];
}