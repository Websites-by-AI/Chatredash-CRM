import React, { useEffect, useState } from 'react';
import { api, formatToman, getUser } from '../lib/api';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Badge } from '../components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../components/ui/tabs';
import { Table, TableHead, TableHeader, TableRow, TableCell, TableBody } from '../components/ui/table';
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../components/ui/dialog';
import { toast } from 'sonner';
import { UserPlus, Users, FileText, Wallet, Settings as SettingsIcon, Copy, Power, Activity } from 'lucide-react';
import SystemTests from './SystemTests';
import SourceSnapshots from '../components/SourceSnapshots';

const StatusBadge = ({ s }) => {
  const map = {
    pending: { t: 'در انتظار', c: 'bg-amber-100 text-amber-800 border-amber-200' },
    approved: { t: 'تأیید شده', c: 'bg-blue-100 text-blue-800 border-blue-200' },
    paid: { t: 'پرداخت شده', c: 'bg-emerald-100 text-emerald-800 border-emerald-200' },
    rejected: { t: 'رد شده', c: 'bg-red-100 text-red-800 border-red-200' },
    active: { t: 'فعال', c: 'bg-emerald-100 text-emerald-800 border-emerald-200' },
    inactive: { t: 'غیرفعال', c: 'bg-slate-100 text-slate-800 border-slate-200' },
  };
  const v = map[s] || { t: s, c: 'bg-slate-100' };
  return <Badge className={`${v.c} border`}>{v.t}</Badge>;
};

