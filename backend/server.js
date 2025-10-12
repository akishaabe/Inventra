import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import { Resend } from "resend";
import db from "./db.js";
import composeDb from "./db.compose.js";
import dashboardRoutes from "./routes/dashboard.js";

const app = express();
const PORT = 4000;

app.use(cors());
app.use(bodyParser.json());

app.use("/api/dashboard", dashboardRoutes);

app.get("/", (req, res) => {
  res.send("Backend is running!");
});

app.get("/api/users", async (req, res) => {
  try {
    const [rows] = await db.query("SELECT * FROM users");
    res.json(rows);
  } catch (err) {
    console.error("Database error:", err);
    res.status(500).json({ error: "Database query failed" });
  }
});

/* amiel db */
app.get("/api/test-users", async (req, res) => {
  try {
    const [rows] = await composeDb.query("SELECT * FROM users");
    res.json(rows);
  } catch (err) {
    console.error("Compose DB error:", err);
    res.status(500).json({ error: "Database query failed" });
  }
});

const resend = new Resend("re_29KHLZqH_9eEuBgEVfnKXqi5pWoEM6r98");
const verificationCodes = {};

app.post("/api/send-reset-code", async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ error: "Email is required" });

  const code = Math.floor(100000 + Math.random() * 900000).toString();

  try {
    await resend.emails.send({
      from: "Inventra <onboarding@resend.dev>",
      to: email,
      subject: "Your Inventra Verification Code",
      html: `
        <div style="font-family: sans-serif; color: #333;">
          <h2>Your Verification Code</h2>
          <p>Please use the following 6-digit code to reset your password:</p>
          <h1 style="letter-spacing: 4px;">${code}</h1>
          <p>This code will expire in 10 minutes.</p>
        </div>
      `,
    });

    verificationCodes[email] = {
      code,
      expiresAt: Date.now() + 10 * 60 * 1000,
    };

    res.json({ success: true, message: "Verification code sent!" });
  } catch (err) {
    console.error("Email sending error:", err);
    res.status(500).json({ error: "Failed to send email" });
  }
});

app.post("/api/verify-code", (req, res) => {
  const { email, code } = req.body;

  const record = verificationCodes[email];
  if (!record) return res.status(400).json({ error: "No code found for this email" });
  if (Date.now() > record.expiresAt) return res.status(400).json({ error: "Code expired" });
  if (record.code !== code) return res.status(400).json({ error: "Invalid code" });

  delete verificationCodes[email];
  res.json({ success: true });
});

app.post("/api/resend-code", async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ error: "Email is required" });

  const code = Math.floor(100000 + Math.random() * 900000).toString();

  try {
    await resend.emails.send({
      from: "Inventra <onboarding@resend.dev>",
      to: email,
      subject: "Your new Inventra Verification Code",
      html: `
        <div style="font-family: sans-serif; color: #333;">
          <h2>Your New Verification Code</h2>
          <p>Please use the following 6-digit code to verify your login:</p>
          <h1 style="letter-spacing: 4px;">${code}</h1>
          <p>This code will expire in 10 minutes.</p>
        </div>
      `,
    });

    verificationCodes[email] = {
      code,
      expiresAt: Date.now() + 10 * 60 * 1000,
    };

    res.json({ success: true, message: "Verification code resent!" });
  } catch (err) {
    console.error("Error resending email:", err);
    res.status(500).json({ error: "Failed to resend verification code" });
  }
});


app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});

