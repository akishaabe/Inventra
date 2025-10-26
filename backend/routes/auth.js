import express from "express";
import db from "../db.js";
import bcrypt from "bcryptjs";

const router = express.Router();

router.post("/signup", async (req, res) => {
  const { email, password, firstName, lastName, role } = req.body;

  if (!email || !password || !firstName || !lastName)
    return res.status(400).json({ error: "All fields are required." });

  try {
    const [existingUser] = await db.query("SELECT user_id FROM users WHERE email = ?", [email]);
    if (existingUser.length > 0)
      return res.status(400).json({ error: "Email already registered." });

    const hashedPassword = await bcrypt.hash(password, 10);

    await db.query(
      "INSERT INTO users (email, password_hash, first_name, last_name, role) VALUES (?, ?, ?, ?, ?)",
      [email, hashedPassword, firstName, lastName, role || "STAFF"]
    );

    res.json({ success: true, message: "User registered successfully!" });
  } catch (err) {
    console.error("Signup error:", err);
    res.status(500).json({ error: "Failed to sign up." });
  }
});

// Login with email/password against DB (supports bcrypt or legacy plain text)
router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: "Email and password are required." });

  try {
    const [rows] = await db.query(
      "SELECT user_id, first_name, last_name, email, password_hash, role FROM users WHERE email = ?",
      [email]
    );

    if (!rows || rows.length === 0) {
      return res.status(401).json({ error: "Invalid email or password." });
    }

    const user = rows[0];
    const hash = user.password_hash || "";

    let valid = false;
    if (hash.startsWith("$2a$") || hash.startsWith("$2b$") || hash.startsWith("$2y$")) {
      valid = await bcrypt.compare(password, hash);
    } else {
      // Fallback for legacy plaintext entries in the dump
      valid = password === hash;
    }

    if (!valid) {
      return res.status(401).json({ error: "Invalid email or password." });
    }

    return res.json({
      success: true,
      user: {
        user_id: user.user_id,
        email: user.email,
        role: (user.role || '').toUpperCase(),
        first_name: user.first_name,
        last_name: user.last_name,
      },
    });
  } catch (err) {
    console.error("Login error:", err);
    return res.status(500).json({ error: "Failed to login." });
  }
});

export default router;
