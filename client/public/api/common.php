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
        'wholesalePrice' => (float) ($row['wholesale_price'] ?? 0),
        'retailUnit' => (string) ($row['retail_unit'] ?? 'meter'),
        'minRetailQty' => (int) ($row['min_retail_qty'] ?? 1),
        'minWholesaleQty' => (int) ($row['min_wholesale_qty'] ?? 1),
        'images' => array_map(static fn (array $image): array => ['url' => $image['url']], $images),
        'description' => $row['description'],
        'featured' => (bool) $row['featured'],
        'createdAt' => $row['created_at'],
        'updatedAt' => $row['updated_at'],
    ];
}

function bankPaymentDetails(): array
{
    return [
        'accountName' => (string) config('bank_account_name', 'Rahim Fabrics'),
        'bankName' => (string) config('bank_name', ''),
        'accountNumber' => (string) config('bank_account_number', ''),
        'iban' => (string) config('bank_iban', ''),
    ];
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
        'city' => $row['city'],
        'address' => $row['address'],
        'paymentMethod' => $row['payment_method'],
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
