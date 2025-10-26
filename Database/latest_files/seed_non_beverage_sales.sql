-- Seed synthetic sales for non-beverage product categories to bootstrap forecasting
-- Categories: Flavoring, Ingredient, Packaging, Raw Material, Supply
-- Generates one sale per product per day for the past 28 days, with category-appropriate quantities
-- Charts and forecasts consume only quantities, so unit_price/line_total here are reasonable placeholders.

START TRANSACTION;

-- Base IDs to allow explicit sale_id mapping (safe even if table is non-empty)
SET @base_sale_id = (SELECT IFNULL(MAX(sale_id), 0) FROM sales);

-- NOTE: We scope the CTE separately for each INSERT for compatibility with phpMyAdmin/MySQL execution.
INSERT INTO sales (sale_id, sale_date, total_amount, processed_by, payment_type)
WITH RECURSIVE dates AS (
  SELECT 0 AS n, CAST(CURDATE() AS DATE) AS d
  UNION ALL
  SELECT n + 1, DATE_SUB(CURDATE(), INTERVAL n + 1 DAY)
  FROM dates
  WHERE n + 1 < 28
),
eligible_products AS (
  SELECT p.product_id, p.category, COALESCE(p.cost_per_unit, 50.00) AS cost_per_unit
  FROM products p
  WHERE p.category IN ('Flavoring','Ingredient','Packaging','Raw Material','Supply')
),
candidates AS (
  SELECT 
    d.d AS sale_day,
    ep.product_id,
    ep.category,
    ep.cost_per_unit,
    CASE ep.category
      WHEN 'Flavoring'    THEN GREATEST(1, FLOOR(1  + RAND(TO_SECONDS(d.d) + ep.product_id) * 5))
      WHEN 'Ingredient'   THEN GREATEST(1, FLOOR(2  + RAND(TO_SECONDS(d.d) + ep.product_id) * 7))
      WHEN 'Packaging'    THEN GREATEST(1, FLOOR(20 + RAND(TO_SECONDS(d.d) + ep.product_id) * 31))
      WHEN 'Raw Material' THEN GREATEST(1, FLOOR(1  + RAND(TO_SECONDS(d.d) + ep.product_id) * 3))
      WHEN 'Supply'       THEN GREATEST(1, FLOOR(15 + RAND(TO_SECONDS(d.d) + ep.product_id) * 36))
      ELSE GREATEST(1, FLOOR(1 + RAND(TO_SECONDS(d.d) + ep.product_id) * 5))
    END AS quantity,
    ROUND(GREATEST(1.00, ep.cost_per_unit * 1.50), 2) AS unit_price
  FROM dates d
  CROSS JOIN eligible_products ep
  WHERE NOT EXISTS (
    SELECT 1
    FROM sales s
    JOIN sales_items si ON si.sale_id = s.sale_id
    WHERE DATE(s.sale_date) = d.d
      AND si.product_id = ep.product_id
  )
),
rows_with_totals AS (
  SELECT 
    sale_day,
    product_id,
    category,
    quantity,
    unit_price,
    ROUND(quantity * unit_price, 2) AS line_total
  FROM candidates
),
numbered AS (
  SELECT 
    sale_day,
    product_id,
    category,
    quantity,
    unit_price,
    line_total,
    ROW_NUMBER() OVER (ORDER BY sale_day, product_id) AS rn
  FROM rows_with_totals
)
SELECT 
  @base_sale_id + rn AS sale_id,
  CAST(CONCAT(sale_day, ' 10:00:00') AS DATETIME) AS sale_date,
  line_total AS total_amount,
  NULL AS processed_by,
  'CASH' AS payment_type
FROM numbered
ORDER BY rn;

-- Insert corresponding sales_items referencing the explicit sale_id mapping
INSERT INTO sales_items (sale_id, product_id, quantity, unit_price, line_total)
WITH RECURSIVE dates AS (
  SELECT 0 AS n, CAST(CURDATE() AS DATE) AS d
  UNION ALL
  SELECT n + 1, DATE_SUB(CURDATE(), INTERVAL n + 1 DAY)
  FROM dates
  WHERE n + 1 < 28
),
eligible_products AS (
  SELECT p.product_id, p.category, COALESCE(p.cost_per_unit, 50.00) AS cost_per_unit
  FROM products p
  WHERE p.category IN ('Flavoring','Ingredient','Packaging','Raw Material','Supply')
),
candidates AS (
  SELECT 
    d.d AS sale_day,
    ep.product_id,
    ep.category,
    ep.cost_per_unit,
    CASE ep.category
      WHEN 'Flavoring'    THEN GREATEST(1, FLOOR(1  + RAND(TO_SECONDS(d.d) + ep.product_id) * 5))
      WHEN 'Ingredient'   THEN GREATEST(1, FLOOR(2  + RAND(TO_SECONDS(d.d) + ep.product_id) * 7))
      WHEN 'Packaging'    THEN GREATEST(1, FLOOR(20 + RAND(TO_SECONDS(d.d) + ep.product_id) * 31))
      WHEN 'Raw Material' THEN GREATEST(1, FLOOR(1  + RAND(TO_SECONDS(d.d) + ep.product_id) * 3))
      WHEN 'Supply'       THEN GREATEST(1, FLOOR(15 + RAND(TO_SECONDS(d.d) + ep.product_id) * 36))
      ELSE GREATEST(1, FLOOR(1 + RAND(TO_SECONDS(d.d) + ep.product_id) * 5))
    END AS quantity,
    ROUND(GREATEST(1.00, ep.cost_per_unit * 1.50), 2) AS unit_price
  FROM dates d
  CROSS JOIN eligible_products ep
  WHERE NOT EXISTS (
    SELECT 1
    FROM sales s
    JOIN sales_items si ON si.sale_id = s.sale_id
    WHERE DATE(s.sale_date) = d.d
      AND si.product_id = ep.product_id
  )
),
rows_with_totals AS (
  SELECT 
    sale_day,
    product_id,
    category,
    quantity,
    unit_price,
    ROUND(quantity * unit_price, 2) AS line_total
  FROM candidates
),
numbered AS (
  SELECT 
    sale_day,
    product_id,
    category,
    quantity,
    unit_price,
    line_total,
    ROW_NUMBER() OVER (ORDER BY sale_day, product_id) AS rn
  FROM rows_with_totals
)
SELECT 
  @base_sale_id + rn AS sale_id,
  product_id,
  quantity,
  unit_price,
  line_total
FROM numbered
ORDER BY rn;

COMMIT;

-- Notes:
-- 1) Safe ranges are tuned per category; adjust multipliers if needed.
-- 2) If you want more/less days, change the WHERE in the dates CTE (currently 28 days).
-- 3) The NOT EXISTS guard avoids duplicating sales for (product, date) already present.
-- 4) Each sale has a single item for simplicity so sales.total_amount matches the item’s line_total.
