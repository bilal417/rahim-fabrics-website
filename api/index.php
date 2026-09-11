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
                $statement = $pdo->prepare('UPDATE products SET name=?, slug=?, code=?, category=?, fabric_type=?, colors=?, thaan_length=?, suits_per_thaan=?, stock=?, description=?, featured=? WHERE id=?');
                $statement->execute([$name, slugify($name), $code, $category, $fabricType, json_encode($colors), $thaanLength, $suits, $stock, $description, $featured, $id]);
            } else {
                $statement = $pdo->prepare('INSERT INTO products (name, slug, code, category, fabric_type, colors, thaan_length, suits_per_thaan, stock, description, featured) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)');
                $statement->execute([$name, slugify($name), $code, $category, $fabricType, json_encode($colors), $thaanLength, $suits, $stock, $description, $featured]);
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
