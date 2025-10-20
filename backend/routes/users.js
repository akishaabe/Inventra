import express from "express";
import db from "../db.js";

const router = express.Router();

// ───────────── GET ALL USERS ─────────────
router.get("/", async (req, res) => {
  try {
    const [rows] = await db.query("SELECT * FROM users");
    res.json(rows);
  } catch (err) {
    console.error("Error fetching users:", err);
    res.status(500).json({ error: "Database error" });
  }
});

// ───────────── ADD USER ─────────────
router.post("/", async (req, res) => {
  const { first_name, last_name, email, password_hash, role } = req.body;

  if (!first_name || !last_name || !email || !password_hash) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  try {
    const sql = `
      INSERT INTO users (first_name, last_name, email, password_hash, role)
      VALUES (?, ?, ?, ?, ?)
    `;
    await db.query(sql, [first_name, last_name, email, password_hash, role || "STAFF"]);
    res.status(201).json({ message: "User added successfully" });
  } catch (err) {
    console.error("Error adding user:", err);
    res.status(500).json({ error: "Failed to add user" });
  }
});

// ───────────── DELETE USER ─────────────
router.delete("/:user_id", async (req, res) => {
  const { user_id } = req.params;
  try {
    await db.query("DELETE FROM users WHERE user_id = ?", [user_id]);
    res.json({ message: "User deleted successfully" });
  } catch (err) {
    console.error("Error deleting user:", err);
    res.status(500).json({ error: "Failed to delete user" });
  }
});

export default router;
