import express from "express";
import db from "../db.js";

const router = express.Router();

// Use promise API (async/await) with mysql2/promise pool
router.get("/", async (req, res) => {
  try {
    const [rows] = await db.query("SELECT * FROM deleted_items ORDER BY date DESC");
    res.json(rows);
  } catch (err) {
    console.error("Error fetching deleted items:", err);
    res.status(500).json({ error: "Failed to fetch deleted items" });
  }
});

export default router;
