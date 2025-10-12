import express from "express";
import db from "../db.js";

const router = express.Router();

router.get("/stats", async (req, res) => {
  try {
    const [users] = await db.query("SELECT COUNT(*) AS total_users FROM users");
    const [sales] = await db.query("SELECT SUM(amount) AS total_sales FROM sales");

    res.json({
      total_users: users[0].total_users,
      total_sales: sales[0].total_sales
    });
  } catch (error) {
    console.error("❌ SQL Error:", error.message);
    res.status(500).json({ message: "Error fetching dashboard data", error: error.message });
  }
});

export default router;
