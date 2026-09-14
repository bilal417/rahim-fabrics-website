-- Clear catalogue products from live DB (keep orders / inquiries).
-- Run in phpMyAdmin after deploy if products still appear from API.

SET NAMES utf8mb4;

DELETE FROM product_images;
DELETE FROM products;
