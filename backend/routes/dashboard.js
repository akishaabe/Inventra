import express from "express";
import db from "../db.js";

const router = express.Router();

router.get("/", async (req, res) => {
   try {
    const [sales] = await db.query(`
      SELECT SUM(total_amount) AS totalSales
      FROM sales
      WHERE DATE(sale_date) = CURDATE()
    `);
    const [stock] = await db.query(`
      SELECT SUM(i.quantity_available * p.cost_per_unit) AS totalStockValue
      FROM inventory i
      JOIN products p ON i.product_id = p.product_id
    `);
        const [lowStock] = await db.query(`
      SELECT COUNT(*) AS lowItems
      FROM products p
      JOIN inventory i ON p.product_id = i.product_id
      WHERE i.quantity_available < p.reorder_level
    `);

    const forecastDemand = 9240.0; // Placeholder value

    res.json({
      todaySales: sales[0].totalSales || 0,
      stockValue: stock[0].totalStockValue || 0,
      lowStock: lowStock[0].lowItems || 0,
      forecastDemand
    });
  } catch (err) {
    console.error("Dashboard data error:", err);
    res.status(500).json({ error: "Failed to fetch dashboard data" });
  }
});

export default router;
