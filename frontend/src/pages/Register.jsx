import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { api, formatToman } from '../lib/api';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card } from '../components/ui/card';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '../components/ui/select';
import { toast } from 'sonner';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { CheckCircle2, Sparkles, Tag } from 'lucide-react';

const exams = ['کنکور سراسری', 'ارشد', 'دکتری', 'وکالت', 'سایر'];

export default function Register() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [field, setField] = useState('');
  const [exam, setExam] = useState('');
  const [rank, setRank] = useState('');
  const [refInfo, setRefInfo] = useState(null);
  const [settings, setSettings] = useState({ base_price: 1000000, default_discount_pct: 10 });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const code = params.get('ref') || localStorage.getItem('rb_ref');
    api.get('/public/settings').then(r => setSettings(r.data));
    if (code) {
      api.get(`/public/referrer/${code}`)
        .then(r => { setRefInfo(r.data); localStorage.setItem('rb_ref', code); })
        .catch(() => { setRefInfo(null); localStorage.removeItem('rb_ref'); });
    }
  }, [params]);

  const submit = async () => {
    if (!name || !phone || !field || !exam || !rank) {
      toast.error('لطفاً همه فیلدها را پر کنید');
      return;
    }
    try {
      setLoading(true);
      const r = await api.post('/public/register', {
        name, phone, field, exam, rank,
        referrer_code: refInfo?.referral_code || null,
      });
      localStorage.removeItem('rb_ref');
      navigate(`/pay/${r.data.id}`);
    } catch (e) {
      toast.error(e.response?.data?.detail || 'خطا در ثبت‌نام');
    } finally { setLoading(false); }
  };

  const discountAmount = refInfo
    ? Math.round(settings.base_price * settings.default_discount_pct / 100)
    : 0;
  const finalAmount = settings.base_price - discountAmount;

  return (
    <div className="min-h-screen bg-slate-50">
      <Header />
      <div className="max-w-4xl mx-auto px-6 py-12">
        {refInfo && (
          <div className="bg-gradient-to-l from-amber-500 to-amber-400 text-slate-900 rounded-md p-5 mb-6 flex items-start gap-4 fade-up" data-testid="discount-banner">
            <Sparkles className="w-6 h-6 mt-0.5" />
            <div>
              <div className="font-black text-lg">تبریک! ۱۰٪ تخفیف دعوت برای شما فعال شد.</div>
              <div className="text-sm mt-1">شما با لینک دعوت {refInfo.name && <span className="font-bold">«{refInfo.name}»</span>} وارد شده‌اید.</div>
            </div>
          </div>
        )}

        <div className="grid lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2 p-8 border-slate-200">
            <h1 className="text-2xl font-black text-slate-900 tracking-tight mb-1">فرم ثبت‌نام رتبه‌های برتر</h1>
            <p className="text-sm text-slate-500 mb-6">اطلاعات زیر را با دقت تکمیل کنید.</p>

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name" className="mb-2 block">نام و نام خانوادگی</Label>
                <Input id="name" value={name} onChange={(e) => setName(e.target.value)} data-testid="reg-name-input" />
              </div>
              <div>
                <Label htmlFor="phone" className="mb-2 block">شماره موبایل</Label>
                <Input id="phone" value={phone} onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))} className="num text-left" dir="ltr" data-testid="reg-phone-input" />
              </div>
              <div>
                <Label htmlFor="field" className="mb-2 block">رشته</Label>
                <Input id="field" placeholder="مثلاً حقوق" value={field} onChange={(e) => setField(e.target.value)} data-testid="reg-field-input" />
              </div>
              <div>
                <Label className="mb-2 block">آزمون</Label>
                <Select value={exam} onValueChange={setExam}>
                  <SelectTrigger data-testid="reg-exam-select"><SelectValue placeholder="انتخاب کنید" /></SelectTrigger>
                  <SelectContent>
                    {exams.map(e => <SelectItem key={e} value={e}>{e}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="sm:col-span-2">
                <Label htmlFor="rank" className="mb-2 block">رتبه</Label>
                <Input id="rank" placeholder="مثلاً ۳" value={rank} onChange={(e) => setRank(e.target.value)} className="num text-left" dir="ltr" data-testid="reg-rank-input" />
              </div>
            </div>

            <Button onClick={submit} disabled={loading} size="lg" className="w-full mt-6 bg-amber-500 hover:bg-amber-600 text-slate-900 font-bold" data-testid="reg-submit-btn">
              {loading ? 'در حال ثبت...' : 'ادامه به مرحله پرداخت'}
            </Button>
            <p className="text-[11px] text-slate-500 text-center mt-3 leading-relaxed">
              برخی لینک‌های دعوت ممکن است شامل پاداش معرفی برای معرف باشند.
            </p>
          </Card>

          <Card className="p-6 h-fit border-slate-200 bg-slate-900 text-white">
            <div className="text-amber-400 text-sm font-bold mb-4 flex items-center gap-2">
              <Tag className="w-4 h-4" /> خلاصه پرداخت
            </div>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-400">قیمت اصلی</span>
                <span className="num font-bold">{formatToman(settings.base_price)}</span>
              </div>
              {refInfo && (
                <div className="flex justify-between text-amber-400">
                  <span>تخفیف دعوت ({settings.default_discount_pct}٪)</span>
                  <span className="num font-bold">- {formatToman(discountAmount)}</span>
                </div>
              )}
              <div className="border-t border-white/10 pt-3 flex justify-between text-lg">
                <span>مبلغ نهایی</span>
                <span className="num font-black text-amber-400">{formatToman(finalAmount)}</span>
              </div>
            </div>
            <ul className="mt-6 space-y-2 text-xs text-slate-300">
              <li className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-amber-400" /> مصاحبه نیم‌ساعته با تیم</li>
              <li className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-amber-400" /> ساخت سایت تک‌صفحه‌ای AI</li>
              <li className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-amber-400" /> رزومه حرفه‌ای آکادمیک</li>
              <li className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-amber-400" /> دسترسی به پلتفرم همکاری</li>
            </ul>
          </Card>
        </div>
      </div>
      <Footer />
    </div>
  );
}
