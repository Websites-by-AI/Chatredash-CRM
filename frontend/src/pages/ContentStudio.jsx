import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Header } from '../components/Header';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Card } from '../components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Badge } from '../components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../components/ui/dialog';
import { api, getUser } from '../lib/api';
import { toast } from 'sonner';
import { Sparkles, Wand2, ArrowLeft, BookOpen, Library, Lightbulb, Copy, ExternalLink } from 'lucide-react';

const STEPS = ['پایه', 'تجربه', 'مخاطب و خروجی'];

// Pre-default values to help user get started quickly
const DEFAULT_FORM = {
  exam_name: 'کنکور سراسری',
  rank: 'رتبه ۱۲ منطقه ۲',
  field: 'تجربی',
  study_strategy: 'روزانه ۸ تا ۱۰ ساعت مطالعه با تقسیم به سشن‌های ۹۰ دقیقه‌ای، استفاده از تکنیک پومودورو، هفته‌ای دو آزمون جامع و مرور خطاها در دفترچه شخصی.',
  resources: 'کتاب‌های گاج، خیلی سبز، مهر و ماه، جزوات استاد ابوالقاسمی، کلاس آنلاین مدرسان‌شریف و آزمون‌های قلم‌چی.',
  strengths: 'تمرکز بالا، توانایی تست‌زنی سریع در زیست‌شناسی، نظم در برنامه‌ریزی هفتگی.',
  achievements: 'رتبه ۱۲ منطقه ۲ در کنکور سراسری، رتبه برتر آزمون‌های آزمایشی قلم‌چی، تدریس خصوصی زیست.',
  target_audience: 'داوطلبان کنکور تجربی سال آینده',
  content_type: 'all',
  tone: 'صمیمی و حرفه‌ای',
};

const PLATFORM_GUIDE = [
  { name: 'ChatGPT', url: 'https://chat.openai.com', tip: 'برای متن بلند و خلاقانه. در باکس چت پرامپت را paste کن.' },
  { name: 'Claude', url: 'https://claude.ai', tip: 'برای متن دقیق و رسمی. متن طولانی را خوب می‌فهمد.' },
  { name: 'Gemini', url: 'https://gemini.google.com', tip: 'برای جستجو + تولید. تصویر هم می‌پذیرد.' },
  { name: 'Perplexity', url: 'https://perplexity.ai', tip: 'برای تولید با منبع‌دهی و رفرنس.' },
];

