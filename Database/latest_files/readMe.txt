-- ==============================================
-- STEP 6: Verification Queries
-- ==============================================

SELECT '✅ Integration Complete!' AS status;

SELECT COUNT(*) AS total_forecasts FROM forecasts;

SELECT * FROM forecasts ORDER BY forecast_date DESC LIMIT 10;



STEP 9 – FINAL DATA INTEGRATION QA CHECKS (POST-STAGING)
They help you confirm:
 - product-sales linkage
 - forecast–trend–sales consistency
 - data integrity (no nulls / invalid keys)


Validate product–sales relationships
-- Counts how many sale items exist per product.
-- This checks whether each product has corresponding sales records.
SELECT 
    p.product_id,
    p.product_name, 
    COUNT(si.sale_item_id) AS total_sales_records,
    SUM(si.line_total) AS total_sales_value
FROM sales_items si
JOIN products p 
    ON si.product_id = p.product_id
JOIN sales s 
    ON si.sale_id = s.sale_id
GROUP BY p.product_id, p.product_name
ORDER BY total_sales_records DESC;


Cross-check forecasts with Google Trends data
-- This helps you verify that your forecasted demand aligns 
-- with external search interest trends (from Google Trends).
SELECT 
    f.forecast_date, 
    p.product_name, 
    f.forecasted_demand, 
    t.search_interest
FROM forecasts f
LEFT JOIN products p 
    ON f.product_id = p.product_id
LEFT JOIN staging_trends t 
    ON t.product_name = p.product_name 
   AND t.trend_date = f.forecast_date
ORDER BY f.forecast_date DESC, p.product_name;


Data integrity check – nulls or invalid references
-- Ensures every forecast record is linked to a product 
-- and has a valid forecast date.
SELECT 
    forecast_id, 
    product_id, 
    forecast_date, 
    forecasted_demand
FROM forecasts
WHERE forecast_date IS NULL 
   OR product_id IS NULL
   OR forecasted_demand IS NULL;



(Optional) Verify trends data coverage
-- Check that every product in forecasts has at least one 
-- corresponding trend entry for matching dates.
SELECT 
    p.product_name,
    COUNT(DISTINCT t.trend_date) AS trend_dates_matched,
    COUNT(DISTINCT f.forecast_date) AS forecast_dates_total
FROM forecasts f
JOIN products p 
    ON f.product_id = p.product_id
LEFT JOIN staging_trends t 
    ON t.product_name = p.product_name 
   AND t.trend_date = f.forecast_date
GROUP BY p.product_name;


(Optional) Check date consistency across all sources
-- Ensures all major tables share consistent date ranges.
SELECT 
    'sales' AS source, MIN(s.sale_date) AS start_date, MAX(s.sale_date) AS end_date 
FROM sales s
UNION ALL
SELECT 
    'forecasts', MIN(f.forecast_date), MAX(f.forecast_date) 
FROM forecasts f
UNION ALL
SELECT 
    'google_trends', MIN(t.trend_date), MAX(t.trend_date)
FROM staging_trends t;
