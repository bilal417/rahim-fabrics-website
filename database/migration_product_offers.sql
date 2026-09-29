-- Adds reusable product offers/bundles to an existing Rahim Fabrics database.
-- The live PHP API also performs this migration idempotently when required.

ALTER TABLE products ADD COLUMN compare_at_price DECIMAL(12,2) NULL DEFAULT NULL AFTER retail_price;
ALTER TABLE products ADD COLUMN bundle_qty INT UNSIGNED NULL DEFAULT NULL AFTER compare_at_price;
ALTER TABLE products ADD COLUMN bundle_price DECIMAL(12,2) NULL DEFAULT NULL AFTER bundle_qty;
ALTER TABLE products ADD COLUMN retail_only TINYINT(1) NOT NULL DEFAULT 0 AFTER min_wholesale_qty;
ALTER TABLE products ADD COLUMN unlimited_stock TINYINT(1) NOT NULL DEFAULT 0 AFTER retail_only;
ALTER TABLE products ADD COLUMN purchase_mode ENUM('checkout', 'whatsapp') NOT NULL DEFAULT 'checkout' AFTER unlimited_stock;
ALTER TABLE products ADD COLUMN meter_price DECIMAL(12,2) NULL DEFAULT NULL AFTER stock_meters;
ALTER TABLE products ADD COLUMN min_meter_qty INT UNSIGNED NOT NULL DEFAULT 1 AFTER meter_price;
