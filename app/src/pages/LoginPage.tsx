import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../lib/auth-context";
import { GraduationCap, Phone, Lock, ShieldCheck, UserCheck, ArrowRight } from "lucide-react";

export default function LoginPage() {
  const { sendOtp, login, user } = useAuth();
  const navigate = useNavigate();
  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [devOtp, setDevOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (user) {
    navigate(user.role === "admin" ? "/admin" : user.role === "referrer" ? "/dashboard" : "/");
  }

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await sendOtp(phone);
      setDevOtp(res.dev_otp || "");
      setOtpSent(true);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "خطا در ارسال کد");
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(phone, code);
      navigate("/");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "کد نادرست است");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-xl overflow-hidden border border-slate-100">
        <div className="bg-gradient-to-tr from-slate-900 to-slate-800 p-8 text-center text-white relative overflow-hidden">
          <div className="absolute -top-10 -right-10 text-white/5"><GraduationCap size={180} /></div>
          <div className="mx-auto w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center mb-4 border border-white/20">
            <GraduationCap size={36} className="text-amber-400" />
          </div>
          <h1 className="text-2xl font-black mb-1">رتبه برتر</h1>
          <p className="text-slate-300/80 text-sm">ورود با کد یکبارمصرف</p>
        </div>

        <div className="p-8">
          {error && (
            <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-xl text-sm font-bold border border-red-100">
              {error}
            </div>
          )}

          {!otpSent ? (
            <form onSubmit={handleSendOtp} className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">شماره تلفن همراه</label>
                <div className="relative">
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-slate-400">
                    <Phone size={18} />
                  </div>
                  <input
                    type="tel" required maxLength={11} placeholder="09123456789"
                    value={phone} onChange={(e) => setPhone(e.target.value.replace(/\D/g, ""))}
                    className="w-full pl-3 pr-10 py-3 bg-slate-50 border border-slate-200 rounded-xl text-left focus:outline-none focus:ring-2 focus:ring-slate-800 font-mono tracking-widest text-slate-800 transition"
                    dir="ltr"
                  />
                </div>
              </div>
              <button type="submit" disabled={loading}
                className="w-full bg-slate-900 text-white py-3.5 rounded-xl font-bold hover:bg-slate-800 transition shadow-md flex items-center justify-center gap-2 cursor-pointer">
                {loading ? <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <><ShieldCheck size={18} /><span>ارسال کد تأیید</span></>}
              </button>
            </form>
          ) : (
            <form onSubmit={handleVerify} className="space-y-5">
              <div className="p-4 bg-amber-50 rounded-2xl border border-amber-100 text-sm text-amber-900">
                <p>کد به <strong className="font-mono">{phone}</strong> ارسال شد.</p>
                {devOtp && <p className="mt-1">کد آزمایشی: <strong className="font-mono text-amber-700">{devOtp}</strong></p>}
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">کد تأیید</label>
                <div className="relative">
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-slate-400">
                    <Lock size={18} />
                  </div>
                  <input
                    type="text" required maxLength={6} placeholder="کد ۵ رقمی"
                    value={code} onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
                    className="w-full pl-3 pr-10 py-3 bg-slate-50 border border-slate-200 rounded-xl text-center focus:outline-none focus:ring-2 focus:ring-slate-800 font-mono tracking-widest text-slate-800 text-lg transition"
                  />
                </div>
                <button type="button" onClick={() => setOtpSent(false)} className="text-xs text-slate-500 hover:text-slate-700 mt-2 cursor-pointer">تغییر شماره</button>
              </div>
              <button type="submit" disabled={loading}
                className="w-full bg-slate-900 text-white py-3.5 rounded-xl font-bold hover:bg-slate-800 transition shadow-md flex items-center justify-center gap-2 cursor-pointer">
                {loading ? <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <><UserCheck size={18} /><span>ورود به سامانه</span></>}
              </button>
            </form>
          )}

          <div className="mt-6 pt-5 border-t border-slate-100 text-center">
            <Link to="/" className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-800 font-bold">
              <ArrowRight size={14} /> بازگشت به صفحه اصلی
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
