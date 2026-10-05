<?php

declare(strict_types=1);

$config = require __DIR__ . '/config.php';

function config(string $key, mixed $fallback = null): mixed
{
    global $config;
    return $config[$key] ?? $fallback;
}

function db(): PDO
{
    static $pdo = null;
    if ($pdo instanceof PDO) {
        return $pdo;
    }

    foreach (['db_name', 'db_user', 'db_password'] as $key) {
        if ((string) config($key) === '') {
            throw new RuntimeException('Database configuration is incomplete.');
        }
    }

    $dsn = sprintf(
        'mysql:host=%s;port=%d;dbname=%s;charset=utf8mb4',
        config('db_host', 'localhost'),
        (int) config('db_port', 3306),
        config('db_name')
    );
    $pdo = new PDO($dsn, (string) config('db_user'), (string) config('db_password'), [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        PDO::ATTR_EMULATE_PREPARES => false,
    ]);
    return $pdo;
}

function respond(mixed $data = null, int $status = 200): never
{
    http_response_code($status);
    header('Content-Type: application/json; charset=utf-8');
    if ($status !== 204) {
        echo json_encode($data, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);
    }
    exit;
}

function fail(string $message, int $status = 400): never
{
    respond(['message' => $message], $status);
}

function input(): array
{
    if (!empty($_POST)) {
        return $_POST;
    }
    $raw = file_get_contents('php://input');
    if ($raw === false || trim($raw) === '') {
        return [];
    }
    $data = json_decode($raw, true);
    return is_array($data) ? $data : [];
}

function requiredText(array $data, string $key, string $label): string
{
    $value = trim((string) ($data[$key] ?? ''));
    if ($value === '') {
        fail($label . ' is required.', 422);
    }
    return $value;
}

function slugify(string $value): string
{
    $slug = strtolower(trim($value));
    $slug = preg_replace('/[^a-z0-9]+/', '-', $slug) ?? '';
    return trim($slug, '-');
}

function base64UrlEncode(string $value): string
{
    return rtrim(strtr(base64_encode($value), '+/', '-_'), '=');
}

function base64UrlDecode(string $value): string|false
{
    return base64_decode(strtr($value, '-_', '+/'), true);
}

function createToken(array $user): string
{
    $secret = (string) config('jwt_secret');
    if (strlen($secret) < 32) {
        throw new RuntimeException('JWT secret must contain at least 32 characters.');
    }
    $header = base64UrlEncode(json_encode(['alg' => 'HS256', 'typ' => 'JWT']));
    $payload = base64UrlEncode(json_encode([
        'id' => (int) $user['id'],
        'role' => $user['role'],
        'iat' => time(),
        'exp' => time() + (int) config('token_ttl', 604800),
    ]));
    $signature = base64UrlEncode(hash_hmac('sha256', $header . '.' . $payload, $secret, true));
    return $header . '.' . $payload . '.' . $signature;
}

function authorizationHeader(): string
{
    if (!empty($_SERVER['HTTP_AUTHORIZATION'])) {
        return (string) $_SERVER['HTTP_AUTHORIZATION'];
    }
    if (!empty($_SERVER['REDIRECT_HTTP_AUTHORIZATION'])) {
        return (string) $_SERVER['REDIRECT_HTTP_AUTHORIZATION'];
    }
    if (function_exists('apache_request_headers')) {
        $headers = apache_request_headers();
        return (string) ($headers['Authorization'] ?? $headers['authorization'] ?? '');
    }
    return '';
}

function requireAuth(): array
{
    $header = authorizationHeader();
    if (!preg_match('/^Bearer\s+(.+)$/i', $header, $matches)) {
        fail('Authentication required.', 401);
    }
    $parts = explode('.', $matches[1]);
    if (count($parts) !== 3) {
        fail('Invalid or expired token.', 401);
    }
    [$encodedHeader, $encodedPayload, $signature] = $parts;
    $expected = base64UrlEncode(hash_hmac(
        'sha256',
        $encodedHeader . '.' . $encodedPayload,
        (string) config('jwt_secret'),
        true
    ));
    $decoded = base64UrlDecode($encodedPayload);
    $payload = $decoded === false ? null : json_decode($decoded, true);
    if (!hash_equals($expected, $signature) || !is_array($payload) || (int) ($payload['exp'] ?? 0) < time()) {
        fail('Invalid or expired token.', 401);
    }
    $statement = db()->prepare('SELECT id, name, email, role FROM users WHERE id = ? LIMIT 1');
    $statement->execute([(int) ($payload['id'] ?? 0)]);
    $user = $statement->fetch();
    if (!$user) {
        fail('User no longer exists.', 401);
    }
    return userJson($user);
}

function userJson(array $row): array
{
    return [
        '_id' => (string) $row['id'],
        'id' => (string) $row['id'],
        'name' => $row['name'],
        'email' => $row['email'],
        'role' => $row['role'],
    ];
}

