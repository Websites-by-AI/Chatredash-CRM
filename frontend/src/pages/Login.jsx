import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api, setToken, setUser } from '../lib/api';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card } from '../components/ui/card';
import { toast } from 'sonner';
import Header from '../components/Header';
import { ShieldCheck, Phone } from 'lucide-react';

export default function Login() {
  const [phone, setPhone] = useState('');
  const [code, setCode] = useState('');
  const [step, setStep] = useState(1);
  const [devOtp, setDevOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const sendOtp = async () => {
    if (!phone || phone.length < 10) {
      toast.error('شماره موبایل را به‌درستی وارد کنید');
      return;
    }
    try {
      setLoading(true);
      const r = await api.post('/auth/send-otp', { phone });
      setDevOtp(r.data.dev_otp || '');
      setStep(2);
      toast.success('کد یک‌بار مصرف ارسال شد (حالت آزمایشی)');
    } catch (e) {
      toast.error(e.response?.data?.detail || 'خطا در ارسال کد');
    } finally { setLoading(false); }
  };

  const verifyOtp = async () => {
    try {
      setLoading(true);
      const r = await api.post('/auth/verify-otp', { phone, code });
      setToken(r.data.token);
      setUser(r.data.user);
      toast.success('ورود موفق');
      if (r.data.user.role === 'admin') navigate('/admin');
      else navigate('/dashboard');
    } catch (e) {
      toast.error(e.response?.data?.detail || 'کد نامعتبر');
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Header />
      <div className="max-w-md mx-auto px-6 py-16">
        <Card className="p-8 border-slate-200" data-testid="login-card">
          <div className="flex flex-col items-center text-center mb-6">
            <div className="w-12 h-12 rounded-md bg-slate-900 flex items-center justify-center mb-3">
              <ShieldCheck className="w-6 h-6 text-amber-400" />
            </div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">ورود به پنل کاربری</h1>
            <p className="text-sm text-slate-500 mt-1">با شماره موبایل خود وارد شوید</p>
          </div>

          {step === 1 ? (
            <div className="space-y-4">
              <div>
                <Label htmlFor="phone" className="mb-2 block">شماره موبایل</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <Input
                    id="phone"
                    placeholder="09120000000"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                    className="num text-left"
                    dir="ltr"
                    data-testid="login-phone-input"
                  />
                </div>
              </div>
              <Button onClick={sendOtp} disabled={loading} className="w-full bg-amber-500 hover:bg-amber-600 text-slate-900 font-bold" data-testid="login-send-otp-btn">
                {loading ? 'در حال ارسال...' : 'ارسال کد یک‌بار مصرف'}
              </Button>
              <p className="text-xs text-slate-500 leading-relaxed mt-3">
                نسخه آزمایشی: کد در همین صفحه نمایش داده می‌شود.<br />
                مدیر سیستم: <span className="num">09120000000</span>
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {devOtp && (
                <div className="bg-amber-50 border border-amber-200 rounded-md px-4 py-3 text-sm text-amber-900" data-testid="dev-otp-banner">
                  کد آزمایشی: <span className="font-black num">{devOtp}</span>
                </div>
              )}
              <div>
                <Label htmlFor="code" className="mb-2 block">کد ۵ رقمی</Label>
                <Input
                  id="code"
                  placeholder="-----"
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
                  maxLength={5}
                  className="num text-center tracking-[0.5em] text-lg"
                  dir="ltr"
                  data-testid="login-otp-input"
                />
              </div>
              <Button onClick={verifyOtp} disabled={loading} className="w-full bg-slate-900 hover:bg-slate-800" data-testid="login-verify-btn">
                {loading ? 'در حال بررسی...' : 'تأیید و ورود'}
              </Button>
              <button onClick={() => setStep(1)} className="w-full text-xs text-slate-500 hover:text-slate-900 transition" data-testid="login-back-btn">
                تغییر شماره موبایل
              </button>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
