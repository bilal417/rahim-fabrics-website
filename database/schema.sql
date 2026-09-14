SET NAMES utf8mb4;
SET time_zone = '+00:00';

CREATE TABLE IF NOT EXISTS users (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  name VARCHAR(120) NOT NULL,
  email VARCHAR(190) NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role ENUM('admin', 'staff') NOT NULL DEFAULT 'staff',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY users_email_unique (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS categories (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  name VARCHAR(120) NOT NULL,
  slug VARCHAR(150) NOT NULL,
  description TEXT NULL,
  active TINYINT(1) NOT NULL DEFAULT 1,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY categories_name_unique (name),
  UNIQUE KEY categories_slug_unique (slug)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS products (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  name VARCHAR(190) NOT NULL,
  slug VARCHAR(220) NOT NULL,
  code VARCHAR(80) NOT NULL,
  category VARCHAR(120) NOT NULL,
  fabric_type VARCHAR(160) NOT NULL,
  colors LONGTEXT NOT NULL,
  thaan_length VARCHAR(100) NOT NULL,
  suits_per_thaan SMALLINT UNSIGNED NOT NULL,
  stock INT UNSIGNED NOT NULL DEFAULT 0,
  stock_meters INT UNSIGNED NOT NULL DEFAULT 0,
  retail_price DECIMAL(12,2) NOT NULL DEFAULT 0.00,
  wholesale_price DECIMAL(12,2) NOT NULL DEFAULT 0.00,
  retail_unit ENUM('meter', 'suit') NOT NULL DEFAULT 'meter',
  min_retail_qty INT UNSIGNED NOT NULL DEFAULT 1,
  min_wholesale_qty INT UNSIGNED NOT NULL DEFAULT 1,
  description TEXT NOT NULL,
  featured TINYINT(1) NOT NULL DEFAULT 0,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY products_slug_unique (slug),
  UNIQUE KEY products_code_unique (code),
  KEY products_category_index (category),
  KEY products_featured_index (featured)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS product_images (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  product_id BIGINT UNSIGNED NOT NULL,
  url VARCHAR(500) NOT NULL,
  sort_order SMALLINT UNSIGNED NOT NULL DEFAULT 0,
  PRIMARY KEY (id),
  KEY product_images_product_index (product_id),
  CONSTRAINT product_images_product_fk FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS inquiries (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  customer_name VARCHAR(150) NOT NULL,
  business_name VARCHAR(190) NULL,
  phone VARCHAR(50) NOT NULL,
  city VARCHAR(120) NOT NULL,
  shop_type VARCHAR(120) NULL,
  monthly_requirement VARCHAR(120) NULL,
  products_interested LONGTEXT NULL,
  message TEXT NULL,
  status ENUM('new', 'contacted', 'closed') NOT NULL DEFAULT 'new',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY inquiries_status_index (status),
  KEY inquiries_created_index (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS orders (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  order_number VARCHAR(32) NOT NULL,
  channel ENUM('retail', 'wholesale') NOT NULL,
  customer_name VARCHAR(150) NOT NULL,
  business_name VARCHAR(190) NULL,
  phone VARCHAR(50) NOT NULL,
  email VARCHAR(190) NULL,
  city VARCHAR(120) NOT NULL,
  address TEXT NOT NULL,
  payment_method ENUM('cod', 'bank_transfer') NOT NULL,
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

INSERT IGNORE INTO categories (name, slug) VALUES
  ('Wash & Wear', 'wash-wear'),
  ('Cotton', 'cotton'),
  ('Khaddar', 'khaddar'),
  ('Summer', 'summer'),
  ('Winter', 'winter');

INSERT IGNORE INTO products (
  name, slug, code, category, fabric_type, colors, thaan_length, suits_per_thaan, stock, stock_meters,
  retail_price, wholesale_price, retail_unit, min_retail_qty, min_wholesale_qty, description, featured
) VALUES
  ('Royal Premium Wash & Wear', 'royal-premium-wash-wear', 'RF-WW-001', 'Wash & Wear', 'Premium Wash & Wear', '["Emerald","Navy Blue","Charcoal","Cream"]', '20 metres', 5, 24, 480, 1850.00, 32000.00, 'meter', 2, 1, 'A refined all-season wash & wear with a clean fall, smooth handle and dependable colour performance for premium menswear.', 1),
  ('Signature Cotton Collection', 'signature-cotton', 'RF-CT-004', 'Cotton', 'Combed Cotton', '["White","Ivory","Sand","Black"]', '18 metres', 5, 17, 306, 1450.00, 24000.00, 'meter', 2, 1, 'Breathable combed cotton with an elegant natural finish, selected for summer retail ranges and everyday comfort.', 1),
  ('Heritage Khaddar', 'heritage-khaddar', 'RF-KH-012', 'Khaddar', 'Fine Khaddar', '["Brown","Charcoal","Olive","Navy Blue"]', '16 metres', 4, 11, 176, 1650.00, 22000.00, 'meter', 2, 1, 'Warm, richly textured fine khaddar developed for winter collections with a premium traditional character.', 1),
  ('Summer Breeze', 'summer-breeze', 'RF-SM-008', 'Summer', 'Lightweight Blended', '["Cream","Ice Blue","Light Grey","White"]', '20 metres', 5, 31, 620, 1250.00, 21000.00, 'meter', 2, 1, 'A lightweight summer blend with airflow, softness and a crisp finish made for high-turnover warm-weather ranges.', 0),
  ('Winter Regent', 'winter-regent', 'RF-WT-016', 'Winter', 'Warm Blended', '["Black","Coffee","Charcoal","Bottle Green"]', '16 metres', 4, 8, 128, 1750.00, 23000.00, 'meter', 2, 1, 'Dense winter fabric with a soft brushed touch and stately drape for elevated seasonal menswear.', 0),
  ('Executive Wash & Wear', 'executive-wash-wear', 'RF-WW-021', 'Wash & Wear', 'Tropical Wash & Wear', '["Navy Blue","Black","Stone","Emerald"]', '20 metres', 5, 19, 380, 1550.00, 28000.00, 'meter', 2, 1, 'A polished tropical wash & wear engineered for easy tailoring, strong recovery and year-round dealer demand.', 0);

INSERT INTO product_images (product_id, url, sort_order)
SELECT p.id, '/images/fabric-collection.png', 0
FROM products p
WHERE NOT EXISTS (SELECT 1 FROM product_images pi WHERE pi.product_id = p.id);
