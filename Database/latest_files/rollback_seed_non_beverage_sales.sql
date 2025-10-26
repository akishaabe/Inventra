-- Rollback the synthetic sales inserted by seed_non_beverage_sales.sql
-- Strategy:
--  - Identify seed sales by:
--      * sale_time = 10:00:00
--      * sale_date within last 28 days
--      * exactly one item per sale
--      * product belongs to categories: Flavoring, Ingredient, Packaging, Raw Material, Supply
--  - Remove matching sales_items then their parent sales

START TRANSACTION;

CREATE TEMPORARY TABLE IF NOT EXISTS seed_sales_ids (
  sale_id INT PRIMARY KEY
) ENGINE=Memory;

TRUNCATE TABLE seed_sales_ids;

INSERT INTO seed_sales_ids (sale_id)
SELECT s.sale_id
FROM sales s
JOIN sales_items si ON si.sale_id = s.sale_id
JOIN products p ON p.product_id = si.product_id
WHERE TIME(s.sale_date) = '10:00:00'
  AND DATE(s.sale_date) BETWEEN DATE_SUB(CURDATE(), INTERVAL 27 DAY) AND CURDATE()
  AND p.category IN ('Flavoring','Ingredient','Packaging','Raw Material','Supply')
GROUP BY s.sale_id
HAVING COUNT(*) = 1; -- we only inserted one item per sale

-- Delete child rows first
DELETE si
FROM sales_items si
JOIN seed_sales_ids ss ON ss.sale_id = si.sale_id;

-- Then delete the parent sales
DELETE s
FROM sales s
JOIN seed_sales_ids ss ON ss.sale_id = s.sale_id;

DROP TEMPORARY TABLE IF EXISTS seed_sales_ids;

COMMIT;
