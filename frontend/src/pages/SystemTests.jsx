import React, { useEffect, useState } from 'react';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Table, TableHead, TableHeader, TableRow, TableCell, TableBody } from '../components/ui/table';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../components/ui/tabs';
import { api } from '../lib/api';
import { toast } from 'sonner';
import { PlayCircle, RefreshCw, CheckCircle2, XCircle, AlertTriangle, Clock, History, Trash2 } from 'lucide-react';

const StatusIcon = ({ s }) => {
  if (s === 'pass') return <CheckCircle2 className="w-4 h-4 text-emerald-600" />;
  if (s === 'fail') return <XCircle className="w-4 h-4 text-red-600" />;
  return <AlertTriangle className="w-4 h-4 text-amber-600" />;
};

const StatusBadge = ({ s }) => {
  const map = {
    pass: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    fail: 'bg-red-100 text-red-800 border-red-200',
    error: 'bg-amber-100 text-amber-800 border-amber-200',
  };
  return <Badge className={`${map[s] || 'bg-slate-100'} border`}>{s}</Badge>;
};

export default function SystemTests() {
  const [history, setHistory] = useState([]);
  const [current, setCurrent] = useState(null);
  const [running, setRunning] = useState(false);
  const [loading, setLoading] = useState(true);

  const loadHistory = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/admin/system-tests/history');
      setHistory(data || []);
      if (!current && data?.length) setCurrent(data[0]);
    } catch (e) {
      toast.error('دریافت تاریخچه ناموفق');
    } finally { setLoading(false); }
  };

  useEffect(() => { loadHistory(); /* eslint-disable-next-line */ }, []);

  const runTests = async () => {
    setRunning(true);
    try {
      const { data } = await api.post('/admin/system-tests/run');
      setCurrent(data);
      toast.success(`تست‌ها اجرا شد: ${data.passed}/${data.total} موفق`);
      loadHistory();
    } catch (e) {
      toast.error('اجرای تست ناموفق');
    } finally { setRunning(false); }
  };

  const deleteRun = async (id) => {
    if (!window.confirm('حذف این اجرا؟')) return;
    await api.delete(`/admin/system-tests/${id}`);
    if (current?.id === id) setCurrent(null);
    loadHistory();
    toast.success('حذف شد');
  };

  const grouped = current ? current.results.reduce((acc, r) => {
    (acc[r.group] = acc[r.group] || []).push(r);
    return acc;
  }, {}) : {};

  return (
    <div className="space-y-6" data-testid="system-tests-tab">
      {/* Run controls */}
      <Card className="p-6 border-slate-200 bg-gradient-to-br from-slate-900 to-slate-800 text-white">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <div className="text-xs font-bold tracking-[0.15em] uppercase text-amber-400 mb-1">SYSTEM HEALTH</div>
            <h3 className="text-2xl font-black">تست خودکار ماژول‌های سیستم</h3>
            <p className="text-slate-300 text-sm mt-2 max-w-xl">
              تست‌های پایه شامل اتصال دیتابیس، تنظیمات، احراز هویت، ماژول هوش مصنوعی و LLM live است. نتایج در دیتابیس ذخیره می‌شود.
            </p>
          </div>
          <Button
            onClick={runTests}
            disabled={running}
            size="lg"
            className="bg-amber-500 hover:bg-amber-600 text-slate-900 font-black"
            data-testid="run-tests-btn"
          >
            {running ? <RefreshCw className="w-5 h-5 ms-2 animate-spin" /> : <PlayCircle className="w-5 h-5 ms-2" />}
            {running ? 'در حال اجرا...' : 'اجرای تست‌ها'}
          </Button>
        </div>
      </Card>

      {/* Summary stats */}
      {current && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { l: 'کل تست‌ها', v: current.total, c: 'text-slate-900' },
            { l: 'موفق', v: current.passed, c: 'text-emerald-700' },
            { l: 'ناموفق', v: current.failed, c: 'text-red-700' },
            { l: 'مدت اجرا', v: `${current.duration_ms} ms`, c: 'text-amber-700' },
          ].map((s, i) => (
            <Card key={i} className="p-4 border-slate-200" data-testid={`test-stat-${i}`}>
              <div className="text-xs text-slate-500 mb-1">{s.l}</div>
              <div className={`text-2xl font-black num ${s.c}`}>{s.v}</div>
            </Card>
          ))}
        </div>
      )}

      <Tabs defaultValue="results">
        <TabsList>
          <TabsTrigger value="results" data-testid="tab-test-results">نتایج آخرین اجرا</TabsTrigger>
          <TabsTrigger value="history" data-testid="tab-test-history"><History className="w-4 h-4 ms-1" /> تاریخچه</TabsTrigger>
        </TabsList>

        <TabsContent value="results">
          {!current ? (
            <Card className="p-12 text-center text-slate-500 border-slate-200" data-testid="test-empty">
              <PlayCircle className="w-12 h-12 mx-auto mb-3 text-slate-300" />
              هنوز تستی اجرا نشده. دکمه «اجرای تست‌ها» را بزنید.
            </Card>
          ) : (
            <div className="space-y-4">
              {Object.entries(grouped).map(([group, items]) => (
                <Card key={group} className="border-slate-200" data-testid={`test-group-${group}`}>
                  <div className="p-3 border-b border-slate-200 bg-slate-50 font-bold text-slate-900 text-sm">
                    {group} <span className="text-slate-500 text-xs me-2">({items.length})</span>
                  </div>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-12">وضعیت</TableHead>
                        <TableHead>عنوان تست</TableHead>
                        <TableHead className="w-32">مدت (ms)</TableHead>
                        <TableHead>جزئیات</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {items.map((r, i) => (
                        <TableRow key={i} data-testid={`test-row-${r.name.replace(/\s/g, '-')}`}>
                          <TableCell><StatusIcon s={r.status} /></TableCell>
                          <TableCell className="font-medium">{r.name}</TableCell>
                          <TableCell className="num text-xs"><Clock className="w-3 h-3 inline ms-1" />{r.duration_ms}</TableCell>
                          <TableCell className="text-xs text-slate-600 num" dir="ltr">{r.detail}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="history">
          <Card className="border-slate-200">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>تاریخ</TableHead>
                  <TableHead>اجراکننده</TableHead>
                  <TableHead>کل</TableHead>
                  <TableHead>موفق</TableHead>
                  <TableHead>ناموفق</TableHead>
                  <TableHead>مدت</TableHead>
                  <TableHead>عملیات</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow><TableCell colSpan={7} className="text-center py-8 text-slate-500">در حال بارگذاری...</TableCell></TableRow>
                ) : history.length === 0 ? (
                  <TableRow><TableCell colSpan={7} className="text-center py-8 text-slate-500">تاریخچه‌ای وجود ندارد.</TableCell></TableRow>
                ) : history.map((h) => (
                  <TableRow key={h.id} className="cursor-pointer hover:bg-slate-50" onClick={() => setCurrent(h)} data-testid={`history-row-${h.id}`}>
                    <TableCell className="text-xs num">{new Date(h.created_at).toLocaleString('fa-IR')}</TableCell>
                    <TableCell className="text-xs">{h.run_by_name || '—'}</TableCell>
                    <TableCell className="num font-bold">{h.total}</TableCell>
                    <TableCell className="num text-emerald-700 font-bold">{h.passed}</TableCell>
                    <TableCell className="num text-red-700 font-bold">{h.failed}</TableCell>
                    <TableCell className="num text-xs">{h.duration_ms} ms</TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button size="sm" variant="ghost" onClick={(e) => { e.stopPropagation(); setCurrent(h); }} data-testid={`view-history-${h.id}`}>نمایش</Button>
                        <Button size="sm" variant="ghost" onClick={(e) => { e.stopPropagation(); deleteRun(h.id); }} data-testid={`del-history-${h.id}`}>
                          <Trash2 className="w-3.5 h-3.5 text-red-600" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
