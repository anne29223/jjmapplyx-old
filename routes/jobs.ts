import { Router, Request, Response } from "express";
import Job from "../models/Job";
import { syncJobs } from "../utils/fetchJobs";

const router = Router();

// Trigger scraper sync
router.get("/sync", async (req: Request, res: Response) => {
  try {
    const count = await syncJobs();
    res.json({ success: true, synced: count });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// List jobs
router.get("/", async (req: Request, res: Response) => {
  try {
    const jobs = await Job.findAll({
      order: [["posted_at", "DESC"], ["createdAt", "DESC"]],
      limit: 100
    });
    res.render("dashboard/jobs", { jobs });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
