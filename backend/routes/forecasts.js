import express from "express";
import axios from "axios";
import composeDb from "../db.compose.js";

const router = express.Router();

const ML_URL = process.env.ML_SERVICE_URL || "http://ml_service:5000/forecast";
const FORECAST_PRODUCT_SKU = process.env.FORECAST_PRODUCT_SKU || "TOTAL_SALES_PLACEHOLDER";

async function ensurePlaceholderProduct() {
  const [rows] = await composeDb.query(
    "SELECT product_id FROM products WHERE sku = ? LIMIT 1",
    [FORECAST_PRODUCT_SKU]
  );

  if (rows.length) return rows[0].product_id;

  const [res] = await composeDb.query(
    "INSERT INTO products (sku, product_name, unit, category) VALUES (?, ?, ?, ?)",
    [FORECAST_PRODUCT_SKU, "Total Sales (placeholder)", "kg", "system"]
  );

  await composeDb.query(
    "INSERT INTO inventory (product_id, quantity_available) VALUES (?, ?)",
    [res.insertId, 0]
  );

  return res.insertId;
}

async function persistForecasts(productId, mlData) {
  const insertValues = mlData.map(item => [
    productId,
    item.ds,
    parseFloat(item.yhat) || 0,
    null,
    null
  ]);

  const insertSql = `
    INSERT INTO forecasts (product_id, forecast_date, forecasted_demand, model_meta, created_at)
    VALUES ?
    ON DUPLICATE KEY UPDATE
      forecasted_demand = VALUES(forecasted_demand),
      created_at = VALUES(created_at)
  `;

  await composeDb.query(insertSql, [insertValues]);
}

router.get("/", async (req, res) => {
  try {
    const refresh = req.query.refresh === "true";
    const horizon = parseInt(req.query.period) || 14;


    const [rows] = await composeDb.query(`
      SELECT f.forecast_id, f.forecast_date, f.forecasted_demand, p.product_name,
             IFNULL(i.quantity_available, 0) AS quantity_available
      FROM forecasts f
      JOIN products p ON f.product_id = p.product_id
      LEFT JOIN inventory i ON p.product_id = i.product_id
      ORDER BY f.forecast_date ASC
    `);

    if (rows.length > 0 && !refresh) return res.json(rows);

    const placeholderProductId = await ensurePlaceholderProduct();

    if (refresh)
      await composeDb.query("DELETE FROM forecasts WHERE product_id = ?", [placeholderProductId]);

    const mlResponse = await axios.post(ML_URL, { horizon });

    let mlData = mlResponse.data;

    // If ML service returns nothing, create placeholder rows
    if (!Array.isArray(mlData) || mlData.length === 0) {
      console.warn("ML service returned empty data — using placeholders.");
      const today = new Date();
      mlData = Array.from({ length: 14 }, (_, i) => ({
        ds: new Date(today.getTime() + i * 86400000).toISOString().split("T")[0],
        yhat: Math.random() * 100, // fake forecast values
        yhat_lower: null,
        yhat_upper: null,
      }));
    }

    await persistForecasts(placeholderProductId, mlData);


    /*
    const [freshRows] = await composeDb.query(`
      SELECT f.forecast_id, f.forecast_date, f.forecasted_demand, p.product_name,
             IFNULL(i.quantity_available, 0) AS quantity_available
      FROM forecasts f
      JOIN products p ON f.product_id = p.product_id
      LEFT JOIN inventory i ON p.product_id = i.product_id
      WHERE p.sku != 'TOTAL_SALES_PLACEHOLDER'
      ORDER BY f.forecast_date ASC
    `);
    */


    const [freshRows] = await composeDb.query(`
      SELECT 
        f.forecast_id,
        f.forecast_date,
        f.forecasted_demand,
        p.product_name,
        IFNULL(i.quantity_available, 0) AS quantity_available
      FROM forecasts f
      JOIN products p ON f.product_id = p.product_id
      LEFT JOIN inventory i ON p.product_id = i.product_id
      WHERE p.sku != 'TOTAL_SALES_PLACEHOLDER'
      ORDER BY f.forecast_date ASC
      LIMIT ?
    `, [horizon]);


    return res.json(freshRows);
  } catch (err) {
    console.error("Forecasts route error:", err);
    res.status(500).json({ error: "Failed to fetch forecasts" });
  }
});

export default router;
