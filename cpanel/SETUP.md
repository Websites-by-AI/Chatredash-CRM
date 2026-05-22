# راهنمای نصب روی سی‌پنل
## رتبه برتر + ترنم مهر

---

## 📋 پیش‌نیازها

| مورد | نسخه |
|------|-------|
| PHP | 8.0 یا بالاتر |
| MySQL | 5.7 یا بالاتر |
| mod_rewrite | فعال (معمولاً پیش‌فرض است) |
| curl | فعال در PHP |

---

## 🚀 مراحل نصب (گام‌به‌گام)

### مرحله ۱ — دیتابیس بسازید

۱. وارد **cPanel** شوید  
۲. بخش **MySQL Databases** را باز کنید  
۳. یک دیتابیس جدید بسازید (مثال: `user_rotbe`)  
۴. یک کاربر MySQL بسازید با رمز قوی  
۵. کاربر را به دیتابیس با **تمام دسترسی‌ها** اضافه کنید  
۶. نام دیتابیس، کاربر و رمز را یادداشت کنید

---

### مرحله ۲ — فایل‌ها را آپلود کنید

۱. وارد **File Manager** یا **FTP** شوید  
۲. پوشه `public_html` را باز کنید  
۳. **تمام** محتویات این پوشه (فایل zip) را آپلود کنید  
۴. فایل zip را extract کنید  
۵. مطمئن شوید این فایل‌ها وجود دارند:

```
public_html/
├── index.html          ← فرانت React
├── assets/             ← CSS، JS، فونت
├── .htaccess           ← مسیریابی (مهم!)
├── api/
│   ├── index.php       ← بک‌اند PHP
│   └── config.php      ← تنظیمات
├── install/
│   └── schema.sql
└── install.php         ← نصب‌کننده
```

> ⚠️ **مهم**: فایل `.htaccess` باید حتماً آپلود شود. در برخی FTP کلاینت‌ها، نمایش فایل‌های مخفی (hidden files) را فعال کنید.

---

### مرحله ۳ — نصب‌کننده را اجرا کنید

۱. مرورگر را باز کنید  
۲. به آدرس بروید: `https://yoursite.com/install.php`  
۳. اطلاعات دیتابیس را وارد کنید:
   - **هاست دیتابیس**: معمولاً `localhost`
   - **نام دیتابیس**: (مثال: `user_rotbe`)
   - **نام کاربری MySQL**: (مثال: `user_dbuser`)
   - **رمز MySQL**: رمزی که تنظیم کردید
   - **شماره ادمین**: شماره ادمین اصلی (پیش‌فرض: `09120000000`)
4. روی **نصب و راه‌اندازی** کلیک کنید

---

### مرحله ۴ — تنظیمات نهایی

**⚠️ حیاتی — حذف install.php:**
```
File Manager → public_html → install.php → راست‌کلیک → Delete
```

**تست سایت:**
- `https://yoursite.com` ← صفحه اصلی
- `https://yoursite.com/edu` ← سامانه ترنم مهر
- `https://yoursite.com/login` ← ورود ادمین

---

## 🔑 ورود اول

۱. به `https://yoursite.com/login` بروید
۲. شماره ادمین را وارد کنید (مثال: `09120000000`)
۳. روی **ارسال کد تأیید** کلیک کنید
4. در پنل سرور (cPanel → Error Logs یا PHP Logs) کد را ببینید

> 💡 برای دریافت خودکار OTP پیامکی، نیاز به سرویس SMS دارید (ملی‌پیامک، کاوه‌نگار و غیره).

---

## 📱 اتصال سرویس پیامک (اختیاری)

فایل `api/index.php` را باز کنید و این بخش را پیدا کنید:

```php
// در محیط production اینجا SMS ارسال می‌شه
$response = ['sent' => true, 'message' => 'کد ارسال شد'];
if (APP_ENV !== 'production') $response['dev_otp'] = $code;
```

آن را با کد SMS سرویس خود جایگزین کنید. مثال برای ملی‌پیامک:

```php
$sms_api_key = 'YOUR_MELLIPAYAMAK_KEY';
$to = $phone;
$text = "کد تأیید ورود به رتبه برتر: $code";
// ارسال با curl...
```

---

## 🤖 فعال‌سازی AI ترنم مهر

۱. وارد سایت شوید (با حساب ادمین)
۲. به `/admin` بروید
۳. تب **تنظیمات** را انتخاب کنید
۴. کلید Gemini API را وارد کنید

برای دریافت کلید رایگان: [aistudio.google.com](https://aistudio.google.com/app/apikey)

---

## 🗄️ دیتابیس دائمی

تمام اطلاعات (معرف‌ها، ثبت‌نام‌ها، تسویه‌ها) در MySQL ذخیره می‌شوند.  
برای بکاپ گیری: **cPanel → phpMyAdmin → Export**

---

## ❓ عیب‌یابی

| مشکل | راه‌حل |
|------|---------|
| صفحه سفید یا 500 | PHP Error Log را ببینید |
| 404 روی `/edu` یا `/admin` | `.htaccess` آپلود نشده یا mod_rewrite غیرفعال است |
| خطای دیتابیس | نام/رمز MySQL را بررسی کنید |
| کد OTP نمی‌آید | در `api/index.php` خط `dev_otp` را موقتاً فعال کنید |
| API خطا می‌دهد | `api/db_config.php` توسط install.php ساخته می‌شود |

---

## 📁 ساختار فایل‌ها

```
public_html/
├── index.html         ← React SPA (ساخته شده)
├── assets/            ← فایل‌های استاتیک
├── .htaccess          ← URL routing
├── install.php        ← نصب‌کننده (بعد از نصب حذف کنید)
├── install/
│   └── schema.sql     ← جداول MySQL
└── api/
    ├── index.php      ← تمام API endpoints
    ├── config.php     ← JWT + PDO + utilities
    └── db_config.php  ← ساخته شده توسط installer (خودکار)
```

---

## 🌐 Subdomain یا زیرمسیر

اگر می‌خواهید روی **subdomain** نصب کنید (مثل `app.yoursite.com`):
- همین مراحل را در `public_html/app.yoursite.com/` انجام دهید

اگر می‌خواهید روی **زیرمسیر** نصب کنید (مثل `yoursite.com/rotbe`):
- در `.htaccess` مسیر `RewriteBase /rotbe/` را اضافه کنید
- در `vite.config.ts` مقدار `base: '/rotbe/'` را تنظیم کنید و دوباره build کنید

---

نسخه: 1.0 | PHP + MySQL | رتبه برتر + ترنم مهر
