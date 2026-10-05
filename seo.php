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
    '/contact' => [
        'title' => 'Contact Rahim Fabrics | New Azam Cloth Market Lahore',
        'description' => 'Contact Rahim Fabrics for retail fabric orders, wholesale thaans and current stock at New Azam Cloth Market Lahore.',
        'keywords' => 'Rahim Fabrics contact, New Azam Cloth Market shop, fabric shop Lahore phone',
    ],
    '/collections/boski-fabric' => [
        'title' => 'Boski Fabric for Men in Pakistan | Rahim Fabrics Lahore',
        'description' => 'Shop premium men’s Boski fabric in cream and off-white from Rahim Fabrics Lahore. Order unstitched suits or discuss thaan quantities for trade buying.',
        'keywords' => 'Boski fabric Pakistan, Boski fabric Lahore, cream Boski, off white Boski, men unstitched fabric',
        'image' => '/images/products/two-horse-boski-cream-website-v1.webp',
    ],
    '/collections/wash-and-wear' => [
        'title' => 'Men’s Wash & Wear Fabric in Lahore | Rahim Fabrics',
        'description' => 'Explore premium men’s wash and wear fabric in versatile colours at Rahim Fabrics Lahore. Shop unstitched suits for everyday and occasion wear.',
        'keywords' => 'wash and wear fabric Lahore, men wash and wear Pakistan, unstitched suits Lahore',
        'image' => '/images/products/bit-coin-olive-branded-v1.webp',
    ],
    '/collections/winter-fabrics' => [
        'title' => 'Winter Fabrics for Men in Pakistan | Rahim Fabrics',
        'description' => 'Shop men’s winter unstitched fabrics including Marjan wool and self-textured wash and wear in refined seasonal colours from Rahim Fabrics Lahore.',
        'keywords' => 'winter fabric men Pakistan, wool fabric Lahore, winter wash and wear',
        'image' => '/images/products/grace-marjan-wool-deep-navy.webp',
    ],
    '/collections/wedding-collection' => [
        'title' => 'Wedding Season Fabrics for Men | Rahim Fabrics Lahore',
        'description' => 'Discover elegant men’s unstitched fabrics for nikah, wedding and family occasions, including Boski, wash and wear and refined winter options.',
        'keywords' => 'wedding fabric men Pakistan, groom shalwar kameez fabric, nikah dress fabric men',
        'image' => '/images/products/premium-thaan-off-white-cream-combined-branded-v2.webp',
    ],
    '/collections/wholesale-gents-fabrics' => [
        'title' => 'Wholesale Gents Fabrics Lahore | Rahim Fabrics',
        'description' => 'Source gents fabric thaans from Rahim Fabrics at New Azam Cloth Market Lahore. Discuss current ranges, quantities and nationwide dispatch with our wholesale desk.',
        'keywords' => 'wholesale gents fabrics Lahore, thaan supplier Pakistan, New Azam Cloth Market wholesale',
        'image' => '/images/showroom-hero.webp',
    ],
    '/shipping-delivery' => [
        'title' => 'Shipping & Delivery | Rahim Fabrics Pakistan',
        'description' => 'How Rahim Fabrics confirms, prepares and dispatches retail and wholesale fabric orders across Pakistan.',
        'keywords' => '',
    ],
    '/returns-exchanges' => [
        'title' => 'Returns & Exchanges | Rahim Fabrics',
        'description' => 'Read the Rahim Fabrics process for reporting an incorrect, damaged or unsuitable fabric order.',
        'keywords' => '',
    ],
    '/payment-policy' => [
        'title' => 'Payment Information | Rahim Fabrics',
        'description' => 'Rahim Fabrics payment methods, order confirmation and bank-deposit verification information.',
        'keywords' => '',
    ],
    '/privacy-policy' => [
        'title' => 'Privacy Policy | Rahim Fabrics',
        'description' => 'How Rahim Fabrics uses information submitted through orders, enquiries and website analytics.',
        'keywords' => '',
    ],
    '/terms-conditions' => [
        'title' => 'Terms & Conditions | Rahim Fabrics',
        'description' => 'Terms for using the Rahim Fabrics website and placing retail or wholesale fabric orders.',
        'keywords' => '',
    ],
];

$page = $pages[$path] ?? null;
$product = null;
$status = 200;
$robots = 'index, follow, max-image-preview:large';
$image = $siteUrl . '/images/og-share.jpg';
$type = 'website';

if (preg_match('#^/products/([a-z0-9-]+)$#', $path, $matches)) {
    try {
        require __DIR__ . '/api/common.php';
        ensureStorefrontSeoUpdates();
        ensureGraceMarjanProductImages();
        ensureBoskiImageAndBrandFix();
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

if (!empty($page['image'])) {
    $image = str_starts_with((string) $page['image'], 'http') ? (string) $page['image'] : $siteUrl . $page['image'];
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
    $productName = strtolower((string) $product['name']);
    $brandName = str_contains($productName, 'gul ahmed')
        ? 'Gul Ahmed'
        : (str_contains($productName, 'shahji') ? 'Shahji Fabrics' : (str_starts_with($productName, 'grace ') ? 'Grace' : 'Rahim Fabrics'));
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
        'brand' => ['@type' => 'Brand', 'name' => $brandName],
        'audience' => ['@type' => 'PeopleAudience', 'suggestedGender' => 'male'],
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
} elseif ($status === 200) {
    $schema = [
        '@context' => 'https://schema.org',
        '@type' => str_starts_with($path, '/collections/') ? 'CollectionPage' : ($path === '/contact' ? 'ContactPage' : 'WebPage'),
        '@id' => $canonical . '#webpage',
        'url' => $canonical,
        'name' => $page['title'],
        'description' => $page['description'],
        'isPartOf' => ['@id' => $siteUrl . '/#website'],
        'about' => ['@id' => $siteUrl . '/#localbusiness'],
        'inLanguage' => 'en-PK',
    ];
    $jsonLd = '<script type="application/ld+json" data-server-seo="true">' . json_encode($schema, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE) . '</script>';
    $html = str_replace('</head>', $jsonLd . "\n  </head>", $html);
}

http_response_code($status);
header('Content-Type: text/html; charset=utf-8');
header('Vary: Accept-Encoding');
echo $html;
