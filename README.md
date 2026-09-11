# Rahim Fabrics

Wholesale fabric catalogue and inquiry website built for standard Hostinger shared hosting.

- Frontend: React, TypeScript, Vite and Tailwind CSS
- Backend: PHP 8.1+ REST API
- Database: MySQL/MariaDB through PDO
- Authentication: signed bearer tokens and PHP password hashing
- Product images: Hostinger filesystem under `uploads/products`

## Local frontend

```bash
npm install
npm run dev
```

The frontend falls back to demo catalogue data when the PHP API is unavailable during local Vite development.

## Production build

```bash
npm ci
npm run build
```

The complete upload-ready website is generated in `client/dist`. Vite copies the PHP API, Apache rules and public images into that directory.

## Hostinger shared-hosting deployment

### 1. Create the database

1. In hPanel open **Databases → MySQL Databases**.
2. Create a database and database user, then give that user access to the database.
3. Open phpMyAdmin for the new database.
4. Import `database/schema.sql` from this repository.

### 2. Deploy the website

If hPanel supports a build command for the connected GitHub repository, use:

- Branch: `main`
- Build command: `npm run build`
- Output directory: `client/dist`
- No Node.js entry file is needed

Alternatively run the production build locally and upload everything **inside** `client/dist` to the domain's `public_html` directory.

### 3. Configure private credentials

In Hostinger File Manager, copy `public_html/api/config.example.php` to `public_html/api/config.local.php`. Fill in the actual database name, username, password, and two different random secrets:

```php
<?php
return [
    'db_host' => 'localhost',
    'db_port' => 3306,
    'db_name' => 'YOUR_HOSTINGER_DATABASE_NAME',
    'db_user' => 'YOUR_HOSTINGER_DATABASE_USER',
    'db_password' => 'YOUR_HOSTINGER_DATABASE_PASSWORD',
    'jwt_secret' => 'PASTE_A_LONG_RANDOM_SECRET_HERE',
    'setup_key' => 'PASTE_A_DIFFERENT_RANDOM_SETUP_KEY_HERE',
    'token_ttl' => 604800,
    'upload_max_bytes' => 8388608,
];
```

Never commit `config.local.php`; it is intentionally ignored by Git.

### 4. Create the first administrator

1. Visit `https://YOUR-DOMAIN.com/api/setup.html`.
2. Enter the `setup_key` from `config.local.php`.
3. Use `info@rahimfabrics.site` and choose a strong admin password.
4. Sign in at `https://YOUR-DOMAIN.com/admin/login`.

The API rejects additional setup attempts after the first user is created.

## Checks after deployment

- `/api/health` should return JSON with `"status":"ok"`.
- `/api/products` should return the seeded catalogue.
- `/catalogue` should load directly and after a browser refresh.
- Admin login, product image upload, and inquiry submission should all be tested.

Back up both the MySQL database and `public_html/uploads` before replacing or moving the live website.
