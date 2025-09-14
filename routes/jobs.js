const express = require("express");
const router = express.Router();
const Job = require("../models/Job");
const { syncJobs } = require("../utils/fetchJobs");

// Trigger scraper sync
router.get("/sync", async (req, res) => {
  try {
    const count = await syncJobs();
    res.json({ success: true, synced: count });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// List jobs for dashboard
router.get("/", async (req, res) => {
  try {
    const jobs = await Job.find().sort({ posted_at: -1, createdAt: -1 }).limit(100);
    res.render("dashboard/jobs", { jobs });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
