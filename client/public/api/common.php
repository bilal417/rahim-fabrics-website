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
        '/images/products/grace-dunhill-sky-blue-tailor-desk.png',
        '/images/products/grace-dunhill-taupe-olive-tailor-desk.png',
        '/images/products/grace-dunhill-muted-teal-blue-tailor-desk.png',
        '/images/products/grace-dunhill-steel-blue-grey-tailor-desk.png',
        '/images/products/grace-dunhill-warm-grey-tailor-desk.png',
        '/images/products/grace-dunhill-deep-charcoal-teal-tailor-desk.png',
        '/images/products/grace-dunhill-light-stone-beige-tailor-desk.png',
    ];
    $imageInsert = $pdo->prepare('INSERT INTO product_images (product_id, url, sort_order) VALUES (?, ?, ?)');
    foreach ($urls as $position => $url) {
        $imageInsert->execute([$productId, $url, $position]);
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
                '/images/products/bit-coin-olive-branded-v1.png',
                '/images/products/bit-coin-ice-blue-branded-v1.png',
                '/images/products/bit-coin-rust-branded-v1.png',
                '/images/products/bit-coin-khaki-branded-v1.png',
                '/images/products/bit-coin-ivory-branded-v1.png',
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
    $directory = dirname(__DIR__) . '/uploads/payment-slips';
    if (!is_dir($directory) && !mkdir($directory, 0755, true) && !is_dir($directory)) {
        throw new RuntimeException('Could not create payment slip storage.');
    }
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
    $filename = basename($url);
    $path = dirname(__DIR__) . '/uploads/payment-slips/' . $filename;
    if (is_file($path)) {
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

    $allowed = ['image/jpeg' => 'jpg', 'image/png' => 'png', 'image/webp' => 'webp'];
    $directory = dirname(__DIR__) . '/uploads/products';
    if (!is_dir($directory) && !mkdir($directory, 0755, true) && !is_dir($directory)) {
        throw new RuntimeException('The product upload directory could not be created.');
    }
    $finfo = new finfo(FILEINFO_MIME_TYPE);
    $saved = [];
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
        $mime = $finfo->file($tmpNames[$index]);
        if (!isset($allowed[$mime])) {
            fail('Only JPEG, PNG and WebP images are allowed.', 422);
        }
        $filename = bin2hex(random_bytes(16)) . '.' . $allowed[$mime];
        if (!move_uploaded_file($tmpNames[$index], $directory . '/' . $filename)) {
            throw new RuntimeException('An image could not be saved.');
        }
        $saved[] = '/uploads/products/' . $filename;
    }
    return $saved;
}

function removeLocalImage(string $url): void
{
    if (!str_starts_with($url, '/uploads/products/')) {
        return;
    }
    $filename = basename($url);
    $path = dirname(__DIR__) . '/uploads/products/' . $filename;
    if (is_file($path)) {
        unlink($path);
    }
}