const ContentStudio = () => {
  const navigate = useNavigate();
  const user = getUser();
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState(DEFAULT_FORM);

  // Prompt dialog
  const [promptOpen, setPromptOpen] = useState(false);
  const [promptLoading, setPromptLoading] = useState(false);
  const [promptData, setPromptData] = useState(null);

  React.useEffect(() => {
    if (!user) {
      toast.error('برای استفاده از استودیو ابتدا وارد شوید');
      navigate('/login');
    }
  }, []);

  const update = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const valid = () => {
    if (step === 0) return form.exam_name && form.rank;
    if (step === 1) return form.study_strategy && form.resources;
    return true;
  };

  const generate = async () => {
    setLoading(true);
    try {
      const { data } = await api.post('/studio/generate', form);
      toast.success('محتوای شما با موفقیت تولید شد');
      navigate(`/studio/result/${data.id}`);
    } catch (e) {
      toast.error(e?.response?.data?.detail || 'خطا در تولید محتوا');
    } finally {
      setLoading(false);
    }
  };

  const showPrompts = async () => {
    if (!form.exam_name || !form.rank) {
      toast.error('ابتدا نام آزمون و رتبه را وارد کن');
      return;
    }
    setPromptOpen(true);
    setPromptLoading(true);
    setPromptData(null);
    try {
      const { data } = await api.post('/studio/prompt', {
        exam_name: form.exam_name,
        rank: form.rank,
        goal: 'تولید محتوای آموزشی و رزومه',
        target_tool: 'ChatGPT',
      });
      setPromptData(data);
    } catch (e) {
      toast.error('خطا در ساخت پرامپت');
      setPromptOpen(false);
    } finally {
      setPromptLoading(false);
    }
  };

  const copyText = (t) => {
    navigator.clipboard.writeText(t || '');
    toast.success('پرامپت کپی شد');
  };

  const resetDefaults = () => {
    setForm(DEFAULT_FORM);
    toast.success('مقادیر پیش‌فرض بازگردانده شد');
  };

  return (
    <div className="min-h-screen bg-[#F9F9F7]" data-testid="content-studio-page">
      <Header />
      <div className="max-w-6xl mx-auto px-6 py-10">
        <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
          <div>
            <div className="text-xs font-bold tracking-[0.15em] uppercase text-[#A1A1AA] mb-2">AI CONTENT STUDIO</div>
            <h1 className="text-4xl sm:text-5xl font-black tracking-tight text-[#1A1A1A]">
              تجربه‌ات را به <span className="text-[#FF4F00]">محتوای حرفه‌ای</span> تبدیل کن
            </h1>
            <p className="mt-3 text-[#52525B] max-w-2xl leading-relaxed">
              فرم با مقادیر پیش‌فرض پر شده — می‌تونی مستقیم تولید کنی یا با اطلاعات خودت ویرایش کنی. در پایان دو راه داری: تولید محتوای کامل، یا گرفتن پرامپت برای استفاده در ابزارهای دیگر.
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={resetDefaults} data-testid="reset-defaults-btn">
              بازگشت به پیش‌فرض
            </Button>
            <Button
              variant="outline"
              onClick={() => navigate('/studio/library')}
              data-testid="open-library-btn"
              className="hidden md:flex"
            >
              <Library className="w-4 h-4 ms-2" />
              کتابخانه محتوای من
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Sidebar */}
          <Card className="lg:col-span-3 p-6 border-[#E5E5E0] bg-white sticky top-24 h-fit" data-testid="studio-stepper">
            <div className="text-xs font-bold tracking-[0.1em] uppercase text-[#A1A1AA] mb-4">مراحل</div>
            <ol className="space-y-3">
              {STEPS.map((s, i) => (
                <li
                  key={s}
                  className={`flex items-center gap-3 p-3 rounded-md border ${
                    i === step
                      ? 'bg-[#0047AB] text-white border-[#0047AB]'
                      : i < step
                      ? 'bg-[#F4F4F0] border-[#E5E5E0] text-[#52525B]'
                      : 'bg-white border-[#E5E5E0] text-[#A1A1AA]'
                  }`}
                >
                  <span className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center text-sm font-bold num">
                    {i + 1}
                  </span>
                  <span className="text-sm font-medium">{s}</span>
                </li>
              ))}
            </ol>

            <div className="mt-6 p-4 rounded-md bg-[#F4F4F0] border border-[#E5E5E0]">
              <div className="flex items-center gap-2 text-[#1A1A1A] font-bold mb-2">
                <Sparkles className="w-4 h-4 text-[#FF4F00]" /> چه چیزی می‌سازد؟
              </div>
              <ul className="text-xs text-[#52525B] space-y-1.5 leading-relaxed">
                <li>• مقاله وبلاگ</li>
                <li>• اسکریپت ویدیو</li>
                <li>• پست لینکدین و اینستاگرام</li>
                <li>• نوت‌بوک آموزشی</li>
                <li>• خلاصه رزومه</li>
                <li>• پرامپت قابل استفاده مجدد</li>
              </ul>
            </div>
          </Card>

          {/* Main form */}
          <Card className="lg:col-span-9 p-8 border-[#E5E5E0] bg-white" data-testid="studio-form-card">
            {step === 0 && (
              <div className="space-y-6 fade-up">
                <h2 className="text-2xl font-black text-[#1A1A1A]">اطلاعات پایه آزمون</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <Label className="text-xs font-bold tracking-[0.1em] uppercase text-[#A1A1AA]">نام آزمون *</Label>
                    <Input data-testid="input-exam-name" placeholder="کنکور سراسری، ارشد، دکتری" value={form.exam_name} onChange={(e) => update('exam_name', e.target.value)} className="mt-2" />
                  </div>
                  <div>
                    <Label className="text-xs font-bold tracking-[0.1em] uppercase text-[#A1A1AA]">رتبه / نتیجه *</Label>
                    <Input data-testid="input-rank" placeholder="رتبه ۱۲ منطقه ۲" value={form.rank} onChange={(e) => update('rank', e.target.value)} className="mt-2" />
                  </div>
                  <div>
                    <Label className="text-xs font-bold tracking-[0.1em] uppercase text-[#A1A1AA]">رشته</Label>
                    <Input data-testid="input-field" placeholder="ریاضی فیزیک، تجربی، انسانی" value={form.field} onChange={(e) => update('field', e.target.value)} className="mt-2" />
                  </div>
                  <div>
                    <Label className="text-xs font-bold tracking-[0.1em] uppercase text-[#A1A1AA]">لحن محتوا</Label>
                    <Select value={form.tone} onValueChange={(v) => update('tone', v)}>
                      <SelectTrigger data-testid="select-tone" className="mt-2"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="صمیمی و حرفه‌ای">صمیمی و حرفه‌ای</SelectItem>
                        <SelectItem value="انگیزشی">انگیزشی</SelectItem>
                        <SelectItem value="آموزشی و دقیق">آموزشی و دقیق</SelectItem>
                        <SelectItem value="داستان‌گو">داستان‌گو</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            )}

            {step === 1 && (
              <div className="space-y-6 fade-up">
                <h2 className="text-2xl font-black text-[#1A1A1A]">روش مطالعه و تجربه</h2>
                <div>
                  <Label className="text-xs font-bold tracking-[0.1em] uppercase text-[#A1A1AA]">روش مطالعه و برنامه‌ریزی *</Label>
                  <Textarea data-testid="input-strategy" rows={4} value={form.study_strategy} onChange={(e) => update('study_strategy', e.target.value)} className="mt-2" />
                </div>
                <div>
                  <Label className="text-xs font-bold tracking-[0.1em] uppercase text-[#A1A1AA]">منابع استفاده‌شده *</Label>
                  <Textarea data-testid="input-resources" rows={3} value={form.resources} onChange={(e) => update('resources', e.target.value)} className="mt-2" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <Label className="text-xs font-bold tracking-[0.1em] uppercase text-[#A1A1AA]">نقاط قوت</Label>
                    <Textarea data-testid="input-strengths" rows={3} value={form.strengths} onChange={(e) => update('strengths', e.target.value)} className="mt-2" />
                  </div>
                  <div>
                    <Label className="text-xs font-bold tracking-[0.1em] uppercase text-[#A1A1AA]">دستاوردها</Label>
                    <Textarea data-testid="input-achievements" rows={3} value={form.achievements} onChange={(e) => update('achievements', e.target.value)} className="mt-2" />
                  </div>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-6 fade-up">
                <h2 className="text-2xl font-black text-[#1A1A1A]">مخاطب و نوع خروجی</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <Label className="text-xs font-bold tracking-[0.1em] uppercase text-[#A1A1AA]">مخاطب هدف</Label>
                    <Input data-testid="input-audience" value={form.target_audience} onChange={(e) => update('target_audience', e.target.value)} className="mt-2" />
                  </div>
                  <div>
                    <Label className="text-xs font-bold tracking-[0.1em] uppercase text-[#A1A1AA]">تمرکز اصلی</Label>
                    <Select value={form.content_type} onValueChange={(v) => update('content_type', v)}>
                      <SelectTrigger data-testid="select-content-type" className="mt-2"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">بسته کامل (همه)</SelectItem>
                        <SelectItem value="article">مقاله وبلاگ</SelectItem>
                        <SelectItem value="video">اسکریپت ویدیو</SelectItem>
                        <SelectItem value="social">پست شبکه‌های اجتماعی</SelectItem>
                        <SelectItem value="notebook">نوت‌بوک آموزشی</SelectItem>
                        <SelectItem value="resume">خلاصه رزومه</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="p-5 rounded-md bg-[#F4F4F0] border border-[#E5E5E0]">
                  <div className="flex items-center gap-2 mb-3">
                    <BookOpen className="w-4 h-4 text-[#0047AB]" />
                    <span className="font-bold text-[#1A1A1A]">پیش‌نمایش ورودی</span>
                  </div>
                  <div className="flex flex-wrap gap-2 text-sm">
                    <Badge className="bg-blue-50 text-blue-700 hover:bg-blue-50">آزمون: {form.exam_name || '—'}</Badge>
                    <Badge className="bg-orange-50 text-orange-700 hover:bg-orange-50">رتبه: {form.rank || '—'}</Badge>
                    <Badge className="bg-green-50 text-green-700 hover:bg-green-50">لحن: {form.tone}</Badge>
                    <Badge className="bg-slate-100 text-slate-700 hover:bg-slate-100">مخاطب: {form.target_audience}</Badge>
                  </div>
                </div>
              </div>
            )}

            <div className="flex items-center justify-between pt-8 mt-8 border-t border-[#E5E5E0] flex-wrap gap-3">
              <Button variant="outline" disabled={step === 0 || loading} onClick={() => setStep((s) => Math.max(0, s - 1))} data-testid="step-prev-btn">
                <ArrowLeft className="w-4 h-4 rotate-180 me-2" />
                قبلی
              </Button>

              <div className="flex flex-wrap gap-2">
                {step === 2 && (
                  <Button variant="outline" onClick={showPrompts} disabled={promptLoading} className="border-[#FF4F00] text-[#FF4F00] hover:bg-orange-50" data-testid="show-prompts-btn">
                    <Lightbulb className="w-4 h-4 ms-2" />
                    {promptLoading ? 'در حال ساخت پرامپت...' : 'گرفتن پرامپت برای ChatGPT/Claude'}
                  </Button>
                )}

                {step < 2 ? (
                  <Button disabled={!valid()} onClick={() => setStep((s) => s + 1)} className="bg-[#0047AB] hover:bg-[#003580] text-white" data-testid="step-next-btn">
                    مرحله بعد
                    <ArrowLeft className="w-4 h-4 ms-2" />
                  </Button>
                ) : (
                  <Button disabled={loading || !form.exam_name || !form.rank || !form.study_strategy} onClick={generate} className="bg-[#FF4F00] hover:bg-[#cc3f00] text-white font-bold" data-testid="generate-btn">
                    <Wand2 className="w-4 h-4 ms-2" />
                    {loading ? 'در حال تولید محتوا...' : 'تولید محتوا با هوش مصنوعی'}
                  </Button>
                )}
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Prompt Dialog */}
      <Dialog open={promptOpen} onOpenChange={setPromptOpen}>
        <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto" data-testid="prompt-dialog">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-2xl font-black">
              <Lightbulb className="w-6 h-6 text-[#FF4F00]" />
              پرامپت‌های آماده برای ابزارهای AI
            </DialogTitle>
          </DialogHeader>

          {promptLoading ? (
            <div className="py-12 text-center text-[#52525B]">در حال تولید پرامپت‌های حرفه‌ای...</div>
          ) : promptData ? (
            <div className="space-y-5">
              <div className="p-4 rounded-md bg-orange-50 border border-orange-200">
                <div className="font-bold text-[#1A1A1A] mb-2 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-[#FF4F00]" />
                  راهنمای استفاده
                </div>
                <p className="text-sm text-[#52525B] leading-relaxed">
                  پرامپت‌های زیر را کپی کن و در سایت‌های زیر paste کن. هر پرامپت برای یک نوع خروجی متفاوت طراحی شده.
                </p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-3">
                  {PLATFORM_GUIDE.map((p) => (
                    <a key={p.name} href={p.url} target="_blank" rel="noreferrer" className="text-xs flex flex-col items-start p-2 rounded-md bg-white border border-orange-200 hover:border-[#FF4F00] transition" data-testid={`platform-${p.name}`}>
                      <span className="font-bold text-[#0047AB] flex items-center gap-1">{p.name} <ExternalLink className="w-3 h-3" /></span>
                      <span className="text-[#52525B] mt-1 leading-snug">{p.tip}</span>
                    </a>
                  ))}
                </div>
              </div>

              {[
                { k: 'short_prompt', l: 'پرامپت کوتاه و سریع' },
                { k: 'detailed_prompt', l: 'پرامپت کامل و حرفه‌ای' },
                { k: 'video_prompt', l: 'پرامپت اسکریپت ویدیو' },
                { k: 'notebook_prompt', l: 'پرامپت نوت‌بوک آموزشی' },
                { k: 'slide_prompt', l: 'پرامپت ساخت اسلاید' },
              ].map((p) => (
                <div key={p.k} className="rounded-md border border-[#E5E5E0] bg-white" data-testid={`prompt-section-${p.k}`}>
                  <div className="flex items-center justify-between p-3 bg-[#F4F4F0] border-b border-[#E5E5E0]">
                    <span className="font-bold text-sm text-[#1A1A1A]">{p.l}</span>
                    <Button size="sm" variant="outline" onClick={() => copyText(promptData[p.k])} data-testid={`copy-prompt-${p.k}`}>
                      <Copy className="w-3.5 h-3.5 ms-1" /> کپی
                    </Button>
                  </div>
                  <div className="p-3 text-sm text-[#52525B] leading-relaxed whitespace-pre-wrap font-mono">{promptData[p.k] || '—'}</div>
                </div>
              ))}
            </div>
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ContentStudio;
