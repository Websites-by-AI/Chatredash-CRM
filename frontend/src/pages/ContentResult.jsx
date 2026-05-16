import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Header } from '../components/Header';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Textarea } from '../components/ui/textarea';
import { Input } from '../components/ui/input';
import { Badge } from '../components/ui/badge';
import { Label } from '../components/ui/label';
import { Skeleton } from '../components/ui/skeleton';
import { api } from '../lib/api';
import { toast } from 'sonner';
import jsPDF from 'jspdf';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Copy, Download, Save, Star, Trash2, Sparkles, ChevronRight, FileText, Video, Hash, BookOpen, FileCode2, FileDown, Image as ImageIcon, Eye, Edit3 } from 'lucide-react';

const TYPES = [
  { id: 'blog_post', label: 'مقاله وبلاگ', icon: FileText, ext: 'md' },
  { id: 'video_script', label: 'اسکریپت ویدیو', icon: Video, ext: 'txt' },
  { id: 'social_posts', label: 'پست‌های اجتماعی', icon: Hash, ext: 'txt' },
  { id: 'notebook_notes', label: 'نوت‌بوک', icon: BookOpen, ext: 'md' },
  { id: 'resume_summary', label: 'خلاصه رزومه', icon: FileText, ext: 'txt' },
  { id: 'recommended_prompt', label: 'پرامپت آماده', icon: FileCode2, ext: 'txt' },
];

const downloadFile = (filename, text) => {
  const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
};

// PDF generator: opens a new window with styled Persian HTML and triggers print-to-PDF.
// jsPDF cannot render Persian glyphs without embedding a Persian font, so we use the
// browser's print dialog which fully supports Persian RTL via Vazirmatn font.
const downloadPDF = (title, sections) => {
  const win = window.open('', '_blank');
  if (!win) { alert('برای دانلود PDF، اجازه پاپ‌آپ را بدهید.'); return; }
  const safe = (t) => (t || '—').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/\n/g, '<br/>');
  const sectionsHtml = sections.map(s =>
    `<section><h2>${safe(s.label)}</h2><div class="content">${safe(s.text)}</div></section>`
  ).join('');
  win.document.write(`<!doctype html><html dir="rtl" lang="fa"><head><meta charset="utf-8"><title>${safe(title)}</title>
    <link href="https://fonts.googleapis.com/css2?family=Vazirmatn:wght@400;700;900&display=swap" rel="stylesheet">
    <style>
      *{box-sizing:border-box}
      body{font-family:'Vazirmatn',sans-serif;color:#1a1a1a;padding:40px;max-width:800px;margin:0 auto;line-height:1.9;direction:rtl}
      h1{font-size:28px;border-bottom:3px solid #FF4F00;padding-bottom:12px;margin-bottom:24px}
      h2{font-size:18px;color:#FF4F00;margin-top:28px;margin-bottom:10px;border-right:4px solid #FF4F00;padding-right:10px}
      .content{white-space:pre-wrap;font-size:14px;background:#fafafa;padding:14px;border-radius:6px;border:1px solid #eee}
      @media print{ body{padding:20px} button{display:none} }
      .topbar{position:fixed;top:10px;left:10px;direction:ltr}
      .topbar button{padding:8px 16px;background:#FF4F00;color:#fff;border:none;border-radius:4px;cursor:pointer;font-family:inherit}
    </style></head><body>
    <div class="topbar"><button onclick="window.print()">چاپ / ذخیره PDF</button></div>
    <h1>${safe(title)}</h1>${sectionsHtml}
    <script>setTimeout(()=>window.print(),700)</script>
    </body></html>`);
  win.document.close();
};

// Kept for compatibility (old buttons used legacy jsPDF fallback - now also routes to print).
const legacyDownloadPDF = downloadPDF;

