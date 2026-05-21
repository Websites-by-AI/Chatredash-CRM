import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { api } from "../lib/api";

interface ReferrerInfo { valid: boolean; name: string; referral_code: string; discount_pct: number; base_price: number; }

export default function ReferrerLanding() {
  const { code } = useParams<{ code: string }>();
  const [info, setInfo] = useState<ReferrerInfo | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get<ReferrerInfo>(`/api/public/referrer/${code}`)
      .then(setInfo).catch(() => setInfo(null)).finally(() => setLoading(false));
  }, [code]);

  if (loading) return <div className="min-h-screen flex items-center justify-center text-slate-500">در حال بارگذاری...</div>;
  if (!info) return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 text-center">
      <div className="text-5xl mb-4">❌</div>
      <h2 className="text-xl font-black text-slate-900 mb-3">کد معرف نامعتبر</h2>
      <p className="text-slate-500 text-sm mb-6">این کد معرف وجود ندارد یا منقضی شده است.</p>
      <Link to="/" className="bg-slate-900 text-white px-6 py-3 rounded-xl font-bold hover:bg-slate-800 transition">بازگشت به خانه</Link>
    </div>
  );

  const discount = Math.round(info.base_price * info.discount_pct / 100);
  const finalPrice = info.base_price - discount;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center p-4">
      <div className="max-w-lg w-full bg-white rounded-3xl shadow-2xl overflow-hidden">
        <div className="bg-gradient-to-tr from-amber-400 to-yellow-300 p-8 text-slate-900 text-center">
          <div className="text-5xl mb-3">🏆</div>
          <h1 className="text-2xl font-black mb-1">دعوت ویژه</h1>
          <p className="font-bold text-slate-700">{info.name} شما را دعوت کرده</p>
        </div>
        <div className="p-8 space-y-6">
          <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200 space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">قیمت پایه:</span>
              <span className="font-bold font-mono">{info.base_price.toLocaleString()} تومان</span>
            </div>
            <div className="flex justify-between text-sm text-emerald-700">
              <span>تخفیف ویژه ({info.discount_pct}٪):</span>
              <span className="font-bold font-mono">-{discount.toLocaleString()} تومان</span>
            </div>
            <div className="flex justify-between pt-3 border-t border-slate-200 font-black text-lg">
              <span>قابل پرداخت:</span>
              <span className="font-mono">{finalPrice.toLocaleString()} تومان</span>
            </div>
          </div>
          <Link to={`/register?ref=${info.referral_code}`}
            className="block w-full bg-slate-900 text-white py-4 rounded-2xl font-black text-center text-base hover:bg-slate-800 transition shadow-lg">
            ثبت‌نام با تخفیف {info.discount_pct}٪
          </Link>
          <Link to="/" className="block text-center text-sm text-slate-400 hover:text-slate-600 transition">درباره رتبه برتر</Link>
        </div>
      </div>
    </div>
  );
}
