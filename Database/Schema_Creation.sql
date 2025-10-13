USE inventra;

-- 1. USERS
CREATE TABLE users (
  user_id INT AUTO_INCREMENT PRIMARY KEY,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  role ENUM('SUPERADMIN','ADMIN','STAFF') NOT NULL DEFAULT 'STAFF',
  is_2fa_enabled BOOLEAN NOT NULL DEFAULT FALSE,
  date_registered DATETIME DEFAULT CURRENT_TIMESTAMP,
  last_password_change DATETIME,
  INDEX idx_users_email (email)
) ENGINE=InnoDB;

-- 2. SUPPLIERS
CREATE TABLE suppliers (
  supplier_id INT AUTO_INCREMENT PRIMARY KEY,
  supplier_name VARCHAR(200) NOT NULL,
  contact_person VARCHAR(150),
  contact_number VARCHAR(50),
  email VARCHAR(150),
  INDEX idx_suppliers_name (supplier_name)
) ENGINE=InnoDB;

-- 3. PRODUCTS
CREATE TABLE products (
  product_id INT AUTO_INCREMENT PRIMARY KEY,
  sku VARCHAR(50) UNIQUE,
  product_name VARCHAR(200) NOT NULL,
  category VARCHAR(100),
  unit VARCHAR(20) NOT NULL,
  reorder_level INT NOT NULL DEFAULT 0,
  supplier_id INT NULL,
  cost_per_unit DECIMAL(10,2),
  has_expiry BOOLEAN DEFAULT FALSE,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (supplier_id) REFERENCES suppliers(supplier_id)
    ON DELETE SET NULL ON UPDATE CASCADE,
  INDEX idx_products_category (category)
) ENGINE=InnoDB;

-- 4. INVENTORY (one row per product)
CREATE TABLE inventory (
  inventory_id INT AUTO_INCREMENT PRIMARY KEY,
  product_id INT NOT NULL UNIQUE,
  quantity_available DECIMAL(10,2) NOT NULL DEFAULT 0,
  last_updated DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (product_id) REFERENCES products(product_id)
    ON DELETE CASCADE ON UPDATE CASCADE,
  INDEX idx_inventory_qty (quantity_available)
) ENGINE=InnoDB;

-- 5. SALES (header)
CREATE TABLE sales (
  sale_id INT AUTO_INCREMENT PRIMARY KEY,
  sale_date DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  total_amount DECIMAL(12,2) NOT NULL DEFAULT 0,
  processed_by INT NULL,
  payment_type ENUM('CASH','CARD','OTHER') DEFAULT 'CASH',
  notes TEXT,
  FOREIGN KEY (processed_by) REFERENCES users(user_id)
    ON DELETE SET NULL ON UPDATE CASCADE,
  INDEX idx_sales_date (sale_date)
) ENGINE=InnoDB;

-- 6. SALES_ITEMS (line items)
CREATE TABLE sales_items (
  sale_item_id INT AUTO_INCREMENT PRIMARY KEY,
  sale_id INT NOT NULL,
  product_id INT NOT NULL,
  quantity DECIMAL(10,2) NOT NULL,
  unit_price DECIMAL(10,2) NOT NULL,
  line_total DECIMAL(12,2) NOT NULL,
  FOREIGN KEY (sale_id) REFERENCES sales(sale_id) ON DELETE CASCADE ON UPDATE CASCADE,
  FOREIGN KEY (product_id) REFERENCES products(product_id) ON DELETE RESTRICT ON UPDATE CASCADE,
  INDEX idx_sales_items_product (product_id),
  INDEX idx_sales_items_sale (sale_id)
) ENGINE=InnoDB;

-- 7. FORECASTS
CREATE TABLE forecasts (
  forecast_id INT AUTO_INCREMENT PRIMARY KEY,
  product_id INT NOT NULL,
  forecasted_demand DECIMAL(10,2) NOT NULL,
  forecast_date DATE NOT NULL,
  generated_by INT,
  model_meta VARCHAR(255),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (product_id) REFERENCES products(product_id) ON DELETE CASCADE ON UPDATE CASCADE,
  FOREIGN KEY (generated_by) REFERENCES users(user_id) ON DELETE SET NULL ON UPDATE CASCADE,
  UNIQUE KEY uq_forecast_product_date (product_id, forecast_date)
) ENGINE=InnoDB;

-- 8. REPORTS (metadata for exports)
CREATE TABLE reports (
  report_id INT AUTO_INCREMENT PRIMARY KEY,
  report_type ENUM('INVENTORY','SALES','FORECAST') NOT NULL,
  generated_date DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  generated_by INT,
  file_path VARCHAR(500),
  FOREIGN KEY (generated_by) REFERENCES users(user_id) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB;

-- 9. BACKUPS (manual backup metadata)
CREATE TABLE backups (
  backup_id INT AUTO_INCREMENT PRIMARY KEY,
  backup_date DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  backup_file VARCHAR(500) NOT NULL,
  created_by INT,
  FOREIGN KEY (created_by) REFERENCES users(user_id) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB;
