<?php

declare(strict_types=1);

$siteUrl = 'https://rahimfabrics.site';
$path = parse_url((string) ($_SERVER['REQUEST_URI'] ?? '/'), PHP_URL_PATH) ?: '/';
$path = '/' . trim(rawurldecode($path), '/');
if ($path === '//') $path = '/';

$pages = [
    '/' => [
        'h1' => 'Gents Fabrics for Retail & Wholesale in Lahore',
        'intro' => 'Shop premium gents fabrics from Rahim Fabrics at New Azam Cloth Market, Lahore. Buy unstitched suits by the suit or metre for retail, or complete thaans for wholesale, with cash on delivery and bank transfer across Pakistan.',
        'title' => 'Gents Fabrics Lahore | Retail & Wholesale | Rahim Fabrics',
        'description' => 'Shop premium gents fabrics in Lahore from Rahim Fabrics at New Azam Cloth Market. Buy by the metre for retail or by the thaan for wholesale.',
        'keywords' => 'gents fabrics Lahore, buy fabric online Lahore, fabric retail Lahore, New Azam Cloth Market, gents fabrics wholesale Lahore, Rahim Fabrics',
    ],
    '/catalogue' => [
        'h1' => 'Shop Fabrics Online in Lahore',
        'intro' => 'Browse wash & wear, Boski, wool, khaddar and seasonal gents fabrics with clear retail prices and wholesale thaan rates from New Azam Cloth Market, Lahore.',
        'title' => 'Shop Fabrics Online Lahore | Retail & Wholesale | Rahim Fabrics',
        'description' => 'Browse wash & wear, cotton, khaddar and seasonal fabrics online. Shop gents fabrics from Rahim Fabrics, New Azam Cloth Market Lahore.',
        'keywords' => 'buy fabric online Lahore, fabric shop Lahore, wash and wear fabric price, New Azam Cloth Market, wholesale fabric collection',
    ],
    '/wholesale' => [
        'h1' => 'Register as a Fabric Wholesale Buyer in Lahore',
        'intro' => 'Rahim Fabrics supplies fabric retailers, resellers, boutiques and online sellers with gents fabric thaans from New Azam Cloth Market. Register to receive trade prices, current thaan availability and nationwide dispatch support.',
        'title' => 'Fabric Wholesale Buyer Registration Lahore | Rahim Fabrics',
        'description' => 'Register as a fabric wholesale buyer in Lahore. Get trade prices, thaan availability and nationwide dispatch support from New Azam Cloth Market.',
        'keywords' => 'fabric wholesale buyer Lahore, wholesale fabric dealer registration, thaan fabric supplier Pakistan, New Azam Cloth Market wholesale',
    ],
    '/about' => [
        'h1' => 'New Azam Cloth Market Fabric Shop for Retail & Wholesale',
        'intro' => 'Rahim Fabrics by Safeer Naseer Fabrics is a gents fabric shop at G 41/A Ground Floor, New Azam Cloth Market, Lahore. We serve retail customers by the suit or metre and wholesale buyers by the thaan.',
        'title' => 'New Azam Cloth Market Fabric Shop Lahore | About Rahim Fabrics',
        'description' => 'Rahim Fabrics by Safeer Naseer Fabrics is a gents fabric shop at New Azam Cloth Market, Lahore, serving retail and wholesale customers.',
        'keywords' => 'New Azam Cloth Market fabric shop, Lahore gents fabric supplier, fabric retail Lahore, about Rahim Fabrics',
    ],
    '/contact' => [
        'h1' => 'Contact Rahim Fabrics',
        'intro' => 'Call or WhatsApp +92 321 9454085, email info@rahimfabrics.site, or visit our shop at G 41/A Ground Floor, New Azam Cloth Market, Lahore for retail orders, wholesale thaans and current stock.',
        'title' => 'Contact Rahim Fabrics | New Azam Cloth Market Lahore',
        'description' => 'Contact Rahim Fabrics for retail fabric orders, wholesale thaans and current stock at New Azam Cloth Market Lahore.',
        'keywords' => 'Rahim Fabrics contact, New Azam Cloth Market shop, fabric shop Lahore phone',
    ],
    '/collections/boski-fabric' => [
        'h1' => 'Premium Boski Fabric for Men',
        'intro' => 'Boski is chosen for its smooth hand, graceful fall and timeless formal character. Our current range focuses on refined cream and off-white tones suited to nikah, Eid, family occasions and classic shalwar qameez tailoring.',
        'title' => 'Boski Fabric for Men in Pakistan | Rahim Fabrics Lahore',
        'description' => 'Shop premium men’s Boski fabric in cream and off-white from Rahim Fabrics Lahore. Order unstitched suits or discuss thaan quantities for trade buying.',
        'keywords' => 'Boski fabric Pakistan, Boski fabric Lahore, cream Boski, off white Boski, men unstitched fabric',
        'image' => '/images/products/two-horse-boski-cream-website-v1.webp',
    ],
    '/collections/wash-and-wear' => [
        'h1' => 'Men’s Wash & Wear Fabric Collection',
        'intro' => 'Wash & wear remains a dependable choice for men who want a polished shalwar qameez with practical everyday handling. This collection brings together smooth finishes, self-textured options and versatile colours for office, Friday, Eid and family wear.',
        'title' => 'Men’s Wash & Wear Fabric in Lahore | Rahim Fabrics',
        'description' => 'Explore premium men’s wash and wear fabric in versatile colours at Rahim Fabrics Lahore. Shop unstitched suits for everyday and occasion wear.',
        'keywords' => 'wash and wear fabric Lahore, men wash and wear Pakistan, unstitched suits Lahore',
        'image' => '/images/products/bit-coin-olive-branded-v1.webp',
    ],
    '/collections/winter-fabrics' => [
        'h1' => 'Winter Unstitched Fabrics for Men',
        'intro' => 'Our winter selection is built around comfortable seasonal weight, richer colours and fabrics that retain an elegant fall after tailoring. Choose from wool-inspired warmth and refined self-textured wash & wear for daily or occasion dressing.',
        'title' => 'Winter Fabrics for Men in Pakistan | Rahim Fabrics',
        'description' => 'Shop men’s winter unstitched fabrics including Marjan wool and self-textured wash and wear in refined seasonal colours from Rahim Fabrics Lahore.',
        'keywords' => 'winter fabric men Pakistan, wool fabric Lahore, winter wash and wear',
        'image' => '/images/products/grace-marjan-wool-deep-navy.webp',
    ],
    '/collections/wedding-collection' => [
        'h1' => 'Wedding Season Fabrics for Men',
        'intro' => 'A memorable wedding look begins with the right fabric. This edit brings together understated light tones for nikah wear and deeper polished shades for evening functions, allowing your tailor to create a fit that remains personal and comfortable.',
        'title' => 'Wedding Season Fabrics for Men | Rahim Fabrics Lahore',
        'description' => 'Discover elegant men’s unstitched fabrics for nikah, wedding and family occasions, including Boski, wash and wear and refined winter options.',
        'keywords' => 'wedding fabric men Pakistan, groom shalwar kameez fabric, nikah dress fabric men',
        'image' => '/images/products/premium-thaan-off-white-cream-combined-branded-v2.webp',
    ],
    '/collections/wholesale-gents-fabrics' => [
        'h1' => 'Wholesale Gents Fabrics in Lahore',
        'intro' => 'Rahim Fabrics supports fabric retailers, resellers, boutiques and online sellers with current thaan availability from New Azam Cloth Market. Product availability and trade pricing are confirmed against the quantity, destination and range you require.',
        'title' => 'Wholesale Gents Fabrics Lahore | Rahim Fabrics',
        'description' => 'Source gents fabric thaans from Rahim Fabrics at New Azam Cloth Market Lahore. Discuss current ranges, quantities and nationwide dispatch with our wholesale desk.',
        'keywords' => 'wholesale gents fabrics Lahore, thaan supplier Pakistan, New Azam Cloth Market wholesale',
        'image' => '/images/showroom-hero.webp',
    ],
    '/shipping-delivery' => [
        'h1' => 'Shipping & Delivery',
        'title' => 'Shipping & Delivery | Rahim Fabrics Pakistan',
        'description' => 'How Rahim Fabrics confirms, prepares and dispatches retail and wholesale fabric orders across Pakistan.',
        'keywords' => '',
    ],
    '/returns-exchanges' => [
        'h1' => 'Returns & Exchanges',
        'title' => 'Returns & Exchanges | Rahim Fabrics',
        'description' => 'Read the Rahim Fabrics process for reporting an incorrect, damaged or unsuitable fabric order.',
        'keywords' => '',
    ],
    '/payment-policy' => [
        'h1' => 'Payment Information',
        'title' => 'Payment Information | Rahim Fabrics',
        'description' => 'Rahim Fabrics payment methods, order confirmation and bank-deposit verification information.',
        'keywords' => '',
    ],
    '/privacy-policy' => [
        'h1' => 'Privacy Policy',
        'title' => 'Privacy Policy | Rahim Fabrics',
        'description' => 'How Rahim Fabrics uses information submitted through orders, enquiries and website analytics.',
        'keywords' => '',
    ],
    '/terms-conditions' => [
        'h1' => 'Terms & Conditions',
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
        require_once __DIR__ . '/api/common.php';
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
                'h1' => (string) $product['name'],
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
            'h1' => 'Page not found',
            'intro' => 'The page you requested is not available. Browse the current Rahim Fabrics catalogue instead.',
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

// Products listed in the server-rendered body of the home, catalogue and collection pages.
// The rules mirror collectionDefinitions[].match in client/src/lib/content.ts.
$collectionMatchers = [
    '/collections/boski-fabric' => fn (array $p): bool => str_contains(strtolower($p['category'] . ' ' . $p['fabric_type'] . ' ' . $p['name']), 'boski'),
    '/collections/wash-and-wear' => fn (array $p): bool => str_contains(strtolower($p['category'] . ' ' . $p['fabric_type']), 'wash & wear'),
    '/collections/winter-fabrics' => fn (array $p): bool => strtolower((string) $p['category']) === 'winter' || str_contains(strtolower((string) $p['fabric_type']), 'wool'),
    '/collections/wedding-collection' => fn (array $p): bool => true,
    '/collections/wholesale-gents-fabrics' => fn (array $p): bool => empty($p['retail_only']),
];
$listedProducts = [];
if ($status === 200 && !$product && ($path === '/' || $path === '/catalogue' || isset($collectionMatchers[$path]))) {
    try {
        require_once __DIR__ . '/api/common.php';
        $listedProducts = db()->query(
            'SELECT p.*, (SELECT url FROM product_images i WHERE i.product_id = p.id ORDER BY i.sort_order, i.id LIMIT 1) AS image_url
             FROM products p ORDER BY p.featured DESC, p.created_at DESC'
        )->fetchAll();
        if (isset($collectionMatchers[$path])) {
            $listedProducts = array_values(array_filter($listedProducts, $collectionMatchers[$path]));
        }
    } catch (Throwable $error) {
        $listedProducts = [];
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

// Server-rendered page content inside #root, so crawlers that do not run JavaScript
// still receive the heading, copy, product links and business details.
// React's createRoot() replaces this markup as soon as the app mounts.
function esc(string $value): string
{
    return htmlspecialchars($value, ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8');
}

function pkr($amount): string
{
    return 'PKR ' . number_format((float) $amount, 0);
}

function productImageUrl(?string $url): string
{
    if (!$url) return '/images/og-share.jpg';
    return $url;
}

function renderProductCard(array $p): string
{
    $href = '/products/' . rawurlencode((string) $p['slug']);
    $unit = (string) ($p['retail_unit'] ?: 'meter');
    return '<li><a href="' . esc($href) . '">'
        . '<img src="' . esc(productImageUrl($p['image_url'] ?? null)) . '" alt="' . esc($p['name'] . ' – ' . $p['fabric_type']) . '" width="300" height="300" loading="lazy" />'
        . '<strong>' . esc((string) $p['name']) . '</strong></a>'
        . '<span>' . esc((string) $p['fabric_type']) . ' · ' . esc(pkr($p['retail_price'])) . ' per ' . esc($unit) . '</span></li>';
}

function renderProductDetail(array $p, string $image): string
{
    $unit = (string) ($p['retail_unit'] ?: 'meter');
    $colors = json_decode((string) $p['colors'], true);
    $facts = [
        'Code' => (string) $p['code'],
        'Fabric' => (string) $p['fabric_type'],
        'Category' => (string) $p['category'],
        'Retail price' => pkr($p['retail_price']) . ' per ' . $unit,
    ];
    if (!empty($p['bundle_qty']) && !empty($p['bundle_price'])) {
        $facts['Bundle offer'] = $p['bundle_qty'] . ' ' . $unit . 's for ' . pkr($p['bundle_price']);
    }
    if ((float) $p['wholesale_price'] > 0 && empty($p['retail_only'])) {
        $facts['Wholesale (complete thaan)'] = pkr($p['wholesale_price']);
    }
    if (!empty($p['thaan_length'])) $facts['Thaan length'] = (string) $p['thaan_length'];
    if (is_array($colors) && $colors) $facts['Colours'] = implode(', ', array_map('strval', $colors));

    $html = '<img src="' . esc($image) . '" alt="' . esc($p['name'] . ' – ' . $p['fabric_type']) . '" width="600" height="600" />';
    $html .= '<p>' . nl2br(esc((string) $p['description'])) . '</p><dl>';
    foreach ($facts as $label => $value) {
        $html .= '<dt>' . esc($label) . '</dt><dd>' . esc($value) . '</dd>';
    }
    return $html . '</dl>';
}

function renderSnapshot(array $page, string $path, ?array $product, array $listedProducts, string $image): string
{
    $nav = [
        '/' => 'Home',
        '/catalogue' => 'Shop Fabrics',
        '/collections/boski-fabric' => 'Boski',
        '/collections/wash-and-wear' => 'Wash & Wear',
        '/collections/winter-fabrics' => 'Winter',
        '/collections/wedding-collection' => 'Wedding',
        '/wholesale' => 'Wholesale',
        '/about' => 'About',
        '/contact' => 'Contact',
    ];
    $html = '<div class="rf-ssr"><header><a href="/" class="rf-brand">Rahim Fabrics</a><nav aria-label="Main">';
    foreach ($nav as $href => $label) {
        $html .= '<a href="' . esc($href) . '">' . esc($label) . '</a>';
    }
    $html .= '</nav></header><main>';

    if ($product) {
        $html .= '<nav aria-label="Breadcrumb" class="rf-crumbs"><a href="/">Home</a> › <a href="/catalogue">Shop Fabrics</a> › <span>' . esc((string) $product['name']) . '</span></nav>';
    }
    $html .= '<h1>' . esc((string) $page['h1']) . '</h1>';
    if (!empty($page['intro'])) {
        $html .= '<p class="rf-intro">' . esc((string) $page['intro']) . '</p>';
    } elseif (!$product) {
        $html .= '<p class="rf-intro">' . esc((string) $page['description']) . '</p>';
    }

    if ($product) {
        $html .= renderProductDetail($product, $image);
    } elseif ($listedProducts) {
        $html .= '<h2>' . ($path === '/' ? 'Featured fabrics' : 'Available fabrics') . '</h2><ul class="rf-grid">';
        foreach ($listedProducts as $item) {
            $html .= renderProductCard($item);
        }
        $html .= '</ul>';
    }
    if ($path !== '/catalogue') {
        $html .= '<p><a href="/catalogue">Browse all gents fabrics</a></p>';
    }

    $html .= '</main><footer><p><strong>Rahim Fabrics</strong> — G 41/A Ground Floor, New Azam Cloth Market, Walled City of Lahore, Punjab 54000, Pakistan.</p>'
        . '<p>Phone &amp; WhatsApp: <a href="tel:+923219454085">+92 321 9454085</a> · Email: <a href="mailto:info@rahimfabrics.site">info@rahimfabrics.site</a></p>'
        . '<p><a href="/shipping-delivery">Shipping &amp; Delivery</a> · <a href="/returns-exchanges">Returns &amp; Exchanges</a> · <a href="/payment-policy">Payment</a> · <a href="/privacy-policy">Privacy Policy</a> · <a href="/terms-conditions">Terms &amp; Conditions</a></p>'
        . '</footer></div>';
    return $html;
}

if (!empty($page['h1'])) {
    $snapshotStyle = '<style>.rf-ssr{max-width:1100px;margin:0 auto;padding:16px;font-family:Manrope,system-ui,sans-serif;color:#1f2937;line-height:1.6}'
        . '.rf-ssr a{color:#073b2c}.rf-ssr header{display:flex;flex-wrap:wrap;gap:12px 18px;align-items:center;padding-bottom:16px;border-bottom:1px solid #e5e7eb}'
        . '.rf-ssr .rf-brand{font-family:"Playfair Display",serif;font-size:1.5rem;font-weight:700;text-decoration:none;margin-right:auto}'
        . '.rf-ssr nav a{margin-right:12px;text-decoration:none}.rf-ssr h1{font-family:"Playfair Display",serif;color:#073b2c;font-size:2.25rem;line-height:1.2;margin:28px 0 12px}'
        . '.rf-ssr img{max-width:100%;height:auto;border-radius:12px}.rf-ssr .rf-grid{list-style:none;padding:0;display:grid;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));gap:20px}'
        . '.rf-ssr .rf-grid li{display:flex;flex-direction:column;gap:4px}.rf-ssr .rf-grid a{text-decoration:none}.rf-ssr dt{font-weight:700;margin-top:8px}.rf-ssr dd{margin:0}'
        . '.rf-ssr footer{margin-top:40px;padding-top:16px;border-top:1px solid #e5e7eb;font-size:.9rem}</style>';
    $snapshot = renderSnapshot($page, $path, $product ?: null, $listedProducts, $image);
    $html = str_replace('</head>', $snapshotStyle . "\n  </head>", $html);
    $html = str_replace('<div id="root"></div>', '<div id="root">' . $snapshot . '</div>', $html);
}

http_response_code($status);
header('Content-Type: text/html; charset=utf-8');
header('Vary: Accept-Encoding');
echo $html;
