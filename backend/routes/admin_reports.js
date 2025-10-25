// routes/admin_reports.js
import express from "express";
import db from "../db.js";

const router = express.Router();

/* =====================
   ADMIN - SALES REPORT
===================== */
router.get("/sales", async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT 
        p.product_name,
        SUM(si.quantity) AS units_sold,
        SUM(si.line_total) AS revenue
      FROM sales_items si
      JOIN products p ON si.product_id = p.product_id
      JOIN sales s ON si.sale_id = s.sale_id
      GROUP BY si.product_id
      ORDER BY revenue DESC
    `);

    if (!rows.length) return res.json([]);

    const totalRevenue = rows.reduce((acc, r) => acc + Number(r.revenue), 0);
    const report = rows.map(r => ({
      product_name: r.product_name,
      units_sold: Number(r.units_sold),
      revenue: Number(r.revenue),
      percentage: ((r.revenue / totalRevenue) * 100).toFixed(2)
    }));

    res.json(report);
  } catch (err) {
    console.error("Error generating admin sales report:", err);
    res.status(500).json({ error: "Failed to fetch sales report" });
  }
});

/* =====================
   ADMIN - INVENTORY REPORT
===================== */
router.get("/inventory", async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT 
        p.product_name AS item_name,
        i.quantity_available AS stock,
        p.reorder_level
      FROM inventory i
      JOIN products p ON i.product_id = p.product_id
      ORDER BY p.product_name ASC
    `);

    const report = rows.map(r => ({
      item_name: r.item_name,
      stock: Number(r.stock),
      reorder_level: Number(r.reorder_level)
    }));

    res.json(report);
  } catch (err) {
    console.error("Error generating admin inventory report:", err);
    res.status(500).json({ error: "Failed to fetch inventory report" });
  }
});

export default router;
