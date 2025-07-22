
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { ResumeManager } from "./ResumeManager";
import { Bot, Settings, Play, Pause, Webhook, Zap } from "lucide-react";

interface ControlPanelProps {
  isRunning: boolean;
  onToggleBot: () => void;
  settings: {
    email: string;
    phone: string;
    runsPerDay: number;
    autoApply: boolean;
    makeWebhook?: string;
    powerAutomateFlow?: string;
  };
  onUpdateSettings: (settings: any) => void;
}

export const ControlPanel = ({ isRunning, onToggleBot, settings, onUpdateSettings }: ControlPanelProps) => {
  const handleResumeUpload = (file: File) => {
    console.log("Resume uploaded:", file.name);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card className="border-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bot className="h-5 w-5" />
            JJMApplyX AI Agent
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
            <Badge variant={isRunning ? "success" : "secondary"}>
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
                checked={settings.autoApply}
                onCheckedChange={(checked) => 
                  onUpdateSettings({...settings, autoApply: checked})
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
                value={settings.runsPerDay}
                onChange={(e) => 
                  onUpdateSettings({...settings, runsPerDay: parseInt(e.target.value)})
                }
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            Automation Integration
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="make-webhook">Make.com Webhook URL</Label>
            <Input
              id="make-webhook"
              type="url"
              value={settings.makeWebhook || ""}
              onChange={(e) => 
                onUpdateSettings({...settings, makeWebhook: e.target.value})
              }
              placeholder="https://hook.make.com/..."
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="power-automate">Power Automate Flow URL</Label>
            <Input
              id="power-automate"
              type="url"
              value={settings.powerAutomateFlow || ""}
              onChange={(e) => 
                onUpdateSettings({...settings, powerAutomateFlow: e.target.value})
              }
              placeholder="https://prod-XX.westus.logic.azure.com..."
            />
          </div>
          
          <div className="text-xs text-muted-foreground space-y-1">
            <p>• Make.com handles job scraping and triggers</p>
            <p>• Power Automate executes browser automation</p>
            <p>• Connect both for full automation pipeline</p>
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
              value={settings.email}
              onChange={(e) => 
                onUpdateSettings({...settings, email: e.target.value})
              }
              placeholder="your@email.com"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="phone">Phone Number</Label>
            <Input
              id="phone"
              type="tel"
              value={settings.phone}
              onChange={(e) => 
                onUpdateSettings({...settings, phone: e.target.value})
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
