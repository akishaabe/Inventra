import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import { Resend } from "resend";
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


const app = express();
const PORT = 4000;

app.use(cors());
app.use(bodyParser.json());

app.use("/api/auth", authRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/inventory", inventoryRoutes);
app.use("/api/forecasts", forecastsRoute);
app.use("/api/users", userRoutes);
app.use("/api/audit-logs", auditRoutes);
app.use("/api/deleted-items", deletedRoutes);
app.use("/api/admin/settings", adminSettingsRoutes);
app.use("/api/admin/dashboard", adminDashboardRoutes);
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

// ===============================
// SEND RESET CODE
// ===============================
app.post("/api/send-reset-code", async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ error: "Email is required" });

  const code = Math.floor(100000 + Math.random() * 900000).toString();

  try {
    await resend.emails.send({
      from: "Inventra <onboarding@resend.dev>",
      to: email,
      subject: "🔐 Your Inventra Verification Code",
      html: `
        <div style="font-family: Arial, sans-serif; background-color: #f7f8fa; padding: 30px;">
          <div style="max-width: 500px; margin: auto; background: #ffffff; border-radius: 10px; box-shadow: 0 4px 10px rgba(0,0,0,0.05); overflow: hidden;">
            <div style="background-color: #2563eb; color: white; padding: 15px 20px; text-align: center;">
              <h2 style="margin: 0;">Inventra Verification</h2>
            </div>
            <div style="padding: 25px; color: #333;">
              <p style="font-size: 15px;">Hi there,</p>
              <p style="font-size: 15px;">Please use the verification code below to reset your password:</p>
              <div style="text-align: center; margin: 25px 0;">
                <h1 style="font-size: 32px; letter-spacing: 6px; color: #2563eb; margin: 0;">${code}</h1>
              </div>
              <p style="font-size: 14px; color: #666;">⚠️ This code will expire in <b>10 minutes</b>.</p>
              <p style="font-size: 14px; color: #666;">If you didn’t request this, you can ignore this email.</p>
              <p style="margin-top: 30px;">– The Inventra Team</p>
            </div>
          </div>
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

// ===============================
// VERIFY CODE
// ===============================
app.post("/api/verify-code", (req, res) => {
  const { email, code } = req.body;

  const record = verificationCodes[email];
  if (!record) return res.status(400).json({ error: "No code found for this email" });
  if (Date.now() > record.expiresAt) return res.status(400).json({ error: "Code expired" });
  if (record.code !== code) return res.status(400).json({ error: "Invalid code" });

  delete verificationCodes[email];
  res.json({ success: true });
});

// ===============================
// RESEND CODE
// ===============================
app.post("/api/resend-code", async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ error: "Email is required" });

  const code = Math.floor(100000 + Math.random() * 900000).toString();

  try {
    await resend.emails.send({
      from: "Inventra <onboarding@resend.dev>",
      to: email,
      subject: "🔄 Your New Inventra Verification Code",
      html: `
        <div style="font-family: Arial, sans-serif; background-color: #f7f8fa; padding: 30px;">
          <div style="max-width: 500px; margin: auto; background: #ffffff; border-radius: 10px; box-shadow: 0 4px 10px rgba(0,0,0,0.05); overflow: hidden;">
            <div style="background-color: #2563eb; color: white; padding: 15px 20px; text-align: center;">
              <h2 style="margin: 0;">Inventra Verification</h2>
            </div>
            <div style="padding: 25px; color: #333;">
              <p style="font-size: 15px;">Hi again,</p>
              <p style="font-size: 15px;">Here’s your new verification code:</p>
              <div style="text-align: center; margin: 25px 0;">
                <h1 style="font-size: 32px; letter-spacing: 6px; color: #2563eb; margin: 0;">${code}</h1>
              </div>
              <p style="font-size: 14px; color: #666;">⚠️ This code will expire in <b>10 minutes</b>.</p>
              <p style="font-size: 14px; color: #666;">If you didn’t request this, please ignore this message.</p>
              <p style="margin-top: 30px;">– The Inventra Team</p>
            </div>
          </div>
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

// ===============================
// DASHBOARD DATA
// ===============================
app.get("/api/dashboard", async (req, res) => {
  try {
    const [sales] = await db.query(
      "SELECT SUM(amount) AS total FROM sales WHERE DATE(date) = CURDATE()"
    );
    const [lowStock] = await db.query(
      "SELECT COUNT(*) AS count FROM products WHERE stock < reorder_level"
    );
    const [stockValue] = await db.query(
      "SELECT SUM(stock * price) AS value FROM products"
    );
    const [forecast] = await db.query(
      "SELECT SUM(predicted_sales) AS demand FROM forecast_data"
    );

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