function productJson(array $row, ?array $images = null): array
{
    if ($images === null) {
        $statement = db()->prepare('SELECT url FROM product_images WHERE product_id = ? ORDER BY sort_order, id');
        $statement->execute([(int) $row['id']]);
        $images = $statement->fetchAll();
    }
    $colors = json_decode((string) ($row['colors'] ?? '[]'), true);
    return [
        '_id' => (string) $row['id'],
        'slug' => $row['slug'],
        'name' => $row['name'],
        'code' => $row['code'],
        'category' => $row['category'],
        'fabricType' => $row['fabric_type'],
        'colors' => is_array($colors) ? $colors : [],
        'thaanLength' => $row['thaan_length'],
        'suitsPerThaan' => (int) $row['suits_per_thaan'],
        'stock' => (int) $row['stock'],
        'stockMeters' => (int) ($row['stock_meters'] ?? 0),
        'meterPrice' => isset($row['meter_price']) ? (float) $row['meter_price'] : null,
        'minMeterQty' => (int) ($row['min_meter_qty'] ?? 1),
        'retailPrice' => (float) ($row['retail_price'] ?? 0),
        'compareAtPrice' => isset($row['compare_at_price']) ? (float) $row['compare_at_price'] : null,
        'bundleQty' => isset($row['bundle_qty']) ? (int) $row['bundle_qty'] : null,
        'bundlePrice' => isset($row['bundle_price']) ? (float) $row['bundle_price'] : null,
        'wholesalePrice' => (float) ($row['wholesale_price'] ?? 0),
        'retailUnit' => (string) ($row['retail_unit'] ?? 'meter'),
        'minRetailQty' => (int) ($row['min_retail_qty'] ?? 1),
        'minWholesaleQty' => (int) ($row['min_wholesale_qty'] ?? 1),
        'images' => array_map(static fn (array $image): array => ['url' => $image['url']], $images),
        'description' => $row['description'],
        'featured' => (bool) $row['featured'],
        'retailOnly' => (bool) ($row['retail_only'] ?? false),
        'purchaseMode' => (string) ($row['purchase_mode'] ?? 'checkout'),
        'unlimitedStock' => (bool) ($row['unlimited_stock'] ?? false),
        'createdAt' => $row['created_at'],
        'updatedAt' => $row['updated_at'],
    ];
}

function isUnlimitedStockProduct(array $product): bool
{
    return (bool) ($product['unlimited_stock'] ?? false);
}

function retailLineTotal(array $product, float $quantity, float $unitPrice): float
{
    $bundleQty = (int) ($product['bundle_qty'] ?? 0);
    $bundlePrice = (float) ($product['bundle_price'] ?? 0);
    if ($bundleQty < 2 || $bundlePrice <= 0 || floor($quantity) !== $quantity) {
        return round($unitPrice * $quantity, 2);
    }

    $wholeUnits = (int) $quantity;
    $bundles = intdiv($wholeUnits, $bundleQty);
    $singleUnits = $wholeUnits % $bundleQty;
    return round(($bundles * $bundlePrice) + ($singleUnits * $unitPrice), 2);
}

function ensureProductOfferColumns(): void
{
    static $checked = false;
    if ($checked) {
        return;
    }
    $checked = true;

    $pdo = db();
    $columns = $pdo->query("SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'products'")
        ->fetchAll(PDO::FETCH_COLUMN);
    $existing = array_fill_keys(array_map('strval', $columns), true);
    $definitions = [
        'meter_price' => 'DECIMAL(12,2) NULL DEFAULT NULL AFTER stock_meters',
        'min_meter_qty' => 'INT UNSIGNED NOT NULL DEFAULT 1 AFTER meter_price',
        'compare_at_price' => 'DECIMAL(12,2) NULL DEFAULT NULL AFTER retail_price',
        'bundle_qty' => 'INT UNSIGNED NULL DEFAULT NULL AFTER compare_at_price',
        'bundle_price' => 'DECIMAL(12,2) NULL DEFAULT NULL AFTER bundle_qty',
        'retail_only' => 'TINYINT(1) NOT NULL DEFAULT 0 AFTER min_wholesale_qty',
        'unlimited_stock' => 'TINYINT(1) NOT NULL DEFAULT 0 AFTER retail_only',
        'purchase_mode' => "ENUM('checkout', 'whatsapp') NOT NULL DEFAULT 'checkout' AFTER unlimited_stock",
    ];

    foreach ($definitions as $column => $definition) {
        if (!isset($existing[$column])) {
            $pdo->exec("ALTER TABLE products ADD COLUMN {$column} {$definition}");
        }
    }
}