const ContentResult = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    try {
      const { data } = await api.get(`/studio/${id}`);
      setItem(data);
    } catch (e) {
      toast.error('بارگذاری محتوا با خطا مواجه شد');
      navigate('/studio/library');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); /* eslint-disable-next-line */ }, [id]);

  const updateField = (key, value) => setItem((p) => ({ ...p, [key]: value }));

  const save = async () => {
    setSaving(true);
    try {
      const payload = {
        title: item.title,
        summary: item.summary,
        blog_post: item.blog_post,
        video_script: item.video_script,
        notebook_notes: item.notebook_notes,
        social_posts: item.social_posts,
        resume_summary: item.resume_summary,
        recommended_prompt: item.recommended_prompt,
        recommended_platforms: item.recommended_platforms,
        keywords: item.keywords,
      };
      await api.put(`/studio/${id}`, payload);
      toast.success('تغییرات ذخیره شد');
    } catch (e) {
      toast.error('ذخیره ناموفق بود');
    } finally { setSaving(false); }
  };

  const toggleFav = async () => {
    try {
      await api.put(`/studio/${id}`, { favorite: !item.favorite });
      setItem((p) => ({ ...p, favorite: !p.favorite }));
    } catch { /* ignore */ }
  };

  const removeItem = async () => {
    if (!window.confirm('حذف این محتوا؟')) return;
    await api.delete(`/studio/${id}`);
    toast.success('حذف شد');
    navigate('/studio/library');
  };

  const copyText = (text) => {
    navigator.clipboard.writeText(text || '');
    toast.success('کپی شد');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F9F9F7]">
        <Header />
        <div className="max-w-7xl mx-auto px-6 py-10 space-y-4">
          <Skeleton className="h-12 w-1/2" />
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    );
  }
  if (!item) return null;

  const social = Array.isArray(item.social_posts) ? item.social_posts : [];

  return (
    <div className="min-h-screen bg-[#F9F9F7]" data-testid="content-result-page">
      <Header />
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Header strip */}
        <div className="flex items-center justify-between flex-wrap gap-4 mb-6">
          <div className="flex-1 min-w-[280px]">
            <div className="text-xs font-bold tracking-[0.15em] uppercase text-[#A1A1AA] mb-1">RESULT · {new Date(item.created_at).toLocaleDateString('fa-IR')}</div>
            <Input
              data-testid="result-title-input"
              value={item.title || ''}
              onChange={(e) => updateField('title', e.target.value)}
              className="text-3xl md:text-4xl font-black border-0 px-0 focus-visible:ring-0 bg-transparent text-[#1A1A1A] h-auto py-1"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" size="sm" onClick={toggleFav} data-testid="fav-btn">
              <Star className={`w-4 h-4 ${item.favorite ? 'fill-[#FF4F00] text-[#FF4F00]' : ''}`} />
            </Button>
            <Button variant="outline" size="sm" onClick={() => navigate('/studio/library')} data-testid="back-library-btn">
              کتابخانه
            </Button>
            <Button variant="outline" size="sm" onClick={removeItem} data-testid="delete-btn">
              <Trash2 className="w-4 h-4 text-red-600" />
            </Button>
            <Button onClick={save} disabled={saving} className="bg-[#0047AB] hover:bg-[#003580] text-white" data-testid="save-btn">
              <Save className="w-4 h-4 ms-2" />
              {saving ? 'در حال ذخیره…' : 'ذخیره'}
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Main editor */}
          <div className="lg:col-span-9">
            <Card className="border-[#E5E5E0] bg-white p-6" data-testid="editor-card">
              <Tabs defaultValue="blog_post">
                <TabsList className="bg-[#F4F4F0] border border-[#E5E5E0] flex-wrap h-auto">
                  {TYPES.map((t) => (
                    <TabsTrigger key={t.id} value={t.id} data-testid={`tab-${t.id}`} className="data-[state=active]:bg-white data-[state=active]:text-[#0047AB] gap-2">
                      <t.icon className="w-4 h-4" />
                      {t.label}
                    </TabsTrigger>
                  ))}
                </TabsList>

                {TYPES.filter((t) => t.id !== 'social_posts').map((t) => (
                  <TabsContent key={t.id} value={t.id} className="mt-5">
                    <div className="flex items-center justify-between mb-2">
                      <Label className="text-xs font-bold tracking-[0.1em] uppercase text-[#A1A1AA]">{t.label}</Label>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={() => copyText(item[t.id])} data-testid={`copy-${t.id}`}>
                          <Copy className="w-3.5 h-3.5 ms-1" /> کپی
                        </Button>
                        <Button variant="outline" size="sm"
                          onClick={() => downloadFile(`${(item.title || 'content').slice(0,30)}-${t.id}.${t.ext}`, item[t.id] || '')}
                          data-testid={`download-${t.id}`}
                        >
                          <Download className="w-3.5 h-3.5 ms-1" /> دانلود
                        </Button>
                        <Button variant="outline" size="sm"
                          onClick={() => downloadPDF(`${item.title} - ${t.label}`, [{ label: t.label, text: item[t.id] || '' }])}
                          data-testid={`pdf-${t.id}`}
                          className="border-red-200 text-red-700 hover:bg-red-50"
                        >
                          <FileDown className="w-3.5 h-3.5 ms-1" /> PDF
                        </Button>
                      </div>
                    </div>
                    <Tabs defaultValue="preview" className="w-full">
                      <TabsList className="grid w-full grid-cols-2 max-w-xs">
                        <TabsTrigger value="preview" data-testid={`preview-tab-${t.id}`}><Eye className="w-3.5 h-3.5 ms-1" /> پیش‌نمایش</TabsTrigger>
                        <TabsTrigger value="edit" data-testid={`edit-tab-${t.id}`}><Edit3 className="w-3.5 h-3.5 ms-1" /> ویرایش</TabsTrigger>
                      </TabsList>
                      <TabsContent value="preview">
                        <div className="prose prose-slate max-w-none bg-white border border-[#E5E5E0] rounded-md p-6 min-h-[400px] leading-loose
                          prose-headings:text-[#1A1A1A] prose-h1:text-2xl prose-h2:text-xl prose-h2:border-r-4 prose-h2:border-[#FF4F00] prose-h2:pr-3
                          prose-strong:text-[#FF4F00] prose-a:text-blue-600 prose-blockquote:border-r-4 prose-blockquote:border-amber-300 prose-blockquote:bg-amber-50 prose-blockquote:py-2 prose-blockquote:px-4 prose-blockquote:rounded
                          prose-ul:list-disc prose-li:my-1 prose-code:bg-slate-100 prose-code:px-1 prose-code:rounded"
                          dir="rtl" data-testid={`preview-${t.id}`}>
                          <ReactMarkdown remarkPlugins={[remarkGfm]}>{item[t.id] || '*هنوز محتوایی نیست*'}</ReactMarkdown>
                        </div>
                      </TabsContent>
                      <TabsContent value="edit">
                        <Textarea
                          data-testid={`textarea-${t.id}`}
                          value={item[t.id] || ''}
                          onChange={(e) => updateField(t.id, e.target.value)}
                          rows={18}
                          className="bg-[#F4F4F0] border-[#E5E5E0] font-mono text-sm leading-relaxed"
                        />
                      </TabsContent>
                    </Tabs>
                  </TabsContent>
                ))}

                <TabsContent value="social_posts" className="mt-5 space-y-4">
                  {social.map((p, i) => (
                    <div key={i} className="rounded-md border border-[#E5E5E0] bg-[#F4F4F0] p-4" data-testid={`social-post-${i}`}>
                      <div className="flex items-center justify-between mb-2">
                        <Badge className="bg-blue-50 text-blue-700 hover:bg-blue-50">{i === 0 ? 'لینکدین' : 'اینستاگرام'}</Badge>
                        <Button variant="ghost" size="sm" onClick={() => copyText(p)} data-testid={`copy-social-${i}`}>
                          <Copy className="w-3.5 h-3.5 ms-1" /> کپی
                        </Button>
                      </div>
                      <Textarea
                        value={p}
                        onChange={(e) => {
                          const list = [...social];
                          list[i] = e.target.value;
                          updateField('social_posts', list);
                        }}
                        rows={6}
                        className="bg-white"
                      />
                    </div>
                  ))}
                </TabsContent>
              </Tabs>
            </Card>
          </div>

          {/* Sidebar AI recommendations */}
          <div className="lg:col-span-3 space-y-4">
            <Card className="p-5 border-[#E5E5E0] bg-white" data-testid="recommendations-card">
              <div className="flex items-center gap-2 mb-3">
                <Sparkles className="w-4 h-4 text-[#FF4F00]" />
                <span className="text-xs font-bold tracking-[0.1em] uppercase text-[#A1A1AA]">پیشنهادهای هوش مصنوعی</span>
              </div>
              <div className="space-y-3 text-sm">
                <div>
                  <div className="text-xs text-[#A1A1AA] mb-1">بهترین تیتر</div>
                  <div className="font-bold text-[#1A1A1A] leading-relaxed">{item.best_title || item.title}</div>
                </div>
                <div>
                  <div className="text-xs text-[#A1A1AA] mb-1">بهترین CTA</div>
                  <div className="text-[#1A1A1A] leading-relaxed">{item.best_cta || '—'}</div>
                </div>
                <div>
                  <div className="text-xs text-[#A1A1AA] mb-1">پلتفرم‌های پیشنهادی</div>
                  <div className="flex flex-wrap gap-1.5 mt-1">
                    {(item.recommended_platforms || []).map((p, i) => (
                      <Badge key={i} variant="secondary" className="bg-[#F4F4F0] border border-[#E5E5E0]">{p}</Badge>
                    ))}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-[#A1A1AA] mb-1">کلیدواژه‌ها</div>
                  <div className="flex flex-wrap gap-1.5 mt-1">
                    {(item.keywords || []).map((k, i) => (
                      <Badge key={i} className="bg-orange-50 text-orange-700 hover:bg-orange-50">#{k}</Badge>
                    ))}
                  </div>
                </div>
              </div>
            </Card>

            <Card className="p-5 border-[#E5E5E0] bg-white" data-testid="summary-card">
              <div className="text-xs font-bold tracking-[0.1em] uppercase text-[#A1A1AA] mb-3">خلاصه</div>
              <Textarea
                value={item.summary || ''}
                onChange={(e) => updateField('summary', e.target.value)}
                rows={5}
                className="bg-[#F4F4F0] border-[#E5E5E0]"
                data-testid="summary-textarea"
              />
            </Card>

            <Button
              onClick={() => downloadFile(`${(item.title || 'content').slice(0,40)}-all.json`, JSON.stringify(item, null, 2))}
              variant="outline"
              className="w-full"
              data-testid="download-json-btn"
            >
              <Download className="w-4 h-4 ms-2" />
              خروجی JSON کامل
            </Button>

            <Button
              onClick={() => downloadPDF(item.title || 'محتوا', [
                { label: 'خلاصه', text: item.summary || '' },
                { label: 'مقاله وبلاگ', text: item.blog_post || '' },
                { label: 'اسکریپت ویدیو', text: item.video_script || '' },
                { label: 'نوت‌بوک آموزشی', text: item.notebook_notes || '' },
                { label: 'پست‌های اجتماعی', text: (item.social_posts || []).join('\n\n---\n\n') },
                { label: 'خلاصه رزومه', text: item.resume_summary || '' },
                { label: 'پرامپت آماده', text: item.recommended_prompt || '' },
              ])}
              variant="outline"
              className="w-full border-red-200 text-red-700 hover:bg-red-50"
              data-testid="download-full-pdf-btn"
            >
              <FileDown className="w-4 h-4 ms-2" />
              دانلود همه به PDF
            </Button>

            <Button
              onClick={() => copyText(JSON.stringify({
                title: item.title,
                summary: item.summary,
                blog: item.blog_post,
                video: item.video_script,
                notebook: item.notebook_notes,
                social: item.social_posts,
                resume: item.resume_summary,
                prompt: item.recommended_prompt,
              }, null, 2))}
              variant="outline"
              className="w-full"
              data-testid="copy-all-btn"
            >
              <Copy className="w-4 h-4 ms-2" />
              کپی کامل به کلیپ‌بورد
            </Button>

            <Button
              onClick={() => navigate('/studio')}
              variant="outline"
              className="w-full"
              data-testid="new-content-btn"
            >
              ساخت محتوای جدید
              <ChevronRight className="w-4 h-4 ms-1" />
            </Button>

            <Card className="p-4 border-amber-200 bg-amber-50/50" data-testid="media-gen-card">
              <div className="text-xs font-bold tracking-[0.1em] uppercase text-amber-800 mb-2 flex items-center gap-1">
                <ImageIcon className="w-3.5 h-3.5" /> تولید تصویر و ویدیو
              </div>
              <p className="text-xs text-slate-600 mb-3 leading-relaxed">
                این قابلیت نیاز به کلید API جداگانه دارد. پیشنهاد ما: <strong>Gemini Nano Banana</strong> برای تصویر و <strong>Sora 2</strong> برای ویدیو.
              </p>
              <div className="space-y-2">
                <Button
                  size="sm" variant="outline" className="w-full justify-start border-amber-300 hover:bg-amber-100"
                  onClick={() => {
                    toast.message('برای فعال‌سازی تولید تصویر، یکی از این کلیدها را به ادمین بدهید:', {
                      description: '۱) Emergent LLM Key (Nano Banana): از Profile→Universal Key ۲) Fal.ai: از fal.ai/dashboard/keys ۳) OpenAI: از platform.openai.com/api-keys',
                      duration: 9000,
                    });
                  }}
                  data-testid="gen-image-btn"
                >
                  <ImageIcon className="w-3.5 h-3.5 ms-2" /> تولید تصویر کاور (به‌زودی)
                </Button>
                <Button
                  size="sm" variant="outline" className="w-full justify-start border-amber-300 hover:bg-amber-100"
                  onClick={() => {
                    toast.message('برای فعال‌سازی تولید ویدیو، یکی از این کلیدها را به ادمین بدهید:', {
                      description: '۱) Sora 2 (OpenAI): از platform.openai.com ۲) Synthesys API ۳) HeyGen API ۴) Pictory API. اسکریپت ویدیو شما آماده استفاده است.',
                      duration: 9000,
                    });
                  }}
                  data-testid="gen-video-btn"
                >
                  <Video className="w-3.5 h-3.5 ms-2" /> تولید ویدیو از اسکریپت (به‌زودی)
                </Button>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContentResult;
