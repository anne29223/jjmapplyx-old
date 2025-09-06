
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { ResumeManager } from "./ResumeManager";
import { Bot, Settings, Play, Pause, Webhook, Zap, Mail } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useUpdateSettings, useTriggerN8N, supabase } from "@/hooks/useSupabase";
import { useState } from "react";

interface ControlPanelProps {
  isRunning: boolean;
  onToggleBot: () => void;
  settings: {
    email: string;
    phone: string;
    runsPerDay?: number;
    runs_per_day?: number;
    autoApply?: boolean;
    auto_apply?: boolean;
    makeWebhook?: string;
    webhook_make?: string;
    powerAutomateFlow?: string;
    webhook_power_automate?: string;
    n8n_webhook_url?: string;
    github_token?: string;
    github_repo?: string;
  };
  onUpdateSettings: (settings: any) => void;
}

export const ControlPanel = ({ isRunning, onToggleBot, settings, onUpdateSettings }: ControlPanelProps) => {
  const { toast } = useToast();
  const { mutate: updateSettings } = useUpdateSettings();
  const { mutate: triggerN8N } = useTriggerN8N();

  // Provide default values if settings is null
  const safeSettings = settings || {
    email: '',
    phone: '',
    runsPerDay: 5,
    runs_per_day: 5,
    autoApply: false,
    auto_apply: false,
    makeWebhook: '',
    webhook_make: '',
    powerAutomateFlow: '',
    webhook_power_automate: '',
    n8n_webhook_url: '',
    github_token: '',
    github_repo: ''
  };

  // Local state for inputs to prevent focus issues
  const [localN8nUrl, setLocalN8nUrl] = useState(safeSettings.n8n_webhook_url || '');

  const handleSettingsUpdate = (newSettings: any) => {
    console.log('Updating settings:', newSettings);
    updateSettings(newSettings, {
      onSuccess: (data) => {
        console.log('Settings update successful:', data);
        onUpdateSettings(newSettings);
        toast({
          title: "Settings Updated",
          description: "Your settings have been saved successfully.",
        });
      },
      onError: (error) => {
        console.error('Settings update failed:', error);
        toast({
          title: "Error",
          description: "Failed to update settings.",
          variant: "destructive"
        });
      }
    });
  };

  const handleStartN8NWorkflow = async (workflow: string) => {
    try {
      if (localN8nUrl && localN8nUrl.trim().length > 0) {
        await triggerN8N({ workflow })
        toast({
          title: "Automation Triggered",
          description: `${workflow} workflow started via your webhook provider.`,
        })
      } else {
        const { data, error } = await supabase.functions.invoke('run-automation', { body: { workflow } })
        if (error) throw error
        toast({
          title: "Built-in Automation Running",
          description: `${workflow} started with the built-in runner (no external tool needed).`,
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to start automation. Check settings and try again.",
        variant: "destructive"
      })
    }
  };

  const handleStartGitHubWorkflow = async (workflow: string) => {
    try {
      if (!safeSettings.github_token || !safeSettings.github_repo) {
        toast({
          title: "Configuration Required",
          description: "Please configure your GitHub token and repository first.",
          variant: "destructive"
        });
        return;
      }

      const { data, error } = await supabase.functions.invoke('trigger-github-workflow', {
        body: {
          workflow,
          github_token: safeSettings.github_token,
          github_repo: safeSettings.github_repo
        }
      });

      if (error) throw error;

      toast({
        title: "GitHub Workflow Triggered",
        description: `${workflow} workflow started on GitHub Actions.`,
      });
    } catch (error) {
      console.error('GitHub workflow trigger error:', error);
      toast({
        title: "Error",
        description: "Failed to trigger GitHub workflow. Check your token and repository settings.",
        variant: "destructive"
      });
    }
  };

  const handleResumeUpload = (file: File) => {
    console.log("Resume uploaded:", file.name);
    toast({
      title: "Resume Uploaded",
      description: `${file.name} has been uploaded successfully.`,
    });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card className="border-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bot className="h-5 w-5" />
            JJMapplyx AI Agent
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Automation Status</p>
              <p className="text-sm text-muted-foreground">
                {isRunning ? "Actively searching and applying" : "Stopped"}
              </p>
            </div>
            <Badge variant={isRunning ? "default" : "secondary"}>
              {isRunning ? "Running" : "Stopped"}
            </Badge>
          </div>
          
          <Button 
            onClick={onToggleBot}
            className="w-full"
            variant={isRunning ? "destructive" : "default"}
          >
            {isRunning ? (
              <>
                <Pause className="h-4 w-4 mr-2" />
                Stop Automation
              </>
            ) : (
              <>
                <Play className="h-4 w-4 mr-2" />
                Start Automation
              </>
            )}
          </Button>
          
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label htmlFor="auto-apply">Auto Apply</Label>
              <Switch 
                id="auto-apply"
                checked={safeSettings.autoApply || safeSettings.auto_apply || false}
                onCheckedChange={(checked) => 
                  handleSettingsUpdate({...safeSettings, auto_apply: checked, autoApply: checked})
                }
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="runs-per-day">Runs Per Day</Label>
              <Input
                id="runs-per-day"
                type="number"
                min="1"
                max="10"
                value={safeSettings.runsPerDay || safeSettings.runs_per_day || 5}
                onChange={(e) => 
                  handleSettingsUpdate({...safeSettings, runs_per_day: parseInt(e.target.value), runsPerDay: parseInt(e.target.value)})
                }
              />
            </div>
          </div>
        </CardContent>
      </Card>

        <Card className="border-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Webhook className="h-5 w-5" />
              GitHub Actions Automation
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
             <div className="space-y-2">
               <Label htmlFor="github-token">GitHub Personal Access Token</Label>
                <Input
                 id="github-token"
                 type="password"
                 placeholder="ghp_xxxxxxxxxxxxxxxxxxxx"
                 value={safeSettings.github_token || ""}
                 onChange={(e) => 
                   handleSettingsUpdate({...safeSettings, github_token: e.target.value})
                 }
               />
               <p className="text-xs text-muted-foreground">
                 Create a token with 'workflow' permissions at github.com/settings/tokens
               </p>
             </div>
             <div className="space-y-2">
               <Label htmlFor="github-repo">GitHub Repository (owner/repo)</Label>
                <Input
                 id="github-repo"
                 placeholder="username/jjmapplyx-automation"
                 value={safeSettings.github_repo || ""}
                 onChange={(e) => 
                   handleSettingsUpdate({...safeSettings, github_repo: e.target.value})
                 }
               />
               <p className="text-xs text-muted-foreground">
                 Repository containing your GitHub Actions workflows
               </p>
             </div>
             <div className="flex gap-2">
               <Button 
                 size="sm" 
                 variant="outline"
                 onClick={() => handleStartGitHubWorkflow('job-scraping')}
               >
                 <Zap className="h-4 w-4 mr-2" />
                 Start Job Scraping
               </Button>
               <Button 
                 size="sm" 
                 variant="outline"
                 onClick={() => handleStartGitHubWorkflow('auto-apply')}
               >
                 <Play className="h-4 w-4 mr-2" />
                 Start Auto Apply
               </Button>
               <Button 
                 size="sm" 
                 variant="outline"
                 onClick={() => handleStartGitHubWorkflow('email-monitoring')}
               >
                 <Mail className="h-4 w-4 mr-2" />
                 Start Email Monitor
               </Button>
             </div>
             
             <div className="text-xs text-muted-foreground space-y-1">
               <p>• Uses GitHub Actions for reliable, scalable automation</p>
               <p>• Workflows run on GitHub's infrastructure</p>
               <p>• No external services required</p>
             </div>
          </CardContent>
        </Card>

      <Card className="border-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Contact Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email Address</Label>
            <Input
              id="email"
              type="email"
              value={safeSettings.email}
              onChange={(e) => 
                handleSettingsUpdate({...safeSettings, email: e.target.value})
              }
              placeholder="your@email.com"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="phone">Phone Number</Label>
            <Input
              id="phone"
              type="tel"
              value={safeSettings.phone}
              onChange={(e) => 
                handleSettingsUpdate({...safeSettings, phone: e.target.value})
              }
              placeholder="+1 (555) 123-4567"
            />
          </div>
          
          <div className="text-xs text-muted-foreground">
            Used for job applications and notifications
          </div>
        </CardContent>
      </Card>

      <div className="lg:col-span-2">
        <ResumeManager onResumeUpload={handleResumeUpload} />
      </div>
    </div>
  );
};
