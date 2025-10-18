import express from "express";
import axios from "axios";
import composeDb from "../db.compose.js";

const router = express.Router();

const ML_URL = process.env.ML_SERVICE_URL || "http://ml_service:5000/forecast";

/**
 * Persist forecasts for given product_id
 */
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

    // Fetch existing forecasts
    const [rows] = await composeDb.query(`
      SELECT f.forecast_id,
             f.forecast_date,
             f.forecasted_demand,
             p.product_id,
             p.product_name,
             IFNULL(i.quantity_available, 0) AS quantity_available
      FROM forecasts f
      JOIN products p ON f.product_id = p.product_id
      LEFT JOIN inventory i ON p.product_id = i.product_id
      ORDER BY f.forecast_date ASC
    `);

    // If forecasts exist and not refreshing, return them
    if (rows.length > 0 && !refresh) return res.json(rows);

    // Optional: refresh from ML service for all products
    const [products] = await composeDb.query("SELECT product_id FROM products");

    for (const product of products) {
      const mlResponse = await axios.post(ML_URL, { horizon, product_id: product.product_id });
      const mlData = Array.isArray(mlResponse.data) ? mlResponse.data : [];
      if (mlData.length > 0) await persistForecasts(product.product_id, mlData);
    }

    // Fetch fresh forecasts after update
    const [freshRows] = await composeDb.query(`
      SELECT f.forecast_id,
             f.forecast_date,
             f.forecasted_demand,
             p.product_id,
             p.product_name,
             IFNULL(i.quantity_available, 0) AS quantity_available
      FROM forecasts f
      JOIN products p ON f.product_id = p.product_id
      LEFT JOIN inventory i ON p.product_id = i.product_id
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
