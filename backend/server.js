import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import nodemailer from "nodemailer";
import db from "./db.js";
import composeDb from "./db.compose.js";
import inventoryRoutes from "./routes/inventory.js";
import dashboardRoutes from "./routes/dashboard.js";
import authRoutes from "./routes/auth.js";
import userRoutes from "./routes/users.js";
import auditRoutes from "./routes/auditLogs.js";
import deletedRoutes from "./routes/deletedItems.js";
import forecastsRoute from "./routes/forecasts.js";
import adminSettingsRoutes from "./routes/admin_settings.js";
import adminDashboardRoutes from "./routes/admin_dashboard.js";
import adminInventoryRoutes from "./routes/admin_inventory.js";
import adminReportsRoutes from "./routes/admin_reports.js";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 4000;

app.use(cors());
app.use(bodyParser.json());

// ------------------------------
// In-memory storage for verification codes
// ------------------------------
const verificationCodes = {};

// ------------------------------
// Helper: generate random 6-digit code
// ------------------------------
function generateCode() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// ------------------------------
// Configure Nodemailer transporter
// ------------------------------
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: false, // use true if port 465
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

// Verify the transporter connection
transporter.verify((error, success) => {
  if (error) {
    console.error("❌ Email transporter error:", error);
  } else {
    console.log("✅ Email transporter ready to send messages");
  }
});

// ------------------------------
// Helper: send verification email
// ------------------------------
async function sendVerificationEmail(email, code) {
  const mailOptions = {
    from: `"Inventra Verification" <${process.env.FROM_EMAIL}>`,
    to: email,
    subject: "Your Inventra Verification Code",
    html: `
      <div style="font-family:sans-serif; line-height:1.6;">
        <h2>Inventra Verification</h2>
        <p>Hello,</p>
        <p>Your verification code is:</p>
        <h1 style="color:#007bff;">${code}</h1>
        <p>This code will expire in 10 minutes.</p>
        <br>
        <p>— The Inventra Team</p>
      </div>
    `,
  };

  await transporter.sendMail(mailOptions);
  console.log(`📧 Verification email sent to ${email}`);
}

// ------------------------------
// Routes
// ------------------------------
app.use("/api/auth", authRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/inventory", inventoryRoutes);
app.use("/api/forecasts", forecastsRoute);
app.use("/api/users", userRoutes);
app.use("/api/audit-logs", auditRoutes);
app.use("/api/deleted-items", deletedRoutes);
app.use("/api/admin/settings", adminSettingsRoutes);
app.use("/api/admin/dashboard", adminDashboardRoutes);
app.use("/api/admin/inventory", adminInventoryRoutes);
app.use("/api/admin/reports", adminReportsRoutes);

app.get("/", (req, res) => res.send("Backend is running!"));

// ------------------------------
// Send verification code
// ------------------------------
app.post("/api/send-reset-code", async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ error: "Email is required" });

  try {
    const code = generateCode();
    verificationCodes[email] = { code, expiresAt: Date.now() + 10 * 60 * 1000 }; // expires in 10 min

    await sendVerificationEmail(email, code);

    res.json({ success: true, message: "Verification code sent to your email." });
  } catch (err) {
    console.error("Error sending verification email:", err);
    res.status(500).json({ error: "Failed to send verification email." });
  }
});

// ------------------------------
// Resend code
// ------------------------------
app.post("/api/resend-code", async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ error: "Email is required" });

  try {
    const code = generateCode();
    verificationCodes[email] = { code, expiresAt: Date.now() + 10 * 60 * 1000 };

    await sendVerificationEmail(email, code);

    res.json({ success: true, message: "New verification code sent to your email." });
  } catch (err) {
    console.error("Error resending verification code:", err);
    res.status(500).json({ error: "Failed to resend verification code." });
  }
});

// ------------------------------
// Verify code
// ------------------------------
app.post("/api/verify-code", (req, res) => {
  const { email, code } = req.body;
  const record = verificationCodes[email];

  if (!record) return res.status(400).json({ error: "No code found for this email." });
  if (Date.now() > record.expiresAt) return res.status(400).json({ error: "Code expired." });
  if (record.code !== code) return res.status(400).json({ error: "Invalid code." });

  delete verificationCodes[email];
  res.json({ success: true, message: "Email verified successfully!" });
});

// ------------------------------
// Dashboard data
// ------------------------------
app.get("/api/dashboard", async (req, res) => {
  try {
    const [sales] = await db.query("SELECT SUM(amount) AS total FROM sales WHERE DATE(date) = CURDATE()");
    const [lowStock] = await db.query("SELECT COUNT(*) AS count FROM products WHERE stock < reorder_level");
    const [stockValue] = await db.query("SELECT SUM(stock * price) AS value FROM products");
    const [forecast] = await db.query("SELECT SUM(predicted_sales) AS demand FROM forecast_data");

    res.json({
      todaySales: sales[0].total || 0,
      lowStock: lowStock[0].count || 0,
      stockValue: stockValue[0].value || 0,
      forecastDemand: forecast[0].demand || 0,
    });
  } catch (err) {
    console.error("Error fetching dashboard data:", err);
    res.status(500).json({ error: "Failed to fetch dashboard data" });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
