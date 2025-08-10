
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import brandingHeader from "@/assets/jjmapplyx-branding-header.jpg";
import { Twitter, Linkedin, Github, Mail } from "lucide-react";

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

      {/* Footer */}
      <footer className="text-center py-5 text-sm text-muted-foreground">
        <div className="flex flex-col items-center gap-3">
          <p>© 2025 JJM Tech. All rights reserved.</p>
          <nav aria-label="Legal" className="space-x-4">
            <a href="/privacy-policy" className="hover:text-foreground transition-colors">Privacy Policy</a>
            <a href="/terms-of-use" className="hover:text-foreground transition-colors">Terms of Use</a>
          </nav>
          <nav aria-label="Social links" className="flex items-center gap-4">
            <a
              href="https://x.com/JJMapplyx"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Follow JJMapplyx on X"
              className="hover:text-foreground transition-colors"
            >
              <Twitter className="h-4 w-4" />
            </a>
            <a
              href="#"
              aria-label="LinkedIn (provide URL to enable)"
              className="hover:text-foreground transition-colors opacity-60 cursor-not-allowed"
              title="LinkedIn coming soon"
            >
              <Linkedin className="h-4 w-4" />
            </a>
            <a
              href="#"
              aria-label="GitHub (provide URL to enable)"
              className="hover:text-foreground transition-colors opacity-60 cursor-not-allowed"
              title="GitHub coming soon"
            >
              <Github className="h-4 w-4" />
            </a>
          </nav>
        </div>
      </footer>
    </div>
  );
};

export default Index;
