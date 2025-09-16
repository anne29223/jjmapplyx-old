import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Download, Upload, FileText, Database, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export const ExportImport = () => {
  const [importFile, setImportFile] = useState<File | null>(null);
  const { toast } = useToast();

  const exportData = (type: 'jobs' | 'settings' | 'all') => {
    // Mock export functionality
    const mockData = {
      jobs: type === 'all' || type === 'jobs' ? [
        { id: '1', title: 'Software Engineer', company: 'Tech Corp', status: 'pending' }
      ] : null,
      settings: type === 'all' || type === 'settings' ? {
        email: 'user@example.com',
        autoApply: true,
        runsPerDay: 5
      } : null,
      exportedAt: new Date().toISOString()
    };

    const dataStr = JSON.stringify(mockData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `jjmapplyx-${type}-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    toast({
      title: "Export successful",
      description: `${type} data exported successfully`,
    });
  };

  const handleDownloadScrapedJobs = async (format: 'json' | 'csv') => {
    try {
      const { createClient } = await import('@supabase/supabase-js');
      const supabase = createClient(
        import.meta.env.VITE_SUPABASE_URL,
        import.meta.env.VITE_SUPABASE_ANON_KEY
      );

      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast({
          title: "Authentication Required",
          description: "Please log in to download jobs.",
          variant: "destructive"
        });
        return;
      }

      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/download-jobs?format=${format}&limit=1000`, {
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to download jobs');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      
      const filename = response.headers.get('Content-Disposition')?.split('filename=')[1]?.replace(/"/g, '') || 
                     `scraped-jobs-${new Date().toISOString().split('T')[0]}.${format}`;
      
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast({
        title: "Download Complete",
        description: `Scraped jobs downloaded successfully as ${format.toUpperCase()}`,
      });
    } catch (error) {
      console.error('Download error:', error);
      toast({
        title: "Download Failed",
        description: error instanceof Error ? error.message : "Failed to download jobs. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type === 'application/json') {
      setImportFile(file);
      
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const data = JSON.parse(event.target?.result as string);
          console.log('Imported data:', data);
          
          toast({
            title: "Import successful",
            description: `Data imported from ${file.name}`,
          });
          
          setImportFile(null);
        } catch (error) {
          toast({
            title: "Import failed",
            description: "Invalid JSON file format",
            variant: "destructive"
          });
        }
      };
      reader.readAsText(file);
    } else {
      toast({
        title: "Invalid file",
        description: "Please select a valid JSON file",
        variant: "destructive"
      });
    }
  };

  return (
    <Card className="border-border">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="h-5 w-5" />
          Data Management
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Export Section */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Export Data</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <Button 
              variant="outline" 
              onClick={() => exportData('jobs')}
              className="flex items-center gap-2"
            >
              <Download className="h-4 w-4" />
              Export Jobs
            </Button>
            <Button 
              variant="outline" 
              onClick={() => exportData('settings')}
              className="flex items-center gap-2"
            >
              <Download className="h-4 w-4" />
              Export Settings
            </Button>
            <Button 
              variant="outline" 
              onClick={() => exportData('all')}
              className="flex items-center gap-2"
            >
              <Download className="h-4 w-4" />
              Export All
            </Button>
          </div>
        </div>

        {/* Scraped Jobs Download Section */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Download Scraped Jobs</h3>
          <p className="text-sm text-muted-foreground">
            Download your scraped jobs data from the database in JSON or CSV format
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <Button 
              variant="default" 
              onClick={() => handleDownloadScrapedJobs('json')}
              className="flex items-center gap-2 bg-green-600 hover:bg-green-700"
            >
              <Download className="h-4 w-4" />
              Download JSON
            </Button>
            <Button 
              variant="default" 
              onClick={() => handleDownloadScrapedJobs('csv')}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700"
            >
              <Download className="h-4 w-4" />
              Download CSV
            </Button>
          </div>
        </div>

        {/* Import Section */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Import Data</h3>
          <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center">
            <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
            <p className="text-sm text-muted-foreground mb-3">
              Import jobs, settings, or complete backup
            </p>
            <Input
              type="file"
              accept=".json"
              onChange={handleImport}
              className="hidden"
              id="import-file"
            />
            <Button asChild variant="outline">
              <label htmlFor="import-file" className="cursor-pointer">
                <FileText className="h-4 w-4 mr-2" />
                Choose JSON File
              </label>
            </Button>
            {importFile && (
              <div className="mt-3 flex items-center justify-center gap-2">
                <Badge variant="secondary">{importFile.name}</Badge>
              </div>
            )}
          </div>
        </div>

        {/* Backup Schedule */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Automatic Backups</h3>
          <div className="bg-muted rounded-lg p-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-warning mt-1" />
              <div>
                <p className="text-sm font-medium">Auto-backup Status</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Automatic daily backups are currently disabled. Enable in settings to automatically 
                  backup your data to Supabase storage.
                </p>
                <Button size="sm" className="mt-2" variant="outline">
                  Enable Auto-backup
                </Button>
              </div>
            </div>
          </div>
        </div>

        <div className="text-xs text-muted-foreground space-y-1">
          <p>• Export creates downloadable JSON files with your data</p>
          <p>• Import overwrites existing data - use with caution</p>
          <p>• Automatic backups require Supabase storage configuration</p>
        </div>
      </CardContent>
    </Card>
  );
};