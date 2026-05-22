<?php
/**
 * نصب‌کننده رتبه برتر + ترنم مهر
 * آدرس: yoursite.com/install.php
 * بعد از نصب موفق، این فایل را حذف کنید!
 */

$step = $_GET['step'] ?? 'form';
$error = '';
$success = '';

// ─── مرحله ۲: اجرای نصب ──────────────────────────────────────────────────────
if ($step === 'install' && $_SERVER['REQUEST_METHOD'] === 'POST') {
    $host     = trim($_POST['db_host'] ?? 'localhost');
    $dbname   = trim($_POST['db_name'] ?? '');
    $user     = trim($_POST['db_user'] ?? '');
    $pass     = trim($_POST['db_pass'] ?? '');
    $secret   = trim($_POST['jwt_secret'] ?? '');
    $adminPh  = trim($_POST['admin_phone'] ?? '09120000000');
    $adminNm  = trim($_POST['admin_name'] ?? 'مدیر سیستم');

    if (!$dbname || !$user) {
        $error = 'نام دیتابیس و کاربر اجباری است.';
    } else {
        try {
            // اتصال به MySQL
            $dsn = "mysql:host=$host;charset=utf8mb4";
            $pdo = new PDO($dsn, $user, $pass, [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION]);

            // ایجاد دیتابیس
            $pdo->exec("CREATE DATABASE IF NOT EXISTS `$dbname` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci");
            $pdo->exec("USE `$dbname`");

            // اجرای SQL schema
            $sql = file_get_contents(__DIR__ . '/install/schema.sql');
            foreach (array_filter(array_map('trim', explode(';', $sql))) as $query) {
                if ($query) $pdo->exec($query);
            }

            // ایجاد کاربر ادمین
            $adminId = sprintf('%04x%04x-%04x-%04x-%04x-%04x%04x%04x',
                mt_rand(0, 0xffff), mt_rand(0, 0xffff), mt_rand(0, 0xffff),
                mt_rand(0, 0x0fff)|0x4000, mt_rand(0, 0x3fff)|0x8000,
                mt_rand(0, 0xffff), mt_rand(0, 0xffff), mt_rand(0, 0xffff));
            $stmt = $pdo->prepare("INSERT IGNORE INTO users (id,phone,name,role) VALUES (?,?,?,'admin')");
            $stmt->execute([$adminId, $adminPh, $adminNm]);

            // ساخت فایل config
            $configContent = "<?php\n"
                . "define('DB_HOST', " . var_export($host, true) . ");\n"
                . "define('DB_NAME', " . var_export($dbname, true) . ");\n"
                . "define('DB_USER', " . var_export($user, true) . ");\n"
                . "define('DB_PASS', " . var_export($pass, true) . ");\n"
                . "define('JWT_SECRET', " . var_export($secret ?: bin2hex(random_bytes(24)), true) . ");\n"
                . "define('APP_ENV', 'production');\n";

            file_put_contents(__DIR__ . '/api/db_config.php', $configContent);

            // بازنویسی config.php برای خواندن db_config.php
            $newConfig = str_replace(
                "define('DB_HOST', getenv('DB_HOST') ?: 'localhost');",
                "if (file_exists(__DIR__.'/db_config.php')) require_once __DIR__.'/db_config.php';\nif (!defined('DB_HOST')) define('DB_HOST', 'localhost');",
                file_get_contents(__DIR__ . '/api/config.php')
            );
            // ساده‌تر: فقط یه فایل override می‌نویسیم
            $step = 'done';
            $success = "نصب با موفقیت انجام شد!";

        } catch (Exception $e) {
            $error = 'خطا: ' . $e->getMessage();
        }
    }
}
?>
<!DOCTYPE html>
<html lang="fa" dir="rtl">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>نصب رتبه برتر</title>
<link href="https://fonts.googleapis.com/css2?family=Vazirmatn:wght@400;600;700;900&display=swap" rel="stylesheet">
<style>
* { box-sizing: border-box; margin: 0; padding: 0; font-family: Vazirmatn, sans-serif; }
body { background: #0f172a; color: #e2e8f0; min-height: 100vh; display: flex; align-items: center; justify-content: center; padding: 1rem; }
.card { background: #1e293b; border: 1px solid #334155; border-radius: 1.5rem; padding: 2.5rem; width: 100%; max-width: 520px; }
h1 { font-size: 1.6rem; font-weight: 900; color: #fbbf24; margin-bottom: .5rem; }
p.sub { color: #94a3b8; font-size: .85rem; margin-bottom: 2rem; }
.field { margin-bottom: 1.2rem; }
label { display: block; font-size: .8rem; font-weight: 700; color: #94a3b8; margin-bottom: .4rem; }
input { width: 100%; background: #0f172a; border: 1px solid #334155; border-radius: .75rem; padding: .75rem 1rem; color: #f1f5f9; font-size: .9rem; font-family: monospace; }
input:focus { outline: none; border-color: #fbbf24; }
.grid2 { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
button { width: 100%; background: #fbbf24; color: #0f172a; border: none; border-radius: .75rem; padding: 1rem; font-size: 1rem; font-weight: 900; cursor: pointer; margin-top: 1rem; }
button:hover { background: #f59e0b; }
.error { background: #450a0a; border: 1px solid #7f1d1d; color: #fca5a5; padding: 1rem; border-radius: .75rem; margin-bottom: 1rem; font-size: .85rem; }
.success { background: #052e16; border: 1px solid #14532d; color: #86efac; padding: 1.5rem; border-radius: .75rem; font-size: .9rem; line-height: 1.8; }
.badge { display: inline-block; background: #1e3a5f; color: #7dd3fc; padding: .2rem .6rem; border-radius: .4rem; font-family: monospace; font-size: .8rem; }
.steps { display: flex; gap: .5rem; margin-bottom: 2rem; }
.step { flex: 1; height: 4px; border-radius: 2px; background: #334155; }
.step.active { background: #fbbf24; }
</style>
</head>
<body>
<div class="card">
  <h1>🎓 نصب رتبه برتر</h1>
  <p class="sub">سرویس یکپارچه رتبه برتر + ترنم مهر — تنظیم اولیه</p>

  <?php if ($step !== 'done'): ?>
  <div class="steps">
    <div class="step active"></div>
    <div class="step <?= $step === 'install' ? 'active' : '' ?>"></div>
  </div>
  <?php endif; ?>

  <?php if ($error): ?>
    <div class="error">❌ <?= htmlspecialchars($error) ?></div>
  <?php endif; ?>

  <?php if ($step === 'done'): ?>
    <div class="success">
      <strong>✅ نصب موفق!</strong><br><br>
      🔑 ورود ادمین:<br>
      &nbsp;&nbsp;شماره: <span class="badge"><?= htmlspecialchars($_POST['admin_phone'] ?? '09120000000') ?></span><br><br>
      🌐 آدرس سایت: <span class="badge">yoursite.com</span><br>
      🎓 سامانه ترنم مهر: <span class="badge">yoursite.com/edu</span><br>
      🔧 پنل ادمین: <span class="badge">yoursite.com/admin</span><br><br>
      <strong style="color:#fca5a5">⚠️ مهم: فایل install.php را از سرور حذف کنید!</strong>
    </div>
    <a href="/" style="display:block;text-align:center;margin-top:1.5rem;color:#7dd3fc;text-decoration:none;font-weight:700;">رفتن به سایت ←</a>

  <?php else: ?>
    <form method="POST" action="install.php?step=install">
      <div class="grid2">
        <div class="field">
          <label>هاست دیتابیس</label>
          <input name="db_host" value="localhost" placeholder="localhost">
        </div>
        <div class="field">
          <label>نام دیتابیس *</label>
          <input name="db_name" placeholder="rotbe_db" required>
        </div>
      </div>
      <div class="grid2">
        <div class="field">
          <label>نام کاربری MySQL *</label>
          <input name="db_user" placeholder="rotbe_user" required>
        </div>
        <div class="field">
          <label>رمز MySQL</label>
          <input name="db_pass" type="password" placeholder="••••••••">
        </div>
      </div>
      <div class="field">
        <label>JWT Secret (کلید امنیتی — خودکار اگر خالی بماند)</label>
        <input name="jwt_secret" placeholder="یک رشته طولانی تصادفی">
      </div>
      <div class="grid2">
        <div class="field">
          <label>شماره ادمین</label>
          <input name="admin_phone" value="09120000000">
        </div>
        <div class="field">
          <label>نام ادمین</label>
          <input name="admin_name" value="مدیر سیستم">
        </div>
      </div>
      <button type="submit">نصب و راه‌اندازی 🚀</button>
    </form>
  <?php endif; ?>
</div>
</body>
</html>
