<?php
// ─── تنظیمات اتصال به دیتابیس ───────────────────────────────────────────────
// این فایل رو بعد از نصب پر کنید یا از install.php استفاده کنید

define('DB_HOST', getenv('DB_HOST') ?: 'localhost');
define('DB_NAME', getenv('DB_NAME') ?: 'rotbe_db');
define('DB_USER', getenv('DB_USER') ?: 'rotbe_user');
define('DB_PASS', getenv('DB_PASS') ?: '');
define('JWT_SECRET', getenv('JWT_SECRET') ?: 'rotbe-bartar-secret-change-this-2025');
define('APP_ENV', getenv('APP_ENV') ?: 'production');

// ─── اتصال PDO ───────────────────────────────────────────────────────────────
function getDB(): PDO {
    static $pdo = null;
    if ($pdo === null) {
        try {
            $dsn = 'mysql:host=' . DB_HOST . ';dbname=' . DB_NAME . ';charset=utf8mb4';
            $pdo = new PDO($dsn, DB_USER, DB_PASS, [
                PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                PDO::ATTR_EMULATE_PREPARES => false,
            ]);
        } catch (PDOException $e) {
            http_response_code(500);
            die(json_encode(['error' => 'خطای اتصال به دیتابیس: ' . $e->getMessage()]));
        }
    }
    return $pdo;
}

// ─── JWT ساده (بدون کتابخانه) ───────────────────────────────────────────────
function base64url_encode(string $data): string {
    return rtrim(strtr(base64_encode($data), '+/', '-_'), '=');
}
function base64url_decode(string $data): string {
    return base64_decode(strtr($data, '-_', '+/') . str_repeat('=', 3 - (3 + strlen($data)) % 4));
}

function jwt_create(string $sub, string $role): string {
    $header  = base64url_encode(json_encode(['alg' => 'HS256', 'typ' => 'JWT']));
    $payload = base64url_encode(json_encode([
        'sub'  => $sub,
        'role' => $role,
        'iat'  => time(),
        'exp'  => time() + 30 * 24 * 3600,
    ]));
    $sig = base64url_encode(hash_hmac('sha256', "$header.$payload", JWT_SECRET, true));
    return "$header.$payload.$sig";
}

function jwt_verify(string $token): ?array {
    $parts = explode('.', $token);
    if (count($parts) !== 3) return null;
    [$header, $payload, $sig] = $parts;
    $expected = base64url_encode(hash_hmac('sha256', "$header.$payload", JWT_SECRET, true));
    if (!hash_equals($expected, $sig)) return null;
    $data = json_decode(base64url_decode($payload), true);
    if (!$data || $data['exp'] < time()) return null;
    return $data;
}

// ─── توابع کمکی ─────────────────────────────────────────────────────────────
function json_out($data, $code = 200) {
    http_response_code($code);
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode($data, JSON_UNESCAPED_UNICODE);
    exit;
}

function get_bearer() {
    $auth = isset($_SERVER['HTTP_AUTHORIZATION']) ? $_SERVER['HTTP_AUTHORIZATION'] : '';
    if (!$auth && isset($_SERVER['REDIRECT_HTTP_AUTHORIZATION'])) {
        $auth = $_SERVER['REDIRECT_HTTP_AUTHORIZATION'];
    }
    if (!$auth && function_exists('apache_request_headers')) {
        $headers = apache_request_headers();
        $auth = isset($headers['Authorization']) ? $headers['Authorization'] : '';
    }
    if (strpos($auth, 'Bearer ') === 0) return substr($auth, 7);
    return null;
}

function require_auth(): array {
    $token = get_bearer();
    if (!$token) json_out(['error' => 'Unauthorized'], 401);
    $payload = jwt_verify($token);
    if (!$payload) json_out(['error' => 'توکن نامعتبر یا منقضی شده'], 401);
    $db = getDB();
    $stmt = $db->prepare('SELECT * FROM users WHERE id = ?');
    $stmt->execute([$payload['sub']]);
    $user = $stmt->fetch();
    if (!$user) json_out(['error' => 'کاربر پیدا نشد'], 401);
    return $user;
}

function require_admin(): array {
    $user = require_auth();
    if ($user['role'] !== 'admin') json_out(['error' => 'فقط ادمین دسترسی دارد'], 403);
    return $user;
}

function require_referrer(): array {
    $user = require_auth();
    if (!in_array($user['role'], ['referrer', 'admin'])) json_out(['error' => 'فقط معرف‌ها دسترسی دارند'], 403);
    return $user;
}

function body(): array {
    static $data = null;
    if ($data === null) {
        $raw = file_get_contents('php://input');
        $data = json_decode($raw, true) ?? [];
    }
    return $data;
}

function gen_uuid(): string {
    return sprintf('%04x%04x-%04x-%04x-%04x-%04x%04x%04x',
        mt_rand(0, 0xffff), mt_rand(0, 0xffff),
        mt_rand(0, 0xffff),
        mt_rand(0, 0x0fff) | 0x4000,
        mt_rand(0, 0x3fff) | 0x8000,
        mt_rand(0, 0xffff), mt_rand(0, 0xffff), mt_rand(0, 0xffff)
    );
}

function gen_code(int $len = 5): string {
    $chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    $code = '';
    for ($i = 0; $i < $len; $i++) $code .= $chars[random_int(0, strlen($chars) - 1)];
    return $code;
}
