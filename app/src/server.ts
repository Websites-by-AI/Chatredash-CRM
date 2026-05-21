import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import { createServer as createViteServer } from "vite";
import jwt from "jsonwebtoken";
import { v4 as uuidv4 } from "uuid";
import { GoogleGenAI, Type } from "@google/genai";

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = parseInt(process.env.PORT || "5000");
const isDev = process.env.NODE_ENV !== "production";
const JWT_SECRET = process.env.JWT_SECRET || "rotbe-bartar-dev-secret-2024";

app.use(express.json({ limit: "5mb" }));

// ─── In-Memory Store ────────────────────────────────────────────────────────
function makeStore() {
  const store = new Map<string, Record<string, unknown>>();
  const nowISO = () => new Date().toISOString();

  const clean = (doc: Record<string, unknown>) => {
    const { _id, ...rest } = doc;
    void _id;
    return rest;
  };

  return {
    findOne: async (q: Record<string, unknown>) => {
      for (const doc of store.values()) {
        if (Object.entries(q).every(([k, v]) => doc[k] === v)) return clean({ ...doc });
      }
      return null;
    },
    find: async (q: Record<string, unknown> = {}) => {
      const results: Record<string, unknown>[] = [];
      for (const doc of store.values()) {
        if (Object.entries(q).every(([k, v]) => doc[k] === v)) results.push(clean({ ...doc }));
      }
      return results.sort((a, b) => ((b.created_at as string) || "") > ((a.created_at as string) || "") ? 1 : -1);
    },
    create: async (doc: Record<string, unknown>) => {
      const saved = { ...doc, _id: uuidv4() };
      store.set(saved._id as string, saved);
      return clean({ ...saved });
    },
    updateOne: async (q: Record<string, unknown>, update: Record<string, unknown>, opts: { upsert?: boolean } = {}) => {
      for (const [key, doc] of store.entries()) {
        if (Object.entries(q).every(([k, v]) => doc[k] === v)) {
          const $set = (update.$set as Record<string, unknown>) || {};
          const $inc = (update.$inc as Record<string, unknown>) || {};
          Object.assign(doc, $set);
          for (const [k, v] of Object.entries($inc)) doc[k] = ((doc[k] as number) || 0) + (v as number);
          store.set(key, doc);
          return { matchedCount: 1 };
        }
      }
      if (opts.upsert) {
        const newDoc = { ...((update.$set as Record<string, unknown>) || {}), _id: uuidv4(), created_at: nowISO() };
        store.set(newDoc._id as string, newDoc);
      }
      return { matchedCount: 0 };
    },
    deleteOne: async (q: Record<string, unknown>) => {
      for (const [key, doc] of store.entries()) {
        if (Object.entries(q).every(([k, v]) => doc[k] === v)) { store.delete(key); return { deletedCount: 1 }; }
      }
      return { deletedCount: 0 };
    },
    count: async (q: Record<string, unknown> = {}) => {
      let n = 0;
      for (const doc of store.values()) {
        if (Object.entries(q).every(([k, v]) => doc[k] === v)) n++;
      }
      return n;
    },
    sumField: async (q: Record<string, unknown>, field: string) => {
      let sum = 0;
      for (const doc of store.values()) {
        if (Object.entries(q).every(([k, v]) => doc[k] === v)) sum += (doc[field] as number) || 0;
      }
      return sum;
    },
  };
}

const DB = {
  users: makeStore(),
  otps: makeStore(),
  referrers: makeStore(),
  registrations: makeStore(),
  payouts: makeStore(),
  settings: makeStore(),
  contents: makeStore(),
};

// ─── Bootstrap ─────────────────────────────────────────────────────────────
async function bootstrap() {
  const nowISO = () => new Date().toISOString();
  const existing = await DB.settings.findOne({ settings_id: "global" });
  if (!existing) {
    await DB.settings.create({ settings_id: "global", base_price: 1000000, default_commission_pct: 20, default_discount_pct: 10, openai_api_key: "", updated_at: nowISO() });
    console.log("✓ Default settings created");
  }
  const admin = await DB.users.findOne({ phone: "09120000000" });
  if (!admin) {
    await DB.users.create({ id: uuidv4(), phone: "09120000000", name: "مدیر سیستم", role: "admin", created_at: nowISO() });
    console.log("✓ Admin user: 09120000000");
  }
}

// ─── Auth middleware ────────────────────────────────────────────────────────
type Role = "admin" | "referrer" | "registrant";
interface JwtPayload { sub: string; role: Role }
interface AuthedRequest extends express.Request { user?: Record<string, unknown> }

