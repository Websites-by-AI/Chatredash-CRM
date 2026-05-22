# رتبه برتر (Rotbe Bartar)

سیستم مدیریت معرف‌ها و تولید محتوا با هوش مصنوعی

---

## معرفی

**رتبه برتر** یک پلتفرم چندمنظوره است با قابلیت‌های:
- ثبت‌نام با کد معرف و سیستم پورسانت
- پنل مدیریت کامل (ادمین)
- پنل معرف‌ها با مدیریت تسویه
- استودیو تولید محتوا با هوش مصنوعی (OpenAI)

---

## راه‌اندازی در Runflare

### پیش‌نیازها
- حساب کاربری در [Runflare](https://runflare.com)
- حساب MongoDB Atlas رایگان (اختیاری — بدونش هم کار می‌کنه)
- کلید API از [OpenAI](https://platform.openai.com) (برای استودیو محتوا)

---

### مرحله ۱ — ساخت دیتابیس MongoDB (اختیاری)

> **بدون MongoDB:** اپ در حالت حافظه موقت کار می‌کند. داده‌ها پس از ریستارت پاک می‌شوند. برای محیط تولید، MongoDB لازم است.

1. به [mongodb.com/atlas](https://www.mongodb.com/atlas) بروید
2. یک cluster رایگان (M0 Free) بسازید
3. یک Database User با username و password ایجاد کنید
4. در بخش **Network Access** آدرس `0.0.0.0/0` را whitelist کنید
5. از دکمه **Connect → Drivers** آدرس اتصال را کپی کنید:
   ```
   mongodb+srv://USERNAME:PASSWORD@cluster0.xxxxx.mongodb.net/rotbebartar
   ```

---

### مرحله ۲ — دپلوی بک‌اند در Runflare

1. وارد [Runflare](https://runflare.com) شوید و **New Service** بسازید
2. کد پروژه را آپلود یا از GitHub متصل کنید
3. تنظیمات سرویس:

   | تنظیم | مقدار |
   |-------|-------|
   | **Root Directory** | `backend` |
   | **Build Command** | `npm install` |
   | **Start Command** | `node src/server.js` |
   | **Port** | `3001` |

4. متغیرهای محیطی را در بخش **Environment Variables** وارد کنید:

   | متغیر | مقدار | الزامی؟ |
   |-------|-------|---------|
   | `MONGO_URI` | آدرس MongoDB Atlas | اختیاری |
   | `JWT_SECRET` | یک رشته تصادفی مثلاً `my-secret-2024` | بله |
   | `OPENAI_API_KEY` | کلید OpenAI | اختیاری* |
   | `PORT` | `3001` | بله |

   *کلید OpenAI را می‌توانید بعداً از پنل ادمین → تنظیمات وارد کنید

5. روی **Deploy** کلیک کنید
6. آدرس سرویس بک‌اند را کپی کنید (مثلاً `https://my-api.runflare.run`)

---

### مرحله ۳ — دپلوی فرانت‌اند در Runflare

1. یک سرویس جدید دیگر بسازید
2. تنظیمات:

   | تنظیم | مقدار |
   |-------|-------|
   | **Root Directory** | `frontend` |
   | **Build Command** | `yarn install && yarn build` |
   | **Start Command** | `npx serve -s build -l 3000` |
   | **Port** | `3000` |

3. متغیر محیطی:

   | متغیر | مقدار |
   |-------|-------|
   | `REACT_APP_BACKEND_URL` | آدرس بک‌اند از مرحله ۲ (بدون `/` انتها) |

4. روی **Deploy** کلیک کنید

---

### مرحله ۴ — تنظیم اولیه پس از دپلوی

1. به آدرس فرانت‌اند بروید و `/login` را باز کنید
2. شماره ادمین پیش‌فرض را وارد کنید: **`09120000000`**
3. کد OTP را از پاسخ API (فیلد `dev_otp`) کپی و وارد کنید
4. به `/admin` بروید → تب **تنظیمات**
5. کلید OpenAI خود را در فیلد مربوطه وارد و **ذخیره** کنید

---

## اجرای محلی (Development)

```bash
# ۱. اجرای بک‌اند (بدون MongoDB هم کار می‌کند)
cd backend
node src/server.js
# → اجرا روی پورت 3001

# ۲. اجرای فرانت‌اند (پنجره جدید)
cd frontend
yarn start
# → اجرا روی پورت 5000 (با پروکسی خودکار به 3001)
```

---

## مسیرهای فرانت‌اند

| مسیر | توضیح |
|------|-------|
| `/` | صفحه اصلی |
| `/login` | ورود با OTP |
| `/register` | ثبت‌نام |
| `/dashboard` | پنل معرف‌ها |
| `/admin` | پنل مدیریت |
| `/studio` | استودیو تولید محتوا |
| `/studio/library` | کتابخانه محتوا |
| `/r/:code` | صفحه لندینگ معرف |
| `/install` | راهنمای نصب |

---

## اطلاعات ادمین پیش‌فرض

| فیلد | مقدار |
|------|-------|
| شماره موبایل | `09120000000` |
| نقش | admin |
| OTP | در پاسخ send-otp فیلد `dev_otp` |

---

## ساختار پروژه

```
rotbe-bartar/
├── backend/
│   ├── src/
│   │   ├── models/      ← Mongoose models (با fallback حافظه)
│   │   ├── routes/      ← Express API routes
│   │   ├── middleware/  ← JWT authentication
│   │   ├── utils/       ← helper functions
│   │   ├── db/          ← in-memory store
│   │   └── server.js    ← main server
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── pages/       ← صفحات React
│   │   ├── components/  ← کامپوننت‌های UI
│   │   └── lib/         ← axios config
│   └── package.json
└── README.md
```
# Taranom-psychology-school-2
# Rotbe-bartar-by-taranom-mehr-trash-1
# Rotbe-bartar-by-taranom-mehr-trash-1
