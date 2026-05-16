import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../lib/api';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Sparkles, AlertTriangle } from 'lucide-react';

export default function ReferralLanding() {
  const { code } = useParams();
  const navigate = useNavigate();
  const [info, setInfo] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    api.get(`/public/referrer/${code}`)
      .then(r => {
        setInfo(r.data);
        localStorage.setItem('rb_ref', r.data.referral_code);
        setTimeout(() => navigate(`/register?ref=${r.data.referral_code}`), 1500);
      })
      .catch(() => setError('کد معرف معتبر نیست یا غیرفعال شده است.'));
  }, [code, navigate]);

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center px-6">
      <Card className="max-w-md w-full p-8 text-center bg-slate-800 border-slate-700 text-white" data-testid="referral-landing-card">
        {error ? (
          <>
            <div className="w-12 h-12 mx-auto rounded-md bg-red-500/20 flex items-center justify-center mb-4">
              <AlertTriangle className="w-6 h-6 text-red-400" />
            </div>
            <h1 className="text-xl font-black mb-2">لینک نامعتبر</h1>
            <p className="text-slate-400 text-sm">{error}</p>
            <Button onClick={() => navigate('/')} className="mt-6 bg-amber-500 text-slate-900 hover:bg-amber-600">
              بازگشت به صفحه اصلی
            </Button>
          </>
        ) : info ? (
          <>
            <div className="w-12 h-12 mx-auto rounded-md bg-amber-500/20 flex items-center justify-center mb-4">
              <Sparkles className="w-6 h-6 text-amber-400" />
            </div>
            <h1 className="text-xl font-black mb-2">تبریک!</h1>
            <p className="text-slate-300 text-sm leading-relaxed">
              شما با لینک دعوت {info.name && <span className="font-bold text-amber-400">«{info.name}»</span>} وارد شده‌اید.
              <br />
              ۱۰٪ تخفیف برای شما فعال شد.
            </p>
            <p className="text-slate-500 text-xs mt-4">در حال انتقال به فرم ثبت‌نام...</p>
          </>
        ) : (
          <p className="text-slate-400 text-sm">در حال بررسی لینک دعوت...</p>
        )}
      </Card>
    </div>
  );
}
