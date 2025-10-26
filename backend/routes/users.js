import express from "express";
import db from "../db.js";
import bcrypt from "bcryptjs";

const router = express.Router();

// ───────────── GET USER BY EMAIL ─────────────
router.get("/by-email", async (req, res) => {
  const { email } = req.query;
  if (!email) return res.status(400).json({ error: "Email is required" });

  try {
    const [rows] = await db.query(
      "SELECT user_id, first_name, last_name, email, role FROM users WHERE email = ?",
      [email]
    );
    if (!rows || rows.length === 0) return res.status(404).json({ error: "User not found" });
    res.json(rows[0]);
  } catch (err) {
    console.error("Error fetching user by email:", err);
    res.status(500).json({ error: "Database error" });
  }
});

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
  const { first_name, last_name, email, password, password_hash, role } = req.body || {};

  if (!first_name || !last_name || !email || (!password && !password_hash)) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  try {
    // Normalize role
    const roleNorm = (role || "STAFF").toString().toUpperCase();
    const allowedRoles = new Set(["SUPERADMIN", "ADMIN", "STAFF"]);
    const finalRole = allowedRoles.has(roleNorm) ? roleNorm : "STAFF";

    // Always store a bcrypt hash; accept plaintext via `password` or legacy `password_hash` if it's not already a bcrypt hash
    let toHash = password || password_hash || "";
    let finalHash = toHash;
    if (!toHash.startsWith("$2a$") && !toHash.startsWith("$2b$") && !toHash.startsWith("$2y$")) {
      finalHash = await bcrypt.hash(toHash, 10);
    }

    const sql = `
      INSERT INTO users (first_name, last_name, email, password_hash, role)
      VALUES (?, ?, ?, ?, ?)
    `;
    await db.query(sql, [first_name, last_name, email, finalHash, finalRole]);
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
