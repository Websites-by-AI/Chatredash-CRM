import { useEffect, useState } from "react";
import { useAuth } from "../lib/auth-context";
import { api } from "../lib/api";
import { Link } from "react-router-dom";
import { LogOut, Copy, TrendingUp, DollarSign, Users, Clock, Plus, CheckCircle } from "lucide-react";

interface ReferrerInfo {
  id: string; name: string; referral_code: string; commission_pct: number;
  total_earnings: number; available_balance: number; total_signups: number; iban: string; status: string;
}
interface RegItem { id: string; name: string; phone: string; status: string; paid_amount: number; created_at: string; }
interface PayoutItem { id: string; amount: number; status: string; iban: string; created_at: string; }

export default function DashboardPage() {
  const { user, token, logout } = useAuth();
  const [ref, setRef] = useState<ReferrerInfo | null>(null);
  const [regs, setRegs] = useState<RegItem[]>([]);
  const [payouts, setPayouts] = useState<PayoutItem[]>([]);
  const [payoutForm, setPayoutForm] = useState({ amount: "", iban: "" });
  const [copied, setCopied] = useState(false);
  const [payoutLoading, setPayoutLoading] = useState(false);
  const [payoutMsg, setPayoutMsg] = useState("");

  useEffect(() => {
    if (!token) return;
    api.get<ReferrerInfo>("/api/referrer/me", token).then(setRef).catch(() => {});
    api.get<RegItem[]>("/api/referrer/registrations", token).then(setRegs).catch(() => {});
    api.get<PayoutItem[]>("/api/referrer/payouts", token).then(setPayouts).catch(() => {});
  }, [token]);

  const copyLink = () => {
    if (!ref) return;
    navigator.clipboard.writeText(`${window.location.origin}/r/${ref.referral_code}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePayout = async (e: React.FormEvent) => {
    e.preventDefault();
    setPayoutLoading(true);
    setPayoutMsg("");
    try {
      await api.post("/api/referrer/payout", { amount: Number(payoutForm.amount), iban: payoutForm.iban }, token);
      setPayoutMsg("درخواست تسویه ثبت شد");
      setPayoutForm({ amount: "", iban: "" });
      const updated = await api.get<ReferrerInfo>("/api/referrer/me", token);
      setRef(updated);
      const updatedPayouts = await api.get<PayoutItem[]>("/api/referrer/payouts", token);
      setPayouts(updatedPayouts);
    } catch (err: unknown) {
      setPayoutMsg(err instanceof Error ? err.message : "خطا در ثبت درخواست");
    } finally {
      setPayoutLoading(false);
    }
  };

  const statusLabel: Record<string, string> = { pending: "در انتظار", paid: "پرداخت شده", approved: "تأیید شده", rejected: "رد شده" };
  const statusColor: Record<string, string> = { pending: "text-amber-600 bg-amber-50 border-amber-100", paid: "text-emerald-700 bg-emerald-50 border-emerald-100", approved: "text-blue-700 bg-blue-50 border-blue-100", rejected: "text-red-600 bg-red-50 border-red-100" };

  return (
    <div className="min-h-screen bg-slate-50" dir="rtl">
      <header className="bg-white border-b border-slate-100 sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="font-black text-slate-900 text-lg">پنل معرف — رتبه برتر</div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-slate-500 hidden sm:block">{user?.name || user?.phone}</span>
            <button onClick={logout} className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-red-600 font-bold transition cursor-pointer">
              <LogOut size={16} /> خروج
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8 space-y-8">
        {/* Stats */}
        {ref && (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: "کل درآمد", value: `${ref.total_earnings.toLocaleString()} ت`, icon: <DollarSign size={20} className="text-emerald-600" />, bg: "bg-emerald-50" },
              { label: "موجودی قابل برداشت", value: `${ref.available_balance.toLocaleString()} ت`, icon: <TrendingUp size={20} className="text-blue-600" />, bg: "bg-blue-50" },
              { label: "تعداد ثبت‌نام", value: ref.total_signups, icon: <Users size={20} className="text-purple-600" />, bg: "bg-purple-50" },
              { label: "پورسانت شما", value: `${ref.commission_pct}٪`, icon: <CheckCircle size={20} className="text-amber-600" />, bg: "bg-amber-50" },
            ].map((s, i) => (
              <div key={i} className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm flex items-center gap-4">
                <div className={`w-12 h-12 ${s.bg} rounded-xl flex items-center justify-center`}>{s.icon}</div>
                <div>
                  <p className="text-xs text-slate-400 font-bold">{s.label}</p>
                  <p className="text-xl font-black text-slate-900 font-mono">{s.value}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Referral Link */}
        {ref && (
          <div className="bg-white rounded-2xl border border-slate-100 p-6">
            <h2 className="font-black text-slate-900 mb-4">لینک اختصاصی معرف شما</h2>
            <div className="flex gap-3 items-center">
              <div className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-mono text-slate-700 overflow-hidden text-ellipsis whitespace-nowrap" dir="ltr">
                {window.location.origin}/r/{ref.referral_code}
              </div>
              <button onClick={copyLink} className={`flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-bold transition cursor-pointer border ${copied ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-slate-900 text-white border-transparent hover:bg-slate-800"}`}>
                <Copy size={15} /> {copied ? "کپی شد!" : "کپی"}
              </button>
            </div>
          </div>
        )}

        {/* Payout Request */}
        {ref && (
          <div className="bg-white rounded-2xl border border-slate-100 p-6">
            <h2 className="font-black text-slate-900 mb-4 flex items-center gap-2">
              <Plus size={18} /> درخواست تسویه
            </h2>
            {payoutMsg && <div className={`mb-4 p-3 rounded-xl text-sm font-bold border ${payoutMsg.includes("ثبت") ? "bg-emerald-50 text-emerald-700 border-emerald-100" : "bg-red-50 text-red-700 border-red-100"}`}>{payoutMsg}</div>}
            <form onSubmit={handlePayout} className="flex flex-col sm:flex-row gap-3">
              <input type="number" placeholder={`مبلغ (موجودی: ${ref.available_balance.toLocaleString()})`}
                value={payoutForm.amount} onChange={(e) => setPayoutForm({ ...payoutForm, amount: e.target.value })}
                min={1} max={ref.available_balance} required
                className="flex-1 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-slate-800" />
              <input type="text" placeholder="شماره شبا (IR...)" value={payoutForm.iban || ref.iban}
                onChange={(e) => setPayoutForm({ ...payoutForm, iban: e.target.value })} required
                className="flex-1 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-mono focus:outline-none focus:ring-2 focus:ring-slate-800" dir="ltr" />
              <button type="submit" disabled={payoutLoading}
                className="bg-slate-900 text-white px-6 py-3 rounded-xl text-sm font-bold hover:bg-slate-800 transition cursor-pointer whitespace-nowrap">
                {payoutLoading ? "..." : "ثبت درخواست"}
              </button>
            </form>
          </div>
        )}

        {/* Registrations */}
        <div className="bg-white rounded-2xl border border-slate-100 p-6">
          <h2 className="font-black text-slate-900 mb-4 flex items-center gap-2"><Users size={18} /> ثبت‌نام‌های شما</h2>
          {regs.length === 0 ? (
            <div className="text-center py-10 text-slate-400">هنوز ثبت‌نامی از طریق کد شما انجام نشده</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead><tr className="border-b border-slate-100 text-slate-500 text-right">
                  <th className="pb-3 font-bold">نام</th><th className="pb-3 font-bold">موبایل</th>
                  <th className="pb-3 font-bold">مبلغ</th><th className="pb-3 font-bold">وضعیت</th>
                  <th className="pb-3 font-bold">تاریخ</th>
                </tr></thead>
                <tbody>{regs.map((r) => (
                  <tr key={r.id} className="border-b border-slate-50 hover:bg-slate-50/50">
                    <td className="py-3 font-semibold">{r.name}</td>
                    <td className="py-3 font-mono text-slate-500">{r.phone}</td>
                    <td className="py-3 font-mono">{r.paid_amount?.toLocaleString()} ت</td>
                    <td className="py-3"><span className={`text-xs font-bold px-2 py-1 rounded-full border ${statusColor[r.status] || "bg-slate-50 text-slate-500 border-slate-100"}`}>{statusLabel[r.status] || r.status}</span></td>
                    <td className="py-3 text-slate-400 text-xs">{new Date(r.created_at).toLocaleDateString("fa-IR")}</td>
                  </tr>
                ))}</tbody>
              </table>
            </div>
          )}
        </div>

        {/* Payouts */}
        <div className="bg-white rounded-2xl border border-slate-100 p-6">
          <h2 className="font-black text-slate-900 mb-4 flex items-center gap-2"><Clock size={18} /> تاریخچه تسویه</h2>
          {payouts.length === 0 ? (
            <div className="text-center py-10 text-slate-400">هنوز درخواست تسویه‌ای ندارید</div>
          ) : (
            <div className="space-y-3">
              {payouts.map((p) => (
                <div key={p.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100">
                  <div><p className="font-bold text-slate-900 font-mono">{p.amount.toLocaleString()} تومان</p><p className="text-xs text-slate-400 font-mono mt-0.5">{p.iban}</p></div>
                  <span className={`text-xs font-bold px-2 py-1 rounded-full border ${statusColor[p.status] || "bg-slate-50 text-slate-500 border-slate-100"}`}>{statusLabel[p.status] || p.status}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="text-center">
          <Link to="/edu" className="inline-flex items-center gap-2 text-sm text-blue-700 font-bold hover:text-blue-900 transition">
            ورود به سامانه آموزشی ترنم مهر →
          </Link>
        </div>
      </main>
    </div>
  );
}
