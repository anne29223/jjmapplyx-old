
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { ResumeManager } from "./ResumeManager";
import { Bot, Settings, Play, Pause, Webhook, Zap, Mail } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useUpdateSettings, useTriggerN8N } from "@/hooks/useSupabase";

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
    n8n_webhook_url: ''
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

  const handleStartN8NWorkflow = async (workflow: string) => {
    try {
      await triggerN8N({ workflow });
      toast({
        title: "n8n Workflow Started",
        description: `${workflow} automation is now running.`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to start n8n workflow. Check your webhook URL.",
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
              n8n Automation Integration
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="n8n-webhook">n8n Webhook URL</Label>
               <Input
                id="n8n-webhook"
                placeholder="https://your-n8n-instance.com/webhook/..."
                value={safeSettings.n8n_webhook_url || ""}
                onChange={(e) => {
                  const updatedSettings = { ...safeSettings, n8n_webhook_url: e.target.value };
                  handleSettingsUpdate(updatedSettings);
                }}
              />
              <p className="text-xs text-muted-foreground">
                This webhook will receive job application triggers from the dashboard
              </p>
            </div>
            <div className="flex gap-2">
              <Button 
                size="sm" 
                variant="outline"
                onClick={() => handleStartN8NWorkflow('job-scraping')}
              >
                <Zap className="h-4 w-4 mr-2" />
                Start Job Scraping
              </Button>
              <Button 
                size="sm" 
                variant="outline"
                onClick={() => handleStartN8NWorkflow('email-monitoring')}
              >
                <Mail className="h-4 w-4 mr-2" />
                Start Email Monitor
              </Button>
            </div>
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
              <p>• n8n provides complete automation workflow management</p>
              <p>• Make.com & Power Automate available for legacy support</p>
              <p>• Configure n8n webhook for advanced job automation</p>
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
