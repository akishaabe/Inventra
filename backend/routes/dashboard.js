import express from "express";
import db from "../db.js";

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const [sales] = await db.query("SELECT SUM(amount) AS totalSales FROM sales WHERE DATE(date) = CURDATE()");
    const [stock] = await db.query("SELECT SUM(stock_value) AS totalStock FROM products");
    const [lowStock] = await db.query("SELECT COUNT(*) AS lowItems FROM products WHERE stock < reorder_point");

    res.json({
      sales: sales[0].totalSales || 0,
      stockValue: stock[0].totalStock || 0,
      lowStock: lowStock[0].lowItems || 0,
      forecast: 9240.00 
    });
  } catch (err) {
    console.error("Dashboard data error:", err);
    res.status(500).json({ error: "Failed to fetch dashboard data" });
  }
});

export default router;
