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
  compare_at_price DECIMAL(12,2) NULL DEFAULT NULL,
  bundle_qty INT UNSIGNED NULL DEFAULT NULL,
  bundle_price DECIMAL(12,2) NULL DEFAULT NULL,
  wholesale_price DECIMAL(12,2) NOT NULL DEFAULT 0.00,
  retail_unit ENUM('meter', 'suit') NOT NULL DEFAULT 'meter',
  min_retail_qty INT UNSIGNED NOT NULL DEFAULT 1,
  min_wholesale_qty INT UNSIGNED NOT NULL DEFAULT 1,
  retail_only TINYINT(1) NOT NULL DEFAULT 0,
  unlimited_stock TINYINT(1) NOT NULL DEFAULT 0,
  purchase_mode ENUM('checkout', 'whatsapp') NOT NULL DEFAULT 'checkout',
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

INSERT IGNORE INTO categories (name, slug) VALUES
  ('Wash & Wear', 'wash-wear'),
  ('Cotton', 'cotton'),
  ('Khaddar', 'khaddar'),
  ('Summer', 'summer'),
  ('Winter', 'winter');
