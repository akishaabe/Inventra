import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import { Resend } from "resend";

const app = express();
const PORT = 4000;

app.use(cors());
app.use(bodyParser.json());

const resend = new Resend("re_29KHLZqH_9eEuBgEVfnKXqi5pWoEM6r98");

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
    console.error(err);
    res.status(500).json({ error: "Failed to send email" });
  }
});

const verificationCodes = {};

app.post("/api/verify-code", (req, res) => {
  const { email, code } = req.body;

  const record = verificationCodes[email];
  if (!record) return res.status(400).json({ error: "No code found for this email" });
  if (Date.now() > record.expiresAt) return res.status(400).json({ error: "Code expired" });
  if (record.code !== code) return res.status(400).json({ error: "Invalid code" });

  delete verificationCodes[email];
  res.json({ success: true });
});

app.listen(PORT, () => console.log(`✅ Server running on http://localhost:${PORT}`));