export default function AdminPanel() {
  const navigate = useNavigate();
  const user = getUser();
  const [stats, setStats] = useState(null);
  const [refs, setRefs] = useState([]);
  const [regs, setRegs] = useState([]);
  const [payouts, setPayouts] = useState([]);
  const [settings, setSettings] = useState({ base_price: 0, default_commission_pct: 0, default_discount_pct: 0, openai_api_key: '' });
  const [openaiKeyInput, setOpenaiKeyInput] = useState('');
  const [openaiKeySet, setOpenaiKeySet] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);

  // create referrer form
  const [open, setOpen] = useState(false);
  const [phone, setPhone] = useState('');
  const [name, setName] = useState('');
  const [commission, setCommission] = useState('');
  const [createdRef, setCreatedRef] = useState(null);

  useEffect(() => {
    if (!user) { navigate('/login'); return; }
    if (user.role !== 'admin') { navigate('/dashboard'); return; }
    refresh();
  }, []);

  const refresh = async () => {
    setLoading(true);
    setLoadError(null);
    // Use allSettled so one failure does not block the whole page
    const results = await Promise.allSettled([
      api.get('/admin/stats'),
      api.get('/admin/referrers'),
      api.get('/admin/registrations'),
      api.get('/admin/payouts'),
      api.get('/admin/settings'),
    ]);
    const [s, r, g, p, st] = results;
    const failed = [];

    if (s.status === 'fulfilled') setStats(s.value.data);
    else { failed.push('stats'); setStats({ total_referrers: 0, total_registrations: 0, pending_payouts_amount: 0, total_paid: 0 }); }

    if (r.status === 'fulfilled') setRefs(r.value.data);
    else failed.push('referrers');

    if (g.status === 'fulfilled') setRegs(g.value.data);
    else failed.push('registrations');

    if (p.status === 'fulfilled') setPayouts(p.value.data);
    else failed.push('payouts');

    if (st.status === 'fulfilled') {
      setSettings(st.value.data);
      setOpenaiKeySet(st.value.data.openai_api_key_set || false);
      setOpenaiKeyInput('');
    } else failed.push('settings');

    if (failed.length) {
      const firstErr = results.find(x => x.status === 'rejected');
      const status = firstErr?.reason?.response?.status;
      if (status === 401 || status === 403) {
        toast.error('نشست شما منقضی شده. دوباره وارد شوید.');
        setTimeout(() => navigate('/login'), 800);
        return;
      }
      setLoadError(`خطا در دریافت ${failed.join('، ')}`);
      toast.error(`خطا در دریافت بخش‌هایی از داده‌ها: ${failed.join('، ')}`);
    }
    setLoading(false);
  };

  const createRef = async () => {
    try {
      const payload = { phone, name };
      if (commission) payload.commission_pct = parseFloat(commission);
      const r = await api.post('/admin/referrers', payload);
      setCreatedRef(r.data);
      setPhone(''); setName(''); setCommission('');
      toast.success('معرف ساخته شد');
      refresh();
    } catch (e) {
      toast.error(e.response?.data?.detail || 'خطا در ساخت معرف');
    }
  };

  const toggleStatus = async (ref) => {
    const newStatus = ref.status === 'active' ? 'inactive' : 'active';
    await api.patch(`/admin/referrers/${ref.id}`, { status: newStatus });
    toast.success('وضعیت تغییر کرد');
    refresh();
  };

  const updatePayout = async (id, status) => {
    await api.patch(`/admin/payouts/${id}`, { status });
    toast.success('بروزرسانی شد');
    refresh();
  };

  const saveSettings = async () => {
    const payload = {
      base_price: parseFloat(settings.base_price),
      default_commission_pct: parseFloat(settings.default_commission_pct),
      default_discount_pct: parseFloat(settings.default_discount_pct),
    };
    if (openaiKeyInput.trim()) payload.openai_api_key = openaiKeyInput.trim();
    await api.put('/admin/settings', payload);
    toast.success('تنظیمات ذخیره شد');
    refresh();
  };

  const copyLink = (code) => {
    const link = `${window.location.origin}/r/${code}`;
    navigator.clipboard.writeText(link);
    toast.success('لینک کپی شد');
  };

  if (loading && !stats) return (
    <div className="min-h-screen bg-slate-50">
      <Header />
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="flex items-center gap-3 text-slate-600">
          <div className="w-5 h-5 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
          <span>در حال بارگذاری پنل ادمین...</span>
        </div>
      </div>
    </div>
  );

  if (loadError && !stats) return (
    <div className="min-h-screen bg-slate-50">
      <Header />
      <div className="max-w-md mx-auto px-6 py-12">
        <Card className="p-6 border-red-200 bg-red-50">
          <div className="font-bold text-red-800 mb-2">خطا در بارگذاری</div>
          <div className="text-sm text-red-700 mb-4">{loadError}</div>
          <Button onClick={refresh} className="bg-slate-900" data-testid="admin-retry-btn">تلاش مجدد</Button>
        </Card>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50">
      <Header />
      <div className="max-w-7xl mx-auto px-6 py-10">
        <div className="mb-8">
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">پنل مدیر سیستم</h1>
          <p className="text-sm text-slate-500 mt-1">مدیریت معرف‌ها، ثبت‌نام‌ها و تسویه‌ها</p>
        </div>

        {/* STATS */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {[
            { l: 'معرف فعال', v: stats.active_referrers, sub: `از ${stats.total_referrers} معرف`, icon: Users },
            { l: 'ثبت‌نام موفق', v: stats.paid_registrations, sub: `از ${stats.total_registrations} کل`, icon: FileText },
            { l: 'درآمد ناخالص', v: formatToman(stats.revenue), sub: '', icon: Wallet },
            { l: 'پورسانت پرداختی', v: formatToman(stats.commissions), sub: `${stats.pending_payouts} درخواست در انتظار`, icon: SettingsIcon },
          ].map((s, i) => (
            <Card key={i} className="p-5 border-slate-200 card-lift" data-testid={`stat-card-${i}`}>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs text-slate-500">{s.l}</span>
                <s.icon className="w-4 h-4 text-amber-500" />
              </div>
              <div className="text-2xl font-black text-slate-900 num">{s.v}</div>
              {s.sub && <div className="text-xs text-slate-500 mt-1 num">{s.sub}</div>}
            </Card>
          ))}
        </div>

        <Tabs defaultValue="referrers">
          <TabsList>
            <TabsTrigger value="referrers" data-testid="tab-referrers">معرف‌ها</TabsTrigger>
            <TabsTrigger value="registrations" data-testid="tab-registrations">ثبت‌نام‌ها</TabsTrigger>
            <TabsTrigger value="payouts" data-testid="tab-admin-payouts">درخواست‌های تسویه</TabsTrigger>
            <TabsTrigger value="tests" data-testid="tab-tests"><Activity className="w-3.5 h-3.5 ms-1" /> تست سیستم</TabsTrigger>
            <TabsTrigger value="settings" data-testid="tab-settings">تنظیمات</TabsTrigger>
          </TabsList>

          <TabsContent value="referrers">
            <Card className="border-slate-200">
              <div className="p-4 border-b border-slate-200 flex items-center justify-between">
                <div className="font-bold text-slate-900">لیست معرف‌ها</div>
                <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) setCreatedRef(null); }}>
                  <DialogTrigger asChild>
                    <Button className="bg-amber-500 hover:bg-amber-600 text-slate-900 font-bold" data-testid="add-ref-btn">
                      <UserPlus className="w-4 h-4 ms-1" /> افزودن معرف
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader><DialogTitle>{createdRef ? 'معرف ساخته شد' : 'افزودن معرف جدید'}</DialogTitle></DialogHeader>
                    {createdRef ? (
                      <div className="space-y-3 text-sm">
                        <div className="bg-emerald-50 border border-emerald-200 rounded-md p-4">
                          <div className="flex justify-between mb-2"><span className="text-slate-600">نام:</span><span className="font-bold">{createdRef.name}</span></div>
                          <div className="flex justify-between mb-2"><span className="text-slate-600">شماره:</span><span className="num">{createdRef.phone}</span></div>
                          <div className="flex justify-between mb-2"><span className="text-slate-600">کد معرف:</span><span className="num font-black text-amber-700">{createdRef.referral_code}</span></div>
                          <div className="flex justify-between mb-2"><span className="text-slate-600">کد امنیتی (PIN):</span><span className="num font-bold">{createdRef.security_pin}</span></div>
                          <div className="flex justify-between"><span className="text-slate-600">پورسانت:</span><span className="num font-bold">{createdRef.commission_pct}٪</span></div>
                        </div>
                        <div className="bg-slate-50 border border-slate-200 rounded-md p-3 text-xs num break-all" dir="ltr">{window.location.origin}/r/{createdRef.referral_code}</div>
                        <Button onClick={() => copyLink(createdRef.referral_code)} variant="outline" className="w-full"><Copy className="w-4 h-4 ms-1" /> کپی لینک</Button>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <div>
                          <Label className="mb-2 block">شماره موبایل</Label>
                          <Input value={phone} onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))} className="num text-left" dir="ltr" data-testid="add-ref-phone" />
                        </div>
                        <div>
                          <Label className="mb-2 block">نام معرف</Label>
                          <Input value={name} onChange={(e) => setName(e.target.value)} data-testid="add-ref-name" />
                        </div>
                        <div>
                          <Label className="mb-2 block">درصد پورسانت (اختیاری)</Label>
                          <Input value={commission} onChange={(e) => setCommission(e.target.value.replace(/[^\d.]/g, ''))} placeholder={`پیش‌فرض ${settings.default_commission_pct}٪`} className="num text-left" dir="ltr" data-testid="add-ref-commission" />
                        </div>
                        <DialogFooter>
                          <Button onClick={createRef} className="bg-slate-900" data-testid="add-ref-submit">ساخت معرف و لینک</Button>
                        </DialogFooter>
                      </div>
                    )}
                  </DialogContent>
                </Dialog>
              </div>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>نام</TableHead>
                    <TableHead>موبایل</TableHead>
                    <TableHead>کد</TableHead>
                    <TableHead>پورسانت</TableHead>
                    <TableHead>ثبت‌نام موفق</TableHead>
                    <TableHead>درآمد</TableHead>
                    <TableHead>موجودی</TableHead>
                    <TableHead>وضعیت</TableHead>
                    <TableHead>عملیات</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {refs.length === 0 ? (
                    <TableRow><TableCell colSpan={9} className="text-center text-slate-500 py-8">هنوز معرفی ساخته نشده است.</TableCell></TableRow>
                  ) : refs.map((r) => (
                    <TableRow key={r.id}>
                      <TableCell className="font-medium">{r.name}</TableCell>
                      <TableCell className="num text-xs">{r.phone}</TableCell>
                      <TableCell><span className="num font-black text-amber-700">{r.referral_code}</span></TableCell>
                      <TableCell className="num">{r.commission_pct}٪</TableCell>
                      <TableCell className="num">{r.total_signups || 0}</TableCell>
                      <TableCell className="num text-xs">{formatToman(r.total_earnings)}</TableCell>
                      <TableCell className="num text-xs">{formatToman(r.available_balance)}</TableCell>
                      <TableCell><StatusBadge s={r.status} /></TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button size="sm" variant="ghost" onClick={() => copyLink(r.referral_code)} data-testid={`copy-${r.referral_code}`}><Copy className="w-3.5 h-3.5" /></Button>
                          <Button size="sm" variant="ghost" onClick={() => toggleStatus(r)} data-testid={`toggle-${r.referral_code}`}><Power className="w-3.5 h-3.5" /></Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>
          </TabsContent>

          <TabsContent value="registrations">
            <Card className="border-slate-200">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>تاریخ</TableHead>
                    <TableHead>نام</TableHead>
                    <TableHead>موبایل</TableHead>
                    <TableHead>رشته</TableHead>
                    <TableHead>آزمون</TableHead>
                    <TableHead>رتبه</TableHead>
                    <TableHead>کد معرف</TableHead>
                    <TableHead>پرداختی</TableHead>
                    <TableHead>وضعیت</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {regs.length === 0 ? (
                    <TableRow><TableCell colSpan={9} className="text-center text-slate-500 py-8">هنوز ثبت‌نامی انجام نشده.</TableCell></TableRow>
                  ) : regs.map((r) => (
                    <TableRow key={r.id}>
                      <TableCell className="text-xs num">{new Date(r.created_at).toLocaleDateString('fa-IR')}</TableCell>
                      <TableCell>{r.name}</TableCell>
                      <TableCell className="num text-xs">{r.phone}</TableCell>
                      <TableCell>{r.field}</TableCell>
                      <TableCell>{r.exam}</TableCell>
                      <TableCell className="num">{r.rank}</TableCell>
                      <TableCell className="num">{r.referrer_code || '—'}</TableCell>
                      <TableCell className="num text-xs">{formatToman(r.paid_amount)}</TableCell>
                      <TableCell><StatusBadge s={r.status} /></TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>
          </TabsContent>

          <TabsContent value="payouts">
            <Card className="border-slate-200">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>تاریخ</TableHead>
                    <TableHead>معرف</TableHead>
                    <TableHead>مبلغ</TableHead>
                    <TableHead>شبا</TableHead>
                    <TableHead>وضعیت</TableHead>
                    <TableHead>عملیات</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {payouts.length === 0 ? (
                    <TableRow><TableCell colSpan={6} className="text-center text-slate-500 py-8">درخواستی ثبت نشده.</TableCell></TableRow>
                  ) : payouts.map((p) => (
                    <TableRow key={p.id}>
                      <TableCell className="text-xs num">{new Date(p.created_at).toLocaleDateString('fa-IR')}</TableCell>
                      <TableCell>{p.referrer_name}</TableCell>
                      <TableCell className="num font-bold">{formatToman(p.amount)}</TableCell>
                      <TableCell className="num text-xs" dir="ltr">{p.iban}</TableCell>
                      <TableCell><StatusBadge s={p.status} /></TableCell>
                      <TableCell>
                        {p.status === 'pending' && (
                          <div className="flex gap-1">
                            <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700" onClick={() => updatePayout(p.id, 'paid')} data-testid={`approve-${p.id}`}>پرداخت شد</Button>
                            <Button size="sm" variant="outline" onClick={() => updatePayout(p.id, 'rejected')} data-testid={`reject-${p.id}`}>رد</Button>
                          </div>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>
          </TabsContent>

          <TabsContent value="tests">
            <SystemTests />
          </TabsContent>

          <TabsContent value="settings">
            <Card className="border-slate-200 p-6 max-w-xl">
              <div className="font-bold text-slate-900 mb-4">تنظیمات کلی طرح</div>
              <div className="space-y-4">
                <div>
                  <Label className="mb-2 block">قیمت پایه (تومان)</Label>
                  <Input value={settings.base_price} onChange={(e) => setSettings({ ...settings, base_price: e.target.value })} className="num text-left" dir="ltr" data-testid="settings-price" />
                </div>
                <div>
                  <Label className="mb-2 block">درصد تخفیف پیش‌فرض ثبت‌نام‌کننده</Label>
                  <Input value={settings.default_discount_pct} onChange={(e) => setSettings({ ...settings, default_discount_pct: e.target.value })} className="num text-left" dir="ltr" data-testid="settings-discount" />
                </div>
                <div>
                  <Label className="mb-2 block">درصد پورسانت پیش‌فرض معرف</Label>
                  <Input value={settings.default_commission_pct} onChange={(e) => setSettings({ ...settings, default_commission_pct: e.target.value })} className="num text-left" dir="ltr" data-testid="settings-commission" />
                </div>
                <Button onClick={saveSettings} className="bg-slate-900" data-testid="settings-save">ذخیره تنظیمات</Button>
              </div>

              {/* OpenAI API Key */}
              <div className="mt-6 pt-6 border-t border-slate-200">
                <div className="flex items-center gap-2 mb-1">
                  <div className="font-bold text-slate-900">کلید OpenAI</div>
                  {openaiKeySet ? (
                    <span className="text-xs bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-full px-2 py-0.5">✓ فعال</span>
                  ) : (
                    <span className="text-xs bg-amber-100 text-amber-700 border border-amber-200 rounded-full px-2 py-0.5">تنظیم نشده</span>
                  )}
                </div>
                <p className="text-xs text-slate-500 mb-3 leading-relaxed">
                  برای استفاده از استودیو تولید محتوا، کلید API از{' '}
                  <a href="https://platform.openai.com/api-keys" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">platform.openai.com</a>
                  {' '}وارد کنید.
                </p>
                <div className="flex gap-2">
                  <Input
                    type="password"
                    value={openaiKeyInput}
                    onChange={(e) => setOpenaiKeyInput(e.target.value)}
                    placeholder={openaiKeySet ? '••••••• (کلید فعلی فعال است)' : 'sk-...'}
                    className="num text-left flex-1"
                    dir="ltr"
                    data-testid="settings-openai-key"
                  />
                  <Button
                    onClick={async () => {
                      if (!openaiKeyInput.trim()) return toast.error('کلید را وارد کنید');
                      await api.put('/admin/settings', { openai_api_key: openaiKeyInput.trim() });
                      toast.success('کلید OpenAI ذخیره شد');
                      setOpenaiKeyInput('');
                      refresh();
                    }}
                    className="bg-emerald-600 hover:bg-emerald-700 whitespace-nowrap"
                    data-testid="settings-openai-save"
                  >
                    ذخیره کلید
                  </Button>
                </div>
              </div>

              <div className="mt-8 pt-6 border-t border-slate-200">
                <div className="font-bold text-slate-900 mb-1">دانلود سورس‌کد (نسخه فعلی)</div>
                <p className="text-xs text-slate-500 mb-3 leading-relaxed">
                  دانلود کامل کد فرانت و بک‌اند به‌صورت ZIP. فایل <span className="num">.env</span> و پوشه‌های <span className="num">node_modules</span> حذف می‌شوند. این قابلیت برای تست است و باید بعداً حذف شود.
                </p>
                <Button
                  onClick={() => {
                    const token = localStorage.getItem('rb_token');
                    const url = `${process.env.REACT_APP_BACKEND_URL}/api/admin/download-source?token=${encodeURIComponent(token)}`;
                    window.location.href = url;
                  }}
                  variant="outline"
                  data-testid="download-source-btn"
                >
                  دانلود ZIP سورس‌کد فعلی
                </Button>
              </div>

              <SourceSnapshots />
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
