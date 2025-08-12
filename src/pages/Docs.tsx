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
          <h2 className="text-xl font-semibold">Automation integration (free)</h2>
          <p className="text-muted-foreground mt-2">
            Works with Pipedream (free), n8n, or Make.com. Paste your inbound webhook URL in Dashboard → Automation Webhook URL.
          </p>
          <ul className="list-disc pl-6 text-sm text-muted-foreground mt-2">
            <li>Receive results: <code>https://tzvzranspvtifnlgrkwi.supabase.co/functions/v1/n8n-webhook</code> (send header <code>x-n8n-secret</code>)</li>
            <li>Trigger provider: via Dashboard buttons → calls <code>/functions/v1/trigger-n8n</code></li>
          </ul>
          <div className="mt-4 space-y-2 text-sm text-muted-foreground">
            <p className="font-medium">Pipedream quick start</p>
            <ol className="list-decimal pl-6 space-y-1">
              <li>Create an HTTP/Webhook source in Pipedream and copy its URL.</li>
              <li>Paste it into Dashboard → Automation Webhook URL and click away to save.</li>
              <li>Click “Start Job Scraping” or “Start Auto Apply” in the Control Panel.</li>
              <li>Add an HTTP step that POSTs results to the receive URL above with header <code>x-n8n-secret</code> and a JSON body like <code>{'{"action":"job-found","data":{...}}'}</code>.</li>
            </ol>
          </div>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold">Job boards configuration</h2>
          <ol className="list-decimal pl-6 text-sm text-muted-foreground mt-2 space-y-1">
            <li>Open Dashboard → Site Config tab.</li>
            <li>Add or paste boards: name, URL, keywords (comma‑separated), and optional location.</li>
            <li>Toggle boards on/off. Enabled boards are iterated when you trigger automations.</li>
            <li>Use “Add Hourly/Gig Presets” to quickly add Snagajob, Instawork, Wonolo, Shiftsmart, TaskRabbit, SimplyHired, Jobcase, PeopleReady.</li>
            <li>In Settings, set your n8n webhook URL. The trigger will loop across all enabled boards automatically.</li>
          </ol>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold">Run automations</h2>
          <ol className="list-decimal pl-6 text-sm text-muted-foreground mt-2 space-y-1">
            <li>Paste your provider webhook URL into Dashboard → Automation Webhook URL.</li>
            <li>Click Start Job Scraping to send scraping tasks.</li>
            <li>Click Start Auto Apply to apply to discovered jobs.</li>
            <li>Use Test Webhook to validate connectivity.</li>
            <li>Monitor Automation Logs and Analytics to verify runs.</li>
          </ol>
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
