// /api/auto-apply.ts
// API route to trigger backend job automation directly (no n8n)
import { runAutomationForJob } from '../automation/jobRunner.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  try {
    const { jobId, jobData } = req.body;
    if (!jobId || !jobData) {
      return res.status(400).json({ error: 'Missing jobId or jobData' });
    }
    const result = await runAutomationForJob(jobId, jobData);
    return res.status(200).json({ success: true, result });
  } catch (error) {
    return res.status(500).json({ error: error.message || 'Internal server error' });
  }
}
