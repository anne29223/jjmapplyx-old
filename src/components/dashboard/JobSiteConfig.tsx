import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Globe, Plus, X, Settings } from "lucide-react";

interface JobSite {
  id: string;
  name: string;
  url: string;
  enabled: boolean;
  keywords: string[];
  location: string;
}

export const JobSiteConfig = () => {
  const [jobSites, setJobSites] = useState<JobSite[]>([
    {
      id: '1',
      name: 'Indeed',
      url: 'https://indeed.com',
      enabled: true,
      keywords: ['software engineer', 'developer'],
      location: 'Remote'
    },
    {
      id: '2',
      name: 'LinkedIn',
      url: 'https://linkedin.com/jobs',
      enabled: true,
      keywords: ['react', 'frontend'],
      location: 'New York'
    }
  ]);

  const [newSite, setNewSite] = useState({ name: '', url: '', keywords: '', location: '' });

  const addJobSite = () => {
    if (newSite.name && newSite.url) {
      const site: JobSite = {
        id: Date.now().toString(),
        name: newSite.name,
        url: newSite.url,
        enabled: true,
        keywords: newSite.keywords.split(',').map(k => k.trim()).filter(k => k),
        location: newSite.location || 'Remote'
      };
      setJobSites([...jobSites, site]);
      setNewSite({ name: '', url: '', keywords: '', location: '' });
    }
  };

  const toggleSite = (id: string) => {
    setJobSites(sites =>
      sites.map(site =>
        site.id === id ? { ...site, enabled: !site.enabled } : site
      )
    );
  };

  const removeSite = (id: string) => {
    setJobSites(sites => sites.filter(site => site.id !== id));
  };

  return (
    <Card className="border-border">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="h-5 w-5" />
          Job Site Configuration
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Existing Job Sites */}
        <div className="space-y-3">
          {jobSites.map((site) => (
            <div key={site.id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
              <div className="flex items-center gap-3">
                <Globe className="h-4 w-4" />
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium">{site.name}</p>
                    <Badge variant={site.enabled ? "default" : "secondary"}>
                      {site.enabled ? "Active" : "Disabled"}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">{site.url}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs text-muted-foreground">Keywords:</span>
                    {site.keywords.map((keyword, i) => (
                      <Badge key={i} variant="outline" className="text-xs">
                        {keyword}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Switch
                  checked={site.enabled}
                  onCheckedChange={() => toggleSite(site.id)}
                />
                <Button size="sm" variant="ghost" onClick={() => removeSite(site.id)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>

        {/* Add New Site */}
        <div className="border-t pt-4">
          <div className="grid grid-cols-2 gap-2 mb-2">
            <Input
              placeholder="Site name (e.g., Indeed)"
              value={newSite.name}
              onChange={(e) => setNewSite(prev => ({ ...prev, name: e.target.value }))}
            />
            <Input
              placeholder="Site URL"
              value={newSite.url}
              onChange={(e) => setNewSite(prev => ({ ...prev, url: e.target.value }))}
            />
          </div>
          <div className="grid grid-cols-2 gap-2 mb-2">
            <Input
              placeholder="Keywords (comma separated)"
              value={newSite.keywords}
              onChange={(e) => setNewSite(prev => ({ ...prev, keywords: e.target.value }))}
            />
            <Input
              placeholder="Location (optional)"
              value={newSite.location}
              onChange={(e) => setNewSite(prev => ({ ...prev, location: e.target.value }))}
            />
          </div>
          <Button onClick={addJobSite} className="w-full" size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Add Job Site
          </Button>
        </div>

        <div className="text-xs text-muted-foreground">
          <p>• Configure which job sites to scrape automatically</p>
          <p>• Keywords help filter relevant job postings</p>
          <p>• Disabled sites will be skipped during automation</p>
        </div>
      </CardContent>
    </Card>
  );
};
