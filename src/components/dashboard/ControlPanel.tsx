import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Play, Pause, Settings, Bot, Mail, Phone } from "lucide-react";
import { useState } from "react";

interface ControlPanelProps {
  isRunning: boolean;
  onToggleBot: () => void;
  settings: {
    email: string;
    phone: string;
    runsPerDay: number;
    autoApply: boolean;
  };
  onUpdateSettings: (settings: any) => void;
}

export const ControlPanel = ({ isRunning, onToggleBot, settings, onUpdateSettings }: ControlPanelProps) => {
  const [localSettings, setLocalSettings] = useState(settings);

  const handleSaveSettings = () => {
    onUpdateSettings(localSettings);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card className="border-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bot className="h-5 w-5" />
            AI Agent Control
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Automation Status</p>
              <p className="text-sm text-muted-foreground">
                Bot runs {settings.runsPerDay}x daily
              </p>
            </div>
            <Badge variant={isRunning ? "success" : "secondary"}>
              {isRunning ? "Running" : "Stopped"}
            </Badge>
          </div>
          
          <Button 
            onClick={onToggleBot}
            variant={isRunning ? "destructive" : "default"}
            className="w-full flex items-center gap-2"
          >
            {isRunning ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
            {isRunning ? "Stop Agent" : "Start Agent"}
          </Button>
        </CardContent>
      </Card>

      <Card className="border-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email" className="flex items-center gap-2">
              <Mail className="h-4 w-4" />
              Personal Email
            </Label>
            <Input
              id="email"
              type="email"
              value={localSettings.email}
              onChange={(e) => setLocalSettings({...localSettings, email: e.target.value})}
              placeholder="your.email@example.com"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone" className="flex items-center gap-2">
              <Phone className="h-4 w-4" />
              Phone Number
            </Label>
            <Input
              id="phone"
              type="tel"
              value={localSettings.phone}
              onChange={(e) => setLocalSettings({...localSettings, phone: e.target.value})}
              placeholder="+1 (555) 123-4567"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="runs">Daily Runs</Label>
            <Input
              id="runs"
              type="number"
              min="1"
              max="10"
              value={localSettings.runsPerDay}
              onChange={(e) => setLocalSettings({...localSettings, runsPerDay: parseInt(e.target.value)})}
            />
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="auto-apply">Auto-Apply Mode</Label>
            <Switch
              id="auto-apply"
              checked={localSettings.autoApply}
              onCheckedChange={(checked) => setLocalSettings({...localSettings, autoApply: checked})}
            />
          </div>

          <Button onClick={handleSaveSettings} variant="outline" className="w-full">
            Save Settings
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};