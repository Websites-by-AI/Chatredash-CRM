import { useState, useEffect } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { api } from "../lib/api";

interface PublicSettings { base_price: number; default_discount_pct: number; }
interface ReferrerInfo { valid: boolean; name: string; referral_code: string; discount_pct: number; base_price: number; }

export default function RegisterPage() {
  const [params] = useSearchParams();
  const refCode = params.get("ref") || "";

  const [settings, setSettings] = useState<PublicSettings>({ base_price: 1000000, default_discount_pct: 0 });
  const [referrer, setReferrer] = useState<ReferrerInfo | null>(null);
  const [form, setForm] = useState({ name: "", phone: "", field: "", exam: "", rank: "", referrer_code: refCode });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    api.get<PublicSettings>("/api/public/settings").then(setSettings).catch(() => {});
  }, []);

  useEffect(() => {
    if (form.referrer_code.length >= 4) {
      api.get<ReferrerInfo>(`/api/public/referrer/${form.referrer_code}`)
        .then(setReferrer).catch(() => setReferrer(null));
    } else {
      setReferrer(null);
    }
  }, [form.referrer_code]);

  const discount = referrer ? Math.round(settings.base_price * referrer.discount_pct / 100) : 0;
  const finalPrice = settings.base_price - discount;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await api.post("/api/public/register", form);
      setSuccess(true);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "خطا در ثبت‌نام");
    } finally {
      setLoading(false);
    }
  };

  if (success) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      <div className="bg-white rounded-3xl p-10 max-w-md w-full text-center shadow-xl border border-slate-100">
        <div className="text-5xl mb-4">✅</div>
        <h2 className="text-2xl font-black text-slate-900 mb-2">ثبت‌نام با موفقیت انجام شد</h2>
        <p className="text-slate-500 text-sm mb-6">اطلاعات شما دریافت شد. برای تکمیل پرداخت با ما تماس بگیرید.</p>
        <Link to="/" className="inline-block bg-slate-900 text-white px-6 py-3 rounded-xl font-bold hover:bg-slate-800 transition">بازگشت به خانه</Link>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="w-full max-w-xl bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden">
        <div className="bg-gradient-to-tr from-amber-400 to-yellow-300 p-8 text-slate-900">
          <h1 className="text-2xl font-black mb-1">ثبت‌نام در رتبه برتر</h1>
          <p className="text-sm text-slate-700">اطلاعات خود را وارد کنید</p>
          {referrer && (
            <div className="mt-3 bg-white/50 rounded-xl p-3 text-sm font-bold">
              🎉 کد معرف: <span className="font-mono">{referrer.referral_code}</span> — {referrer.name} — {referrer.discount_pct}٪ تخفیف
            </div>
          )}
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-4">
          {error && <div className="p-3 bg-red-50 text-red-700 rounded-xl text-sm font-bold border border-red-100">{error}</div>}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              { label: "نام و نام خانوادگی", key: "name", type: "text", placeholder: "نام کامل" },
              { label: "شماره موبایل", key: "phone", type: "tel", placeholder: "09..." },
              { label: "رشته", key: "field", type: "text", placeholder: "ریاضی / تجربی / انسانی" },
              { label: "آزمون", key: "exam", type: "text", placeholder: "کنکور ۱۴۰۵" },
              { label: "رتبه", key: "rank", type: "text", placeholder: "رتبه کنکور یا آزمون" },
            ].map(({ label, key, type, placeholder }) => (
              <div key={key}>
                <label className="block text-xs font-bold text-slate-600 mb-1.5">{label}</label>
                <input type={type} placeholder={placeholder} value={form[key as keyof typeof form]}
                  onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-slate-800 transition" required />
              </div>
            ))}
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1.5">کد معرف (اختیاری)</label>
              <input type="text" placeholder="کد معرف" value={form.referrer_code}
                onChange={(e) => setForm({ ...form, referrer_code: e.target.value.toUpperCase() })}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-slate-800 font-mono transition" />
            </div>
          </div>

          <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 text-sm space-y-1">
            <div className="flex justify-between"><span className="text-slate-500">قیمت پایه:</span><span className="font-bold font-mono">{settings.base_price.toLocaleString()} تومان</span></div>
            {discount > 0 && <div className="flex justify-between text-emerald-700"><span>تخفیف معرف:</span><span className="font-bold font-mono">-{discount.toLocaleString()} تومان</span></div>}
            <div className="flex justify-between pt-2 border-t border-slate-200 font-black text-base"><span>قابل پرداخت:</span><span className="font-mono text-slate-900">{finalPrice.toLocaleString()} تومان</span></div>
          </div>

          <button type="submit" disabled={loading}
            className="w-full bg-slate-900 text-white py-3.5 rounded-xl font-bold hover:bg-slate-800 transition flex items-center justify-center gap-2 cursor-pointer">
            {loading ? <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : "ثبت‌نام"}
          </button>
        </form>
      </div>
    </div>
  );
}
