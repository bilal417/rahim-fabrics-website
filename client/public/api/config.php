<?php

declare(strict_types=1);

$local = [];
$localFiles = [
    dirname(__DIR__, 2) . '/rahim-fabrics-config.php',
    __DIR__ . '/config.local.php',
];
foreach ($localFiles as $localFile) {
    if (is_file($localFile)) {
        $local = require $localFile;
        break;
    }
}

if (!is_array($local)) {
    $local = [];
}

$env = static function (string $name, mixed $fallback = null): mixed {
    $value = getenv($name);
    return $value === false || $value === '' ? $fallback : $value;
};

return array_merge([
    'db_host' => $env('DB_HOST', 'localhost'),
    'db_port' => (int) $env('DB_PORT', 3306),
    'db_name' => $env('DB_NAME', ''),
    'db_user' => $env('DB_USER', ''),
    'db_password' => $env('DB_PASSWORD', ''),
    'jwt_secret' => $env('JWT_SECRET', ''),
    'setup_key' => $env('SETUP_KEY', ''),
    'token_ttl' => (int) $env('TOKEN_TTL', 604800),
    'upload_max_bytes' => (int) $env('UPLOAD_MAX_BYTES', 8388608),
    'bank_account_name' => $env('BANK_ACCOUNT_NAME', 'Rahim Fabrics'),
    'bank_name' => $env('BANK_NAME', ''),
    'bank_account_number' => $env('BANK_ACCOUNT_NUMBER', ''),
    'bank_iban' => $env('BANK_IBAN', ''),
], $local);
