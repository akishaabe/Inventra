import express from "express";
import db from "../db.compose.js";

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    // lifetime sales instead of today's only
    const [salesRows] = await db.query(`
      SELECT COALESCE(SUM(total_amount), 0) AS totalSales
      FROM sales
    `);

    // stock value (still 0 until inventory has rows)
    const [stockRows] = await db.query(`
      SELECT COALESCE(SUM(
        IFNULL(i.quantity_available,0) * IFNULL(p.cost_per_unit,0)
      ), 0) AS totalStockValue
      FROM products p
      LEFT JOIN inventory i ON p.product_id = i.product_id
    `);

    // low stock count (will stay 0 until you fill inventory + set reorder levels)
    const [lowRows] = await db.query(`
      SELECT COALESCE(SUM(
        CASE WHEN i.quantity_available < p.reorder_level THEN 1 ELSE 0 END
      ), 0) AS lowItems
      FROM products p
      LEFT JOIN inventory i ON p.product_id = i.product_id
    `);

    const todaySales = Number(salesRows[0]?.totalSales || 0);
    const stockValue = Number(stockRows[0]?.totalStockValue || 0);
    const lowStock = Number(lowRows[0]?.lowItems || 0);
    const forecastDemand = 9240.0; // placeholder

    res.json({ todaySales, stockValue, lowStock, forecastDemand });
  } catch (err) {
    console.error("Dashboard data error:", err);
    res.status(500).json({ error: "Failed to fetch dashboard data" });
  }
});


export default router;
