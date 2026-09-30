<?php

declare(strict_types=1);

header('Content-Type: application/xml; charset=utf-8');
header('Cache-Control: public, max-age=3600');

$siteUrl = 'https://rahimfabrics.site';
$contentLastModified = '2026-10-01';
$urls = [
    ['path' => '/', 'lastmod' => $contentLastModified, 'changefreq' => 'weekly', 'priority' => '1.0'],
    ['path' => '/catalogue', 'lastmod' => $contentLastModified, 'changefreq' => 'weekly', 'priority' => '0.9'],
    ['path' => '/wholesale', 'lastmod' => $contentLastModified, 'changefreq' => 'monthly', 'priority' => '0.8'],
    ['path' => '/about', 'lastmod' => $contentLastModified, 'changefreq' => 'monthly', 'priority' => '0.7'],
    ['path' => '/contact', 'lastmod' => $contentLastModified, 'changefreq' => 'monthly', 'priority' => '0.7'],
    ['path' => '/collections/boski-fabric', 'lastmod' => $contentLastModified, 'changefreq' => 'weekly', 'priority' => '0.8'],
    ['path' => '/collections/wash-and-wear', 'lastmod' => $contentLastModified, 'changefreq' => 'weekly', 'priority' => '0.8'],
    ['path' => '/collections/winter-fabrics', 'lastmod' => $contentLastModified, 'changefreq' => 'weekly', 'priority' => '0.8'],
    ['path' => '/collections/wedding-collection', 'lastmod' => $contentLastModified, 'changefreq' => 'weekly', 'priority' => '0.8'],
    ['path' => '/collections/wholesale-gents-fabrics', 'lastmod' => $contentLastModified, 'changefreq' => 'weekly', 'priority' => '0.8'],
    ['path' => '/shipping-delivery', 'lastmod' => $contentLastModified, 'changefreq' => 'yearly', 'priority' => '0.4'],
    ['path' => '/returns-exchanges', 'lastmod' => $contentLastModified, 'changefreq' => 'yearly', 'priority' => '0.4'],
    ['path' => '/payment-policy', 'lastmod' => $contentLastModified, 'changefreq' => 'yearly', 'priority' => '0.4'],
    ['path' => '/privacy-policy', 'lastmod' => $contentLastModified, 'changefreq' => 'yearly', 'priority' => '0.3'],
    ['path' => '/terms-conditions', 'lastmod' => $contentLastModified, 'changefreq' => 'yearly', 'priority' => '0.3'],
];

try {
    require __DIR__ . '/api/common.php';
    ensureStorefrontSeoUpdates();
    $products = db()->query("SELECT slug, updated_at FROM products WHERE slug <> '' ORDER BY updated_at DESC")->fetchAll();
    foreach ($products as $product) {
        $updated = strtotime((string) ($product['updated_at'] ?? ''));
        $urls[] = [
            'path' => '/products/' . rawurlencode((string) $product['slug']),
            'lastmod' => $updated ? gmdate('Y-m-d', $updated) : $contentLastModified,
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
