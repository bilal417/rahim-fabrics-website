<?php

declare(strict_types=1);

$siteUrl = 'https://rahimfabrics.site';
$path = parse_url((string) ($_SERVER['REQUEST_URI'] ?? '/'), PHP_URL_PATH) ?: '/';
$path = '/' . trim(rawurldecode($path), '/');
if ($path === '//') $path = '/';

$pages = [
    '/catalogue' => [
        'title' => 'Shop Fabrics Online Lahore | Retail & Wholesale | Rahim Fabrics',
        'description' => 'Browse wash & wear, cotton, khaddar and seasonal fabrics online. Shop gents fabrics from Rahim Fabrics, New Azam Cloth Market Lahore.',
        'keywords' => 'buy fabric online Lahore, fabric shop Lahore, wash and wear fabric price, New Azam Cloth Market, wholesale fabric collection',
    ],
    '/wholesale' => [
        'title' => 'Fabric Wholesale Buyer Registration Lahore | Rahim Fabrics',
        'description' => 'Register as a fabric wholesale buyer in Lahore. Get trade prices, thaan availability and nationwide dispatch support from New Azam Cloth Market.',
        'keywords' => 'fabric wholesale buyer Lahore, wholesale fabric dealer registration, thaan fabric supplier Pakistan, New Azam Cloth Market wholesale',
    ],
    '/about' => [
        'title' => 'New Azam Cloth Market Fabric Shop Lahore | About Rahim Fabrics',
        'description' => 'Rahim Fabrics by Safeer Naseer Fabrics is a gents fabric shop at New Azam Cloth Market, Lahore, serving retail and wholesale customers.',
        'keywords' => 'New Azam Cloth Market fabric shop, Lahore gents fabric supplier, fabric retail Lahore, about Rahim Fabrics',
    ],
];

$page = $pages[$path] ?? null;
$product = null;
$status = 200;
$robots = 'index, follow, max-image-preview:large';
$image = $siteUrl . '/logo.webp';
$type = 'website';

if (preg_match('#^/products/([a-z0-9-]+)$#', $path, $matches)) {
    try {
        require __DIR__ . '/api/common.php';
        ensureGraceMarjanProductImages();
        $statement = db()->prepare('SELECT * FROM products WHERE slug = ? LIMIT 1');
        $statement->execute([$matches[1]]);
        $product = $statement->fetch();
        if ($product) {
            $imageStatement = db()->prepare('SELECT url FROM product_images WHERE product_id = ? ORDER BY sort_order, id');
            $imageStatement->execute([(int) $product['id']]);
            $firstImage = $imageStatement->fetchColumn();
            if ($firstImage) $image = str_starts_with((string) $firstImage, 'http') ? (string) $firstImage : $siteUrl . $firstImage;
            $price = number_format((float) $product['retail_price'], 0);
            $unit = (string) ($product['retail_unit'] ?: 'meter');
            $page = [
                'title' => $product['name'] . ' Price Lahore | Rahim Fabrics',
                'description' => 'Buy ' . $product['name'] . ' online from Rahim Fabrics Lahore. ' . $product['fabric_type'] . ' from PKR ' . $price . '/' . $unit . '. Order premium unstitched fabric for retail or wholesale.',
                'keywords' => $product['name'] . ' fabric Lahore, ' . $product['category'] . ' fabric Lahore, ' . $product['fabric_type'] . ', buy fabric online Lahore',
            ];
            $type = 'product';
        }
    } catch (Throwable $error) {
        $product = null;
    }
}

if (!$page) {
    $privateRoute = preg_match('#^/(?:cart|checkout|order-success(?:/.*)?|admin(?:/.*)?)$#', $path);
    if ($privateRoute) {
        $page = [
            'title' => 'Rahim Fabrics',
            'description' => 'Rahim Fabrics customer page.',
            'keywords' => '',
        ];
        $robots = 'noindex, nofollow';
        header('X-Robots-Tag: noindex, nofollow');
    } else {
        $status = 404;
        $robots = 'noindex, nofollow';
        $page = [
            'title' => 'Page Not Found | Rahim Fabrics',
            'description' => 'The requested page could not be found. Browse the current Rahim Fabrics catalogue.',
            'keywords' => '',
        ];
        header('X-Robots-Tag: noindex, nofollow');
    }
}

$html = file_get_contents(__DIR__ . '/index.html');
if ($html === false) {
    http_response_code(500);
    exit('Website shell is unavailable.');
}

function attrValue(string $value): string
{
    return htmlspecialchars($value, ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8');
}

function replaceMeta(string $html, string $attribute, string $name, string $content): string
{
    $pattern = '/<meta\s+' . preg_quote($attribute, '/') . '="' . preg_quote($name, '/') . '"\s+content="[^"]*"\s*\/?>/i';
    $tag = '<meta ' . $attribute . '="' . attrValue($name) . '" content="' . attrValue($content) . '" />';
    return preg_replace($pattern, $tag, $html, 1) ?? $html;
}

$canonical = $siteUrl . $path;
$html = preg_replace('/<title>.*?<\/title>/is', '<title>' . attrValue($page['title']) . '</title>', $html, 1) ?? $html;
$html = preg_replace('/<link\s+rel="canonical"\s+href="[^"]*"\s*\/?>/i', '<link rel="canonical" href="' . attrValue($canonical) . '" />', $html, 1) ?? $html;
$html = replaceMeta($html, 'name', 'robots', $robots);
$html = replaceMeta($html, 'name', 'description', $page['description']);
$html = replaceMeta($html, 'name', 'keywords', $page['keywords']);
$html = replaceMeta($html, 'property', 'og:type', $type);
$html = replaceMeta($html, 'property', 'og:url', $canonical);
$html = replaceMeta($html, 'property', 'og:title', $page['title']);
$html = replaceMeta($html, 'property', 'og:description', $page['description']);
$html = replaceMeta($html, 'property', 'og:image', $image);
$html = replaceMeta($html, 'name', 'twitter:title', $page['title']);
$html = replaceMeta($html, 'name', 'twitter:description', $page['description']);
$html = replaceMeta($html, 'name', 'twitter:image', $image);

if ($product) {
    $inStock = !empty($product['unlimited_stock']) || (float) $product['stock_meters'] > 0 || (int) $product['stock'] > 0;
    $schema = [
        '@context' => 'https://schema.org',
        '@type' => 'Product',
        '@id' => $canonical . '#product',
        'name' => $product['name'],
        'description' => $product['description'],
        'sku' => $product['code'],
        'category' => $product['category'],
        'image' => [$image],
        'material' => $product['fabric_type'],
        'brand' => ['@type' => 'Brand', 'name' => 'Rahim Fabrics'],
        'offers' => [
            '@type' => 'Offer',
            'url' => $canonical,
            'priceCurrency' => 'PKR',
            'price' => (float) $product['retail_price'],
            'availability' => $inStock ? 'https://schema.org/InStock' : 'https://schema.org/PreOrder',
            'itemCondition' => 'https://schema.org/NewCondition',
        ],
    ];
    $jsonLd = '<script type="application/ld+json" data-server-seo="true">' . json_encode($schema, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE) . '</script>';
    $html = str_replace('</head>', $jsonLd . "\n  </head>", $html);
}

http_response_code($status);
header('Content-Type: text/html; charset=utf-8');
header('Vary: Accept-Encoding');
echo $html;