const makeToken = (id: string, role: Role) => jwt.sign({ sub: id, role }, JWT_SECRET, { expiresIn: "30d" });

async function authenticate(req: AuthedRequest, res: express.Response, next: express.NextFunction) {
  const auth = req.headers.authorization;
  if (!auth?.startsWith("Bearer ")) return res.status(401).json({ error: "Unauthorized" }) as unknown as void;
  try {
    const payload = jwt.verify(auth.slice(7), JWT_SECRET) as JwtPayload;
    const user = await DB.users.findOne({ id: payload.sub });
    if (!user) return res.status(401).json({ error: "User not found" }) as unknown as void;
    req.user = user;
    next();
  } catch { res.status(401).json({ error: "Invalid token" }); }
}

function requireAdmin(req: AuthedRequest, res: express.Response, next: express.NextFunction) {
  if (req.user?.role !== "admin") return res.status(403).json({ error: "Admin only" }) as unknown as void;
  next();
}

function requireReferrer(req: AuthedRequest, res: express.Response, next: express.NextFunction) {
  if (!["referrer", "admin"].includes(req.user?.role as string)) return res.status(403).json({ error: "Referrer only" }) as unknown as void;
  next();
}

function genCode(len = 5) {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  return Array.from({ length: len }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
}
function genPin(len = 5) {
  return Array.from({ length: len }, () => Math.floor(Math.random() * 10)).join("");
}

const nowISO = () => new Date().toISOString();

// ─── Auth Routes ────────────────────────────────────────────────────────────
app.post("/api/auth/send-otp", async (req, res) => {
  try {
    const phone = (req.body.phone || "").trim();
    if (!phone || phone.length < 10) return res.status(400).json({ error: "شماره موبایل نامعتبر" });
    const code = Array.from({ length: 5 }, () => Math.floor(Math.random() * 10)).join("");
    const expires_at = new Date(Date.now() + 10 * 60 * 1000).toISOString();
    await DB.otps.updateOne({ phone }, { $set: { phone, code, expires_at } }, { upsert: true });
    return res.json({ sent: true, dev_otp: code, message: "کد ارسال شد (حالت آزمایشی)" });
  } catch (e: unknown) { return res.status(500).json({ error: (e as Error).message }); }
});

app.post("/api/auth/verify-otp", async (req, res) => {
  try {
    const phone = (req.body.phone || "").trim();
    const code = (req.body.code || "").trim();
    const rec = await DB.otps.findOne({ phone });
    if (!rec || rec.code !== code) return res.status(400).json({ error: "کد وارد شده نامعتبر است" });
    if (rec.expires_at && new Date(rec.expires_at as string) < new Date()) return res.status(400).json({ error: "کد منقضی شده" });
    let user = await DB.users.findOne({ phone });
    if (!user) user = await DB.users.create({ id: uuidv4(), phone, name: "", role: "registrant", created_at: nowISO() });
    await DB.otps.deleteOne({ phone });
    const token = makeToken(user.id as string, user.role as Role);
    return res.json({ token, user });
  } catch (e: unknown) { return res.status(500).json({ error: (e as Error).message }); }
});

app.get("/api/auth/me", authenticate as express.RequestHandler, async (req: AuthedRequest, res) => {
  const out: Record<string, unknown> = { user: req.user };
  if (req.user?.role === "referrer") {
    const ref = await DB.referrers.findOne({ user_id: req.user.id });
    if (ref) out.referrer = ref;
  }
  return res.json(out);
});

// ─── Public Routes ──────────────────────────────────────────────────────────
app.get("/api/public/settings", async (_req, res) => {
  try {
    const s = await DB.settings.findOne({ settings_id: "global" });
    return res.json({ base_price: s?.base_price, default_discount_pct: s?.default_discount_pct });
  } catch (e: unknown) { return res.status(500).json({ error: (e as Error).message }); }
});

app.get("/api/public/referrer/:code", async (req, res) => {
  try {
    const code = req.params.code.toUpperCase().trim();
    const ref = await DB.referrers.findOne({ referral_code: code, status: "active" });
    if (!ref) return res.status(404).json({ error: "کد معرف معتبر نیست" });
    const s = await DB.settings.findOne({ settings_id: "global" });
    return res.json({ valid: true, name: ref.name, referral_code: ref.referral_code, discount_pct: s?.default_discount_pct, base_price: s?.base_price });
  } catch (e: unknown) { return res.status(500).json({ error: (e as Error).message }); }
});

app.post("/api/public/register", async (req, res) => {
  try {
    const { name, phone, field, exam, rank, referrer_code } = req.body;
    const s = await DB.settings.findOne({ settings_id: "global" });
    const base_price = parseFloat(String(s?.base_price || 1000000));
    let discount_pct = 0, referrerCode = null, referrer_id = null, commission_pct = 0;
    if (referrer_code) {
      const rc = (referrer_code as string).toUpperCase().trim();
      const ref = await DB.referrers.findOne({ referral_code: rc, status: "active" });
      if (ref) { referrerCode = ref.referral_code; referrer_id = ref.id; commission_pct = parseFloat(String(ref.commission_pct || s?.default_commission_pct || 20)); discount_pct = parseFloat(String(s?.default_discount_pct || 10)); }
    }
    const discount_amount = Math.round(base_price * discount_pct / 100);
    const paid_amount = base_price - discount_amount;
    const commission_amount = referrer_id ? Math.round(paid_amount * commission_pct / 100) : 0;
    const reg = await DB.registrations.create({ id: uuidv4(), name, phone, field, exam, rank, referrer_code: referrerCode, referrer_id, discount_pct, discount_amount, base_price, paid_amount, commission_pct, commission_amount, status: "pending", created_at: nowISO() });
    return res.json(reg);
  } catch (e: unknown) { return res.status(500).json({ error: (e as Error).message }); }
});

// ─── Admin Routes ───────────────────────────────────────────────────────────
const adminAuth = [authenticate as express.RequestHandler, requireAdmin as express.RequestHandler];

app.post("/api/admin/referrers", ...adminAuth, async (req: AuthedRequest, res) => {
  try {
    const { phone, name, commission_pct } = req.body;
    const s = await DB.settings.findOne({ settings_id: "global" });
    const commissionPct = commission_pct != null ? parseFloat(commission_pct) : parseFloat(String(s?.default_commission_pct || 20));
    let user = await DB.users.findOne({ phone });
    if (!user) user = await DB.users.create({ id: uuidv4(), phone, name: name || "", role: "referrer", created_at: nowISO() });
    else await DB.users.updateOne({ id: user.id }, { $set: { role: "referrer", name: name || user.name } });
    const existing = await DB.referrers.findOne({ user_id: user.id });
    if (existing) return res.status(400).json({ error: "این کاربر قبلاً به‌عنوان معرف ثبت شده" });
    let code = "";
    for (let i = 0; i < 20; i++) { code = genCode(5); if (!(await DB.referrers.findOne({ referral_code: code }))) break; }
    const ref = await DB.referrers.create({ id: uuidv4(), user_id: user.id, phone, name: name || "", referral_code: code, security_pin: genPin(5), commission_pct: commissionPct, status: "active", total_earnings: 0, available_balance: 0, total_signups: 0, iban: "", created_at: nowISO() });
    return res.status(201).json(ref);
  } catch (e: unknown) { return res.status(500).json({ error: (e as Error).message }); }
});

app.get("/api/admin/referrers", ...adminAuth, async (_req, res) => {
  return res.json(await DB.referrers.find());
});

app.patch("/api/admin/referrers/:id", ...adminAuth, async (req, res) => {
  try {
    const update: Record<string, unknown> = {};
    if (req.body.status != null) update.status = req.body.status;
    if (req.body.commission_pct != null) update.commission_pct = parseFloat(req.body.commission_pct);
    if (req.body.name != null) update.name = req.body.name;
    await DB.referrers.updateOne({ id: req.params.id }, { $set: update });
    return res.json(await DB.referrers.findOne({ id: req.params.id }));
  } catch (e: unknown) { return res.status(500).json({ error: (e as Error).message }); }
});

app.get("/api/admin/registrations", ...adminAuth, async (_req, res) => res.json(await DB.registrations.find()));
app.get("/api/admin/payouts", ...adminAuth, async (_req, res) => res.json(await DB.payouts.find()));

app.patch("/api/admin/payouts/:id", ...adminAuth, async (req, res) => {
  try {
    const payout = await DB.payouts.findOne({ id: req.params.id });
    if (!payout) return res.status(404).json({ error: "پیدا نشد" });
    const newStatus = req.body.status;
    await DB.payouts.updateOne({ id: req.params.id }, { $set: { status: newStatus, processed_at: nowISO() } });
    if (newStatus === "rejected" && payout.status !== "rejected") await DB.referrers.updateOne({ id: payout.referrer_id }, { $inc: { available_balance: payout.amount as number } });
    return res.json(await DB.payouts.findOne({ id: req.params.id }));
  } catch (e: unknown) { return res.status(500).json({ error: (e as Error).message }); }
});

app.get("/api/admin/stats", ...adminAuth, async (_req, res) => {
  try {
    const [total_referrers, active_referrers, total_registrations, paid_registrations, revenue, commissions, pending_payouts] = await Promise.all([
      DB.referrers.count(),
      DB.referrers.count({ status: "active" }),
      DB.registrations.count(),
      DB.registrations.count({ status: "paid" }),
      DB.registrations.sumField({ status: "paid" }, "paid_amount"),
      DB.registrations.sumField({ status: "paid" }, "commission_amount"),
      DB.payouts.count({ status: "pending" }),
    ]);
    return res.json({ total_referrers, active_referrers, total_registrations, paid_registrations, revenue, commissions, pending_payouts });
  } catch (e: unknown) { return res.status(500).json({ error: (e as Error).message }); }
});

app.get("/api/admin/settings", ...adminAuth, async (_req, res) => {
  try {
    const s = await DB.settings.findOne({ settings_id: "global" });
    const out = { ...s, openai_api_key_set: !!(s?.openai_api_key), openai_api_key: s?.openai_api_key ? "••••••••" : "" };
    return res.json(out);
  } catch (e: unknown) { return res.status(500).json({ error: (e as Error).message }); }
});

app.put("/api/admin/settings", ...adminAuth, async (req, res) => {
  try {
    const update: Record<string, unknown> = { updated_at: nowISO() };
    if (req.body.base_price != null) update.base_price = parseFloat(req.body.base_price);
    if (req.body.default_commission_pct != null) update.default_commission_pct = parseFloat(req.body.default_commission_pct);
    if (req.body.default_discount_pct != null) update.default_discount_pct = parseFloat(req.body.default_discount_pct);
    if (req.body.openai_api_key != null && req.body.openai_api_key !== "••••••••") update.openai_api_key = req.body.openai_api_key.trim();
    await DB.settings.updateOne({ settings_id: "global" }, { $set: update }, { upsert: true });
    const s = await DB.settings.findOne({ settings_id: "global" });
    return res.json({ ...s, openai_api_key_set: !!(s?.openai_api_key), openai_api_key: s?.openai_api_key ? "••••••••" : "" });
  } catch (e: unknown) { return res.status(500).json({ error: (e as Error).message }); }
});

// ─── Referrer Routes ────────────────────────────────────────────────────────
const refAuth = [authenticate as express.RequestHandler, requireReferrer as express.RequestHandler];

app.get("/api/referrer/me", ...refAuth, async (req: AuthedRequest, res) => {
  const ref = await DB.referrers.findOne({ user_id: req.user?.id });
  if (!ref) return res.status(404).json({ error: "حساب معرف یافت نشد" });
  return res.json(ref);
});

app.get("/api/referrer/registrations", ...refAuth, async (req: AuthedRequest, res) => {
  const ref = await DB.referrers.findOne({ user_id: req.user?.id });
  if (!ref) return res.json([]);
  const regs = await DB.registrations.find({ referrer_id: ref.id });
  return res.json(regs.map(r => { const ph = String(r.phone || ""); return { ...r, phone: ph.length >= 7 ? ph.slice(0, 4) + "***" + ph.slice(-3) : ph }; }));
});

app.post("/api/referrer/payout", ...refAuth, async (req: AuthedRequest, res) => {
  try {
    const ref = await DB.referrers.findOne({ user_id: req.user?.id });
    if (!ref) return res.status(404).json({ error: "حساب معرف یافت نشد" });
    const amount = parseFloat(req.body.amount);
    const iban = (req.body.iban || "").trim();
    if (!amount || amount <= 0) return res.status(400).json({ error: "مبلغ نامعتبر" });
    if (amount > (ref.available_balance as number)) return res.status(400).json({ error: "موجودی کافی نیست" });
    if (!iban || iban.length < 10) return res.status(400).json({ error: "شماره شبا نامعتبر" });
    const payout = await DB.payouts.create({ id: uuidv4(), referrer_id: ref.id, referrer_name: ref.name, amount, iban, status: "pending", created_at: nowISO() });
    await DB.referrers.updateOne({ id: ref.id }, { $inc: { available_balance: -amount }, $set: { iban } });
    return res.status(201).json(payout);
  } catch (e: unknown) { return res.status(500).json({ error: (e as Error).message }); }
});

app.get("/api/referrer/payouts", ...refAuth, async (req: AuthedRequest, res) => {
  const ref = await DB.referrers.findOne({ user_id: req.user?.id });
  if (!ref) return res.json([]);
  return res.json(await DB.payouts.find({ referrer_id: ref.id }));
});

// ─── Taranom Mehr AI Routes ─────────────────────────────────────────────────
async function getAI() {
  const s = await DB.settings.findOne({ settings_id: "global" });
  const key = (s?.openai_api_key as string) || process.env.GEMINI_API_KEY || process.env.OPENAI_API_KEY || "";
  if (!key || key === "••••••••") return null;
  try { return new GoogleGenAI({ apiKey: key }); } catch { return null; }
}

app.get("/api/motivational", async (_req, res) => {
  const quotes = [
    "سودای بزرگی در سر داری و مسیر پر از فراز و نشیب است. امروز با هر قدم کوچکت به رویایت نزدیک‌تر می‌شوی. محکم ادامه بده!",
    "موفقیت به معنای بی‌نقص بودن نیست؛ بلکه ادامه دادن با وجود خستگی‌هاست. امروز بهترین نسخه کار خودت را به نمایش بگذار!",
    "هر تست و تحلیل کارنامه‌ای، چراغی روبه‌جلوست. تلاش امروز تو، ترازِ درخشان فرداست. پر انرژی و پرتوان باش!",
    "آرام آرام، اما با استواری کامل پیش برو. کوه‌ها حاصل ایستادگی ذره‌ها هستند. همین امروز یک آجر دیگه روی اهدافت بذار.",
  ];
  try {
    const ai = await getAI();
    if (ai?.models) {
      const r = await ai.models.generateContent({ model: "gemini-2.0-flash", contents: "یک پیام انگیزشی کوتاه (حداکثر دو جمله) به فارسی برای دانش‌آموزی که برای کنکور می‌خواند بنویس." });
      return res.json({ quote: r.text?.trim() || quotes[0] });
    }
  } catch { /* fallback */ }
  return res.json({ quote: quotes[Math.floor(Math.random() * quotes.length)] });
});

app.post("/api/chat", async (req, res) => {
  const { message, history } = req.body;
  try {
    const ai = await getAI();
    if (ai?.models) {
      const formattedHistory = [
        { role: "user", parts: [{ text: "شما مشاور تحصیلی هوشمند 'آقای رادان' در موسسه ترنم مهر هستید. به فارسی صمیمی و کاربردی پاسخ دهید." }] },
        ...((history || []) as { role: string; content: string }[]).map((m) => ({ role: m.role === "user" ? "user" : "model", parts: [{ text: m.content }] })),
        { role: "user", parts: [{ text: message }] },
      ];
      const r = await ai.models.generateContent({ model: "gemini-2.0-flash", contents: formattedHistory });
      return res.json({ reply: r.text?.trim() });
    }
  } catch { /* fallback */ }
  const lm = (message || "").toLowerCase();
  let reply = "چه سوال به‌جایی پرسیدی! بیشتر توضیح بده تا بتونم بهتر راهنمایی‌ات کنم.";
  if (lm.includes("فیزیک") || lm.includes("حرکت")) reply = "برای فیزیک، نمودار سرعت-زمان رو رسم کن و ۲۵ تست زمان‌دار حل کن!";
  else if (lm.includes("ریاضی") || lm.includes("حد")) reply = "مبحث حد با قاعده هوپیتال و هم‌ارزهای جبری حل میشه. جزوه ترنم مهر بخونی کافیه!";
  else if (lm.includes("خسته") || lm.includes("انگیزه")) reply = "تکنیک پومودورو (۲۵ دقیقه درس، ۵ دقیقه استراحت) رو امتحان کن. تو توانایی‌ش رو داری!";
  return res.json({ reply });
});

app.post("/api/analyze-exam", async (req, res) => {
  const { lessons, field } = req.body;
  const subjects = (lessons || []) as { lessonName: string; percentage: number; correct: number; wrong: number; empty: number }[];
  try {
    const ai = await getAI();
    if (ai?.models) {
      const prompt = `کارنامه دانش‌آموز رشته ${field}: ${JSON.stringify(lessons)}\nتحلیل JSON با کلیدهای weaknesses، psychological، remedialPlan، estimatedNextTraz بدون markdown.`;
      const r = await ai.models.generateContent({ model: "gemini-2.0-flash", contents: prompt, config: { responseMimeType: "application/json", responseSchema: { type: Type.OBJECT, properties: { weaknesses: { type: Type.ARRAY, items: { type: Type.OBJECT } }, psychological: { type: Type.OBJECT }, remedialPlan: { type: Type.ARRAY, items: { type: Type.OBJECT } }, estimatedNextTraz: { type: Type.NUMBER } } } } });
      const data = JSON.parse(r.text || "{}");
      return res.json(data);
    }
  } catch { /* fallback */ }
  // Offline fallback
  const weakSubjects = [...subjects].sort((a, b) => a.percentage - b.percentage).slice(0, 3);
  const nextTraz = Math.min(8000, Math.max(4000, Math.floor((subjects.reduce((acc, cur) => acc + cur.percentage, 0) / (subjects.length || 1)) * 50 + 3200)));
  const totalWrong = subjects.reduce((s, x) => s + (x.wrong || 0), 0);
  const totalQ = subjects.reduce((s, x) => s + x.wrong + x.correct + x.empty, 0) || 1;
  const stressLevel = Math.min(95, Math.max(15, Math.floor((totalWrong / totalQ) * 100 + 10)));
  return res.json({
    weaknesses: weakSubjects.map(s => ({ topic: "مبحث پایه", subject: s.lessonName, percentage: s.percentage, recommendation: "حل ۳۰ تست از آزمون‌های قبلی", questionsCount: 30, severity: s.percentage < 35 ? "critical" : "warning" })),
    psychological: { pattern: "تمرکز نوسانی", description: `استرس آزمونی ${stressLevel}٪`, correctToWrongRate: Math.round((totalWrong / totalQ) * 100), suggestion: "تکنیک پومودورو را پیاده کنید", cardColor: stressLevel > 70 ? "red" : stressLevel > 45 ? "orange" : "blue", stressLevel, stressAnalysis: { avgResponseTimeWrong: 65, avgResponseTimeCorrect: 45, consecutiveErrorsCount: 3, stressLabel: stressLevel > 70 ? "بحرانی" : "متوسط", technicalDetail: "نوسان زمانی در پاسخ‌دهی" } },
    remedialPlan: [{ day: "شنبه", morningPlan: `${weakSubjects[0]?.lessonName || "درس ضعیف"} - مطالعه مفهومی`, afternoonPlan: "حل ۱۵ تست", totalQuestions: 15 }],
    estimatedNextTraz: nextTraz + 150,
  });
});

app.post("/api/goal-insight", async (req, res) => {
  const { currentTraz, targetTraz, currentPercentage, latestQuizScore, targetGrowth } = req.body;
  const trazDiff = (targetTraz || 6200) - (currentTraz || 5575);
  let likelihood = Math.min(95, Math.max(10, 80 - Math.min(60, Math.round(trazDiff / 10))));
  const targetPercentage = (currentPercentage || 59) + (targetGrowth || 10);
  likelihood = Math.min(95, Math.max(10, likelihood + Math.round(((latestQuizScore || 63) - targetPercentage) * 1.5)));
  return res.json({ likelihood, text: `تراز هدف ${targetTraz} با تلاش مستمر قابل دسترسی است.`, recommendations: ["تمرکز بر مباحث ضعیف", "حل تست‌های زمان‌دار", "استراحت کافی"] });
});

// ─── Health ─────────────────────────────────────────────────────────────────
app.get("/api/health", (_req, res) => res.json({ status: "ok", mode: "unified", time: new Date().toISOString() }));

// ─── Vite / Static ──────────────────────────────────────────────────────────
async function startServer() {
  await bootstrap();
  if (isDev) {
    const vite = await createViteServer({ server: { middlewareMode: true }, appType: "spa", root: path.resolve(__dirname, "..") });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, "../dist/public");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => res.sendFile(path.join(distPath, "index.html")));
  }
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`\n🚀 Rotbe Bartar + Taranom Mehr — port ${PORT}`);
    console.log("  ✅  /          → صفحه اصلی رتبه برتر");
    console.log("  ✅  /edu       → سامانه ترنم مهر");
    console.log("  ✅  /admin     → پنل ادمین");
    console.log("  ✅  /r/:code   → صفحه معرف");
    console.log("  ⚠️   حالت حافظه موقت — برای دیتابیس دائمی MONGO_URI تنظیم کنید\n");
  });
}

startServer().catch(console.error);
