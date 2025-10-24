// routes/admin_reports.js
import express from "express";
import db from "../db.compose.js";

const router = express.Router();

// === SALES REPORT ===
router.get("/sales", async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT 
        p.product_name,
        SUM(s.quantity_sold) AS units_sold,
        SUM(s.quantity_sold * s.price) AS revenue
      FROM sales s
      JOIN products p ON s.product_id = p.product_id
      GROUP BY s.product_id
    `);

    if (!rows.length) return res.json([]);

    const totalRevenue = rows.reduce((acc, r) => acc + Number(r.revenue), 0);
    const report = rows.map(r => ({
      product_name: r.product_name,
      units_sold: r.units_sold,
      revenue: r.revenue,
      percentage: ((r.revenue / totalRevenue) * 100).toFixed(2),
    }));

    res.json(report);
  } catch (err) {
    console.error("Error generating sales report:", err);
    res.status(500).json({ error: "Failed to fetch sales report" });
  }
});

// === INVENTORY REPORT ===
router.get("/inventory", async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT 
        i.item_name,
        i.stock,
        i.reorder_level
      FROM inventory i
    `);

    const report = rows.map(r => ({
      item_name: r.item_name,
      stock: r.stock,
      reorder_level: r.reorder_level,
    }));

    res.json(report);
  } catch (err) {
    console.error("Error generating inventory report:", err);
    res.status(500).json({ error: "Failed to fetch inventory report" });
  }
});

export default router;
