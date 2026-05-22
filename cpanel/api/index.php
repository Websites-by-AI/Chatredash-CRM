<?php
// سازگار با PHP 7.4+

// ─── هدرها ───────────────────────────────────────────────────────────────────
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET,POST,PUT,PATCH,DELETE,OPTIONS');
header('Access-Control-Allow-Headers: Content-Type,Authorization');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(204); exit; }

// ─── پیکربندی ─────────────────────────────────────────────────────────────────
if (file_exists(__DIR__ . '/db_config.php')) require_once __DIR__ . '/db_config.php';
require_once __DIR__ . '/config.php';

// ─── تشخیص route ──────────────────────────────────────────────────────────────
$method = $_SERVER['REQUEST_METHOD'];
$uri    = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
$uri    = preg_replace('#^/api#', '', $uri);
$uri    = rtrim($uri, '/') ?: '/';

// ─── تطبیق route ──────────────────────────────────────────────────────────────
function match_route(string $pattern, string $uri, array &$params): bool {
    $regex = preg_replace('#:([a-z_]+)#', '(?P<$1>[^/]+)', $pattern);
    if (preg_match("#^$regex$#", $uri, $m)) {
        foreach ($m as $k => $v) if (is_string($k)) $params[$k] = $v;
        return true;
    }
    return false;
}

$params = [];

// ════════════════════════════════════════════════════════════════════════════
//  AUTH
// ════════════════════════════════════════════════════════════════════════════

// POST /auth/send-otp
if ($method === 'POST' && $uri === '/auth/send-otp') {
    $body  = body();
    $phone = trim($body['phone'] ?? '');
    if (!$phone || strlen($phone) < 10) json_out(['error' => 'شماره موبایل نامعتبر است'], 400);

    $code    = str_pad((string)random_int(0, 99999), 5, '0', STR_PAD_LEFT);
    $expires = date('Y-m-d H:i:s', time() + 600);
    $db = getDB();
    $db->prepare('REPLACE INTO otps (phone, code, expires_at) VALUES (?,?,?)')
       ->execute([$phone, $code, $expires]);

    // در محیط production اینجا SMS ارسال می‌شه
    $response = ['sent' => true, 'message' => 'کد ارسال شد'];
    if (APP_ENV !== 'production') $response['dev_otp'] = $code;
    json_out($response);
}

// POST /auth/verify-otp
if ($method === 'POST' && $uri === '/auth/verify-otp') {
    $body  = body();
    $phone = trim($body['phone'] ?? '');
    $code  = trim($body['code'] ?? '');
    $db    = getDB();

    $stmt = $db->prepare('SELECT * FROM otps WHERE phone = ?');
    $stmt->execute([$phone]);
    $otp = $stmt->fetch();

    if (!$otp || $otp['code'] !== $code)
        json_out(['error' => 'کد وارد شده نادرست است'], 400);
    if (strtotime($otp['expires_at']) < time())
        json_out(['error' => 'کد منقضی شده است'], 400);

    $db->prepare('DELETE FROM otps WHERE phone = ?')->execute([$phone]);

    $stmt = $db->prepare('SELECT * FROM users WHERE phone = ?');
    $stmt->execute([$phone]);
    $user = $stmt->fetch();

    if (!$user) {
        $id = gen_uuid();
        $db->prepare('INSERT INTO users (id,phone,name,role) VALUES (?,?,?,?)')
           ->execute([$id, $phone, '', 'registrant']);
        $stmt->execute([$phone]);
        $user = $stmt->fetch();
    }

    $token = jwt_create($user['id'], $user['role']);
    json_out(['token' => $token, 'user' => sanitize_user($user)]);
}

// GET /auth/me
if ($method === 'GET' && $uri === '/auth/me') {
    $user = require_auth();
    $out  = ['user' => sanitize_user($user)];
    if ($user['role'] === 'referrer') {
        $ref = get_referrer_by_user($user['id']);
        if ($ref) $out['referrer'] = $ref;
    }
    json_out($out);
}

// ════════════════════════════════════════════════════════════════════════════
//  PUBLIC
// ════════════════════════════════════════════════════════════════════════════

// GET /public/settings
if ($method === 'GET' && $uri === '/public/settings') {
    $s = get_settings();
    json_out([
        'base_price'           => (float)($s['base_price'] ?? 1000000),
        'default_discount_pct' => (float)($s['default_discount_pct'] ?? 10),
    ]);
}

