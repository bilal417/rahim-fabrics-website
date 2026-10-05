<?php

declare(strict_types=1);

// Serves uploads stored above public_html (see uploadDirectory in api/common.php).
$kind = (string) ($_GET['kind'] ?? '');
$file = basename((string) ($_GET['file'] ?? ''));
$types = ['webp' => 'image/webp', 'jpg' => 'image/jpeg', 'png' => 'image/png', 'pdf' => 'application/pdf'];
$extension = strtolower(pathinfo($file, PATHINFO_EXTENSION));

if (!in_array($kind, ['products', 'payment-slips'], true) || !preg_match('/^[A-Za-z0-9_-]+\.[a-z]+$/', $file) || !isset($types[$extension])) {
    http_response_code(404);
    exit;
}

$path = dirname(__DIR__) . '/rahim-fabrics-uploads/' . $kind . '/' . $file;
if (!is_file($path)) {
    http_response_code(404);
    exit;
}

header('Content-Type: ' . $types[$extension]);
header('Content-Length: ' . filesize($path));
header('X-Content-Type-Options: nosniff');
header($kind === 'products' ? 'Cache-Control: public, max-age=604800' : 'Cache-Control: private, no-store');
readfile($path);
