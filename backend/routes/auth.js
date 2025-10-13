import express from "express";
import db from "../db.js";
import bcrypt from "bcryptjs";

const router = express.Router();

router.post("/signup", async (req, res) => {
  const { email, password, firstName, lastName } = req.body;

  if (!email || !password || !firstName || !lastName)
    return res.status(400).json({ error: "All fields are required." });

  try {
    const [existingUser] = await db.query("SELECT * FROM users WHERE email = ?", [email]);
    if (existingUser.length > 0)
      return res.status(400).json({ error: "Email already registered." });

    const hashedPassword = await bcrypt.hash(password, 10);

    await db.query(
      "INSERT INTO users (email, password, first_name, last_name) VALUES (?, ?, ?, ?)",
      [email, hashedPassword, firstName, lastName]
    );

    res.json({ message: "User registered successfully!" });
  } catch (err) {
    console.error("Signup error:", err);
    res.status(500).json({ error: "Failed to sign up." });
  }
});

export default router;