// GET /public/referrer/:code
if ($method === 'GET' && match_route('/public/referrer/:code', $uri, $params)) {
    $code = strtoupper(trim($params['code']));
    $db   = getDB();
    $stmt = $db->prepare("SELECT * FROM referrers WHERE referral_code = ? AND status = 'active'");
    $stmt->execute([$code]);
    $ref  = $stmt->fetch();
    if (!$ref) json_out(['error' => 'کد معرف معتبر نیست'], 404);
    $s    = get_settings();
    json_out([
        'valid'          => true,
        'name'           => $ref['name'],
        'referral_code'  => $ref['referral_code'],
        'discount_pct'   => (float)($s['default_discount_pct'] ?? 10),
        'base_price'     => (float)($s['base_price'] ?? 1000000),
    ]);
}

// POST /public/register
if ($method === 'POST' && $uri === '/public/register') {
    $b    = body();
    $name = trim($b['name'] ?? '');
    $ph   = trim($b['phone'] ?? '');
    if (!$name || !$ph) json_out(['error' => 'نام و موبایل الزامی است'], 400);

    $s          = get_settings();
    $base_price = (float)($s['base_price'] ?? 1000000);
    $refCode    = strtoupper(trim($b['referrer_code'] ?? ''));

    $discount_pct = 0; $referrer_id = null; $commission_pct = 0; $savedCode = null;
    if ($refCode) {
        $db   = getDB();
        $stmt = $db->prepare("SELECT * FROM referrers WHERE referral_code = ? AND status = 'active'");
        $stmt->execute([$refCode]);
        $ref  = $stmt->fetch();
        if ($ref) {
            $savedCode      = $ref['referral_code'];
            $referrer_id    = $ref['id'];
            $commission_pct = (float)$ref['commission_pct'];
            $discount_pct   = (float)($s['default_discount_pct'] ?? 10);
        }
    }

    $disc_amount = round($base_price * $discount_pct / 100);
    $paid_amount = $base_price - $disc_amount;
    $comm_amount = $referrer_id ? round($paid_amount * $commission_pct / 100) : 0;

    $db  = getDB();
    $id  = gen_uuid();
    $db->prepare('INSERT INTO registrations
        (id,name,phone,field,exam,rank,referrer_code,referrer_id,
         discount_pct,discount_amount,base_price,paid_amount,commission_pct,commission_amount,status)
        VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)')
       ->execute([$id, $name, $ph,
           trim($b['field'] ?? ''), trim($b['exam'] ?? ''), trim($b['rank'] ?? ''),
           $savedCode, $referrer_id,
           $discount_pct, $disc_amount, $base_price, $paid_amount,
           $commission_pct, $comm_amount, 'pending']);

    // آپدیت آمار معرف
    if ($referrer_id) {
        $db->prepare('UPDATE referrers SET total_signups = total_signups + 1 WHERE id = ?')
           ->execute([$referrer_id]);
    }

    $stmt = $db->prepare('SELECT * FROM registrations WHERE id = ?');
    $stmt->execute([$id]);
    json_out($stmt->fetch());
}

// ════════════════════════════════════════════════════════════════════════════
//  ADMIN
// ════════════════════════════════════════════════════════════════════════════

// GET /admin/stats
if ($method === 'GET' && $uri === '/admin/stats') {
    require_admin();
    $db = getDB();
    $q  = fn(string $sql, array $p = []) => (int)$db->prepare($sql)->execute($p) ? (int)$db->prepare($sql)->execute($p) && ($s = $db->prepare($sql)) && $s->execute($p) ? $s->fetchColumn() : 0 : 0;

    $stats = [];
    foreach ([
        'total_referrers'      => ['SELECT COUNT(*) FROM referrers', []],
        'active_referrers'     => ["SELECT COUNT(*) FROM referrers WHERE status='active'", []],
        'total_registrations'  => ['SELECT COUNT(*) FROM registrations', []],
        'paid_registrations'   => ["SELECT COUNT(*) FROM registrations WHERE status='paid'", []],
        'revenue'              => ["SELECT COALESCE(SUM(paid_amount),0) FROM registrations WHERE status='paid'", []],
        'commissions'          => ["SELECT COALESCE(SUM(commission_amount),0) FROM registrations WHERE status='paid'", []],
        'pending_payouts'      => ["SELECT COUNT(*) FROM payouts WHERE status='pending'", []],
    ] as $key => [$sql, $p]) {
        $s = $db->prepare($sql); $s->execute($p);
        $stats[$key] = is_numeric($v = $s->fetchColumn()) ? (float)$v : 0;
    }
    json_out($stats);
}

