-- Checkout delivery fields and bank-deposit receipt support.
-- The live PHP API also applies these columns idempotently when the checkout is opened.

SET NAMES utf8mb4;

ALTER TABLE orders ADD COLUMN country VARCHAR(120) NOT NULL DEFAULT 'Pakistan' AFTER email;
ALTER TABLE orders ADD COLUMN address_line2 VARCHAR(255) NULL AFTER address;
ALTER TABLE orders ADD COLUMN postal_code VARCHAR(32) NULL AFTER address_line2;
ALTER TABLE orders ADD COLUMN billing_same TINYINT(1) NOT NULL DEFAULT 1 AFTER postal_code;
ALTER TABLE orders ADD COLUMN billing_address TEXT NULL AFTER billing_same;
ALTER TABLE orders ADD COLUMN payment_slip_url VARCHAR(500) NULL AFTER payment_method;
