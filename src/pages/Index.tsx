import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import brandingHeader from "@/assets/jjmapplyx-branding-header.jpg";

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <img 
            src={brandingHeader} 
            alt="JJMapplyx - Land Jobs. No Interviews. All Auto." 
            className="mx-auto mb-6 rounded-lg shadow-lg max-w-2xl w-full"
          />
          <Badge variant="secondary" className="mb-6">
            Pre-release now live
          </Badge>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
          <Button onClick={() => navigate("/dashboard")} size="lg">
            Open Dashboard 🚀
          </Button>
          
          <Button variant="outline" size="lg" disabled className="opacity-60">
            📱 Download App - Coming Soon
          </Button>
        </div>

        {/* App Store Links */}
        <div className="text-center">
          <p className="text-muted-foreground mb-4">Mobile app launching soon on:</p>
          <div className="flex gap-4 justify-center">
            <div className="opacity-60 cursor-not-allowed">
              <img 
                src="https://developer.apple.com/assets/elements/badges/download-on-the-app-store.svg" 
                alt="Download on the App Store - Coming Soon"
                className="h-12 grayscale"
              />
            </div>
            <div className="opacity-60 cursor-not-allowed">
              <img 
                src="https://play.google.com/intl/en_us/badges/static/images/badges/en_badge_web_generic.png" 
                alt="Get it on Google Play - Coming Soon"
                className="h-12 grayscale"
              />
            </div>
          </div>
          <p className="text-sm text-muted-foreground mt-2">Coming Soon</p>
        </div>
      </div>
    </div>
  );
};

export default Index;
