import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Globe, Plus, X, Settings } from "lucide-react";
import { useJobSites, useAddJobSite, useToggleJobSite, useRemoveJobSite, useBulkUpsertJobSites } from "@/hooks/useSupabase";
interface JobSite {
  id: string;
  name: string;
  url: string;
  enabled: boolean;
  keywords: string[];
  location: string;
}

export const JobSiteConfig = () => {
  const { data: jobSites = [], isLoading } = useJobSites();
  const addMutation = useAddJobSite();
  const toggleMutation = useToggleJobSite();
  const removeMutation = useRemoveJobSite();
  const bulkPresetMutation = useBulkUpsertJobSites();

  const [newSite, setNewSite] = useState({ name: '', url: '', keywords: '', location: '' });

  const addJobSite = () => {
    if (newSite.name && newSite.url) {
      const keywordsArr = newSite.keywords.split(',').map(k => k.trim()).filter(k => k)
      addMutation.mutate({
        name: newSite.name,
        url: newSite.url,
        enabled: true,
        keywords: keywordsArr,
        location: newSite.location || 'Remote'
      })
      setNewSite({ name: '', url: '', keywords: '', location: '' })
    }
  };

  const toggleSite = (id: string, enabled: boolean) => {
    toggleMutation.mutate({ id, enabled })
  };

  const removeSite = (id: string) => {
    removeMutation.mutate(id)
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
                  onCheckedChange={(checked) => toggleSite(site.id, checked)}
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
          <Button
            variant="outline"
            className="w-full mt-2"
            size="sm"
            onClick={() =>
              bulkPresetMutation.mutate([
                { name: 'Snagajob', url: 'https://www.snagajob.com', keywords: ['hourly','no interview','immediate hire'] },
                { name: 'Instawork', url: 'https://www.instawork.com', keywords: ['gig','shift','hourly'] },
                { name: 'Wonolo', url: 'https://www.wonolo.com', keywords: ['gig','warehouse','immediate'] },
                { name: 'Shiftsmart', url: 'https://www.shiftsmart.com', keywords: ['shift work','hourly','retail'] },
                { name: 'TaskRabbit', url: 'https://www.taskrabbit.com', keywords: ['task','gig','handyman'] },
                { name: 'SimplyHired', url: 'https://www.simplyhired.com', keywords: ['hourly','entry level','no experience'] },
                { name: 'Jobcase', url: 'https://www.jobcase.com', keywords: ['hourly','retail','warehouse'] },
                { name: 'PeopleReady', url: 'https://www.peopleready.com', keywords: ['day labor','warehouse','construction'] }
              ])
            }
          >
            Add Hourly/Gig Presets
          </Button>
        </div>

        <div className="text-xs text-muted-foreground">
          <p>• Configure which job sites to scrape automatically</p>
          <p>• Keywords help filter relevant job postings</p>
          <p>• Enabled sites are iterated in your n8n workflow when triggering automation</p>
        </div>
      </CardContent>
    </Card>
  );
};
