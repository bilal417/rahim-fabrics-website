<?php

declare(strict_types=1);

header('Content-Type: application/xml; charset=utf-8');
header('Cache-Control: public, max-age=3600');

$siteUrl = 'https://rahimfabrics.site';
$today = gmdate('Y-m-d');
$urls = [
    ['path' => '/', 'lastmod' => $today, 'changefreq' => 'weekly', 'priority' => '1.0'],
    ['path' => '/catalogue', 'lastmod' => $today, 'changefreq' => 'weekly', 'priority' => '0.9'],
    ['path' => '/wholesale', 'lastmod' => $today, 'changefreq' => 'monthly', 'priority' => '0.8'],
    ['path' => '/about', 'lastmod' => $today, 'changefreq' => 'monthly', 'priority' => '0.7'],
];

try {
    require __DIR__ . '/api/common.php';
    $products = db()->query("SELECT slug, updated_at FROM products WHERE slug <> '' ORDER BY updated_at DESC")->fetchAll();
    foreach ($products as $product) {
        $updated = strtotime((string) ($product['updated_at'] ?? ''));
        $urls[] = [
            'path' => '/products/' . rawurlencode((string) $product['slug']),
            'lastmod' => $updated ? gmdate('Y-m-d', $updated) : $today,
            'changefreq' => 'weekly',
            'priority' => '0.8',
        ];
    }
} catch (Throwable $error) {
    // Keep the core sitemap available if the catalogue database is temporarily unavailable.
}

function xmlValue(string $value): string
{
    return htmlspecialchars($value, ENT_XML1 | ENT_QUOTES, 'UTF-8');
}

echo '<?xml version="1.0" encoding="UTF-8"?>' . "\n";
echo '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">' . "\n";
foreach ($urls as $url) {
    $location = $url['path'] === '/' ? $siteUrl . '/' : $siteUrl . $url['path'];
    echo "  <url>\n";
    echo '    <loc>' . xmlValue($location) . "</loc>\n";
    echo '    <lastmod>' . xmlValue($url['lastmod']) . "</lastmod>\n";
    echo '    <changefreq>' . xmlValue($url['changefreq']) . "</changefreq>\n";
    echo '    <priority>' . xmlValue($url['priority']) . "</priority>\n";
    echo "  </url>\n";
}
echo "</urlset>\n";
