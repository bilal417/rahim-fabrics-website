-- One-time live catalogue conversion to website checkout.
-- The PHP API applies the equivalent migration automatically and records it in app_migrations.

SET NAMES utf8mb4;

UPDATE products SET purchase_mode = 'checkout';
