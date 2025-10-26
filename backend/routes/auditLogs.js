import express from "express";
import db from "../db.js";

const router = express.Router();

// Use promise API (async/await) with mysql2/promise pool
router.get("/", async (req, res) => {
  try {
    const [rows] = await db.query("SELECT * FROM audit_logs ORDER BY date DESC");
    res.json(rows);
  } catch (err) {
    console.error("Error fetching audit logs:", err);
    res.status(500).json({ error: "Failed to fetch audit logs" });
  }
});

export default router;
