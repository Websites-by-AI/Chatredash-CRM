import React, { useEffect, useState } from 'react';
import { api, formatToman, getUser } from '../lib/api';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Badge } from '../components/ui/badge';
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../components/ui/dialog';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../components/ui/tabs';
import { Table, TableHead, TableHeader, TableRow, TableCell, TableBody } from '../components/ui/table';
import { toast } from 'sonner';
import { Copy, Wallet, TrendingUp, Users, Send, Link2, ShieldCheck } from 'lucide-react';

const StatusBadge = ({ s }) => {
  const map = {
    pending: { t: 'در انتظار', c: 'bg-amber-100 text-amber-800 border-amber-200' },
    approved: { t: 'تأیید شده', c: 'bg-blue-100 text-blue-800 border-blue-200' },
    paid: { t: 'پرداخت شده', c: 'bg-emerald-100 text-emerald-800 border-emerald-200' },
    rejected: { t: 'رد شده', c: 'bg-red-100 text-red-800 border-red-200' },
    cancelled: { t: 'لغو شده', c: 'bg-slate-100 text-slate-800 border-slate-200' },
  };
  const v = map[s] || { t: s, c: 'bg-slate-100 text-slate-800' };
  return <Badge className={`${v.c} border`}>{v.t}</Badge>;
};

