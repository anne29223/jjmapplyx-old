import { Alert, AlertDescription } from '@/components/ui/alert';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Shield, AlertTriangle, ExternalLink, Check } from 'lucide-react';
import { AdminGuard } from '@/components/ui/admin-guard';

export function SecurityConfig() {
  const securityTasks = [
    {
      id: 'rls',
      title: 'Row Level Security',
      description: 'Database-level security policies',
      status: 'completed' as const,
      type: 'automatic' as const
    },
    {
      id: 'user-roles',
      title: 'User Role Management',
      description: 'Role-based access control system',
      status: 'completed' as const,
      type: 'automatic' as const
    },
    {
      id: 'webhook-signatures',
      title: 'Webhook Signature Verification',
      description: 'HMAC signature validation for webhooks',
      status: 'completed' as const,
      type: 'automatic' as const
    },
    {
      id: 'leaked-passwords',
      title: 'Leaked Password Protection',
      description: 'Enable leaked password checking in Auth settings',
      status: 'pending' as const,
      type: 'manual' as const,
      action: () => window.open('https://supabase.com/dashboard/project/tzvzranspvtifnlgrkwi/auth/providers', '_blank')
    },
    {
      id: 'webhook-secret',
      title: 'Webhook Secret Configuration',
      description: 'Configure N8N_WEBHOOK_SECRET in edge function secrets',
      status: 'pending' as const,
      type: 'manual' as const,
      action: () => window.open('https://supabase.com/dashboard/project/tzvzranspvtifnlgrkwi/settings/functions', '_blank')
    }
  ];

  const completedTasks = securityTasks.filter(task => task.status === 'completed').length;
  const totalTasks = securityTasks.length;
  const securityScore = Math.round((completedTasks / totalTasks) * 100);

  return (
    <AdminGuard>
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Security Configuration Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Overall Security Score</span>
                <Badge variant={securityScore >= 80 ? "default" : "destructive"}>
                  {securityScore}%
                </Badge>
              </div>
              
              <div className="space-y-3">
                {securityTasks.map((task) => (
                  <div key={task.id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                    <div className="flex items-center gap-3">
                      {task.status === 'completed' ? (
                        <Check className="h-4 w-4 text-green-500" />
                      ) : (
                        <AlertTriangle className="h-4 w-4 text-yellow-500" />
                      )}
                      <div>
                        <p className="text-sm font-medium">{task.title}</p>
                        <p className="text-xs text-muted-foreground">{task.description}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={task.status === 'completed' ? "default" : "secondary"}>
                        {task.status === 'completed' ? 'Done' : 'Pending'}
                      </Badge>
                      {task.action && task.status === 'pending' && (
                        <Button size="sm" variant="outline" onClick={task.action}>
                          <ExternalLink className="h-3 w-3 mr-1" />
                          Configure
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {securityScore < 100 && (
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              <strong>Security Configuration Required:</strong> Complete the pending manual configurations above to achieve 100% security compliance.
              
              <div className="mt-2 space-y-1 text-xs">
                <p>• <strong>Leaked Password Protection:</strong> Go to Auth → Providers → Password, enable "Leaked Password Protection"</p>
                <p>• <strong>Webhook Secret:</strong> Go to Edge Functions → Settings, add N8N_WEBHOOK_SECRET environment variable</p>
              </div>
            </AlertDescription>
          </Alert>
        )}
      </div>
    </AdminGuard>
  );
}