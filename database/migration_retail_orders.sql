-- Live DB migration for retail + wholesale shop (Hostinger / MySQL / MariaDB).
-- If a column already exists, skip that ALTER line and continue.

SET NAMES utf8mb4;

ALTER TABLE products ADD COLUMN stock_meters INT UNSIGNED NOT NULL DEFAULT 0 AFTER stock;
ALTER TABLE products ADD COLUMN retail_price DECIMAL(12,2) NOT NULL DEFAULT 0.00 AFTER stock_meters;
ALTER TABLE products ADD COLUMN wholesale_price DECIMAL(12,2) NOT NULL DEFAULT 0.00 AFTER retail_price;
ALTER TABLE products ADD COLUMN retail_unit ENUM('meter', 'suit') NOT NULL DEFAULT 'meter' AFTER wholesale_price;
ALTER TABLE products ADD COLUMN min_retail_qty INT UNSIGNED NOT NULL DEFAULT 1 AFTER retail_unit;
ALTER TABLE products ADD COLUMN min_wholesale_qty INT UNSIGNED NOT NULL DEFAULT 1 AFTER min_retail_qty;

UPDATE products SET
  stock_meters = CASE code
    WHEN 'RF-WW-001' THEN 480
    WHEN 'RF-CT-004' THEN 306
    WHEN 'RF-KH-012' THEN 176
    WHEN 'RF-SM-008' THEN 620
    WHEN 'RF-WT-016' THEN 128
    WHEN 'RF-WW-021' THEN 380
    ELSE GREATEST(stock_meters, stock * 20)
  END,
  retail_price = CASE code
    WHEN 'RF-WW-001' THEN 1850.00
    WHEN 'RF-CT-004' THEN 1450.00
    WHEN 'RF-KH-012' THEN 1650.00
    WHEN 'RF-SM-008' THEN 1250.00
    WHEN 'RF-WT-016' THEN 1750.00
    WHEN 'RF-WW-021' THEN 1550.00
    ELSE GREATEST(retail_price, 1000.00)
  END,
  wholesale_price = CASE code
    WHEN 'RF-WW-001' THEN 32000.00
    WHEN 'RF-CT-004' THEN 24000.00
    WHEN 'RF-KH-012' THEN 22000.00
    WHEN 'RF-SM-008' THEN 21000.00
    WHEN 'RF-WT-016' THEN 23000.00
    WHEN 'RF-WW-021' THEN 28000.00
    ELSE GREATEST(wholesale_price, 15000.00)
  END,
  min_retail_qty = GREATEST(min_retail_qty, 2),
  min_wholesale_qty = GREATEST(min_wholesale_qty, 1)
WHERE retail_price = 0 OR wholesale_price = 0 OR stock_meters = 0;

CREATE TABLE IF NOT EXISTS orders (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  order_number VARCHAR(32) NOT NULL,
  channel ENUM('retail', 'wholesale') NOT NULL,
  customer_name VARCHAR(150) NOT NULL,
  business_name VARCHAR(190) NULL,
  phone VARCHAR(50) NOT NULL,
  email VARCHAR(190) NULL,
  country VARCHAR(120) NOT NULL DEFAULT 'Pakistan',
  city VARCHAR(120) NOT NULL,
  address TEXT NOT NULL,
  address_line2 VARCHAR(255) NULL,
  postal_code VARCHAR(32) NULL,
  billing_same TINYINT(1) NOT NULL DEFAULT 1,
  billing_address TEXT NULL,
  payment_method ENUM('cod', 'bank_transfer') NOT NULL,
  payment_slip_url VARCHAR(500) NULL,
  payment_status ENUM('pending', 'cod_pending', 'paid', 'failed', 'refunded') NOT NULL DEFAULT 'pending',
  order_status ENUM('new', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled') NOT NULL DEFAULT 'new',
  subtotal DECIMAL(12,2) NOT NULL DEFAULT 0.00,
  total DECIMAL(12,2) NOT NULL DEFAULT 0.00,
  notes TEXT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY orders_number_unique (order_number),
  KEY orders_channel_index (channel),
  KEY orders_status_index (order_status),
  KEY orders_payment_index (payment_status),
  KEY orders_created_index (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS order_items (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  order_id BIGINT UNSIGNED NOT NULL,
  product_id BIGINT UNSIGNED NULL,
  product_name VARCHAR(190) NOT NULL,
  product_code VARCHAR(80) NOT NULL,
  unit ENUM('meter', 'suit', 'thaan') NOT NULL,
  qty DECIMAL(12,2) NOT NULL,
  unit_price DECIMAL(12,2) NOT NULL,
  line_total DECIMAL(12,2) NOT NULL,
  PRIMARY KEY (id),
  KEY order_items_order_index (order_id),
  CONSTRAINT order_items_order_fk FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