function ensureTwoHorseBoskiProduct(): void
{
    static $checked = false;
    if ($checked) {
        return;
    }
    $checked = true;

    $pdo = db();
    $pdo->exec("CREATE TABLE IF NOT EXISTS app_migrations (
        migration_key VARCHAR(120) NOT NULL,
        applied_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (migration_key)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci");

    $pdo->beginTransaction();
    try {
        $claim = $pdo->prepare('INSERT IGNORE INTO app_migrations (migration_key) VALUES (?)');
        $claim->execute(['2026-09-29-two-horse-boski']);
        if ($claim->rowCount() === 0) {
            $pdo->rollBack();
            return;
        }

        $find = $pdo->prepare('SELECT id FROM products WHERE code = ? OR slug = ? LIMIT 1 FOR UPDATE');
        $find->execute(['THB-SF-24', 'two-horse-boski-by-rahim-fabrics']);
        $productId = (int) ($find->fetchColumn() ?: 0);

        if ($productId === 0) {
            $insert = $pdo->prepare('INSERT INTO products (name, slug, code, category, fabric_type, colors, thaan_length, suits_per_thaan, stock, stock_meters, meter_price, min_meter_qty, retail_price, compare_at_price, bundle_qty, bundle_price, wholesale_price, retail_unit, min_retail_qty, min_wholesale_qty, retail_only, unlimited_stock, purchase_mode, description, featured) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)');
            $insert->execute([
                'Two Horse Boski by Shahji Fabrics',
                'two-horse-boski-by-rahim-fabrics',
                'THB-SF-24',
                'Boski',
                'Premium Boski',
                json_encode(['Cream', 'Off White']),
                '24 metres per thaan',
                4,
                0,
                0,
                400.0,
                100,
                2000.0,
                null,
                2,
                3500.0,
                9600.0,
                'suit',
                1,
                10,
                0,
                1,
                'checkout',
                'Two Horse Boski by Shahji Fabrics is a refined cream and off-white unstitched men\'s fabric with a smooth finish, graceful fall and timeless formal look. An elegant choice for weddings, Eid and classic shalwar qameez. Order by the metre at PKR 400, choose one 5-metre suit for PKR 2,000, save with two suits for PKR 3,500, or buy a complete 24-metre thaan.',
                1,
            ]);
            $productId = (int) $pdo->lastInsertId();
            $image = $pdo->prepare('INSERT INTO product_images (product_id, url, sort_order) VALUES (?, ?, 0)');
            $image->execute([$productId, '/images/products/two-horse-boski-cream-website-v1.webp']);
        }

        $pdo->commit();
    } catch (Throwable $error) {
        if ($pdo->inTransaction()) {
            $pdo->rollBack();
        }
        throw $error;
    }
}

function ensureTwoHorseBoskiMinimumQuantities(): void
{
    static $checked = false;
    if ($checked) {
        return;
    }
    $checked = true;

    $pdo = db();
    $pdo->beginTransaction();
    try {
        $claim = $pdo->prepare('INSERT IGNORE INTO app_migrations (migration_key) VALUES (?)');
        $claim->execute(['2026-09-29-two-horse-minimum-quantities']);
        if ($claim->rowCount() === 0) {
            $pdo->rollBack();
            return;
        }

        $update = $pdo->prepare('UPDATE products SET min_meter_qty = 100, min_wholesale_qty = 10 WHERE code = ? OR slug IN (?, ?)');
        $update->execute(['THB-SF-24', 'two-horse-boski-by-rahim-fabrics', 'two-horse-boski-by-shahji-fabrics']);
        $pdo->commit();
    } catch (Throwable $error) {
        if ($pdo->inTransaction()) {
            $pdo->rollBack();
        }
        throw $error;
    }
}

function ensureStorefrontSeoUpdates(): void
{
    static $checked = false;
    if ($checked) {
        return;
    }
    $checked = true;

    $pdo = db();
    $pdo->exec("CREATE TABLE IF NOT EXISTS app_migrations (
        migration_key VARCHAR(120) NOT NULL,
        applied_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (migration_key)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci");

    $pdo->beginTransaction();
    try {
        $claim = $pdo->prepare('INSERT IGNORE INTO app_migrations (migration_key) VALUES (?)');
        $claim->execute(['2026-10-01-seo-webp-product-urls']);
        if ($claim->rowCount() === 0) {
            $pdo->rollBack();
            return;
        }

        $normalizeBoski = $pdo->prepare('UPDATE products SET slug = ? WHERE code = ?');
        $normalizeBoski->execute(['two-horse-boski-by-rahim-fabrics', 'THB-SF-24']);

        $pdo->exec("UPDATE product_images
            SET url = CONCAT(LEFT(url, CHAR_LENGTH(url) - 4), '.webp')
            WHERE url LIKE '/images/products/%.png'");

        $pdo->commit();
    } catch (Throwable $error) {
        if ($pdo->inTransaction()) {
            $pdo->rollBack();
        }
        throw $error;
    }
}

function ensureBoskiImageAndBrandFix(): void
{
    static $checked = false;
    if ($checked) {
        return;
    }
    $checked = true;

    $pdo = db();
    $pdo->beginTransaction();
    try {
        $claim = $pdo->prepare('INSERT IGNORE INTO app_migrations (migration_key) VALUES (?)');
        $claim->execute(['2026-10-05-boski-image-and-brand']);
        if ($claim->rowCount() === 0) {
            $pdo->rollBack();
            return;
        }

        $find = $pdo->prepare('SELECT id FROM products WHERE code = ? LIMIT 1');
        $find->execute(['THB-SF-24']);
        $productId = (int) ($find->fetchColumn() ?: 0);
        if ($productId > 0) {
            $pdo->prepare("UPDATE products SET description = REPLACE(description, 'by Shahji Fabrics', 'by Rahim Fabrics') WHERE id = ?")
                ->execute([$productId]);

            // Earlier deployments deleted the uploaded Boski photo; fall back to the committed one.
            $images = $pdo->prepare('SELECT url FROM product_images WHERE product_id = ?');
            $images->execute([$productId]);
            $working = array_filter($images->fetchAll(PDO::FETCH_COLUMN), static fn (string $url): bool =>
                !str_starts_with($url, '/uploads/products/') || uploadedFilePath('products', basename($url)) !== null);
            if (!$working) {
                $pdo->prepare('DELETE FROM product_images WHERE product_id = ?')->execute([$productId]);
                $pdo->prepare('INSERT INTO product_images (product_id, url, sort_order) VALUES (?, ?, 0)')
                    ->execute([$productId, '/images/products/two-horse-boski-cream-website-v1.webp']);
            }
        }

        $pdo->commit();
    } catch (Throwable $error) {
        if ($pdo->inTransaction()) {
            $pdo->rollBack();
        }
        throw $error;
    }
}

function ensureGraceDunhillProduct(): void
{
    static $checked = false;
    if ($checked) {
        return;
    }
    $checked = true;

    $pdo = db();
    $find = $pdo->prepare('SELECT id FROM products WHERE code = ? OR slug = ? LIMIT 1');
    $find->execute(['GR-DH-WW', 'grace-dunhill-self-textured-winter-wash-and-wear']);
    $productId = (int) ($find->fetchColumn() ?: 0);

    if ($productId === 0) {
        $insert = $pdo->prepare('INSERT INTO products (name, slug, code, category, fabric_type, colors, thaan_length, suits_per_thaan, stock, stock_meters, retail_price, wholesale_price, retail_unit, min_retail_qty, min_wholesale_qty, description, featured) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)');
        $insert->execute([
            'Grace Dunhill Self-Textured',
            'grace-dunhill-self-textured-winter-wash-and-wear',
            'GR-DH-WW',
            'Winter',
            'Premium Winter Wash & Wear',
            json_encode(['Sky Blue', 'Taupe Olive', 'Muted Teal Blue', 'Steel Blue Grey', 'Warm Grey', 'Deep Charcoal Teal', 'Light Stone Beige']),
            '4 metres per unstitched suit',
            1,
            0,
            0,
            1499.0,
            0.0,
            'suit',
            1,
            1,
            'Grace Dunhill Self-Textured is a premium winter wash & wear collection for men. Its refined self-textured finish, comfortable seasonal weight and seven versatile shades make it an elegant choice for everyday and occasion wear. Choose one unstitched 4-metre suit for PKR 1,499 or any two suits for PKR 2,599.',
            1,
        ]);
        $productId = (int) $pdo->lastInsertId();
    }

    $offer = $pdo->prepare('UPDATE products SET compare_at_price = NULL, bundle_qty = 2, bundle_price = 2599.00, retail_only = 1, unlimited_stock = 1 WHERE id = ?');
    $offer->execute([$productId]);

    $imageCount = $pdo->prepare('SELECT COUNT(*) FROM product_images WHERE product_id = ?');
    $imageCount->execute([$productId]);
    if ((int) $imageCount->fetchColumn() > 0) {
        return;
    }

    $urls = [
        '/images/products/grace-dunhill-sky-blue-tailor-desk.webp',
        '/images/products/grace-dunhill-taupe-olive-tailor-desk.webp',
        '/images/products/grace-dunhill-muted-teal-blue-tailor-desk.webp',
        '/images/products/grace-dunhill-steel-blue-grey-tailor-desk.webp',
        '/images/products/grace-dunhill-warm-grey-tailor-desk.webp',
        '/images/products/grace-dunhill-deep-charcoal-teal-tailor-desk.webp',
        '/images/products/grace-dunhill-light-stone-beige-tailor-desk.webp',
    ];
    $imageInsert = $pdo->prepare('INSERT INTO product_images (product_id, url, sort_order) VALUES (?, ?, ?)');
    foreach ($urls as $position => $url) {
        $imageInsert->execute([$productId, $url, $position]);
    }
}

function ensureGraceMarjanProductImages(): void
{
    static $checked = false;
    if ($checked) {
        return;
    }
    $checked = true;

    $pdo = db();
    $find = $pdo->prepare('SELECT id FROM products WHERE code = ? OR slug = ? LIMIT 1');
    $find->execute(['GR-MW-01', 'grace-marjan-wool']);
    $productId = (int) ($find->fetchColumn() ?: 0);
    if ($productId === 0) {
        return;
    }

    $urls = [
        '/images/products/grace-marjan-wool-maroon.webp?v=2',
        '/images/products/grace-marjan-wool-deep-teal.webp?v=2',
        '/images/products/grace-marjan-wool-charcoal.webp?v=2',
        '/images/products/grace-marjan-wool-rich-brown.webp?v=2',
        '/images/products/grace-marjan-wool-deep-navy.webp?v=2',
        '/images/products/grace-marjan-wool-forest-green.webp?v=2',
        '/images/products/grace-marjan-wool-steel-blue.webp?v=2',
    ];

    $pdo->prepare('UPDATE products SET colors = ?, description = ? WHERE id = ?')->execute([
        json_encode(['Maroon', 'Deep Teal', 'Charcoal', 'Rich Brown', 'Deep Navy', 'Forest Green', 'Steel Blue']),
        'Grace Marjan Wool is a premium winter unstitched fabric for men, offering a soft feel, elegant fall and comfortable seasonal warmth. Available in seven sophisticated colours for everyday and occasion wear.',
        $productId,
    ]);

    $currentStatement = $pdo->prepare('SELECT url FROM product_images WHERE product_id = ? ORDER BY sort_order, id');
    $currentStatement->execute([$productId]);
    $current = array_map('strval', $currentStatement->fetchAll(PDO::FETCH_COLUMN));
    if ($current === $urls) {
        return;
    }

    $pdo->beginTransaction();
    try {
        $pdo->prepare('DELETE FROM product_images WHERE product_id = ?')->execute([$productId]);
        $insert = $pdo->prepare('INSERT INTO product_images (product_id, url, sort_order) VALUES (?, ?, ?)');
        foreach ($urls as $position => $url) {
            $insert->execute([$productId, $url, $position]);
        }
        $pdo->commit();
    } catch (Throwable $error) {
        if ($pdo->inTransaction()) {
            $pdo->rollBack();
        }
        throw $error;
    }
}

function ensureCurrentCatalogueCheckout(): void
{
    static $checked = false;
    if ($checked) {
        return;
    }
    $checked = true;

    $pdo = db();
    $pdo->exec("CREATE TABLE IF NOT EXISTS app_migrations (
        migration_key VARCHAR(120) NOT NULL,
        applied_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (migration_key)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci");
    $migrationKey = '2026-09-18-current-catalogue-checkout';
    $pdo->beginTransaction();
    try {
        $claim = $pdo->prepare('INSERT IGNORE INTO app_migrations (migration_key) VALUES (?)');
        $claim->execute([$migrationKey]);
        if ($claim->rowCount() === 0) {
            $pdo->rollBack();
            return;
        }
        $find = $pdo->prepare('SELECT id FROM products WHERE code = ? OR slug = ? LIMIT 1 FOR UPDATE');
        $find->execute(['BC-GA-OLIVE', 'bit-coin-by-gul-ahmed-olive']);
        $productId = (int) ($find->fetchColumn() ?: 0);

        if ($productId === 0) {
            $insert = $pdo->prepare('INSERT INTO products (name, slug, code, category, fabric_type, colors, thaan_length, suits_per_thaan, stock, stock_meters, retail_price, compare_at_price, bundle_qty, bundle_price, wholesale_price, retail_unit, min_retail_qty, min_wholesale_qty, retail_only, unlimited_stock, purchase_mode, description, featured) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)');
            $insert->execute([
                'Bit Coin by Gul Ahmed',
                'bit-coin-by-gul-ahmed-olive',
                'BC-GA-OLIVE',
                'Wash & Wear',
                'Premium Wash & Wear',
                json_encode(['Olive Khaki', 'Ice Blue', 'Rust', 'Warm Khaki', 'Ivory']),
                'Retail suit pack',
                1,
                0,
                0,
                3299.0,
                4000.0,
                2,
                6499.0,
                0.0,
                'suit',
                1,
                1,
                1,
                1,
                'checkout',
                'Bit Coin by Gul Ahmed is a premium wash & wear fabric with a smooth finish and graceful drape. Choose from Olive Khaki, Ice Blue, Rust, Warm Khaki and Ivory for polished everyday and occasion wear.',
                1,
            ]);
            $productId = (int) $pdo->lastInsertId();
        } else {
            $update = $pdo->prepare("UPDATE products SET retail_price = 3299.00, compare_at_price = 4000.00, bundle_qty = 2, bundle_price = 6499.00, retail_unit = 'suit', min_retail_qty = 1, retail_only = 1, unlimited_stock = 1, purchase_mode = 'checkout' WHERE id = ?");
            $update->execute([$productId]);
        }

        $imageCount = $pdo->prepare('SELECT COUNT(*) FROM product_images WHERE product_id = ?');
        $imageCount->execute([$productId]);
        if ((int) $imageCount->fetchColumn() === 0) {
            $urls = [
                '/images/products/bit-coin-olive-branded-v1.webp',
                '/images/products/bit-coin-ice-blue-branded-v1.webp',
                '/images/products/bit-coin-rust-branded-v1.webp',
                '/images/products/bit-coin-khaki-branded-v1.webp',
                '/images/products/bit-coin-ivory-branded-v1.webp',
            ];
            $imageInsert = $pdo->prepare('INSERT INTO product_images (product_id, url, sort_order) VALUES (?, ?, ?)');
            foreach ($urls as $position => $url) {
                $imageInsert->execute([$productId, $url, $position]);
            }
        }

        $pdo->exec("UPDATE products SET purchase_mode = 'checkout'");
        $pdo->commit();
    } catch (Throwable $error) {
        if ($pdo->inTransaction()) {
            $pdo->rollBack();
        }
        throw $error;
    }
}

function bankPaymentDetails(): array
{
    return [
        'accountName' => (string) config('bank_account_name', 'SHEIKH MUHAMMAD BILAL'),
        'bankName' => (string) config('bank_name', 'Meezan Bank'),
        'accountNumber' => (string) config('bank_account_number', '02470108665528'),
        'iban' => (string) config('bank_iban', 'PK88MEZN0002470108665528'),
        'branch' => (string) config('bank_branch', 'J-III JOHAR TOWN-LHR'),
    ];
}

function ensureOrderCheckoutColumns(): void
{
    static $checked = false;
    if ($checked) {
        return;
    }
    $checked = true;

    $pdo = db();
    $tableExists = (int) $pdo->query("SELECT COUNT(*) FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'orders'")
        ->fetchColumn();
    if ($tableExists === 0) {
        return;
    }
    $columns = $pdo->query("SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'orders'")
        ->fetchAll(PDO::FETCH_COLUMN);
    $existing = array_fill_keys(array_map('strval', $columns), true);
    $definitions = [
        'country' => "VARCHAR(120) NOT NULL DEFAULT 'Pakistan' AFTER email",
        'address_line2' => 'VARCHAR(255) NULL AFTER address',
        'postal_code' => 'VARCHAR(32) NULL AFTER address_line2',
        'billing_same' => 'TINYINT(1) NOT NULL DEFAULT 1 AFTER postal_code',
        'billing_address' => 'TEXT NULL AFTER billing_same',
        'payment_slip_url' => 'VARCHAR(500) NULL AFTER payment_method',
    ];
    foreach ($definitions as $column => $definition) {
        if (!isset($existing[$column])) {
            $pdo->exec("ALTER TABLE orders ADD COLUMN {$column} {$definition}");
        }
    }
}

/**
 * Uploads live one level above public_html so Git deployments, which replace
 * the web root, never delete them. media.php serves them at /uploads/<kind>/.
 */
function uploadDirectory(string $kind): string
{
    $persistent = dirname(__DIR__, 2) . '/rahim-fabrics-uploads/' . $kind;
    if (is_dir($persistent) || @mkdir($persistent, 0755, true) || is_dir($persistent)) {
        return $persistent;
    }
    $public = dirname(__DIR__) . '/uploads/' . $kind;
    if (!is_dir($public) && !mkdir($public, 0755, true) && !is_dir($public)) {
        throw new RuntimeException('Could not create upload storage.');
    }
    return $public;
}

function uploadedFilePath(string $kind, string $filename): ?string
{
    foreach ([dirname(__DIR__, 2) . '/rahim-fabrics-uploads/' . $kind, dirname(__DIR__) . '/uploads/' . $kind] as $directory) {
        if (is_file($directory . '/' . $filename)) {
            return $directory . '/' . $filename;
        }
    }
    return null;
}

function uploadedPaymentSlip(): ?string
{
    if (!isset($_FILES['paymentSlip']) || !is_array($_FILES['paymentSlip'])) {
        return null;
    }
    $file = $_FILES['paymentSlip'];
    $error = (int) ($file['error'] ?? UPLOAD_ERR_NO_FILE);
    if ($error === UPLOAD_ERR_NO_FILE) {
        return null;
    }
    if ($error !== UPLOAD_ERR_OK) {
        fail('Payment slip upload failed. Please select the file again.', 422);
    }
    $size = (int) ($file['size'] ?? 0);
    $maximum = min((int) config('upload_max_bytes', 8388608), 8388608);
    if ($size < 1 || $size > $maximum) {
        fail('Payment slip must be smaller than 8 MB.', 422);
    }
    $temporary = (string) ($file['tmp_name'] ?? '');
    if ($temporary === '' || !is_uploaded_file($temporary)) {
        fail('Payment slip upload is invalid.', 422);
    }
    $mime = (new finfo(FILEINFO_MIME_TYPE))->file($temporary) ?: '';
    $extensions = [
        'image/jpeg' => 'jpg',
        'image/png' => 'png',
        'image/webp' => 'webp',
        'application/pdf' => 'pdf',
    ];
    if (!isset($extensions[$mime])) {
        fail('Payment slip must be a JPG, PNG, WEBP or PDF file.', 422);
    }
    $directory = uploadDirectory('payment-slips');
    $filename = date('Ymd-His') . '-' . bin2hex(random_bytes(8)) . '.' . $extensions[$mime];
    if (!move_uploaded_file($temporary, $directory . '/' . $filename)) {
        throw new RuntimeException('Could not store payment slip.');
    }
    return '/uploads/payment-slips/' . $filename;
}

function removePaymentSlip(?string $url): void
{
    if (!$url || !str_starts_with($url, '/uploads/payment-slips/')) {
        return;
    }
    $path = uploadedFilePath('payment-slips', basename($url));
    if ($path) {
        @unlink($path);
    }
}

function orderItemJson(array $row): array
{
    return [
        '_id' => (string) $row['id'],
        'productId' => $row['product_id'] !== null ? (string) $row['product_id'] : null,
        'productName' => $row['product_name'],
        'productCode' => $row['product_code'],
        'unit' => $row['unit'],
        'qty' => (float) $row['qty'],
        'unitPrice' => (float) $row['unit_price'],
        'lineTotal' => (float) $row['line_total'],
    ];
}

function orderJson(array $row, ?array $items = null): array
{
    if ($items === null) {
        $statement = db()->prepare('SELECT * FROM order_items WHERE order_id = ? ORDER BY id');
        $statement->execute([(int) $row['id']]);
        $items = $statement->fetchAll();
    }
    return [
        '_id' => (string) $row['id'],
        'orderNumber' => $row['order_number'],
        'channel' => $row['channel'],
        'customerName' => $row['customer_name'],
        'businessName' => $row['business_name'] ?? '',
        'phone' => $row['phone'],
        'email' => $row['email'] ?? '',
        'country' => $row['country'] ?? 'Pakistan',
        'city' => $row['city'],
        'address' => $row['address'],
        'addressLine2' => $row['address_line2'] ?? '',
        'postalCode' => $row['postal_code'] ?? '',
        'billingSame' => (bool) ($row['billing_same'] ?? true),
        'billingAddress' => $row['billing_address'] ?? '',
        'paymentMethod' => $row['payment_method'],
        'paymentSlipUrl' => $row['payment_slip_url'] ?? null,
        'paymentStatus' => $row['payment_status'],
        'orderStatus' => $row['order_status'],
        'subtotal' => (float) $row['subtotal'],
        'total' => (float) $row['total'],
        'notes' => $row['notes'] ?? '',
        'items' => array_map('orderItemJson', $items),
        'createdAt' => $row['created_at'],
        'updatedAt' => $row['updated_at'],
        'bankDetails' => $row['payment_method'] === 'bank_transfer' ? bankPaymentDetails() : null,
    ];
}

function generateOrderNumber(PDO $pdo): string
{
    for ($attempt = 0; $attempt < 8; $attempt++) {
        $candidate = 'RF' . date('ymd') . strtoupper(bin2hex(random_bytes(3)));
        $check = $pdo->prepare('SELECT id FROM orders WHERE order_number = ? LIMIT 1');
        $check->execute([$candidate]);
        if (!$check->fetch()) {
            return $candidate;
        }
    }
    throw new RuntimeException('Could not generate a unique order number.');
}

function categoryJson(array $row): array
{
    return [
        '_id' => (string) $row['id'],
        'name' => $row['name'],
        'slug' => $row['slug'],
        'description' => $row['description'] ?? '',
        'active' => (bool) $row['active'],
    ];
}

function inquiryJson(array $row): array
{
    $interested = json_decode((string) ($row['products_interested'] ?? '[]'), true);
    return [
        '_id' => (string) $row['id'],
        'customerName' => $row['customer_name'],
        'businessName' => $row['business_name'] ?? '',
        'phone' => $row['phone'],
        'city' => $row['city'],
        'shopType' => $row['shop_type'] ?? '',
        'monthlyRequirement' => $row['monthly_requirement'] ?? '',
        'productsInterested' => is_array($interested) ? $interested : [],
        'message' => $row['message'] ?? '',
        'status' => $row['status'],
        'createdAt' => $row['created_at'],
        'updatedAt' => $row['updated_at'],
    ];
}

function productImageFromUpload(string $path, string $mime): mixed
{
    if (!extension_loaded('gd') || !function_exists('imagewebp')) {
        throw new RuntimeException('WebP image support is not available on the server.');
    }

    $image = match ($mime) {
        'image/jpeg' => function_exists('imagecreatefromjpeg') ? @imagecreatefromjpeg($path) : false,
        'image/png' => function_exists('imagecreatefrompng') ? @imagecreatefrompng($path) : false,
        'image/webp' => function_exists('imagecreatefromwebp') ? @imagecreatefromwebp($path) : false,
        default => false,
    };
    if ($image === false) {
        throw new RuntimeException('The uploaded image could not be decoded.');
    }

    if ($mime === 'image/jpeg' && function_exists('exif_read_data')) {
        $exif = @exif_read_data($path);
        $orientation = is_array($exif) ? (int) ($exif['Orientation'] ?? 1) : 1;
        $degrees = match ($orientation) {
            3 => 180,
            6 => -90,
            8 => 90,
            default => 0,
        };
        if ($degrees !== 0) {
            $rotated = imagerotate($image, $degrees, 0);
            if ($rotated !== false) {
                $image = $rotated;
            }
        }
    }

    return $image;
}

function resizeProductImage(mixed $image): mixed
{
    $width = imagesx($image);
    $height = imagesy($image);
    $maximum = max(1200, min(4000, (int) config('product_image_max_dimension', 2400)));
    if ($width <= $maximum && $height <= $maximum) {
        imagepalettetotruecolor($image);
        imagealphablending($image, true);
        imagesavealpha($image, true);
        return $image;
    }

    $scale = min($maximum / $width, $maximum / $height);
    $targetWidth = max(1, (int) round($width * $scale));
    $targetHeight = max(1, (int) round($height * $scale));
    $resized = imagecreatetruecolor($targetWidth, $targetHeight);
    if ($resized === false) {
        throw new RuntimeException('The uploaded image could not be resized.');
    }
    imagealphablending($resized, false);
    imagesavealpha($resized, true);
    $transparent = imagecolorallocatealpha($resized, 0, 0, 0, 127);
    imagefilledrectangle($resized, 0, 0, $targetWidth, $targetHeight, $transparent);
    if (!imagecopyresampled($resized, $image, 0, 0, 0, 0, $targetWidth, $targetHeight, $width, $height)) {
        throw new RuntimeException('The uploaded image could not be resized.');
    }
    return $resized;
}

function convertProductImageToWebp(string $source, string $mime, string $destination): void
{
    $image = productImageFromUpload($source, $mime);
    try {
        $image = resizeProductImage($image);
        $quality = max(60, min(92, (int) config('product_image_webp_quality', 82)));
        if (!imagewebp($image, $destination, $quality) || !is_file($destination) || filesize($destination) === 0) {
            throw new RuntimeException('The uploaded image could not be converted to WebP.');
        }
        @chmod($destination, 0644);
    } catch (Throwable $error) {
        if (is_file($destination)) {
            unlink($destination);
        }
        throw $error;
    }
}

function uploadedImages(): array
{
    if (empty($_FILES['images'])) {
        return [];
    }
    $files = $_FILES['images'];
    $names = is_array($files['name']) ? $files['name'] : [$files['name']];
    $tmpNames = is_array($files['tmp_name']) ? $files['tmp_name'] : [$files['tmp_name']];
    $errors = is_array($files['error']) ? $files['error'] : [$files['error']];
    $sizes = is_array($files['size']) ? $files['size'] : [$files['size']];
    if (count($names) > 6) {
        fail('A maximum of 6 images is allowed.', 422);
    }

    $allowed = ['image/jpeg', 'image/png', 'image/webp'];
    $directory = uploadDirectory('products');
    $finfo = new finfo(FILEINFO_MIME_TYPE);
    $validated = [];
    foreach ($names as $index => $originalName) {
        if ((int) $errors[$index] === UPLOAD_ERR_NO_FILE) {
            continue;
        }
        if ((int) $errors[$index] !== UPLOAD_ERR_OK) {
            fail('One of the image uploads failed.', 422);
        }
        if ((int) $sizes[$index] > (int) config('upload_max_bytes', 8388608)) {
            fail('Each image must be 8 MB or smaller.', 422);
        }
        $temporary = (string) $tmpNames[$index];
        if ($temporary === '' || !is_uploaded_file($temporary)) {
            fail('One of the image uploads is invalid.', 422);
        }
        $mime = (string) $finfo->file($temporary);
        if (!in_array($mime, $allowed, true)) {
            fail('Only JPEG, PNG and WebP images are allowed.', 422);
        }
        $dimensions = @getimagesize($temporary);
        if ($dimensions === false || (int) $dimensions[0] < 1 || (int) $dimensions[1] < 1) {
            fail('One of the uploaded images is invalid.', 422);
        }
        if ((int) $dimensions[0] * (int) $dimensions[1] > 30000000) {
            fail('Each image must be 30 megapixels or smaller.', 422);
        }
        $validated[] = ['path' => $temporary, 'mime' => $mime];
    }

    $saved = [];
    try {
        foreach ($validated as $upload) {
            $filename = bin2hex(random_bytes(16)) . '.webp';
            convertProductImageToWebp($upload['path'], $upload['mime'], $directory . '/' . $filename);
            $saved[] = '/uploads/products/' . $filename;
        }
    } catch (Throwable $error) {
        foreach ($saved as $url) {
            removeLocalImage($url);
        }
        throw $error;
    }
    return $saved;
}

function removeLocalImage(string $url): void
{
    if (!str_starts_with($url, '/uploads/products/')) {
        return;
    }
    $path = uploadedFilePath('products', basename($url));
    if ($path) {
        unlink($path);
    }
}
