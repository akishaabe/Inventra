import express from "express";
import axios from "axios";
import composeDb from "../db.js";

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
SELECT 
  p.product_id,
  p.product_name,
  p.category,
  MAX(f.forecast_date) AS forecast_date,
  ANY_VALUE(f.forecasted_demand) AS forecasted_demand,
  IFNULL(i.quantity_available, 0) AS quantity_available,
  IFNULL(
    JSON_ARRAYAGG(
      JSON_OBJECT(
        'text', a.recommendation_text,
        'priority', a.priority,
        'reason', a.reason
      )
    ), JSON_ARRAY()
  ) AS ai_recommendations
FROM forecasts f
JOIN products p ON f.product_id = p.product_id
LEFT JOIN inventory i ON p.product_id = i.product_id
LEFT JOIN ai_recommendations a ON p.product_id = a.product_id AND a.is_active = 1
GROUP BY p.product_id
ORDER BY p.product_name;



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
SELECT 
  p.product_id,
  p.product_name,
  p.category,
  MAX(f.forecast_date) AS forecast_date,
  ANY_VALUE(f.forecasted_demand) AS forecasted_demand,
  IFNULL(i.quantity_available, 0) AS quantity_available,
  IFNULL(
    JSON_ARRAYAGG(
      JSON_OBJECT(
        'text', a.recommendation_text,
        'priority', a.priority,
        'reason', a.reason
      )
    ), JSON_ARRAY()
  ) AS ai_recommendations
FROM forecasts f
JOIN products p ON f.product_id = p.product_id
LEFT JOIN inventory i ON p.product_id = i.product_id
LEFT JOIN ai_recommendations a ON p.product_id = a.product_id AND a.is_active = 1
GROUP BY p.product_id
ORDER BY p.product_name;
    `, [horizon]);

    return res.json(freshRows);
  } catch (err) {
    console.error("Forecasts route error:", err);
    res.status(500).json({ error: "Failed to fetch forecasts" });
  }
});

// Return one highest-priority active AI recommendation for dashboard cards
router.get("/ai-recommendation", async (req, res) => {
  try {
    const [rows] = await composeDb.query(
      `SELECT a.id,
              a.product_id,
              p.product_name,
              a.recommendation_text,
              a.reason,
              a.priority,
              a.created_at
       FROM ai_recommendations a
       LEFT JOIN products p ON p.product_id = a.product_id
       WHERE a.is_active = 1 AND LOWER(a.priority) = 'high'
       ORDER BY a.created_at DESC
       LIMIT 1`
    );

    if (!rows || rows.length === 0) return res.json(null);
    res.json(rows[0]);
  } catch (err) {
    console.error("AI recommendation fetch error:", err);
    res.status(500).json({ error: "Failed to fetch AI recommendation" });
  }
});

export default router;