// GET /admin/referrers
if ($method === 'GET' && $uri === '/admin/referrers') {
    require_admin();
    $db   = getDB();
    $stmt = $db->query('SELECT * FROM referrers ORDER BY created_at DESC');
    json_out($stmt->fetchAll());
}

// POST /admin/referrers
if ($method === 'POST' && $uri === '/admin/referrers') {
    require_admin();
    $b    = body();
    $phone = trim($b['phone'] ?? '');
    $name  = trim($b['name'] ?? '');
    if (!$phone) json_out(['error' => 'شماره موبایل الزامی است'], 400);

    $db   = getDB();
    $s    = get_settings();

    // کاربر بساز یا پیدا کن
    $stmt = $db->prepare('SELECT * FROM users WHERE phone = ?');
    $stmt->execute([$phone]);
    $user = $stmt->fetch();
    if (!$user) {
        $uid = gen_uuid();
        $db->prepare('INSERT INTO users (id,phone,name,role) VALUES (?,?,?,?)')
           ->execute([$uid, $phone, $name, 'referrer']);
        $stmt->execute([$phone]);
        $user = $stmt->fetch();
    } else {
        $db->prepare("UPDATE users SET role='referrer', name=? WHERE id=?")->execute([$name ?: $user['name'], $user['id']]);
    }

    // چک کن قبلاً معرف نباشه
    $stmt = $db->prepare('SELECT id FROM referrers WHERE user_id = ?');
    $stmt->execute([$user['id']]);
    if ($stmt->fetch()) json_out(['error' => 'این کاربر قبلاً معرف است'], 400);

    // کد یکتا بساز
    $code = '';
    for ($i = 0; $i < 20; $i++) {
        $code = gen_code(5);
        $stmt = $db->prepare('SELECT id FROM referrers WHERE referral_code = ?');
        $stmt->execute([$code]);
        if (!$stmt->fetch()) break;
    }

    $commPct = isset($b['commission_pct']) ? (float)$b['commission_pct'] : (float)($s['default_commission_pct'] ?? 20);
    $rid     = gen_uuid();
    $pin     = str_pad((string)random_int(0, 99999), 5, '0', STR_PAD_LEFT);

    $db->prepare('INSERT INTO referrers
        (id,user_id,phone,name,referral_code,security_pin,commission_pct,status,
         total_earnings,available_balance,total_signups,iban)
        VALUES (?,?,?,?,?,?,?,?,0,0,0,?)')
       ->execute([$rid, $user['id'], $phone, $name, $code, $pin, $commPct, 'active', '']);

    $stmt = $db->prepare('SELECT * FROM referrers WHERE id = ?');
    $stmt->execute([$rid]);
    json_out($stmt->fetch(), 201);
}

// PATCH /admin/referrers/:id
if ($method === 'PATCH' && match_route('/admin/referrers/:id', $uri, $params)) {
    require_admin();
    $b   = body();
    $db  = getDB();
    $set = []; $vals = [];
    if (isset($b['status']))         { $set[] = 'status = ?';         $vals[] = $b['status']; }
    if (isset($b['commission_pct'])) { $set[] = 'commission_pct = ?'; $vals[] = (float)$b['commission_pct']; }
    if (isset($b['name']))           { $set[] = 'name = ?';           $vals[] = $b['name']; }
    if ($set) {
        $vals[] = $params['id'];
        $db->prepare('UPDATE referrers SET ' . implode(', ', $set) . ' WHERE id = ?')->execute($vals);
    }
    $stmt = $db->prepare('SELECT * FROM referrers WHERE id = ?');
    $stmt->execute([$params['id']]);
    json_out($stmt->fetch() ?: ['error' => 'پیدا نشد']);
}

// GET /admin/registrations
if ($method === 'GET' && $uri === '/admin/registrations') {
    require_admin();
    $db   = getDB();
    $stmt = $db->query('SELECT * FROM registrations ORDER BY created_at DESC');
    json_out($stmt->fetchAll());
}

// PATCH /admin/registrations/:id
if ($method === 'PATCH' && match_route('/admin/registrations/:id', $uri, $params)) {
    require_admin();
    $b    = body();
    $db   = getDB();
    $newStatus = $b['status'] ?? null;
    if ($newStatus) {
        // اگر پرداخت شد → کمیسیون به موجودی معرف اضافه کن
        $stmt = $db->prepare('SELECT * FROM registrations WHERE id = ?');
        $stmt->execute([$params['id']]);
        $reg  = $stmt->fetch();
        if ($reg && $newStatus === 'paid' && $reg['status'] !== 'paid' && $reg['referrer_id']) {
            $db->prepare('UPDATE referrers SET total_earnings=total_earnings+?, available_balance=available_balance+? WHERE id=?')
               ->execute([$reg['commission_amount'], $reg['commission_amount'], $reg['referrer_id']]);
        }
        $db->prepare('UPDATE registrations SET status=? WHERE id=?')->execute([$newStatus, $params['id']]);
    }
    $stmt = $db->prepare('SELECT * FROM registrations WHERE id = ?');
    $stmt->execute([$params['id']]);
    json_out($stmt->fetch() ?: ['error' => 'پیدا نشد']);
}

// GET /admin/payouts
if ($method === 'GET' && $uri === '/admin/payouts') {
    require_admin();
    $db   = getDB();
    $stmt = $db->query('SELECT * FROM payouts ORDER BY created_at DESC');
    json_out($stmt->fetchAll());
}

// PATCH /admin/payouts/:id
if ($method === 'PATCH' && match_route('/admin/payouts/:id', $uri, $params)) {
    require_admin();
    $b    = body();
    $db   = getDB();
    $stmt = $db->prepare('SELECT * FROM payouts WHERE id = ?');
    $stmt->execute([$params['id']]);
    $payout = $stmt->fetch();
    if (!$payout) json_out(['error' => 'پیدا نشد'], 404);

    $newStatus = $b['status'] ?? $payout['status'];
    // اگر رد شد → موجودی برگردونه
    if ($newStatus === 'rejected' && $payout['status'] !== 'rejected') {
        $db->prepare('UPDATE referrers SET available_balance=available_balance+? WHERE id=?')
           ->execute([$payout['amount'], $payout['referrer_id']]);
    }
    $db->prepare("UPDATE payouts SET status=?, processed_at=NOW() WHERE id=?")->execute([$newStatus, $params['id']]);
    $stmt->execute([$params['id']]);
    json_out($stmt->fetch());
}

// GET /admin/settings
if ($method === 'GET' && $uri === '/admin/settings') {
    require_admin();
    $s   = get_settings();
    $key = $s['openai_api_key'] ?? '';
    json_out([
        'base_price'             => (float)($s['base_price'] ?? 1000000),
        'default_commission_pct' => (float)($s['default_commission_pct'] ?? 20),
        'default_discount_pct'   => (float)($s['default_discount_pct'] ?? 10),
        'openai_api_key'         => $key ? '••••••••' : '',
        'openai_api_key_set'     => !empty($key),
    ]);
}

// PUT /admin/settings
if ($method === 'PUT' && $uri === '/admin/settings') {
    require_admin();
    $b  = body();
    $db = getDB();
    $map = [
        'base_price'             => $b['base_price'] ?? null,
        'default_commission_pct' => $b['default_commission_pct'] ?? null,
        'default_discount_pct'   => $b['default_discount_pct'] ?? null,
        'openai_api_key'         => (isset($b['openai_api_key']) && $b['openai_api_key'] !== '••••••••') ? $b['openai_api_key'] : null,
        'gemini_api_key'         => (isset($b['gemini_api_key']) && $b['gemini_api_key'] !== '••••••••') ? $b['gemini_api_key'] : null,
    ];
    foreach ($map as $k => $v) {
        if ($v !== null) {
            $db->prepare('INSERT INTO app_settings (setting_key,setting_value) VALUES (?,?) ON DUPLICATE KEY UPDATE setting_value=?')
               ->execute([$k, $v, $v]);
        }
    }
    $s   = get_settings();
    $key = $s['openai_api_key'] ?? '';
    json_out(['base_price' => (float)($s['base_price'] ?? 1000000), 'default_commission_pct' => (float)($s['default_commission_pct'] ?? 20), 'default_discount_pct' => (float)($s['default_discount_pct'] ?? 10), 'openai_api_key' => $key ? '••••••••' : '', 'openai_api_key_set' => !empty($key)]);
}

// ════════════════════════════════════════════════════════════════════════════
//  REFERRER
// ════════════════════════════════════════════════════════════════════════════

// GET /referrer/me
if ($method === 'GET' && $uri === '/referrer/me') {
    $user = require_referrer();
    $ref  = get_referrer_by_user($user['id']);
    if (!$ref) json_out(['error' => 'حساب معرف یافت نشد'], 404);
    json_out($ref);
}

// GET /referrer/registrations
if ($method === 'GET' && $uri === '/referrer/registrations') {
    $user = require_referrer();
    $ref  = get_referrer_by_user($user['id']);
    if (!$ref) json_out([]);
    $db   = getDB();
    $stmt = $db->prepare('SELECT * FROM registrations WHERE referrer_id = ? ORDER BY created_at DESC');
    $stmt->execute([$ref['id']]);
    $rows = $stmt->fetchAll();
    // مخفی کردن بخشی از شماره
    foreach ($rows as &$r) {
        $ph = $r['phone'];
        $r['phone'] = strlen($ph) >= 7 ? substr($ph, 0, 4) . '***' . substr($ph, -3) : $ph;
    }
    json_out($rows);
}

// POST /referrer/payout
if ($method === 'POST' && $uri === '/referrer/payout') {
    $user   = require_referrer();
    $ref    = get_referrer_by_user($user['id']);
    if (!$ref) json_out(['error' => 'حساب معرف یافت نشد'], 404);

    $b      = body();
    $amount = (float)($b['amount'] ?? 0);
    $iban   = trim($b['iban'] ?? '');

    if ($amount <= 0) json_out(['error' => 'مبلغ نامعتبر است'], 400);
    if ($amount > (float)$ref['available_balance']) json_out(['error' => 'موجودی کافی نیست'], 400);
    if (strlen($iban) < 10) json_out(['error' => 'شماره شبا نامعتبر است'], 400);

    $db  = getDB();
    $pid = gen_uuid();
    $db->prepare('INSERT INTO payouts (id,referrer_id,referrer_name,amount,iban,status) VALUES (?,?,?,?,?,?)')
       ->execute([$pid, $ref['id'], $ref['name'], $amount, $iban, 'pending']);
    $db->prepare('UPDATE referrers SET available_balance=available_balance-?, iban=? WHERE id=?')
       ->execute([$amount, $iban, $ref['id']]);

    $stmt = $db->prepare('SELECT * FROM payouts WHERE id = ?');
    $stmt->execute([$pid]);
    json_out($stmt->fetch(), 201);
}

// GET /referrer/payouts
if ($method === 'GET' && $uri === '/referrer/payouts') {
    $user = require_referrer();
    $ref  = get_referrer_by_user($user['id']);
    if (!$ref) json_out([]);
    $db   = getDB();
    $stmt = $db->prepare('SELECT * FROM payouts WHERE referrer_id = ? ORDER BY created_at DESC');
    $stmt->execute([$ref['id']]);
    json_out($stmt->fetchAll());
}

// ════════════════════════════════════════════════════════════════════════════
//  AI — ترنم مهر
// ════════════════════════════════════════════════════════════════════════════

// GET /motivational
if ($method === 'GET' && $uri === '/motivational') {
    $s   = get_settings();
    $key = $s['gemini_api_key'] ?? ($s['openai_api_key'] ?? '');

    $quotes = [
        'سودای بزرگی در سر داری؛ امروز با هر قدم کوچکت به رویایت نزدیک‌تر می‌شوی.',
        'موفقیت به معنای بی‌نقص بودن نیست؛ بلکه ادامه دادن با وجود خستگی‌هاست.',
        'تلاش امروز تو، ترازِ درخشان فرداست. پر انرژی و پرتوان باش!',
        'آرام آرام، اما با استواری کامل پیش برو. همین امروز یک قدم دیگه بردار.',
        'هر تست که حل می‌کنی، یک آجر روی بنای رتبه‌ات می‌ذاری.',
    ];

    if ($key && $key !== '••••••••') {
        // Gemini API
        $ch = curl_init('https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=' . urlencode($key));
        curl_setopt_array($ch, [
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_POST           => true,
            CURLOPT_HTTPHEADER     => ['Content-Type: application/json'],
            CURLOPT_POSTFIELDS     => json_encode(['contents' => [['parts' => [['text' => 'یک پیام انگیزشی کوتاه (حداکثر دو جمله) به فارسی برای دانش‌آموزی که برای کنکور می‌خواند بنویس.']]]]], JSON_UNESCAPED_UNICODE),
            CURLOPT_TIMEOUT        => 10,
        ]);
        $resp = curl_exec($ch);
        curl_close($ch);
        if ($resp) {
            $data = json_decode($resp, true);
            $text = $data['candidates'][0]['content']['parts'][0]['text'] ?? null;
            if ($text) json_out(['quote' => trim($text)]);
        }
    }
    json_out(['quote' => $quotes[array_rand($quotes)]]);
}

// POST /chat
if ($method === 'POST' && $uri === '/chat') {
    $b       = body();
    $message = trim($b['message'] ?? '');
    $history = $b['history'] ?? [];
    $s       = get_settings();
    $key     = $s['gemini_api_key'] ?? ($s['openai_api_key'] ?? '');

    if ($key && $key !== '••••••••' && $message) {
        $contents = [['role' => 'user', 'parts' => [['text' => 'شما مشاور تحصیلی هوشمند آقای رادان در موسسه ترنم مهر هستید. به فارسی صمیمی و کاربردی پاسخ دهید.']]]];
        foreach ($history as $h) {
            if (isset($h['role'], $h['content'])) {
                $contents[] = ['role' => $h['role'] === 'user' ? 'user' : 'model', 'parts' => [['text' => $h['content']]]];
            }
        }
        $contents[] = ['role' => 'user', 'parts' => [['text' => $message]]];

        $ch = curl_init('https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=' . urlencode($key));
        curl_setopt_array($ch, [
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_POST           => true,
            CURLOPT_HTTPHEADER     => ['Content-Type: application/json'],
            CURLOPT_POSTFIELDS     => json_encode(['contents' => $contents], JSON_UNESCAPED_UNICODE),
            CURLOPT_TIMEOUT        => 15,
        ]);
        $resp = curl_exec($ch);
        curl_close($ch);
        if ($resp) {
            $data = json_decode($resp, true);
            $text = $data['candidates'][0]['content']['parts'][0]['text'] ?? null;
            if ($text) json_out(['reply' => trim($text)]);
        }
    }

    // فال‌بک آفلاین
    $lm      = mb_strtolower($message);
    $replies = [
        'فیزیک'   => 'برای فیزیک، نمودار سرعت-زمان رسم کن و ۲۵ تست زمان‌دار حل کن!',
        'ریاضی'   => 'مبحث حد با قاعده هوپیتال حل میشه. جزوه ترنم مهر رو بخون.',
        'خسته'    => 'تکنیک پومودورو (۲۵ دقیقه درس، ۵ دقیقه استراحت) رو امتحان کن.',
        'استرس'   => 'قبل از آزمون نفس عمیق بکش. مشکل استرس آزمون رو با تمرین مکرر حل کن.',
    ];
    $reply = 'چه سوال خوبی! بیشتر توضیح بده تا بتونم بهتر راهنماییت کنم.';
    foreach ($replies as $k => $v) { if (strpos($lm, $k) !== false) { $reply = $v; break; } }
    json_out(['reply' => $reply]);
}

// POST /analyze-exam
if ($method === 'POST' && $uri === '/analyze-exam') {
    $b       = body();
    $lessons = $b['lessons'] ?? [];
    $field   = $b['field'] ?? 'unknown';
    $s       = get_settings();
    $key     = $s['gemini_api_key'] ?? ($s['openai_api_key'] ?? '');

    if ($key && $key !== '••••••••') {
        $prompt = "کارنامه دانش‌آموز رشته $field:\n" . json_encode($lessons, JSON_UNESCAPED_UNICODE) .
                  "\nتحلیل JSON با کلیدهای weaknesses، psychological، remedialPlan، estimatedNextTraz بدون markdown.";
        $ch = curl_init('https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=' . urlencode($key));
        curl_setopt_array($ch, [
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_POST           => true,
            CURLOPT_HTTPHEADER     => ['Content-Type: application/json'],
            CURLOPT_POSTFIELDS     => json_encode(['contents' => [['parts' => [['text' => $prompt]]]], 'generationConfig' => ['responseMimeType' => 'application/json']], JSON_UNESCAPED_UNICODE),
            CURLOPT_TIMEOUT        => 20,
        ]);
        $resp = curl_exec($ch); curl_close($ch);
        if ($resp) {
            $data = json_decode($resp, true);
            $text = $data['candidates'][0]['content']['parts'][0]['text'] ?? null;
            if ($text) { $parsed = json_decode($text, true); if ($parsed) json_out($parsed); }
        }
    }

    // فال‌بک آفلاین
    $subjects   = is_array($lessons) ? $lessons : [];
    $weakSubs   = $subjects;
    usort($weakSubs, fn($a, $b) => ($a['percentage'] ?? 0) <=> ($b['percentage'] ?? 0));
    $weakSubs   = array_slice($weakSubs, 0, 3);
    $totalW     = array_sum(array_column($subjects, 'wrong'));
    $totalQ     = array_sum(array_column($subjects, 'wrong')) + array_sum(array_column($subjects, 'correct')) + array_sum(array_column($subjects, 'empty')) ?: 1;
    $stress     = min(95, max(15, (int)(($totalW / $totalQ) * 100 + 10)));
    $avgPct     = count($subjects) ? array_sum(array_column($subjects, 'percentage')) / count($subjects) : 50;
    $nextTraz   = min(8000, max(4000, (int)($avgPct * 50 + 3350)));

    json_out([
        'weaknesses'       => array_map(fn($s) => ['topic' => 'مبحث پایه', 'subject' => $s['lessonName'] ?? '', 'percentage' => $s['percentage'] ?? 0, 'recommendation' => 'حل ۳۰ تست از آزمون‌های قبلی', 'questionsCount' => 30, 'severity' => ($s['percentage'] ?? 100) < 35 ? 'critical' : 'warning'], $weakSubs),
        'psychological'    => ['pattern' => 'تمرکز نوسانی', 'description' => "استرس آزمونی {$stress}٪", 'correctToWrongRate' => (int)(($totalW / $totalQ) * 100), 'suggestion' => 'تکنیک پومودورو را پیاده کنید', 'cardColor' => $stress > 70 ? 'red' : ($stress > 45 ? 'orange' : 'blue'), 'stressLevel' => $stress, 'stressAnalysis' => ['avgResponseTimeWrong' => 65, 'avgResponseTimeCorrect' => 45, 'consecutiveErrorsCount' => 3, 'stressLabel' => $stress > 70 ? 'بحرانی' : 'متوسط', 'technicalDetail' => 'نوسان زمانی در پاسخ‌دهی']],
        'remedialPlan'     => [['day' => 'شنبه', 'morningPlan' => ($weakSubs[0]['lessonName'] ?? 'درس ضعیف') . ' - مطالعه مفهومی', 'afternoonPlan' => 'حل ۱۵ تست', 'totalQuestions' => 15]],
        'estimatedNextTraz'=> $nextTraz + 150,
    ]);
}

// GET /health
if ($uri === '/health') {
    json_out(['status' => 'ok', 'mode' => 'php-unified', 'time' => date('c')]);
}

// ─── ۴۰۴ ─────────────────────────────────────────────────────────────────────
json_out(['error' => "route not found: $method $uri"], 404);

// ════════════════════════════════════════════════════════════════════════════
//  توابع کمکی
// ════════════════════════════════════════════════════════════════════════════
function sanitize_user(array $u): array {
    unset($u['password']);
    return $u;
}

function get_settings(): array {
    static $cache = null;
    if ($cache) return $cache;
    $db   = getDB();
    $stmt = $db->query('SELECT setting_key, setting_value FROM app_settings');
    $rows = $stmt->fetchAll(PDO::FETCH_KEY_PAIR);
    $cache = $rows ?: [];
    return $cache;
}

function get_referrer_by_user(string $userId): ?array {
    $db   = getDB();
    $stmt = $db->prepare('SELECT * FROM referrers WHERE user_id = ?');
    $stmt->execute([$userId]);
    return $stmt->fetch() ?: null;
}
