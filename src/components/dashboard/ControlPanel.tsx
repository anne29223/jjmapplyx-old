
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { ResumeManager } from "./ResumeManager";
import { AppliedJobsList } from "./AppliedJobsList";
import { Bot, Settings, Play, Pause, Github, ExternalLink } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useUpdateSettings } from "@/hooks/useSupabase";
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
<<<<<<< HEAD
    github_token?: string;
    github_repo?: string;
=======
>>>>>>> fed2c2426af020fe81aac46e74b03937fb045b5a
  };
  onUpdateSettings: (settings: any) => void;
}

export const ControlPanel = ({ isRunning, onToggleBot, settings, onUpdateSettings }: ControlPanelProps) => {
  const { toast } = useToast();
  const { mutate: updateSettings } = useUpdateSettings();

  // Provide default values if settings is null
  const safeSettings = settings || {
    email: '',
    phone: '',
    runsPerDay: 5,
    runs_per_day: 5,
    autoApply: false,
    auto_apply: false,
<<<<<<< HEAD
    makeWebhook: '',
    webhook_make: '',
    powerAutomateFlow: '',
    webhook_power_automate: '',
<<<<<<< HEAD
    n8n_webhook_url: '',
    github_token: '',
    github_repo: ''
=======
    n8n_webhook_url: ''
>>>>>>> fed2c2426af020fe81aac46e74b03937fb045b5a
=======
>>>>>>> 8f07a84086daaf29b201ff33d5dc6d8008191e39
  };

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

  const triggerGitHubWorkflow = async () => {
    toast({
      title: "GitHub Actions Required",
      description: "Configure GitHub Actions to run automated job applications. Check the documentation for setup instructions.",
    });
  };

<<<<<<< HEAD
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

=======
>>>>>>> fed2c2426af020fe81aac46e74b03937fb045b5a
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
<<<<<<< HEAD
              <Webhook className="h-5 w-5" />
<<<<<<< HEAD
              GitHub Actions Automation
=======
              Automation Webhook Integration
>>>>>>> fed2c2426af020fe81aac46e74b03937fb045b5a
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
             <div className="space-y-2">
<<<<<<< HEAD
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
=======
               <Label htmlFor="n8n-webhook">Automation Webhook URL (Pipedream / n8n / Make)</Label>
                <Input
                 id="n8n-webhook"
                 placeholder="https://eox.pipedream.net/..."
                 value={localN8nUrl}
                 onChange={(e) => setLocalN8nUrl(e.target.value)}
                 onBlur={(e) => {
                   const updatedSettings = { ...safeSettings, n8n_webhook_url: e.target.value };
                   handleSettingsUpdate(updatedSettings);
                 }}
               />
               <p className="text-xs text-muted-foreground">
                 Paste any provider's inbound webhook URL. We'll POST your payload to it securely.
>>>>>>> fed2c2426af020fe81aac46e74b03937fb045b5a
               </p>
             </div>
             <div className="flex gap-2">
               <Button 
                 size="sm" 
                 variant="outline"
<<<<<<< HEAD
                 onClick={() => handleStartGitHubWorkflow('job-scraping')}
=======
                 onClick={() => handleStartN8NWorkflow('job-scraping')}
>>>>>>> fed2c2426af020fe81aac46e74b03937fb045b5a
               >
                 <Zap className="h-4 w-4 mr-2" />
                 Start Job Scraping
               </Button>
               <Button 
                 size="sm" 
                 variant="outline"
<<<<<<< HEAD
                 onClick={() => handleStartGitHubWorkflow('auto-apply')}
=======
                 onClick={() => handleStartN8NWorkflow('auto-apply')}
>>>>>>> fed2c2426af020fe81aac46e74b03937fb045b5a
               >
                 <Play className="h-4 w-4 mr-2" />
                 Start Auto Apply
               </Button>
               <Button 
                 size="sm" 
                 variant="outline"
<<<<<<< HEAD
                 onClick={() => handleStartGitHubWorkflow('email-monitoring')}
=======
                 onClick={() => handleStartN8NWorkflow('email-monitoring')}
>>>>>>> fed2c2426af020fe81aac46e74b03937fb045b5a
               >
                 <Mail className="h-4 w-4 mr-2" />
                 Start Email Monitor
               </Button>
             </div>
<<<<<<< HEAD
             
             <div className="text-xs text-muted-foreground space-y-1">
               <p>• Uses GitHub Actions for reliable, scalable automation</p>
               <p>• Workflows run on GitHub's infrastructure</p>
               <p>• No external services required</p>
=======
             <div className="space-y-2">
               <Label htmlFor="make-webhook">Make.com Webhook URL (Legacy)</Label>
               <Input
                 id="make-webhook"
                 type="url"
                 value={safeSettings.makeWebhook || safeSettings.webhook_make || ""}
                 onChange={(e) => 
                   handleSettingsUpdate({...safeSettings, webhook_make: e.target.value, makeWebhook: e.target.value})
                 }
                 placeholder="https://hook.make.com/..."
               />
             </div>
             
             <div className="space-y-2">
               <Label htmlFor="power-automate">Power Automate Flow URL (Legacy)</Label>
               <Input
                 id="power-automate"
                 type="url"
                 value={safeSettings.powerAutomateFlow || safeSettings.webhook_power_automate || ""}
                 onChange={(e) => 
                   handleSettingsUpdate({...safeSettings, webhook_power_automate: e.target.value, powerAutomateFlow: e.target.value})
                 }
                 placeholder="https://prod-XX.westus.logic.azure.com..."
               />
             </div>
             
             <div className="text-xs text-muted-foreground space-y-1">
               <p>• Works with Pipedream (free), n8n, Make.com, Power Automate</p>
               <p>• Configure your webhook to enable one-click automation</p>
>>>>>>> fed2c2426af020fe81aac46e74b03937fb045b5a
             </div>
=======
              <Github className="h-5 w-5" />
              GitHub Actions Automation
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-sm text-muted-foreground space-y-2">
              <p>Automated job applications now run via GitHub Actions on a schedule:</p>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>9:00 AM UTC - Morning job search</li>
                <li>12:00 PM UTC - Afternoon job search</li>
              </ul>
              <p>Configure your repository secrets to enable automation:</p>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li><code className="bg-muted px-1 rounded">SUPABASE_URL</code></li>
                <li><code className="bg-muted px-1 rounded">SUPABASE_SERVICE_KEY</code></li>
              </ul>
            </div>
            
            <div className="flex gap-2">
              <Button 
                variant="outline"
                onClick={triggerGitHubWorkflow}
                className="flex-1"
              >
                <Github className="h-4 w-4 mr-2" />
                Trigger Manual Run
              </Button>
              <Button 
                variant="outline"
                size="sm"
                onClick={() => window.open('https://github.com/settings/personal-access-tokens', '_blank')}
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                Setup Guide
              </Button>
            </div>
            
            <div className="text-xs text-muted-foreground">
              GitHub Actions provides reliable, scheduled automation without external dependencies.
            </div>
>>>>>>> 8f07a84086daaf29b201ff33d5dc6d8008191e39
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
      
      <div className="lg:col-span-2">
        <AppliedJobsList />
      </div>
    </div>
  );
};
