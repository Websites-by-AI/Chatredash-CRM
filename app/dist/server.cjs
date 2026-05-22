"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// src/server.ts
var import_express = __toESM(require("express"), 1);
var import_path = __toESM(require("path"), 1);
var import_url = require("url");
var import_dotenv = __toESM(require("dotenv"), 1);
var import_vite = require("vite");
var import_jsonwebtoken = __toESM(require("jsonwebtoken"), 1);
var import_uuid = require("uuid");
var import_genai = require("@google/genai");
var import_meta = {};
import_dotenv.default.config();
var __dirname = import_path.default.dirname((0, import_url.fileURLToPath)(import_meta.url));
var app = (0, import_express.default)();
var PORT = parseInt(process.env.PORT || "5000");
var isDev = process.env.NODE_ENV !== "production";
var JWT_SECRET = process.env.JWT_SECRET || "rotbe-bartar-dev-secret-2024";
app.use(import_express.default.json({ limit: "5mb" }));
function makeStore() {
  const store = /* @__PURE__ */ new Map();
  const nowISO2 = () => (/* @__PURE__ */ new Date()).toISOString();
  const clean = (doc) => {
    const { _id, ...rest } = doc;
    void _id;
    return rest;
  };
  return {
    findOne: async (q) => {
      for (const doc of store.values()) {
        if (Object.entries(q).every(([k, v]) => doc[k] === v)) return clean({ ...doc });
      }
      return null;
    },
    find: async (q = {}) => {
      const results = [];
      for (const doc of store.values()) {
        if (Object.entries(q).every(([k, v]) => doc[k] === v)) results.push(clean({ ...doc }));
      }
      return results.sort((a, b) => (b.created_at || "") > (a.created_at || "") ? 1 : -1);
    },
    create: async (doc) => {
      const saved = { ...doc, _id: (0, import_uuid.v4)() };
      store.set(saved._id, saved);
      return clean({ ...saved });
    },
    updateOne: async (q, update, opts = {}) => {
      for (const [key, doc] of store.entries()) {
        if (Object.entries(q).every(([k, v]) => doc[k] === v)) {
          const $set = update.$set || {};
          const $inc = update.$inc || {};
          Object.assign(doc, $set);
          for (const [k, v] of Object.entries($inc)) doc[k] = (doc[k] || 0) + v;
          store.set(key, doc);
          return { matchedCount: 1 };
        }
      }
      if (opts.upsert) {
        const newDoc = { ...update.$set || {}, _id: (0, import_uuid.v4)(), created_at: nowISO2() };
        store.set(newDoc._id, newDoc);
      }
      return { matchedCount: 0 };
    },
    deleteOne: async (q) => {
      for (const [key, doc] of store.entries()) {
        if (Object.entries(q).every(([k, v]) => doc[k] === v)) {
          store.delete(key);
          return { deletedCount: 1 };
        }
      }
      return { deletedCount: 0 };
    },
    count: async (q = {}) => {
      let n = 0;
      for (const doc of store.values()) {
        if (Object.entries(q).every(([k, v]) => doc[k] === v)) n++;
      }
      return n;
    },
    sumField: async (q, field) => {
      let sum = 0;
      for (const doc of store.values()) {
        if (Object.entries(q).every(([k, v]) => doc[k] === v)) sum += doc[field] || 0;
      }
      return sum;
    }
  };
}
var DB = {
  users: makeStore(),
  otps: makeStore(),
  referrers: makeStore(),
  registrations: makeStore(),
  payouts: makeStore(),
  settings: makeStore(),
  contents: makeStore()
};
async function bootstrap() {
  const nowISO2 = () => (/* @__PURE__ */ new Date()).toISOString();
  const existing = await DB.settings.findOne({ settings_id: "global" });
  if (!existing) {
    await DB.settings.create({ settings_id: "global", base_price: 1e6, default_commission_pct: 20, default_discount_pct: 10, openai_api_key: "", updated_at: nowISO2() });
    console.log("\u2713 Default settings created");
  }
  const admin = await DB.users.findOne({ phone: "09120000000" });
  if (!admin) {
    await DB.users.create({ id: (0, import_uuid.v4)(), phone: "09120000000", name: "\u0645\u062F\u06CC\u0631 \u0633\u06CC\u0633\u062A\u0645", role: "admin", created_at: nowISO2() });
    console.log("\u2713 Admin user: 09120000000");
  }
}
var makeToken = (id, role) => import_jsonwebtoken.default.sign({ sub: id, role }, JWT_SECRET, { expiresIn: "30d" });
async function authenticate(req, res, next) {
  const auth = req.headers.authorization;
  if (!auth?.startsWith("Bearer ")) return res.status(401).json({ error: "Unauthorized" });
  try {
    const payload = import_jsonwebtoken.default.verify(auth.slice(7), JWT_SECRET);
    const user = await DB.users.findOne({ id: payload.sub });
    if (!user) return res.status(401).json({ error: "User not found" });
    req.user = user;
    next();
  } catch {
    res.status(401).json({ error: "Invalid token" });
  }
}
function requireAdmin(req, res, next) {
  if (req.user?.role !== "admin") return res.status(403).json({ error: "Admin only" });
  next();
}
function requireReferrer(req, res, next) {
  if (!["referrer", "admin"].includes(req.user?.role)) return res.status(403).json({ error: "Referrer only" });
  next();
}
function genCode(len = 5) {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  return Array.from({ length: len }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
}
function genPin(len = 5) {
  return Array.from({ length: len }, () => Math.floor(Math.random() * 10)).join("");
}
var nowISO = () => (/* @__PURE__ */ new Date()).toISOString();
app.post("/api/auth/send-otp", async (req, res) => {
  try {
    const phone = (req.body.phone || "").trim();
    if (!phone || phone.length < 10) return res.status(400).json({ error: "\u0634\u0645\u0627\u0631\u0647 \u0645\u0648\u0628\u0627\u06CC\u0644 \u0646\u0627\u0645\u0639\u062A\u0628\u0631" });
    const code = Array.from({ length: 5 }, () => Math.floor(Math.random() * 10)).join("");
    const expires_at = new Date(Date.now() + 10 * 60 * 1e3).toISOString();
    await DB.otps.updateOne({ phone }, { $set: { phone, code, expires_at } }, { upsert: true });
    return res.json({ sent: true, dev_otp: code, message: "\u06A9\u062F \u0627\u0631\u0633\u0627\u0644 \u0634\u062F (\u062D\u0627\u0644\u062A \u0622\u0632\u0645\u0627\u06CC\u0634\u06CC)" });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
});
app.post("/api/auth/verify-otp", async (req, res) => {
  try {
    const phone = (req.body.phone || "").trim();
    const code = (req.body.code || "").trim();
    const rec = await DB.otps.findOne({ phone });
    if (!rec || rec.code !== code) return res.status(400).json({ error: "\u06A9\u062F \u0648\u0627\u0631\u062F \u0634\u062F\u0647 \u0646\u0627\u0645\u0639\u062A\u0628\u0631 \u0627\u0633\u062A" });
    if (rec.expires_at && new Date(rec.expires_at) < /* @__PURE__ */ new Date()) return res.status(400).json({ error: "\u06A9\u062F \u0645\u0646\u0642\u0636\u06CC \u0634\u062F\u0647" });
    let user = await DB.users.findOne({ phone });
    if (!user) user = await DB.users.create({ id: (0, import_uuid.v4)(), phone, name: "", role: "registrant", created_at: nowISO() });
    await DB.otps.deleteOne({ phone });
    const token = makeToken(user.id, user.role);
    return res.json({ token, user });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
});
app.get("/api/auth/me", authenticate, async (req, res) => {
  const out = { user: req.user };
  if (req.user?.role === "referrer") {
    const ref = await DB.referrers.findOne({ user_id: req.user.id });
    if (ref) out.referrer = ref;
  }
  return res.json(out);
});
app.get("/api/public/settings", async (_req, res) => {
  try {
    const s = await DB.settings.findOne({ settings_id: "global" });
    return res.json({ base_price: s?.base_price, default_discount_pct: s?.default_discount_pct });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
});
app.get("/api/public/referrer/:code", async (req, res) => {
  try {
    const code = req.params.code.toUpperCase().trim();
    const ref = await DB.referrers.findOne({ referral_code: code, status: "active" });
    if (!ref) return res.status(404).json({ error: "\u06A9\u062F \u0645\u0639\u0631\u0641 \u0645\u0639\u062A\u0628\u0631 \u0646\u06CC\u0633\u062A" });
    const s = await DB.settings.findOne({ settings_id: "global" });
    return res.json({ valid: true, name: ref.name, referral_code: ref.referral_code, discount_pct: s?.default_discount_pct, base_price: s?.base_price });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
});
app.post("/api/public/register", async (req, res) => {
  try {
    const { name, phone, field, exam, rank, referrer_code } = req.body;
    const s = await DB.settings.findOne({ settings_id: "global" });
    const base_price = parseFloat(String(s?.base_price || 1e6));
    let discount_pct = 0, referrerCode = null, referrer_id = null, commission_pct = 0;
    if (referrer_code) {
      const rc = referrer_code.toUpperCase().trim();
      const ref = await DB.referrers.findOne({ referral_code: rc, status: "active" });
      if (ref) {
        referrerCode = ref.referral_code;
        referrer_id = ref.id;
        commission_pct = parseFloat(String(ref.commission_pct || s?.default_commission_pct || 20));
        discount_pct = parseFloat(String(s?.default_discount_pct || 10));
      }
    }
    const discount_amount = Math.round(base_price * discount_pct / 100);
    const paid_amount = base_price - discount_amount;
    const commission_amount = referrer_id ? Math.round(paid_amount * commission_pct / 100) : 0;
    const reg = await DB.registrations.create({ id: (0, import_uuid.v4)(), name, phone, field, exam, rank, referrer_code: referrerCode, referrer_id, discount_pct, discount_amount, base_price, paid_amount, commission_pct, commission_amount, status: "pending", created_at: nowISO() });
    return res.json(reg);
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
});
var adminAuth = [authenticate, requireAdmin];
app.post("/api/admin/referrers", ...adminAuth, async (req, res) => {
  try {
    const { phone, name, commission_pct } = req.body;
    const s = await DB.settings.findOne({ settings_id: "global" });
    const commissionPct = commission_pct != null ? parseFloat(commission_pct) : parseFloat(String(s?.default_commission_pct || 20));
    let user = await DB.users.findOne({ phone });
    if (!user) user = await DB.users.create({ id: (0, import_uuid.v4)(), phone, name: name || "", role: "referrer", created_at: nowISO() });
    else await DB.users.updateOne({ id: user.id }, { $set: { role: "referrer", name: name || user.name } });
    const existing = await DB.referrers.findOne({ user_id: user.id });
    if (existing) return res.status(400).json({ error: "\u0627\u06CC\u0646 \u06A9\u0627\u0631\u0628\u0631 \u0642\u0628\u0644\u0627\u064B \u0628\u0647\u200C\u0639\u0646\u0648\u0627\u0646 \u0645\u0639\u0631\u0641 \u062B\u0628\u062A \u0634\u062F\u0647" });
    let code = "";
    for (let i = 0; i < 20; i++) {
      code = genCode(5);
      if (!await DB.referrers.findOne({ referral_code: code })) break;
    }
    const ref = await DB.referrers.create({ id: (0, import_uuid.v4)(), user_id: user.id, phone, name: name || "", referral_code: code, security_pin: genPin(5), commission_pct: commissionPct, status: "active", total_earnings: 0, available_balance: 0, total_signups: 0, iban: "", created_at: nowISO() });
    return res.status(201).json(ref);
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
});
app.get("/api/admin/referrers", ...adminAuth, async (_req, res) => {
  return res.json(await DB.referrers.find());
});
app.patch("/api/admin/referrers/:id", ...adminAuth, async (req, res) => {
  try {
    const update = {};
    if (req.body.status != null) update.status = req.body.status;
    if (req.body.commission_pct != null) update.commission_pct = parseFloat(req.body.commission_pct);
    if (req.body.name != null) update.name = req.body.name;
    await DB.referrers.updateOne({ id: req.params.id }, { $set: update });
    return res.json(await DB.referrers.findOne({ id: req.params.id }));
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
});
app.get("/api/admin/registrations", ...adminAuth, async (_req, res) => res.json(await DB.registrations.find()));
app.get("/api/admin/payouts", ...adminAuth, async (_req, res) => res.json(await DB.payouts.find()));
app.patch("/api/admin/payouts/:id", ...adminAuth, async (req, res) => {
  try {
    const payout = await DB.payouts.findOne({ id: req.params.id });
    if (!payout) return res.status(404).json({ error: "\u067E\u06CC\u062F\u0627 \u0646\u0634\u062F" });
    const newStatus = req.body.status;
    await DB.payouts.updateOne({ id: req.params.id }, { $set: { status: newStatus, processed_at: nowISO() } });
    if (newStatus === "rejected" && payout.status !== "rejected") await DB.referrers.updateOne({ id: payout.referrer_id }, { $inc: { available_balance: payout.amount } });
    return res.json(await DB.payouts.findOne({ id: req.params.id }));
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
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
      DB.payouts.count({ status: "pending" })
    ]);
    return res.json({ total_referrers, active_referrers, total_registrations, paid_registrations, revenue, commissions, pending_payouts });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
});
app.get("/api/admin/settings", ...adminAuth, async (_req, res) => {
  try {
    const s = await DB.settings.findOne({ settings_id: "global" });
    const out = { ...s, openai_api_key_set: !!s?.openai_api_key, openai_api_key: s?.openai_api_key ? "\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022" : "" };
    return res.json(out);
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
});
app.put("/api/admin/settings", ...adminAuth, async (req, res) => {
  try {
    const update = { updated_at: nowISO() };
    if (req.body.base_price != null) update.base_price = parseFloat(req.body.base_price);
    if (req.body.default_commission_pct != null) update.default_commission_pct = parseFloat(req.body.default_commission_pct);
    if (req.body.default_discount_pct != null) update.default_discount_pct = parseFloat(req.body.default_discount_pct);
    if (req.body.openai_api_key != null && req.body.openai_api_key !== "\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022") update.openai_api_key = req.body.openai_api_key.trim();
    await DB.settings.updateOne({ settings_id: "global" }, { $set: update }, { upsert: true });
    const s = await DB.settings.findOne({ settings_id: "global" });
    return res.json({ ...s, openai_api_key_set: !!s?.openai_api_key, openai_api_key: s?.openai_api_key ? "\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022" : "" });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
});
var refAuth = [authenticate, requireReferrer];
app.get("/api/referrer/me", ...refAuth, async (req, res) => {
  const ref = await DB.referrers.findOne({ user_id: req.user?.id });
  if (!ref) return res.status(404).json({ error: "\u062D\u0633\u0627\u0628 \u0645\u0639\u0631\u0641 \u06CC\u0627\u0641\u062A \u0646\u0634\u062F" });
  return res.json(ref);
});
app.get("/api/referrer/registrations", ...refAuth, async (req, res) => {
  const ref = await DB.referrers.findOne({ user_id: req.user?.id });
  if (!ref) return res.json([]);
  const regs = await DB.registrations.find({ referrer_id: ref.id });
  return res.json(regs.map((r) => {
    const ph = String(r.phone || "");
    return { ...r, phone: ph.length >= 7 ? ph.slice(0, 4) + "***" + ph.slice(-3) : ph };
  }));
});
app.post("/api/referrer/payout", ...refAuth, async (req, res) => {
  try {
    const ref = await DB.referrers.findOne({ user_id: req.user?.id });
    if (!ref) return res.status(404).json({ error: "\u062D\u0633\u0627\u0628 \u0645\u0639\u0631\u0641 \u06CC\u0627\u0641\u062A \u0646\u0634\u062F" });
    const amount = parseFloat(req.body.amount);
    const iban = (req.body.iban || "").trim();
    if (!amount || amount <= 0) return res.status(400).json({ error: "\u0645\u0628\u0644\u063A \u0646\u0627\u0645\u0639\u062A\u0628\u0631" });
    if (amount > ref.available_balance) return res.status(400).json({ error: "\u0645\u0648\u062C\u0648\u062F\u06CC \u06A9\u0627\u0641\u06CC \u0646\u06CC\u0633\u062A" });
    if (!iban || iban.length < 10) return res.status(400).json({ error: "\u0634\u0645\u0627\u0631\u0647 \u0634\u0628\u0627 \u0646\u0627\u0645\u0639\u062A\u0628\u0631" });
    const payout = await DB.payouts.create({ id: (0, import_uuid.v4)(), referrer_id: ref.id, referrer_name: ref.name, amount, iban, status: "pending", created_at: nowISO() });
    await DB.referrers.updateOne({ id: ref.id }, { $inc: { available_balance: -amount }, $set: { iban } });
    return res.status(201).json(payout);
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
});
app.get("/api/referrer/payouts", ...refAuth, async (req, res) => {
  const ref = await DB.referrers.findOne({ user_id: req.user?.id });
  if (!ref) return res.json([]);
  return res.json(await DB.payouts.find({ referrer_id: ref.id }));
});
async function getAI() {
  const s = await DB.settings.findOne({ settings_id: "global" });
  const key = s?.openai_api_key || process.env.GEMINI_API_KEY || process.env.OPENAI_API_KEY || "";
  if (!key || key === "\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022") return null;
  try {
    return new import_genai.GoogleGenAI({ apiKey: key });
  } catch {
    return null;
  }
}
app.get("/api/motivational", async (_req, res) => {
  const quotes = [
    "\u0633\u0648\u062F\u0627\u06CC \u0628\u0632\u0631\u06AF\u06CC \u062F\u0631 \u0633\u0631 \u062F\u0627\u0631\u06CC \u0648 \u0645\u0633\u06CC\u0631 \u067E\u0631 \u0627\u0632 \u0641\u0631\u0627\u0632 \u0648 \u0646\u0634\u06CC\u0628 \u0627\u0633\u062A. \u0627\u0645\u0631\u0648\u0632 \u0628\u0627 \u0647\u0631 \u0642\u062F\u0645 \u06A9\u0648\u0686\u06A9\u062A \u0628\u0647 \u0631\u0648\u06CC\u0627\u06CC\u062A \u0646\u0632\u062F\u06CC\u06A9\u200C\u062A\u0631 \u0645\u06CC\u200C\u0634\u0648\u06CC. \u0645\u062D\u06A9\u0645 \u0627\u062F\u0627\u0645\u0647 \u0628\u062F\u0647!",
    "\u0645\u0648\u0641\u0642\u06CC\u062A \u0628\u0647 \u0645\u0639\u0646\u0627\u06CC \u0628\u06CC\u200C\u0646\u0642\u0635 \u0628\u0648\u062F\u0646 \u0646\u06CC\u0633\u062A\u061B \u0628\u0644\u06A9\u0647 \u0627\u062F\u0627\u0645\u0647 \u062F\u0627\u062F\u0646 \u0628\u0627 \u0648\u062C\u0648\u062F \u062E\u0633\u062A\u06AF\u06CC\u200C\u0647\u0627\u0633\u062A. \u0627\u0645\u0631\u0648\u0632 \u0628\u0647\u062A\u0631\u06CC\u0646 \u0646\u0633\u062E\u0647 \u06A9\u0627\u0631 \u062E\u0648\u062F\u062A \u0631\u0627 \u0628\u0647 \u0646\u0645\u0627\u06CC\u0634 \u0628\u06AF\u0630\u0627\u0631!",
    "\u0647\u0631 \u062A\u0633\u062A \u0648 \u062A\u062D\u0644\u06CC\u0644 \u06A9\u0627\u0631\u0646\u0627\u0645\u0647\u200C\u0627\u06CC\u060C \u0686\u0631\u0627\u063A\u06CC \u0631\u0648\u0628\u0647\u200C\u062C\u0644\u0648\u0633\u062A. \u062A\u0644\u0627\u0634 \u0627\u0645\u0631\u0648\u0632 \u062A\u0648\u060C \u062A\u0631\u0627\u0632\u0650 \u062F\u0631\u062E\u0634\u0627\u0646 \u0641\u0631\u062F\u0627\u0633\u062A. \u067E\u0631 \u0627\u0646\u0631\u0698\u06CC \u0648 \u067E\u0631\u062A\u0648\u0627\u0646 \u0628\u0627\u0634!",
    "\u0622\u0631\u0627\u0645 \u0622\u0631\u0627\u0645\u060C \u0627\u0645\u0627 \u0628\u0627 \u0627\u0633\u062A\u0648\u0627\u0631\u06CC \u06A9\u0627\u0645\u0644 \u067E\u06CC\u0634 \u0628\u0631\u0648. \u06A9\u0648\u0647\u200C\u0647\u0627 \u062D\u0627\u0635\u0644 \u0627\u06CC\u0633\u062A\u0627\u062F\u06AF\u06CC \u0630\u0631\u0647\u200C\u0647\u0627 \u0647\u0633\u062A\u0646\u062F. \u0647\u0645\u06CC\u0646 \u0627\u0645\u0631\u0648\u0632 \u06CC\u06A9 \u0622\u062C\u0631 \u062F\u06CC\u06AF\u0647 \u0631\u0648\u06CC \u0627\u0647\u062F\u0627\u0641\u062A \u0628\u0630\u0627\u0631."
  ];
  try {
    const ai = await getAI();
    if (ai?.models) {
      const r = await ai.models.generateContent({ model: "gemini-2.0-flash", contents: "\u06CC\u06A9 \u067E\u06CC\u0627\u0645 \u0627\u0646\u06AF\u06CC\u0632\u0634\u06CC \u06A9\u0648\u062A\u0627\u0647 (\u062D\u062F\u0627\u06A9\u062B\u0631 \u062F\u0648 \u062C\u0645\u0644\u0647) \u0628\u0647 \u0641\u0627\u0631\u0633\u06CC \u0628\u0631\u0627\u06CC \u062F\u0627\u0646\u0634\u200C\u0622\u0645\u0648\u0632\u06CC \u06A9\u0647 \u0628\u0631\u0627\u06CC \u06A9\u0646\u06A9\u0648\u0631 \u0645\u06CC\u200C\u062E\u0648\u0627\u0646\u062F \u0628\u0646\u0648\u06CC\u0633." });
      return res.json({ quote: r.text?.trim() || quotes[0] });
    }
  } catch {
  }
  return res.json({ quote: quotes[Math.floor(Math.random() * quotes.length)] });
});
app.post("/api/chat", async (req, res) => {
  const { message, history } = req.body;
  try {
    const ai = await getAI();
    if (ai?.models) {
      const formattedHistory = [
        { role: "user", parts: [{ text: "\u0634\u0645\u0627 \u0645\u0634\u0627\u0648\u0631 \u062A\u062D\u0635\u06CC\u0644\u06CC \u0647\u0648\u0634\u0645\u0646\u062F '\u0622\u0642\u0627\u06CC \u0631\u0627\u062F\u0627\u0646' \u062F\u0631 \u0645\u0648\u0633\u0633\u0647 \u062A\u0631\u0646\u0645 \u0645\u0647\u0631 \u0647\u0633\u062A\u06CC\u062F. \u0628\u0647 \u0641\u0627\u0631\u0633\u06CC \u0635\u0645\u06CC\u0645\u06CC \u0648 \u06A9\u0627\u0631\u0628\u0631\u062F\u06CC \u067E\u0627\u0633\u062E \u062F\u0647\u06CC\u062F." }] },
        ...(history || []).map((m) => ({ role: m.role === "user" ? "user" : "model", parts: [{ text: m.content }] })),
        { role: "user", parts: [{ text: message }] }
      ];
      const r = await ai.models.generateContent({ model: "gemini-2.0-flash", contents: formattedHistory });
      return res.json({ reply: r.text?.trim() });
    }
  } catch {
  }
  const lm = (message || "").toLowerCase();
  let reply = "\u0686\u0647 \u0633\u0648\u0627\u0644 \u0628\u0647\u200C\u062C\u0627\u06CC\u06CC \u067E\u0631\u0633\u06CC\u062F\u06CC! \u0628\u06CC\u0634\u062A\u0631 \u062A\u0648\u0636\u06CC\u062D \u0628\u062F\u0647 \u062A\u0627 \u0628\u062A\u0648\u0646\u0645 \u0628\u0647\u062A\u0631 \u0631\u0627\u0647\u0646\u0645\u0627\u06CC\u06CC\u200C\u0627\u062A \u06A9\u0646\u0645.";
  if (lm.includes("\u0641\u06CC\u0632\u06CC\u06A9") || lm.includes("\u062D\u0631\u06A9\u062A")) reply = "\u0628\u0631\u0627\u06CC \u0641\u06CC\u0632\u06CC\u06A9\u060C \u0646\u0645\u0648\u062F\u0627\u0631 \u0633\u0631\u0639\u062A-\u0632\u0645\u0627\u0646 \u0631\u0648 \u0631\u0633\u0645 \u06A9\u0646 \u0648 \u06F2\u06F5 \u062A\u0633\u062A \u0632\u0645\u0627\u0646\u200C\u062F\u0627\u0631 \u062D\u0644 \u06A9\u0646!";
  else if (lm.includes("\u0631\u06CC\u0627\u0636\u06CC") || lm.includes("\u062D\u062F")) reply = "\u0645\u0628\u062D\u062B \u062D\u062F \u0628\u0627 \u0642\u0627\u0639\u062F\u0647 \u0647\u0648\u067E\u06CC\u062A\u0627\u0644 \u0648 \u0647\u0645\u200C\u0627\u0631\u0632\u0647\u0627\u06CC \u062C\u0628\u0631\u06CC \u062D\u0644 \u0645\u06CC\u0634\u0647. \u062C\u0632\u0648\u0647 \u062A\u0631\u0646\u0645 \u0645\u0647\u0631 \u0628\u062E\u0648\u0646\u06CC \u06A9\u0627\u0641\u06CC\u0647!";
  else if (lm.includes("\u062E\u0633\u062A\u0647") || lm.includes("\u0627\u0646\u06AF\u06CC\u0632\u0647")) reply = "\u062A\u06A9\u0646\u06CC\u06A9 \u067E\u0648\u0645\u0648\u062F\u0648\u0631\u0648 (\u06F2\u06F5 \u062F\u0642\u06CC\u0642\u0647 \u062F\u0631\u0633\u060C \u06F5 \u062F\u0642\u06CC\u0642\u0647 \u0627\u0633\u062A\u0631\u0627\u062D\u062A) \u0631\u0648 \u0627\u0645\u062A\u062D\u0627\u0646 \u06A9\u0646. \u062A\u0648 \u062A\u0648\u0627\u0646\u0627\u06CC\u06CC\u200C\u0634 \u0631\u0648 \u062F\u0627\u0631\u06CC!";
  return res.json({ reply });
});
app.post("/api/analyze-exam", async (req, res) => {
  const { lessons, field } = req.body;
  const subjects = lessons || [];
  try {
    const ai = await getAI();
    if (ai?.models) {
      const prompt = `\u06A9\u0627\u0631\u0646\u0627\u0645\u0647 \u062F\u0627\u0646\u0634\u200C\u0622\u0645\u0648\u0632 \u0631\u0634\u062A\u0647 ${field}: ${JSON.stringify(lessons)}
\u062A\u062D\u0644\u06CC\u0644 JSON \u0628\u0627 \u06A9\u0644\u06CC\u062F\u0647\u0627\u06CC weaknesses\u060C psychological\u060C remedialPlan\u060C estimatedNextTraz \u0628\u062F\u0648\u0646 markdown.`;
      const r = await ai.models.generateContent({ model: "gemini-2.0-flash", contents: prompt, config: { responseMimeType: "application/json", responseSchema: { type: import_genai.Type.OBJECT, properties: { weaknesses: { type: import_genai.Type.ARRAY, items: { type: import_genai.Type.OBJECT } }, psychological: { type: import_genai.Type.OBJECT }, remedialPlan: { type: import_genai.Type.ARRAY, items: { type: import_genai.Type.OBJECT } }, estimatedNextTraz: { type: import_genai.Type.NUMBER } } } } });
      const data = JSON.parse(r.text || "{}");
      return res.json(data);
    }
  } catch {
  }
  const weakSubjects = [...subjects].sort((a, b) => a.percentage - b.percentage).slice(0, 3);
  const nextTraz = Math.min(8e3, Math.max(4e3, Math.floor(subjects.reduce((acc, cur) => acc + cur.percentage, 0) / (subjects.length || 1) * 50 + 3200)));
  const totalWrong = subjects.reduce((s, x) => s + (x.wrong || 0), 0);
  const totalQ = subjects.reduce((s, x) => s + x.wrong + x.correct + x.empty, 0) || 1;
  const stressLevel = Math.min(95, Math.max(15, Math.floor(totalWrong / totalQ * 100 + 10)));
  return res.json({
    weaknesses: weakSubjects.map((s) => ({ topic: "\u0645\u0628\u062D\u062B \u067E\u0627\u06CC\u0647", subject: s.lessonName, percentage: s.percentage, recommendation: "\u062D\u0644 \u06F3\u06F0 \u062A\u0633\u062A \u0627\u0632 \u0622\u0632\u0645\u0648\u0646\u200C\u0647\u0627\u06CC \u0642\u0628\u0644\u06CC", questionsCount: 30, severity: s.percentage < 35 ? "critical" : "warning" })),
    psychological: { pattern: "\u062A\u0645\u0631\u06A9\u0632 \u0646\u0648\u0633\u0627\u0646\u06CC", description: `\u0627\u0633\u062A\u0631\u0633 \u0622\u0632\u0645\u0648\u0646\u06CC ${stressLevel}\u066A`, correctToWrongRate: Math.round(totalWrong / totalQ * 100), suggestion: "\u062A\u06A9\u0646\u06CC\u06A9 \u067E\u0648\u0645\u0648\u062F\u0648\u0631\u0648 \u0631\u0627 \u067E\u06CC\u0627\u062F\u0647 \u06A9\u0646\u06CC\u062F", cardColor: stressLevel > 70 ? "red" : stressLevel > 45 ? "orange" : "blue", stressLevel, stressAnalysis: { avgResponseTimeWrong: 65, avgResponseTimeCorrect: 45, consecutiveErrorsCount: 3, stressLabel: stressLevel > 70 ? "\u0628\u062D\u0631\u0627\u0646\u06CC" : "\u0645\u062A\u0648\u0633\u0637", technicalDetail: "\u0646\u0648\u0633\u0627\u0646 \u0632\u0645\u0627\u0646\u06CC \u062F\u0631 \u067E\u0627\u0633\u062E\u200C\u062F\u0647\u06CC" } },
    remedialPlan: [{ day: "\u0634\u0646\u0628\u0647", morningPlan: `${weakSubjects[0]?.lessonName || "\u062F\u0631\u0633 \u0636\u0639\u06CC\u0641"} - \u0645\u0637\u0627\u0644\u0639\u0647 \u0645\u0641\u0647\u0648\u0645\u06CC`, afternoonPlan: "\u062D\u0644 \u06F1\u06F5 \u062A\u0633\u062A", totalQuestions: 15 }],
    estimatedNextTraz: nextTraz + 150
  });
});
app.post("/api/goal-insight", async (req, res) => {
  const { currentTraz, targetTraz, currentPercentage, latestQuizScore, targetGrowth } = req.body;
  const trazDiff = (targetTraz || 6200) - (currentTraz || 5575);
  let likelihood = Math.min(95, Math.max(10, 80 - Math.min(60, Math.round(trazDiff / 10))));
  const targetPercentage = (currentPercentage || 59) + (targetGrowth || 10);
  likelihood = Math.min(95, Math.max(10, likelihood + Math.round(((latestQuizScore || 63) - targetPercentage) * 1.5)));
  return res.json({ likelihood, text: `\u062A\u0631\u0627\u0632 \u0647\u062F\u0641 ${targetTraz} \u0628\u0627 \u062A\u0644\u0627\u0634 \u0645\u0633\u062A\u0645\u0631 \u0642\u0627\u0628\u0644 \u062F\u0633\u062A\u0631\u0633\u06CC \u0627\u0633\u062A.`, recommendations: ["\u062A\u0645\u0631\u06A9\u0632 \u0628\u0631 \u0645\u0628\u0627\u062D\u062B \u0636\u0639\u06CC\u0641", "\u062D\u0644 \u062A\u0633\u062A\u200C\u0647\u0627\u06CC \u0632\u0645\u0627\u0646\u200C\u062F\u0627\u0631", "\u0627\u0633\u062A\u0631\u0627\u062D\u062A \u06A9\u0627\u0641\u06CC"] });
});
app.get("/api/health", (_req, res) => res.json({ status: "ok", mode: "unified", time: (/* @__PURE__ */ new Date()).toISOString() }));
async function startServer() {
  await bootstrap();
  if (isDev) {
    const vite = await (0, import_vite.createServer)({ server: { middlewareMode: true }, appType: "spa", root: import_path.default.resolve(__dirname, "..") });
    app.use(vite.middlewares);
  } else {
    const distPath = import_path.default.resolve(__dirname, "../dist/public");
    app.use(import_express.default.static(distPath));
    app.get("*", (_req, res) => res.sendFile(import_path.default.join(distPath, "index.html")));
  }
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`
\u{1F680} Rotbe Bartar + Taranom Mehr \u2014 port ${PORT}`);
    console.log("  \u2705  /          \u2192 \u0635\u0641\u062D\u0647 \u0627\u0635\u0644\u06CC \u0631\u062A\u0628\u0647 \u0628\u0631\u062A\u0631");
    console.log("  \u2705  /edu       \u2192 \u0633\u0627\u0645\u0627\u0646\u0647 \u062A\u0631\u0646\u0645 \u0645\u0647\u0631");
    console.log("  \u2705  /admin     \u2192 \u067E\u0646\u0644 \u0627\u062F\u0645\u06CC\u0646");
    console.log("  \u2705  /r/:code   \u2192 \u0635\u0641\u062D\u0647 \u0645\u0639\u0631\u0641");
    console.log("  \u26A0\uFE0F   \u062D\u0627\u0644\u062A \u062D\u0627\u0641\u0638\u0647 \u0645\u0648\u0642\u062A \u2014 \u0628\u0631\u0627\u06CC \u062F\u06CC\u062A\u0627\u0628\u06CC\u0633 \u062F\u0627\u0626\u0645\u06CC MONGO_URI \u062A\u0646\u0638\u06CC\u0645 \u06A9\u0646\u06CC\u062F\n");
  });
}
startServer().catch(console.error);
//# sourceMappingURL=server.cjs.map
