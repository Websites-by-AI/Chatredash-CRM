import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { api, formatToman } from '../lib/api';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { CheckCircle2, CreditCard, Loader2 } from 'lucide-react';
import Header from '../components/Header';
import { toast } from 'sonner';

export default function Pay() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [paid, setPaid] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [reg, setReg] = useState(null);

  useEffect(() => {
    // we'll fetch summary by hitting pay endpoint only on user action; for display, get from admin? — instead use minimal info from URL state.
    // We'll fetch via a lightweight request: call pay endpoint after click.
  }, []);

  const handlePay = async () => {
    setProcessing(true);
    try {
      // simulate delay
      await new Promise(r => setTimeout(r, 1200));
      const res = await api.post(`/public/pay/${id}`);
      setReg(res.data.registration);
      setPaid(true);
      toast.success('پرداخت با موفقیت انجام شد');
    } catch (e) {
      toast.error(e.response?.data?.detail || 'خطا در پرداخت');
    } finally { setProcessing(false); }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Header />
      <div className="max-w-xl mx-auto px-6 py-16">
        <Card className="p-8 border-slate-200" data-testid="pay-card">
          {!paid ? (
            <>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-md bg-slate-900 flex items-center justify-center">
                  <CreditCard className="w-5 h-5 text-amber-400" />
                </div>
                <div>
                  <h1 className="text-xl font-black text-slate-900">پرداخت ثبت‌نام</h1>
                  <p className="text-xs text-slate-500">حالت آزمایشی — درگاه پرداخت شبیه‌سازی شده</p>
                </div>
              </div>

              <div className="bg-slate-50 rounded-md p-5 border border-slate-200 mb-6 space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-500">شناسه ثبت‌نام</span>
                  <span className="num font-bold text-xs text-slate-700">{id?.slice(0, 8)}...</span>
                </div>
              </div>

              <Button onClick={handlePay} disabled={processing} size="lg" className="w-full bg-amber-500 hover:bg-amber-600 text-slate-900 font-bold" data-testid="pay-confirm-btn">
                {processing ? <><Loader2 className="w-4 h-4 ms-2 animate-spin" /> در حال پردازش...</> : 'تأیید و پرداخت'}
              </Button>
              <p className="text-[11px] text-slate-500 text-center mt-3">با کلیک روی دکمه، پرداخت در حالت آزمایشی انجام می‌شود.</p>
            </>
          ) : (
            <div className="text-center" data-testid="pay-success">
              <div className="w-14 h-14 mx-auto rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center mb-4">
                <CheckCircle2 className="w-7 h-7 text-emerald-600" />
              </div>
              <h1 className="text-2xl font-black text-slate-900 tracking-tight">پرداخت موفق</h1>
              <p className="text-slate-500 text-sm mt-2 leading-relaxed">
                ثبت‌نام شما در طرح ملی رزومه‌سازی رتبه‌های برتر ثبت شد.<br />
                به‌زودی با شما تماس گرفته می‌شود.
              </p>
              {reg && (
                <div className="bg-slate-50 rounded-md p-4 mt-5 text-sm border border-slate-200 text-right space-y-1">
                  <div className="flex justify-between"><span className="text-slate-500">نام</span><span className="font-bold">{reg.name}</span></div>
                  <div className="flex justify-between"><span className="text-slate-500">آزمون</span><span>{reg.exam}</span></div>
                  <div className="flex justify-between"><span className="text-slate-500">مبلغ پرداختی</span><span className="num font-bold text-emerald-700">{formatToman(reg.paid_amount)}</span></div>
                </div>
              )}
              <Button onClick={() => navigate('/')} className="mt-6 bg-slate-900 hover:bg-slate-800" data-testid="pay-home-btn">بازگشت به صفحه اصلی</Button>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
