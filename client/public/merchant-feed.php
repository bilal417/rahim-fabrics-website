<?php

declare(strict_types=1);

header('Content-Type: application/xml; charset=utf-8');
header('Cache-Control: public, max-age=3600');

$siteUrl = 'https://rahimfabrics.site';
$items = [];

try {
    require __DIR__ . '/api/common.php';
    ensureStorefrontSeoUpdates();
    $statement = db()->query("SELECT p.*, (
        SELECT pi.url FROM product_images pi WHERE pi.product_id = p.id ORDER BY pi.sort_order, pi.id LIMIT 1
    ) AS image_url FROM products p WHERE p.slug <> '' AND p.retail_price > 0 ORDER BY p.updated_at DESC");
    $items = $statement->fetchAll();
} catch (Throwable $error) {
    $items = [];
}

function feedValue(string $value): string
{
    return htmlspecialchars($value, ENT_XML1 | ENT_QUOTES, 'UTF-8');
}

function feedBrand(string $name): string
{
    $normalized = strtolower($name);
    if (str_contains($normalized, 'gul ahmed')) return 'Gul Ahmed';
    if (str_contains($normalized, 'shahji')) return 'Shahji Fabrics';
    if (str_starts_with($normalized, 'grace ')) return 'Grace';
    return 'Rahim Fabrics';
}

echo '<?xml version="1.0" encoding="UTF-8"?>' . "\n";
echo '<rss version="2.0" xmlns:g="http://base.google.com/ns/1.0">' . "\n";
echo "  <channel>\n";
echo '    <title>Rahim Fabrics Product Feed</title>' . "\n";
echo '    <link>' . feedValue($siteUrl . '/') . '</link>' . "\n";
echo '    <description>Current retail fabrics available from Rahim Fabrics Lahore.</description>' . "\n";

foreach ($items as $item) {
    $link = $siteUrl . '/products/' . rawurlencode((string) $item['slug']);
    $imagePath = (string) ($item['image_url'] ?: '/logo.webp');
    $image = str_starts_with($imagePath, 'http') ? $imagePath : $siteUrl . $imagePath;
    $inStock = !empty($item['unlimited_stock']) || (float) $item['stock_meters'] > 0 || (int) $item['stock'] > 0;
    $description = trim(strip_tags((string) $item['description']));

    echo "    <item>\n";
    echo '      <g:id>' . feedValue((string) $item['code']) . '</g:id>' . "\n";
    echo '      <g:title>' . feedValue((string) $item['name']) . '</g:title>' . "\n";
    echo '      <g:description>' . feedValue($description) . '</g:description>' . "\n";
    echo '      <g:link>' . feedValue($link) . '</g:link>' . "\n";
    echo '      <g:image_link>' . feedValue($image) . '</g:image_link>' . "\n";
    echo '      <g:availability>' . ($inStock ? 'in_stock' : 'preorder') . '</g:availability>' . "\n";
    echo '      <g:price>' . feedValue(number_format((float) $item['retail_price'], 2, '.', '') . ' PKR') . '</g:price>' . "\n";
    echo '      <g:condition>new</g:condition>' . "\n";
    echo '      <g:brand>' . feedValue(feedBrand((string) $item['name'])) . '</g:brand>' . "\n";
    echo '      <g:mpn>' . feedValue((string) $item['code']) . '</g:mpn>' . "\n";
    echo '      <g:product_type>' . feedValue('Apparel & Accessories > Clothing > Traditional Clothing > ' . (string) $item['category']) . '</g:product_type>' . "\n";
    echo "    </item>\n";
}

echo "  </channel>\n";
echo "</rss>\n";
