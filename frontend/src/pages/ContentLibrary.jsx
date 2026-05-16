import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Header } from '../components/Header';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Badge } from '../components/ui/badge';
import { api, getUser } from '../lib/api';
import { toast } from 'sonner';
import { Plus, Search, Star, Trash2, ArrowLeft, Sparkles } from 'lucide-react';

const EMPTY_IMG = 'https://static.prod-images.emergentagent.com/jobs/448a4898-65d9-422e-84b1-8e2b55a11d09/images/928f61459481fb7a9c2ff734c0ac10d0c99aeb6c21e803bf4c1a3c59ce1d1aa6.png';

const ContentLibrary = () => {
  const navigate = useNavigate();
  const user = getUser();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');

  const load = async () => {
    try {
      const { data } = await api.get('/studio/list');
      setItems(data || []);
    } catch (e) {
      toast.error('بارگذاری کتابخانه ناموفق بود');
    } finally { setLoading(false); }
  };

  useEffect(() => {
    if (!user) { navigate('/login'); return; }
    load();
    // eslint-disable-next-line
  }, []);

  const remove = async (id, e) => {
    e.stopPropagation();
    if (!window.confirm('حذف این محتوا؟')) return;
    await api.delete(`/studio/${id}`);
    setItems((arr) => arr.filter((x) => x.id !== id));
    toast.success('حذف شد');
  };

  const filtered = items.filter((x) =>
    !query || (x.title || '').toLowerCase().includes(query.toLowerCase()) || (x.summary || '').toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#F9F9F7]" data-testid="content-library-page">
      <Header />
      <div className="max-w-7xl mx-auto px-6 py-10">
        <div className="flex items-center justify-between flex-wrap gap-4 mb-8">
          <div>
            <div className="text-xs font-bold tracking-[0.15em] uppercase text-[#A1A1AA] mb-2">CONTENT LIBRARY</div>
            <h1 className="text-4xl sm:text-5xl font-black tracking-tight text-[#1A1A1A]">کتابخانه محتوای من</h1>
            <p className="mt-2 text-[#52525B]">همه بسته‌های محتوای ساخته‌شده توسط هوش مصنوعی</p>
          </div>
          <Button onClick={() => navigate('/studio')} className="bg-[#0047AB] hover:bg-[#003580] text-white" data-testid="new-from-library-btn">
            <Plus className="w-4 h-4 ms-2" /> ساخت محتوای جدید
          </Button>
        </div>

        <div className="relative mb-6 max-w-md">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#A1A1AA]" />
          <Input
            data-testid="library-search"
            placeholder="جستجو در عنوان یا خلاصه..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="ps-10 pe-10 bg-white border-[#E5E5E0]"
          />
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Card key={i} className="border-[#E5E5E0] h-56 animate-pulse bg-[#F4F4F0]" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <Card className="border-[#E5E5E0] bg-white p-12 text-center" data-testid="library-empty">
            <img src={EMPTY_IMG} alt="" className="w-64 mx-auto mb-6 rounded-md opacity-95" />
            <h3 className="text-2xl font-black text-[#1A1A1A] mb-2">هنوز محتوایی نساختی</h3>
            <p className="text-[#52525B] mb-6">اولین بسته محتوای حرفه‌ای خود را با چند کلیک بساز</p>
            <Button onClick={() => navigate('/studio')} className="bg-[#FF4F00] hover:bg-[#cc3f00] text-white font-bold" data-testid="empty-create-btn">
              <Sparkles className="w-4 h-4 ms-2" />
              شروع کن
            </Button>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filtered.map((it) => (
              <Card
                key={it.id}
                onClick={() => navigate(`/studio/result/${it.id}`)}
                className="border-[#E5E5E0] bg-white p-5 cursor-pointer card-lift group"
                data-testid={`library-item-${it.id}`}
              >
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div className="flex items-center gap-2">
                    <Badge className="bg-blue-50 text-blue-700 hover:bg-blue-50">{it.input?.exam_name || 'محتوا'}</Badge>
                    {it.favorite && <Star className="w-4 h-4 fill-[#FF4F00] text-[#FF4F00]" />}
                  </div>
                  <button onClick={(e) => remove(it.id, e)} className="text-[#A1A1AA] hover:text-red-600 transition" data-testid={`remove-${it.id}`}>
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                <h3 className="font-black text-[#1A1A1A] text-lg leading-tight mb-2 line-clamp-2">{it.title || 'بدون عنوان'}</h3>
                <p className="text-sm text-[#52525B] line-clamp-3 leading-relaxed mb-4">{it.summary || '—'}</p>
                <div className="flex flex-wrap gap-1.5 mb-4">
                  {(it.keywords || []).slice(0, 3).map((k, i) => (
                    <Badge key={i} variant="secondary" className="text-xs bg-[#F4F4F0] border border-[#E5E5E0]">#{k}</Badge>
                  ))}
                </div>
                <div className="flex items-center justify-between pt-3 border-t border-[#E5E5E0]">
                  <span className="text-xs text-[#A1A1AA] num">{new Date(it.created_at).toLocaleDateString('fa-IR')}</span>
                  <span className="text-xs text-[#0047AB] font-bold flex items-center gap-1 group-hover:gap-2 transition-all">
                    باز کن <ArrowLeft className="w-3.5 h-3.5" />
                  </span>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ContentLibrary;
