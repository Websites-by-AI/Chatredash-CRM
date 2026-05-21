import { useEffect, useState, useCallback } from "react";
import { useAuth } from "../lib/auth-context";
import { api } from "../lib/api";
import { LogOut, Users, BarChart3, Settings, DollarSign, FileText, Plus, RefreshCw } from "lucide-react";

interface Stats { total_referrers: number; active_referrers: number; total_registrations: number; paid_registrations: number; revenue: number; commissions: number; pending_payouts: number; }
interface Referrer { id: string; name: string; phone: string; referral_code: string; commission_pct: number; status: string; total_earnings: number; available_balance: number; total_signups: number; }
interface Registration { id: string; name: string; phone: string; field: string; exam: string; rank: string; referrer_code: string; paid_amount: number; commission_amount: number; status: string; created_at: string; }
interface Payout { id: string; referrer_id: string; referrer_name: string; amount: number; iban: string; status: string; created_at: string; }
interface AppSettings { base_price: number; default_commission_pct: number; default_discount_pct: number; openai_api_key: string; openai_api_key_set: boolean; }

type Tab = "stats" | "referrers" | "registrations" | "payouts" | "settings";

export default function AdminPage() {
  const { user, token, logout } = useAuth();
  const [tab, setTab] = useState<Tab>("stats");
  const [stats, setStats] = useState<Stats | null>(null);
  const [referrers, setReferrers] = useState<Referrer[]>([]);
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [payouts, setPayouts] = useState<Payout[]>([]);
  const [settings, setSettings] = useState<AppSettings>({ base_price: 0, default_commission_pct: 20, default_discount_pct: 10, openai_api_key: "", openai_api_key_set: false });
  const [newOaiKey, setNewOaiKey] = useState("");
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState("");

  // New referrer form
  const [refForm, setRefForm] = useState({ phone: "", name: "", commission_pct: "" });
  const [refLoading, setRefLoading] = useState(false);

  const refresh = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const [s, r, reg, p, st] = await Promise.allSettled([
        api.get<Stats>("/api/admin/stats", token),
        api.get<Referrer[]>("/api/admin/referrers", token),
        api.get<Registration[]>("/api/admin/registrations", token),
        api.get<Payout[]>("/api/admin/payouts", token),
        api.get<AppSettings>("/api/admin/settings", token),
      ]);
      if (s.status === "fulfilled") setStats(s.value);
      if (r.status === "fulfilled") setReferrers(r.value);
      if (reg.status === "fulfilled") setRegistrations(reg.value);
      if (p.status === "fulfilled") setPayouts(p.value);
      if (st.status === "fulfilled") setSettings(st.value);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => { refresh(); }, [refresh]);

  const addReferrer = async (e: React.FormEvent) => {
    e.preventDefault();
    setRefLoading(true);
    setMsg("");
    try {
      await api.post("/api/admin/referrers", { ...refForm, commission_pct: Number(refForm.commission_pct) || settings.default_commission_pct }, token);
      setRefForm({ phone: "", name: "", commission_pct: "" });
      setMsg("✅ معرف با موفقیت افزوده شد");
      refresh();
    } catch (err: unknown) {
      setMsg(err instanceof Error ? `❌ ${err.message}` : "❌ خطا");
    } finally {
      setRefLoading(false);
    }
  };

  const updatePayout = async (id: string, status: string) => {
    try {
      await api.patch(`/api/admin/payouts/${id}`, { status }, token);
      refresh();
    } catch (err: unknown) {
      setMsg(err instanceof Error ? `❌ ${err.message}` : "❌ خطا");
    }
  };

  const saveSettings = async () => {
    try {
      const payload: Record<string, unknown> = {
        base_price: settings.base_price,
        default_commission_pct: settings.default_commission_pct,
        default_discount_pct: settings.default_discount_pct,
      };
      if (newOaiKey.trim()) payload.openai_api_key = newOaiKey.trim();
      await api.put("/api/admin/settings", payload, token);
      setNewOaiKey("");
      setMsg("✅ تنظیمات ذخیره شد");
      refresh();
    } catch (err: unknown) {
      setMsg(err instanceof Error ? `❌ ${err.message}` : "❌ خطا");
    }
  };

  const statusLabel: Record<string, string> = { pending: "در انتظار", paid: "پرداخت شده", approved: "تأیید شده", rejected: "رد شده", active: "فعال", inactive: "غیرفعال" };
  const statusColor: Record<string, string> = { pending: "text-amber-600 bg-amber-50 border-amber-100", paid: "text-emerald-700 bg-emerald-50 border-emerald-100", approved: "text-blue-700 bg-blue-50 border-blue-100", rejected: "text-red-600 bg-red-50 border-red-100", active: "text-emerald-700 bg-emerald-50 border-emerald-100", inactive: "text-slate-500 bg-slate-50 border-slate-100" };

  const tabs: { key: Tab; label: string; icon: React.ReactNode }[] = [
    { key: "stats", label: "آمار کلی", icon: <BarChart3 size={16} /> },
    { key: "referrers", label: "معرف‌ها", icon: <Users size={16} /> },
    { key: "registrations", label: "ثبت‌نام‌ها", icon: <FileText size={16} /> },
    { key: "payouts", label: "تسویه‌ها", icon: <DollarSign size={16} /> },
    { key: "settings", label: "تنظیمات", icon: <Settings size={16} /> },
  ];

  return (
    <div className="min-h-screen bg-slate-50" dir="rtl">
      <header className="bg-white border-b border-slate-100 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="font-black text-slate-900 text-lg">پنل ادمین — رتبه برتر</div>
          <div className="flex items-center gap-3">
            <button onClick={refresh} className="p-2 text-slate-400 hover:text-slate-700 transition cursor-pointer" title="رفرش">
              <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
            </button>
            <span className="text-sm text-slate-500 hidden sm:block">{user?.name || user?.phone}</span>
            <button onClick={logout} className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-red-600 font-bold transition cursor-pointer">
              <LogOut size={16} /> خروج
            </button>
          </div>
        </div>
      </header>

      {/* Tabs */}
      <div className="bg-white border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 flex gap-1 overflow-x-auto py-2">
          {tabs.map(t => (
            <button key={t.key} onClick={() => { setTab(t.key); setMsg(""); }}
              className={`flex items-center gap-2 px-4 py-2.5 text-sm font-bold rounded-xl whitespace-nowrap transition cursor-pointer ${tab === t.key ? "bg-slate-900 text-white" : "text-slate-500 hover:bg-slate-100"}`}>
              {t.icon}{t.label}
            </button>
          ))}
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {msg && <div className={`mb-6 p-4 rounded-2xl text-sm font-bold border ${msg.startsWith("✅") ? "bg-emerald-50 text-emerald-700 border-emerald-100" : "bg-red-50 text-red-700 border-red-100"}`}>{msg}</div>}

        {/* Stats */}
        {tab === "stats" && stats && (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: "کل معرف‌ها", value: stats.total_referrers, sub: `${stats.active_referrers} فعال` },
              { label: "کل ثبت‌نام‌ها", value: stats.total_registrations, sub: `${stats.paid_registrations} پرداخت شده` },
              { label: "درآمد کل", value: `${stats.revenue.toLocaleString()} ت`, sub: `کمیسیون: ${stats.commissions.toLocaleString()}` },
              { label: "تسویه در انتظار", value: stats.pending_payouts, sub: "درخواست" },
            ].map((s, i) => (
              <div key={i} className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
                <p className="text-xs text-slate-400 font-bold mb-1">{s.label}</p>
                <p className="text-3xl font-black text-slate-900 font-mono">{s.value}</p>
                <p className="text-xs text-slate-400 mt-1">{s.sub}</p>
              </div>
            ))}
          </div>
        )}

        {/* Referrers */}
        {tab === "referrers" && (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl border border-slate-100 p-6">
              <h2 className="font-black text-slate-900 mb-4 flex items-center gap-2"><Plus size={18} /> افزودن معرف</h2>
              <form onSubmit={addReferrer} className="flex flex-wrap gap-3">
                <input placeholder="شماره موبایل" value={refForm.phone} onChange={e => setRefForm({ ...refForm, phone: e.target.value })} required
                  className="flex-1 min-w-36 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-slate-800 font-mono" dir="ltr" />
                <input placeholder="نام معرف" value={refForm.name} onChange={e => setRefForm({ ...refForm, name: e.target.value })} required
                  className="flex-1 min-w-36 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-slate-800" />
                <input placeholder={`پورسانت % (پیش‌فرض: ${settings.default_commission_pct})`} value={refForm.commission_pct} onChange={e => setRefForm({ ...refForm, commission_pct: e.target.value })}
                  type="number" min={1} max={100}
                  className="w-40 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-slate-800" />
                <button type="submit" disabled={refLoading} className="bg-slate-900 text-white px-6 py-3 rounded-xl text-sm font-bold hover:bg-slate-800 transition cursor-pointer">
                  {refLoading ? "..." : "افزودن"}
                </button>
              </form>
            </div>
            <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead><tr className="border-b border-slate-100 text-slate-500 text-right bg-slate-50">
                    {["نام", "موبایل", "کد معرف", "پورسانت", "درآمد", "موجودی", "ثبت‌نام", "وضعیت"].map(h => (
                      <th key={h} className="px-4 py-3 font-bold">{h}</th>
                    ))}
                  </tr></thead>
                  <tbody>{referrers.map(r => (
                    <tr key={r.id} className="border-b border-slate-50 hover:bg-slate-50/50">
                      <td className="px-4 py-3 font-semibold">{r.name}</td>
                      <td className="px-4 py-3 font-mono text-slate-500">{r.phone}</td>
                      <td className="px-4 py-3 font-mono font-bold text-blue-700">{r.referral_code}</td>
                      <td className="px-4 py-3">{r.commission_pct}٪</td>
                      <td className="px-4 py-3 font-mono">{r.total_earnings?.toLocaleString()}</td>
                      <td className="px-4 py-3 font-mono">{r.available_balance?.toLocaleString()}</td>
                      <td className="px-4 py-3">{r.total_signups}</td>
                      <td className="px-4 py-3"><span className={`text-xs font-bold px-2 py-1 rounded-full border ${statusColor[r.status] || ""}`}>{statusLabel[r.status] || r.status}</span></td>
                    </tr>
                  ))}</tbody>
                </table>
                {referrers.length === 0 && <div className="text-center py-12 text-slate-400">هنوز معرفی ثبت نشده</div>}
              </div>
            </div>
          </div>
        )}

        {/* Registrations */}
        {tab === "registrations" && (
          <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead><tr className="border-b border-slate-100 text-slate-500 text-right bg-slate-50">
                  {["نام", "موبایل", "رشته", "رتبه", "کد معرف", "مبلغ", "کمیسیون", "وضعیت", "تاریخ"].map(h => (
                    <th key={h} className="px-4 py-3 font-bold">{h}</th>
                  ))}
                </tr></thead>
                <tbody>{registrations.map(r => (
                  <tr key={r.id} className="border-b border-slate-50 hover:bg-slate-50/50">
                    <td className="px-4 py-3 font-semibold">{r.name}</td>
                    <td className="px-4 py-3 font-mono text-slate-500">{r.phone}</td>
                    <td className="px-4 py-3">{r.field}</td>
                    <td className="px-4 py-3">{r.rank}</td>
                    <td className="px-4 py-3 font-mono">{r.referrer_code || "—"}</td>
                    <td className="px-4 py-3 font-mono">{r.paid_amount?.toLocaleString()}</td>
                    <td className="px-4 py-3 font-mono">{r.commission_amount?.toLocaleString()}</td>
                    <td className="px-4 py-3"><span className={`text-xs font-bold px-2 py-1 rounded-full border ${statusColor[r.status] || ""}`}>{statusLabel[r.status] || r.status}</span></td>
                    <td className="px-4 py-3 text-slate-400 text-xs">{new Date(r.created_at).toLocaleDateString("fa-IR")}</td>
                  </tr>
                ))}</tbody>
              </table>
              {registrations.length === 0 && <div className="text-center py-12 text-slate-400">هنوز ثبت‌نامی انجام نشده</div>}
            </div>
          </div>
        )}

        {/* Payouts */}
        {tab === "payouts" && (
          <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead><tr className="border-b border-slate-100 text-slate-500 text-right bg-slate-50">
                  {["معرف", "مبلغ", "شبا", "وضعیت", "تاریخ", "عملیات"].map(h => (
                    <th key={h} className="px-4 py-3 font-bold">{h}</th>
                  ))}
                </tr></thead>
                <tbody>{payouts.map(p => (
                  <tr key={p.id} className="border-b border-slate-50 hover:bg-slate-50/50">
                    <td className="px-4 py-3 font-semibold">{p.referrer_name}</td>
                    <td className="px-4 py-3 font-mono font-bold">{p.amount?.toLocaleString()} ت</td>
                    <td className="px-4 py-3 font-mono text-xs text-slate-500">{p.iban}</td>
                    <td className="px-4 py-3"><span className={`text-xs font-bold px-2 py-1 rounded-full border ${statusColor[p.status] || ""}`}>{statusLabel[p.status] || p.status}</span></td>
                    <td className="px-4 py-3 text-slate-400 text-xs">{new Date(p.created_at).toLocaleDateString("fa-IR")}</td>
                    <td className="px-4 py-3">
                      {p.status === "pending" && (
                        <div className="flex gap-2">
                          <button onClick={() => updatePayout(p.id, "approved")} className="text-xs px-3 py-1.5 bg-blue-50 text-blue-700 border border-blue-100 rounded-lg font-bold hover:bg-blue-100 transition cursor-pointer">تأیید</button>
                          <button onClick={() => updatePayout(p.id, "rejected")} className="text-xs px-3 py-1.5 bg-red-50 text-red-700 border border-red-100 rounded-lg font-bold hover:bg-red-100 transition cursor-pointer">رد</button>
                        </div>
                      )}
                      {p.status === "approved" && (
                        <button onClick={() => updatePayout(p.id, "paid")} className="text-xs px-3 py-1.5 bg-emerald-50 text-emerald-700 border border-emerald-100 rounded-lg font-bold hover:bg-emerald-100 transition cursor-pointer">پرداخت شد</button>
                      )}
                    </td>
                  </tr>
                ))}</tbody>
              </table>
              {payouts.length === 0 && <div className="text-center py-12 text-slate-400">هنوز درخواست تسویه‌ای ندارید</div>}
            </div>
          </div>
        )}

        {/* Settings */}
        {tab === "settings" && (
          <div className="max-w-xl space-y-6">
            <div className="bg-white rounded-2xl border border-slate-100 p-6 space-y-4">
              <h2 className="font-black text-slate-900">تنظیمات کلی</h2>
              {[
                { label: "قیمت پایه (تومان)", key: "base_price" },
                { label: "درصد پورسانت پیش‌فرض", key: "default_commission_pct" },
                { label: "درصد تخفیف پیش‌فرض", key: "default_discount_pct" },
              ].map(({ label, key }) => (
                <div key={key}>
                  <label className="block text-xs font-bold text-slate-600 mb-1.5">{label}</label>
                  <input type="number" value={settings[key as keyof AppSettings] as number}
                    onChange={e => setSettings({ ...settings, [key]: Number(e.target.value) })}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-slate-800 font-mono" dir="ltr" />
                </div>
              ))}
              <button onClick={saveSettings} className="w-full bg-slate-900 text-white py-3 rounded-xl font-bold hover:bg-slate-800 transition cursor-pointer">
                ذخیره تنظیمات
              </button>
            </div>

            <div className="bg-white rounded-2xl border border-slate-100 p-6 space-y-4">
              <div className="flex items-center gap-3">
                <h2 className="font-black text-slate-900">کلید OpenAI</h2>
                <span className={`text-xs font-bold px-2 py-1 rounded-full border ${settings.openai_api_key_set ? "bg-emerald-50 text-emerald-700 border-emerald-100" : "bg-amber-50 text-amber-700 border-amber-100"}`}>
                  {settings.openai_api_key_set ? "✓ فعال" : "تنظیم نشده"}
                </span>
              </div>
              <p className="text-xs text-slate-500 leading-relaxed">
                برای استودیو محتوا و سامانه ترنم مهر (مشاور AI)، کلید OpenAI یا Gemini وارد کنید.
                از <a href="https://platform.openai.com/api-keys" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">platform.openai.com</a> دریافت کنید.
              </p>
              <div className="flex gap-3">
                <input type="password" placeholder={settings.openai_api_key_set ? "کلید فعلی پنهان است — برای تغییر وارد کنید" : "sk-..."} value={newOaiKey}
                  onChange={e => setNewOaiKey(e.target.value)}
                  className="flex-1 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-slate-800 font-mono" dir="ltr" />
                <button onClick={async () => {
                  if (!newOaiKey.trim()) return;
                  try {
                    await api.put("/api/admin/settings", { openai_api_key: newOaiKey.trim() }, token);
                    setNewOaiKey("");
                    setMsg("✅ کلید OpenAI ذخیره شد");
                    refresh();
                  } catch (e: unknown) { setMsg(e instanceof Error ? `❌ ${e.message}` : "❌ خطا"); }
                }} className="bg-emerald-600 text-white px-5 py-3 rounded-xl font-bold hover:bg-emerald-700 transition cursor-pointer whitespace-nowrap">
                  ذخیره کلید
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