export default function ReferrerDashboard() {
  const navigate = useNavigate();
  const user = getUser();
  const [me, setMe] = useState(null);
  const [regs, setRegs] = useState([]);
  const [pays, setPays] = useState([]);
  const [amount, setAmount] = useState('');
  const [iban, setIban] = useState('');
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!user) { navigate('/login'); return; }
    if (user.role === 'admin') { navigate('/admin'); return; }
    refresh();
  }, []);

  const refresh = async () => {
    try {
      const [m, r, p] = await Promise.all([
        api.get('/referrer/me'),
        api.get('/referrer/registrations'),
        api.get('/referrer/payouts'),
      ]);
      setMe(m.data);
      setRegs(r.data);
      setPays(p.data);
      if (m.data.iban) setIban(m.data.iban);
    } catch (e) {
      if (e.response?.status === 404) {
        toast.error('حساب معرف برای شما تعریف نشده');
        navigate('/');
      }
    }
  };

  const link = me ? `${window.location.origin}/r/${me.referral_code}` : '';

  const copy = () => {
    navigator.clipboard.writeText(link);
    toast.success('لینک کپی شد');
  };

  const requestPayout = async () => {
    try {
      const amt = parseFloat(amount);
      await api.post('/referrer/payout', { amount: amt, iban });
      toast.success('درخواست تسویه ثبت شد');
      setOpen(false); setAmount('');
      refresh();
    } catch (e) {
      toast.error(e.response?.data?.detail || 'خطا در ثبت درخواست');
    }
  };

  if (!me) return <div className="min-h-screen bg-slate-50"><Header /><div className="max-w-7xl mx-auto px-6 py-12 text-slate-500">در حال بارگذاری...</div></div>;

  return (
    <div className="min-h-screen bg-slate-50">
      <Header />
      <div className="max-w-7xl mx-auto px-6 py-10">
        <div className="mb-8">
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">پنل معرف</h1>
          <p className="text-sm text-slate-500 mt-1">سلام {me.name} — وضعیت: <span className={me.status === 'active' ? 'text-emerald-700 font-bold' : 'text-red-700 font-bold'}>{me.status === 'active' ? 'فعال' : 'غیرفعال'}</span></p>
        </div>

        {/* Wallet Card + Stats */}
        <div className="grid lg:grid-cols-3 gap-6 mb-6">
          <Card className="lg:col-span-2 p-8 bg-slate-900 text-white border-slate-800 relative overflow-hidden" data-testid="wallet-card">
            <div className="absolute -left-12 -top-12 w-48 h-48 rounded-full bg-amber-500/10 blur-3xl" />
            <div className="relative">
              <div className="text-amber-400 text-sm font-bold flex items-center gap-2 mb-3"><Wallet className="w-4 h-4" /> کیف پول</div>
              <div className="text-5xl font-black tracking-tight num text-white">{formatToman(me.available_balance)}</div>
              <div className="text-slate-400 text-sm mt-2">موجودی قابل تسویه</div>

              <div className="grid grid-cols-3 gap-4 mt-8 pt-6 border-t border-white/10">
                <div>
                  <div className="text-slate-400 text-xs">مجموع درآمد</div>
                  <div className="text-lg font-bold mt-1 num">{formatToman(me.total_earnings)}</div>
                </div>
                <div>
                  <div className="text-slate-400 text-xs">ثبت‌نام موفق</div>
                  <div className="text-lg font-bold mt-1 num">{me.total_signups || 0}</div>
                </div>
                <div>
                  <div className="text-slate-400 text-xs">درصد پورسانت</div>
                  <div className="text-lg font-bold mt-1 num text-amber-400">{me.commission_pct}٪</div>
                </div>
              </div>

              <div className="mt-6 flex gap-3">
                <Dialog open={open} onOpenChange={setOpen}>
                  <DialogTrigger asChild>
                    <Button className="bg-amber-500 hover:bg-amber-600 text-slate-900 font-bold" data-testid="payout-btn">
                      <Send className="w-4 h-4 ms-1" /> درخواست تسویه
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader><DialogTitle>درخواست تسویه پورسانت</DialogTitle></DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label className="mb-2 block">مبلغ (تومان)</Label>
                        <Input value={amount} onChange={(e) => setAmount(e.target.value.replace(/\D/g, ''))} className="num text-left" dir="ltr" data-testid="payout-amount-input" />
                        <p className="text-xs text-slate-500 mt-1 num">حداکثر: {formatToman(me.available_balance)}</p>
                      </div>
                      <div>
                        <Label className="mb-2 block">شماره شبا (IR…)</Label>
                        <Input value={iban} onChange={(e) => setIban(e.target.value)} className="num text-left" dir="ltr" placeholder="IR000000000000000000000000" data-testid="payout-iban-input" />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button onClick={requestPayout} className="bg-slate-900" data-testid="payout-submit-btn">ثبت درخواست</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </div>
          </Card>

          <Card className="p-6 border-slate-200" data-testid="link-card">
            <div className="text-slate-700 text-sm font-bold flex items-center gap-2 mb-3"><Link2 className="w-4 h-4 text-amber-500" /> لینک اختصاصی شما</div>
            <div className="bg-slate-50 border border-slate-200 rounded-md p-3 text-xs num break-all text-slate-700" dir="ltr">{link}</div>
            <Button onClick={copy} variant="outline" className="w-full mt-3" data-testid="copy-link-btn"><Copy className="w-4 h-4 ms-1" /> کپی لینک</Button>
            <div className="text-xs text-slate-500 mt-4 leading-relaxed">
              کد اختصاصی: <span className="font-black text-slate-900 num">{me.referral_code}</span>
              <br />
              کد امنیتی شخصی: <span className="num font-bold text-slate-700">{me.security_pin}</span>
            </div>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="regs">
          <TabsList>
            <TabsTrigger value="regs" data-testid="tab-regs"><Users className="w-4 h-4 ms-1" /> ثبت‌نام‌ها</TabsTrigger>
            <TabsTrigger value="payouts" data-testid="tab-payouts"><TrendingUp className="w-4 h-4 ms-1" /> تسویه‌ها</TabsTrigger>
          </TabsList>

          <TabsContent value="regs">
            <Card className="border-slate-200" data-testid="regs-table">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>نام</TableHead>
                    <TableHead>آزمون</TableHead>
                    <TableHead>رتبه</TableHead>
                    <TableHead>مبلغ پرداختی</TableHead>
                    <TableHead>پورسانت</TableHead>
                    <TableHead>وضعیت</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {regs.length === 0 ? (
                    <TableRow><TableCell colSpan={6} className="text-center text-slate-500 py-8">هنوز ثبت‌نامی از طریق لینک شما انجام نشده.</TableCell></TableRow>
                  ) : regs.map((r) => (
                    <TableRow key={r.id}>
                      <TableCell className="font-medium">{r.name}</TableCell>
                      <TableCell>{r.exam}</TableCell>
                      <TableCell className="num">{r.rank}</TableCell>
                      <TableCell className="num">{formatToman(r.paid_amount)}</TableCell>
                      <TableCell className="num text-amber-700 font-bold">{formatToman(r.commission_amount)}</TableCell>
                      <TableCell><StatusBadge s={r.status} /></TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>
          </TabsContent>

          <TabsContent value="payouts">
            <Card className="border-slate-200" data-testid="payouts-table">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>تاریخ</TableHead>
                    <TableHead>مبلغ</TableHead>
                    <TableHead>شبا</TableHead>
                    <TableHead>وضعیت</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pays.length === 0 ? (
                    <TableRow><TableCell colSpan={4} className="text-center text-slate-500 py-8">درخواستی ثبت نکرده‌اید.</TableCell></TableRow>
                  ) : pays.map((p) => (
                    <TableRow key={p.id}>
                      <TableCell className="num text-xs">{new Date(p.created_at).toLocaleDateString('fa-IR')}</TableCell>
                      <TableCell className="num font-bold">{formatToman(p.amount)}</TableCell>
                      <TableCell className="num text-xs">{p.iban}</TableCell>
                      <TableCell><StatusBadge s={p.status} /></TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="mt-8 text-xs text-slate-500 flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-amber-500" /> شماره موبایل ثبت‌نام‌کنندگان به دلیل حفظ حریم خصوصی نمایش داده نمی‌شود.
        </div>
      </div>
    </div>
  );
}
