<?php

declare(strict_types=1);

require __DIR__ . '/common.php';

header('X-Content-Type-Options: nosniff');
header('X-Frame-Options: DENY');
header('Referrer-Policy: same-origin');
header('Cache-Control: no-store');

if (($_SERVER['REQUEST_METHOD'] ?? 'GET') === 'OPTIONS') {
    header('Allow: GET, POST, PUT, PATCH, DELETE, OPTIONS');
    respond(null, 204);
}

$method = strtoupper((string) ($_SERVER['REQUEST_METHOD'] ?? 'GET'));
$requestPath = parse_url((string) ($_SERVER['REQUEST_URI'] ?? '/api'), PHP_URL_PATH) ?: '/api';
$apiPosition = strpos($requestPath, '/api');
$route = $apiPosition === false ? '/' : substr($requestPath, $apiPosition + 4);
$route = '/' . trim(rawurldecode($route), '/');

try {
    if ($method === 'GET' && $route === '/health') {
        db()->query('SELECT 1');
        respond(['status' => 'ok', 'service' => 'Rahim Fabrics PHP API']);
    }

    if (str_starts_with($route, '/products') || ($method === 'POST' && $route === '/orders')) {
        ensureProductOfferColumns();
        ensureGraceDunhillProduct();
    }

    if ($method === 'POST' && $route === '/setup') {
        $data = input();
        $setupKey = (string) config('setup_key');
        if (strlen($setupKey) < 16 || !hash_equals($setupKey, (string) ($data['setupKey'] ?? ''))) {
            fail('Invalid setup key.', 403);
        }
        if ((int) db()->query('SELECT COUNT(*) FROM users')->fetchColumn() > 0) {
            fail('Administrator setup has already been completed.', 409);
        }
        $name = requiredText($data, 'name', 'Admin name');
        $email = strtolower(requiredText($data, 'email', 'Admin email'));
        $password = (string) ($data['password'] ?? '');
        if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
            fail('Enter a valid admin email.', 422);
        }
        if (strlen($password) < 10) {
            fail('Admin password must contain at least 10 characters.', 422);
        }
        $statement = db()->prepare("INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, 'admin')");
        $statement->execute([$name, $email, password_hash($password, PASSWORD_DEFAULT)]);
        respond(['message' => 'Administrator created.'], 201);
    }

    if ($method === 'POST' && $route === '/auth/login') {
        $data = input();
        $email = strtolower(trim((string) ($data['email'] ?? '')));
        $password = (string) ($data['password'] ?? '');
        $statement = db()->prepare('SELECT id, name, email, password_hash, role FROM users WHERE email = ? LIMIT 1');
        $statement->execute([$email]);
        $user = $statement->fetch();
        if (!$user || !password_verify($password, $user['password_hash'])) {
            usleep(350000);
            fail('Invalid credentials.', 401);
        }
        respond(['token' => createToken($user), 'user' => userJson($user)]);
    }

    if ($method === 'GET' && $route === '/auth/me') {
        respond(requireAuth());
    }

    if ($method === 'GET' && $route === '/products') {
        $conditions = [];
        $parameters = [];
        if (!empty($_GET['category'])) {
            $conditions[] = 'category = ?';
            $parameters[] = trim((string) $_GET['category']);
        }
        if (($_GET['featured'] ?? '') === 'true') {
            $conditions[] = 'featured = 1';
        }
        $sql = 'SELECT * FROM products' . ($conditions ? ' WHERE ' . implode(' AND ', $conditions) : '') . ' ORDER BY created_at DESC';
        $statement = db()->prepare($sql);
        $statement->execute($parameters);
        $products = array_map('productJson', $statement->fetchAll());
        respond($products);
    }

    if ($method === 'GET' && preg_match('#^/products/([^/]+)$#', $route, $matches)) {
        $identifier = $matches[1];
        $column = ctype_digit($identifier) ? 'id' : 'slug';
        $statement = db()->prepare("SELECT * FROM products WHERE {$column} = ? LIMIT 1");
        $statement->execute([$identifier]);
        $product = $statement->fetch();
        if (!$product) {
            fail('Product not found.', 404);
        }
        respond(productJson($product));
    }

    if ($method === 'POST' && ($route === '/products' || preg_match('#^/products/(\d+)$#', $route, $productMatch))) {
        requireAuth();
        $data = input();
        $name = requiredText($data, 'name', 'Product name');
        $code = strtoupper(requiredText($data, 'code', 'Product code'));
        $category = requiredText($data, 'category', 'Category');
        $fabricType = requiredText($data, 'fabricType', 'Fabric type');
        $thaanLength = requiredText($data, 'thaanLength', 'Thaan length');
        $description = requiredText($data, 'description', 'Description');
        $colorsInput = $data['colors'] ?? [];
        $colors = is_array($colorsInput) ? $colorsInput : explode(',', (string) $colorsInput);
        $colors = array_values(array_filter(array_map('trim', $colors)));
        $suits = max(1, (int) ($data['suitsPerThaan'] ?? 0));
        $stock = max(0, (int) ($data['stock'] ?? 0));
        $stockMeters = max(0, (int) ($data['stockMeters'] ?? 0));
        $retailPrice = max(0, (float) ($data['retailPrice'] ?? 0));
        $compareAtPrice = (float) ($data['compareAtPrice'] ?? 0);
        $compareAtPrice = $compareAtPrice > 0 ? $compareAtPrice : null;
        $bundleEnabled = filter_var($data['bundleEnabled'] ?? false, FILTER_VALIDATE_BOOLEAN);
        $bundleQty = $bundleEnabled ? max(2, (int) ($data['bundleQty'] ?? 2)) : null;
        $bundlePrice = $bundleEnabled ? max(0, (float) ($data['bundlePrice'] ?? 0)) : null;
        if ($bundleEnabled && (!$bundlePrice || $bundlePrice >= $retailPrice * $bundleQty)) {
            fail('Bundle price must be greater than zero and lower than the regular total.', 422);
        }
        $wholesalePrice = max(0, (float) ($data['wholesalePrice'] ?? 0));
        $retailUnit = (string) ($data['retailUnit'] ?? 'meter');
        if (!in_array($retailUnit, ['meter', 'suit'], true)) {
            $retailUnit = 'meter';
        }
        $minRetailQty = max(1, (int) ($data['minRetailQty'] ?? 1));
        $minWholesaleQty = max(1, (int) ($data['minWholesaleQty'] ?? 1));
        $retailOnly = filter_var($data['retailOnly'] ?? false, FILTER_VALIDATE_BOOLEAN) ? 1 : 0;
        $unlimitedStock = filter_var($data['unlimitedStock'] ?? false, FILTER_VALIDATE_BOOLEAN) ? 1 : 0;
        $purchaseMode = (string) ($data['purchaseMode'] ?? 'checkout');
        if (!in_array($purchaseMode, ['checkout', 'whatsapp'], true)) {
            $purchaseMode = 'checkout';
        }
        $featured = filter_var($data['featured'] ?? false, FILTER_VALIDATE_BOOLEAN) ? 1 : 0;
        $newImages = uploadedImages();
        $pdo = db();
        $pdo->beginTransaction();
        try {
            if (!empty($productMatch[1])) {
                $id = (int) $productMatch[1];
                $check = $pdo->prepare('SELECT id FROM products WHERE id = ?');
                $check->execute([$id]);
                if (!$check->fetch()) {
                    $pdo->rollBack();
                    foreach ($newImages as $url) removeLocalImage($url);
                    fail('Product not found.', 404);
                }
                $statement = $pdo->prepare('UPDATE products SET name=?, slug=?, code=?, category=?, fabric_type=?, colors=?, thaan_length=?, suits_per_thaan=?, stock=?, stock_meters=?, retail_price=?, compare_at_price=?, bundle_qty=?, bundle_price=?, wholesale_price=?, retail_unit=?, min_retail_qty=?, min_wholesale_qty=?, retail_only=?, unlimited_stock=?, purchase_mode=?, description=?, featured=? WHERE id=?');
                $statement->execute([$name, slugify($name), $code, $category, $fabricType, json_encode($colors), $thaanLength, $suits, $stock, $stockMeters, $retailPrice, $compareAtPrice, $bundleQty, $bundlePrice, $wholesalePrice, $retailUnit, $minRetailQty, $minWholesaleQty, $retailOnly, $unlimitedStock, $purchaseMode, $description, $featured, $id]);
            } else {
                $statement = $pdo->prepare('INSERT INTO products (name, slug, code, category, fabric_type, colors, thaan_length, suits_per_thaan, stock, stock_meters, retail_price, compare_at_price, bundle_qty, bundle_price, wholesale_price, retail_unit, min_retail_qty, min_wholesale_qty, retail_only, unlimited_stock, purchase_mode, description, featured) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)');
                $statement->execute([$name, slugify($name), $code, $category, $fabricType, json_encode($colors), $thaanLength, $suits, $stock, $stockMeters, $retailPrice, $compareAtPrice, $bundleQty, $bundlePrice, $wholesalePrice, $retailUnit, $minRetailQty, $minWholesaleQty, $retailOnly, $unlimitedStock, $purchaseMode, $description, $featured]);
                $id = (int) $pdo->lastInsertId();
            }
            if ($newImages) {
                $oldStatement = $pdo->prepare('SELECT url FROM product_images WHERE product_id = ?');
                $oldStatement->execute([$id]);
                $oldImages = $oldStatement->fetchAll();
                $pdo->prepare('DELETE FROM product_images WHERE product_id = ?')->execute([$id]);
                $imageStatement = $pdo->prepare('INSERT INTO product_images (product_id, url, sort_order) VALUES (?, ?, ?)');
                foreach ($newImages as $position => $url) {
                    $imageStatement->execute([$id, $url, $position]);
                }
            }
            $pdo->commit();
            if (!empty($oldImages)) {
                foreach ($oldImages as $image) removeLocalImage($image['url']);
            }
        } catch (Throwable $error) {
            if ($pdo->inTransaction()) $pdo->rollBack();
            foreach ($newImages as $url) removeLocalImage($url);
            throw $error;
        }
        $statement = $pdo->prepare('SELECT * FROM products WHERE id = ?');
        $statement->execute([$id]);
        respond(productJson($statement->fetch()), empty($productMatch[1]) ? 201 : 200);
    }

    if ($method === 'DELETE' && preg_match('#^/products/(\d+)$#', $route, $matches)) {
        requireAuth();
        $id = (int) $matches[1];
        $statement = db()->prepare('SELECT url FROM product_images WHERE product_id = ?');
        $statement->execute([$id]);
        $images = $statement->fetchAll();
        $delete = db()->prepare('DELETE FROM products WHERE id = ?');
        $delete->execute([$id]);
        if ($delete->rowCount() === 0) {
            fail('Product not found.', 404);
        }
        foreach ($images as $image) removeLocalImage($image['url']);
        respond(null, 204);
    }

    if ($method === 'GET' && $route === '/categories') {
        $rows = db()->query('SELECT * FROM categories WHERE active = 1 ORDER BY name')->fetchAll();
        respond(array_map('categoryJson', $rows));
    }

    if ($method === 'POST' && $route === '/categories') {
        requireAuth();
        $data = input();
        $name = requiredText($data, 'name', 'Category name');
        $description = trim((string) ($data['description'] ?? ''));
        $statement = db()->prepare('INSERT INTO categories (name, slug, description) VALUES (?, ?, ?)');
        $statement->execute([$name, slugify($name), $description]);
        $id = (int) db()->lastInsertId();
        $statement = db()->prepare('SELECT * FROM categories WHERE id = ?');
        $statement->execute([$id]);
        respond(categoryJson($statement->fetch()), 201);
    }

    if ($method === 'PUT' && preg_match('#^/categories/(\d+)$#', $route, $matches)) {
        requireAuth();
        $data = input();
        $name = requiredText($data, 'name', 'Category name');
        $statement = db()->prepare('UPDATE categories SET name=?, slug=?, description=?, active=? WHERE id=?');
        $statement->execute([$name, slugify($name), trim((string) ($data['description'] ?? '')), filter_var($data['active'] ?? true, FILTER_VALIDATE_BOOLEAN) ? 1 : 0, (int) $matches[1]]);
        $statement = db()->prepare('SELECT * FROM categories WHERE id = ?');
        $statement->execute([(int) $matches[1]]);
        $category = $statement->fetch();
        if (!$category) fail('Category not found.', 404);
        respond(categoryJson($category));
    }

    if ($method === 'DELETE' && preg_match('#^/categories/(\d+)$#', $route, $matches)) {
        requireAuth();
        $statement = db()->prepare('DELETE FROM categories WHERE id = ?');
        $statement->execute([(int) $matches[1]]);
        if ($statement->rowCount() === 0) fail('Category not found.', 404);
        respond(null, 204);
    }

    if ($method === 'POST' && $route === '/inquiries') {
        $data = input();
        $customerName = requiredText($data, 'customerName', 'Customer name');
        $phone = requiredText($data, 'phone', 'Phone');
        $city = requiredText($data, 'city', 'City');
        $interested = $data['productsInterested'] ?? [];
        if (!is_array($interested)) $interested = array_filter(array_map('trim', explode(',', (string) $interested)));
        $statement = db()->prepare('INSERT INTO inquiries (customer_name, business_name, phone, city, shop_type, monthly_requirement, products_interested, message) VALUES (?, ?, ?, ?, ?, ?, ?, ?)');
        $statement->execute([$customerName, trim((string) ($data['businessName'] ?? '')), $phone, $city, trim((string) ($data['shopType'] ?? '')), trim((string) ($data['monthlyRequirement'] ?? '')), json_encode(array_values($interested)), trim((string) ($data['message'] ?? ''))]);
        $id = (int) db()->lastInsertId();
        $statement = db()->prepare('SELECT * FROM inquiries WHERE id = ?');
        $statement->execute([$id]);
        respond(inquiryJson($statement->fetch()), 201);
    }

    if ($method === 'GET' && $route === '/inquiries') {
        requireAuth();
        $rows = db()->query('SELECT * FROM inquiries ORDER BY created_at DESC')->fetchAll();
        respond(array_map('inquiryJson', $rows));
    }

    if ($method === 'PATCH' && preg_match('#^/inquiries/(\d+)$#', $route, $matches)) {
        requireAuth();
        $data = input();
        $status = (string) ($data['status'] ?? '');
        if (!in_array($status, ['new', 'contacted', 'closed'], true)) {
            fail('Invalid inquiry status.', 422);
        }
        $statement = db()->prepare('UPDATE inquiries SET status = ? WHERE id = ?');
        $statement->execute([$status, (int) $matches[1]]);
        $statement = db()->prepare('SELECT * FROM inquiries WHERE id = ?');
        $statement->execute([(int) $matches[1]]);
        $inquiry = $statement->fetch();
        if (!$inquiry) fail('Inquiry not found.', 404);
        respond(inquiryJson($inquiry));
    }

    if ($method === 'GET' && $route === '/checkout/payment-options') {
        respond([
            'methods' => ['cod', 'bank_transfer'],
            'bankDetails' => bankPaymentDetails(),
            'note' => 'Delivery charges are confirmed after order review. Product total is charged at checkout.',
        ]);
    }

    if ($method === 'POST' && $route === '/orders') {
        $data = input();
        $channel = (string) ($data['channel'] ?? '');
        if (!in_array($channel, ['retail', 'wholesale'], true)) {
            fail('Choose retail or wholesale checkout.', 422);
        }
        $paymentMethod = (string) ($data['paymentMethod'] ?? '');
        if (!in_array($paymentMethod, ['cod', 'bank_transfer'], true)) {
            fail('Choose a valid payment method.', 422);
        }
        $customerName = requiredText($data, 'customerName', 'Customer name');
        $phone = requiredText($data, 'phone', 'Phone');
        $city = requiredText($data, 'city', 'City');
        $address = requiredText($data, 'address', 'Address');
        $email = trim((string) ($data['email'] ?? ''));
        $businessName = trim((string) ($data['businessName'] ?? ''));
        $notes = trim((string) ($data['notes'] ?? ''));
        $itemsInput = $data['items'] ?? [];
        if (!is_array($itemsInput) || !$itemsInput) {
            fail('Add at least one item to the order.', 422);
        }

        $pdo = db();
        $pdo->beginTransaction();
        try {
            $normalized = [];
            $subtotal = 0.0;
            foreach ($itemsInput as $item) {
                if (!is_array($item)) {
                    fail('Invalid order item.', 422);
                }
                $productIdentifier = trim((string) ($item['productId'] ?? ''));
                $qty = (float) ($item['qty'] ?? 0);
                if ($productIdentifier === '' || $qty <= 0) {
                    fail('Each item needs a product and quantity.', 422);
                }
                if (ctype_digit($productIdentifier)) {
                    $statement = $pdo->prepare('SELECT * FROM products WHERE id = ? LIMIT 1 FOR UPDATE');
                    $statement->execute([(int) $productIdentifier]);
                } else {
                    $statement = $pdo->prepare('SELECT * FROM products WHERE slug = ? OR code = ? LIMIT 1 FOR UPDATE');
                    $statement->execute([$productIdentifier, strtoupper($productIdentifier)]);
                }
                $product = $statement->fetch();
                if (!$product) {
                    fail('One of the products is no longer available.', 404);
                }
                $productId = (int) $product['id'];

                if ($channel === 'retail') {
                    $unit = (string) ($product['retail_unit'] ?? 'meter');
                    $unitPrice = (float) $product['retail_price'];
                    $minQty = max(1, (int) ($product['min_retail_qty'] ?? 1));
                    if ($unit === 'suit' && floor($qty) !== $qty) {
                        fail($product['name'] . ' can only be ordered in whole suits.', 422);
                    }
                    if ($qty < $minQty) {
                        fail($product['name'] . ' requires at least ' . $minQty . ' ' . $unit . '(s).', 422);
                    }
                    if (!isUnlimitedStockProduct($product)) {
                        if ($qty > (int) ($product['stock_meters'] ?? 0)) {
                            fail('Not enough retail stock for ' . $product['name'] . '.', 422);
                        }
                        $pdo->prepare('UPDATE products SET stock_meters = stock_meters - ? WHERE id = ?')
                            ->execute([$qty, $productId]);
                    }
                } else {
                    $unit = 'thaan';
                    $unitPrice = (float) $product['wholesale_price'];
                    $minQty = max(1, (int) ($product['min_wholesale_qty'] ?? 1));
                    if ($qty < $minQty) {
                        fail($product['name'] . ' requires at least ' . $minQty . ' thaan(s).', 422);
                    }
                    if ($qty > (int) $product['stock']) {
                        fail('Not enough wholesale stock for ' . $product['name'] . '.', 422);
                    }
                    $pdo->prepare('UPDATE products SET stock = stock - ? WHERE id = ?')
                        ->execute([(int) $qty, $productId]);
                }

                if ($unitPrice <= 0) {
                    fail('Pricing is not configured for ' . $product['name'] . '.', 422);
                }

                $lineTotal = $channel === 'retail'
                    ? retailLineTotal($product, $qty, $unitPrice)
                    : round($unitPrice * $qty, 2);
                $subtotal += $lineTotal;
                $normalized[] = [
                    'product_id' => $productId,
                    'product_name' => $product['name'],
                    'product_code' => $product['code'],
                    'unit' => $unit,
                    'qty' => $qty,
                    'unit_price' => $unitPrice,
                    'line_total' => $lineTotal,
                ];
            }

            $orderNumber = generateOrderNumber($pdo);
            $paymentStatus = $paymentMethod === 'cod' ? 'cod_pending' : 'pending';
            $total = round($subtotal, 2);
            $insert = $pdo->prepare('INSERT INTO orders (order_number, channel, customer_name, business_name, phone, email, city, address, payment_method, payment_status, order_status, subtotal, total, notes) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)');
            $insert->execute([
                $orderNumber,
                $channel,
                $customerName,
                $businessName !== '' ? $businessName : null,
                $phone,
                $email !== '' ? $email : null,
                $city,
                $address,
                $paymentMethod,
                $paymentStatus,
                'new',
                $subtotal,
                $total,
                $notes !== '' ? $notes : null,
            ]);
            $orderId = (int) $pdo->lastInsertId();
            $itemInsert = $pdo->prepare('INSERT INTO order_items (order_id, product_id, product_name, product_code, unit, qty, unit_price, line_total) VALUES (?, ?, ?, ?, ?, ?, ?, ?)');
            foreach ($normalized as $line) {
                $itemInsert->execute([
                    $orderId,
                    $line['product_id'],
                    $line['product_name'],
                    $line['product_code'],
                    $line['unit'],
                    $line['qty'],
                    $line['unit_price'],
                    $line['line_total'],
                ]);
            }
            $pdo->commit();
        } catch (Throwable $error) {
            if ($pdo->inTransaction()) {
                $pdo->rollBack();
            }
            throw $error;
        }

        $statement = db()->prepare('SELECT * FROM orders WHERE id = ?');
        $statement->execute([$orderId]);
        respond(orderJson($statement->fetch()), 201);
    }

    if ($method === 'GET' && $route === '/orders') {
        requireAuth();
        $rows = db()->query('SELECT * FROM orders ORDER BY created_at DESC')->fetchAll();
        respond(array_map('orderJson', $rows));
    }

    if ($method === 'GET' && preg_match('#^/orders/([^/]+)$#', $route, $matches)) {
        $identifier = $matches[1];
        if (ctype_digit($identifier)) {
            requireAuth();
            $statement = db()->prepare('SELECT * FROM orders WHERE id = ? LIMIT 1');
            $statement->execute([(int) $identifier]);
        } else {
            $statement = db()->prepare('SELECT * FROM orders WHERE order_number = ? LIMIT 1');
            $statement->execute([$identifier]);
        }
        $order = $statement->fetch();
        if (!$order) {
            fail('Order not found.', 404);
        }
        respond(orderJson($order));
    }

    if ($method === 'PATCH' && preg_match('#^/orders/(\d+)$#', $route, $matches)) {
        requireAuth();
        $data = input();
        $orderStatus = (string) ($data['orderStatus'] ?? '');
        $paymentStatus = (string) ($data['paymentStatus'] ?? '');
        $allowedOrder = ['new', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'];
        $allowedPayment = ['pending', 'cod_pending', 'paid', 'failed', 'refunded'];
        if ($orderStatus !== '' && !in_array($orderStatus, $allowedOrder, true)) {
            fail('Invalid order status.', 422);
        }
        if ($paymentStatus !== '' && !in_array($paymentStatus, $allowedPayment, true)) {
            fail('Invalid payment status.', 422);
        }
        if ($orderStatus === '' && $paymentStatus === '') {
            fail('Provide orderStatus or paymentStatus.', 422);
        }
        $fields = [];
        $params = [];
        if ($orderStatus !== '') {
            $fields[] = 'order_status = ?';
            $params[] = $orderStatus;
        }
        if ($paymentStatus !== '') {
            $fields[] = 'payment_status = ?';
            $params[] = $paymentStatus;
        }
        $params[] = (int) $matches[1];
        $statement = db()->prepare('UPDATE orders SET ' . implode(', ', $fields) . ' WHERE id = ?');
        $statement->execute($params);
        $statement = db()->prepare('SELECT * FROM orders WHERE id = ?');
        $statement->execute([(int) $matches[1]]);
        $order = $statement->fetch();
        if (!$order) {
            fail('Order not found.', 404);
        }
        respond(orderJson($order));
    }

    fail('Route not found.', 404);
} catch (PDOException $error) {
    error_log($error->__toString());
    if ((string) $error->getCode() === '23000') {
        fail('A record with that name, code or email already exists.', 409);
    }
    fail('Database request failed.', 500);
} catch (Throwable $error) {
    error_log($error->__toString());
    fail('Server configuration or request failed.', 500);
}
