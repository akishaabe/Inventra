// routes/supad_reports.js
import express from "express";
import db from "../db.compose.js";

const router = express.Router();

/* =====================
   SUPERADMIN - SALES REPORT
===================== */
router.get("/sales", async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT 
        p.product_name,
        SUM(si.quantity) AS total_units_sold,
        SUM(si.line_total) AS total_revenue
      FROM sales_items si
      JOIN products p ON si.product_id = p.product_id
      JOIN sales s ON si.sale_id = s.sale_id
      GROUP BY si.product_id
      ORDER BY total_revenue DESC
    `);

    if (!rows.length) return res.json([]);

    const totalRevenue = rows.reduce((acc, r) => acc + Number(r.total_revenue), 0);

    const report = rows.map(r => ({
      product_name: r.product_name,
      total_units_sold: Number(r.total_units_sold),
      total_revenue: Number(r.total_revenue),
      percentage: ((r.total_revenue / totalRevenue) * 100).toFixed(2)
    }));

    res.json(report);
  } catch (err) {
    console.error("Error generating SupAd sales report:", err);
    res.status(500).json({ error: "Failed to fetch SupAd sales report" });
  }
});

/* =====================
   SUPERADMIN - INVENTORY REPORT
===================== */
router.get("/inventory", async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT 
        p.product_name,
        i.quantity_available AS stock,
        p.reorder_level,
        CASE 
          WHEN i.quantity_available <= p.reorder_level THEN 'Low Stock'
          ELSE 'Sufficient'
        END AS status
      FROM inventory i
      JOIN products p ON i.product_id = p.product_id
      ORDER BY p.product_name ASC
    `);

    res.json(rows);
  } catch (err) {
    console.error("Error generating SupAd inventory report:", err);
    res.status(500).json({ error: "Failed to fetch SupAd inventory report" });
  }
});

export default router;
