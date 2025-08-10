import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const Docs = () => {
  const navigate = useNavigate();

  useEffect(() => {
    document.title = "JJMapplyx Documentation";
    const meta = document.querySelector('meta[name="description"]');
    const prev = meta?.getAttribute("content") || null;
    const desc = "Documentation for JJMapplyx: setup, n8n integration, webhooks, and troubleshooting.";
    if (meta) meta.setAttribute("content", desc);
    return () => {
      if (meta && prev) meta.setAttribute("content", prev);
    };
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 items-center justify-between">
          <h1 className="text-base font-semibold">JJMapplyx Documentation</h1>
          <nav className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => navigate("/dashboard")}>
              Open Dashboard
            </Button>
          </nav>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <section className="mb-8">
          <h2 className="text-2xl font-semibold tracking-tight">Getting started</h2>
          <p className="text-muted-foreground mt-2">
            1) Sign in  2) Configure job sites and resumes  3) Connect your n8n endpoints  4) Start automations.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold">n8n integration</h2>
          <p className="text-muted-foreground mt-2">
            Use the provided templates to set up Job Scraping, Auto Apply, and Email Monitoring workflows in your n8n instance.
          </p>
          <ul className="list-disc pl-6 text-sm text-muted-foreground mt-2">
            <li>Webhook receive: <code>/functions/v1/n8n-webhook</code></li>
            <li>Trigger n8n: <code>/functions/v1/trigger-n8n</code></li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold">Troubleshooting</h2>
          <ul className="list-disc pl-6 text-sm text-muted-foreground mt-2">
            <li>Check Automation Logs in the Dashboard</li>
            <li>Use the Test Webhook tool to validate connectivity</li>
            <li>Verify Supabase credentials and webhook URLs</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold">More guides</h2>
          <ul className="list-disc pl-6 text-sm text-muted-foreground mt-2">
            <li>See in-app guides and README for detailed steps.</li>
          </ul>
        </section>
      </main>

      <footer className="text-center py-6 text-sm text-muted-foreground">
        <p>© 2025 JJM Tech. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default Docs;
