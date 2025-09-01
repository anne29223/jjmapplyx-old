import { X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface SiteViewerProps {
  url: string | null;
  onClose: () => void;
}

export const SiteViewer = ({ url, onClose }: SiteViewerProps) => {
  if (!url) return null;

  return (
    <div className="fixed inset-0 z-50 bg-background">
      <div className="flex items-center justify-between p-4 border-b border-border">
        <div className="flex-1">
          <h3 className="text-lg font-semibold">Viewing Job Site</h3>
          <p className="text-sm text-muted-foreground truncate">{url}</p>
        </div>
        <Button variant="outline" size="sm" onClick={onClose}>
          <X className="h-4 w-4 mr-2" />
          Close
        </Button>
      </div>
      <iframe
        src={url}
        className="w-full h-[calc(100vh-80px)] border-0"
        title="Job Site Viewer"
        sandbox="allow-same-origin allow-scripts allow-forms allow-popups"
      />
    </div>
  );
};