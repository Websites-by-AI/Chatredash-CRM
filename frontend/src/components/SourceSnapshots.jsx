import React, { useEffect, useState } from 'react';
import { api } from '../lib/api';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { toast } from 'sonner';
import { History, Camera, Download, Trash2, Loader2 } from 'lucide-react';

function formatBytes(n) {
  if (!n) return '0 B';
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  return `${(n / 1024 / 1024).toFixed(2)} MB`;
}

export default function SourceSnapshots() {
  const [items, setItems] = useState([]);
  const [label, setLabel] = useState('');
  const [busy, setBusy] = useState(false);
  const [loaded, setLoaded] = useState(false);

  const load = async () => {
    try {
      const r = await api.get('/admin/source-snapshots');
      setItems(r.data || []);
    } catch (e) { /* ignore */ }
    setLoaded(true);
  };

  useEffect(() => { load(); }, []);

  const snapshot = async () => {
    setBusy(true);
    try {
      await api.post('/admin/source-snapshots', { label });
      setLabel('');
      toast.success('نسخه ذخیره شد');
      load();
    } catch (e) {
      toast.error('خطا در ذخیره نسخه');
    } finally { setBusy(false); }
  };

  const download = (sid) => {
    const token = localStorage.getItem('rb_token');
    window.location.href = `${process.env.REACT_APP_BACKEND_URL}/api/admin/source-snapshots/${sid}/download?token=${encodeURIComponent(token)}`;
  };

  const remove = async (sid) => {
    if (!window.confirm('این نسخه حذف شود؟')) return;
    await api.delete(`/admin/source-snapshots/${sid}`);
    toast.success('حذف شد');
    load();
  };

  return (
    <div className="mt-8 pt-6 border-t border-slate-200" data-testid="source-snapshots">
      <div className="flex items-center gap-2 mb-1">
        <History className="w-4 h-4 text-amber-600" />
        <div className="font-bold text-slate-900">سابقه نسخه‌های سورس‌کد</div>
        <Badge variant="outline" className="num">{items.length}</Badge>
      </div>
      <p className="text-xs text-slate-500 mb-3 leading-relaxed">
        قبل از هر تغییر مهم، یک snapshot از کد فعلی ذخیره کن تا بعداً بتوانی به همان نقطه برگردی. هر snapshot یک ZIP کامل از <span className="num">backend</span> و <span className="num">frontend</span> است.
      </p>
      <div className="flex flex-wrap gap-2 mb-4">
        <Input
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          placeholder="برچسب نسخه (اختیاری) — مثال: قبل از اضافه‌کردن پادکست"
          className="flex-1 min-w-[280px]"
          data-testid="snapshot-label-input"
        />
        <Button onClick={snapshot} disabled={busy} className="bg-amber-500 hover:bg-amber-600 text-slate-900 font-bold" data-testid="snapshot-create-btn">
          {busy ? <><Loader2 className="w-4 h-4 ms-1 animate-spin" /> در حال ذخیره</> : <><Camera className="w-4 h-4 ms-1" /> ذخیره نسخه جدید</>}
        </Button>
      </div>

      {!loaded ? (
        <div className="text-xs text-slate-400">در حال بارگذاری...</div>
      ) : items.length === 0 ? (
        <div className="text-xs text-slate-500 text-center py-6 border-2 border-dashed border-slate-200 rounded-md">
          هنوز نسخه‌ای ذخیره نشده. روی «ذخیره نسخه جدید» بزن.
        </div>
      ) : (
        <div className="space-y-2">
          {items.map((it) => (
            <div key={it.id} className="flex items-center justify-between bg-slate-50 border border-slate-200 rounded-md p-3" data-testid={`snapshot-row-${it.id}`}>
              <div className="flex-1 min-w-0">
                <div className="font-medium text-sm text-slate-900 truncate">{it.label}</div>
                <div className="text-xs text-slate-500 flex flex-wrap gap-3 mt-0.5">
                  <span className="num">{new Date(it.created_at).toLocaleString('fa-IR')}</span>
                  <span className="num">{formatBytes(it.size)}</span>
                  <span className="num text-[10px] text-slate-400">{it.id}</span>
                </div>
              </div>
              <div className="flex gap-1">
                <Button size="sm" variant="outline" onClick={() => download(it.id)} data-testid={`snapshot-dl-${it.id}`}>
                  <Download className="w-3.5 h-3.5 ms-1" /> دانلود
                </Button>
                <Button size="sm" variant="ghost" onClick={() => remove(it.id)} data-testid={`snapshot-del-${it.id}`}>
                  <Trash2 className="w-4 h-4 text-red-500" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
