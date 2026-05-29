import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Terminal, Cpu, Cloud, Github, Sparkles, Send, Globe, Play, Server, ArrowLeft, RefreshCw, Smartphone, Tablet, Monitor, Settings2, Sliders, CheckCircle2, AlertCircle } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { mockConnectedApps } from '../data/mockData';
import { ConnectedApp } from '../types';

const AIWorkspace: React.FC = () => {
  const { colorClass, bgClass, ringClass } = useTheme();
  
  // Deployment & cloudflare states
  const [apps, setApps] = useState<ConnectedApp[]>(mockConnectedApps);
  const [projectName, setProjectName] = useState('');
  const [githubUrl, setGithubUrl] = useState('');
  const [customSubdomain, setCustomSubdomain] = useState('');
  const [deployLogs, setDeployLogs] = useState<string[]>([]);
  const [deploying, setDeploying] = useState(false);
  const [activePreviewUrl, setActivePreviewUrl] = useState<string>('my-portfolio.kianhub.workers.dev');
  const [previewDevice, setPreviewDevice] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  
  // Simulated Sync with GitHub status
  const [isSyncing, setIsSyncing] = useState(false);
  const [showSyncToast, setShowSyncToast] = useState(false);

  // Connection settings states
  const [showSettings, setShowSettings] = useState(false);
  const [githubPat, setGithubPat] = useState('ghp_KianHubOktoKitSecureToken2026_xyz');
  const [cfAccountId, setCfAccountId] = useState('cf_3b9952da44c802e9dff77b1e84a20b1c');
  const [cfWorkerToken, setCfWorkerToken] = useState('●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●');
  const [selectedAiModel, setSelectedAiModel] = useState('gemini-2.5-flash');
  const [isTestLoading, setIsTestLoading] = useState(false);
  const [testResult, setTestResult] = useState<'success' | 'error' | null>(null);

  // AI Generator states
  const [aiPrompt, setAiPrompt] = useState('یک فرم تماس با ما مدرن و خلاقانه با تگهای تلویند بساز');
  const [aiCode, setAiCode] = useState(`<!-- فرم تماس با ما مدرن کیانهاب -->
<div class="max-w-md mx-auto bg-white/80 backdrop-blur-md rounded-3xl p-8 border border-gray-100 shadow-2xl relative overflow-hidden text-right" dir="rtl">
  <div class="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-3xl"></div>
  <h3 class="text-xl font-black text-gray-900 mb-2">ارتباط با ما</h3>
  <p class="text-xs text-gray-400 mb-6 font-medium">پاسخگوی سوالات شما در کمتر از ۲ ساعت هستیم</p>
  <form class="space-y-4">
    <div>
      <label class="block text-[11px] font-bold text-gray-400 mb-1">نام کامل شما</label>
      <input type="text" placeholder="مثال: علی احمدی" class="w-full text-xs font-bold px-4 py-2.5 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-indigo-500 transition-all outline-none" />
    </div>
    <div>
      <label class="block text-[11px] font-bold text-gray-400 mb-1">آدرس ایمیل</label>
      <input type="email" placeholder="ali@gmail.com" class="w-full text-xs font-bold px-4 py-2.5 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-indigo-500 transition-all outline-none text-left" />
    </div>
    <div>
      <label class="block text-[11px] font-bold text-gray-400 mb-1">پیام شما</label>
      <textarea rows="3" placeholder="دیدگاه ارزشمند خود را بنویسید..." class="w-full text-xs font-bold px-4 py-2.5 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-indigo-500 transition-all outline-none"></textarea>
    </div>
    <button type="button" class="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-lg shadow-indigo-600/15 transition-all">ارسال پیام</button>
  </form>
</div>`);
  const [generating, setGenerating] = useState(false);

  const getSoftBgClass = () => {
    switch (bgClass) {
      case 'bg-blue-600': return 'bg-blue-50';
      case 'bg-emerald-600': return 'bg-emerald-50';
      case 'bg-purple-600': return 'bg-purple-50';
      case 'bg-amber-600': return 'bg-amber-50';
      default: return 'bg-indigo-50';
    }
  };

  // call server-side gemini api to build code
  const handleAiGenerate = async () => {
    if (!aiPrompt.trim()) return;
    setGenerating(true);
    try {
      const response = await fetch("/api/crm/insights", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        // Since we repurposed the insight helper on the server, we pass custom instructs
        body: JSON.stringify({ 
          data: {
            task: "طراحی وب با تلویند",
            userPrompt: aiPrompt,
            instruction: "یک قطعه کد HTML تمیز و کاملاً استایل‌دهی شده با Tailwind به صورت مستقیم در تگهای div برگردان. هیچ توضیح اضافه مانند ```html یا توضیحات متنی قبل و بعد ننویس. فقط و فقط کدهای معتبر html تلویند مناسب برای رندر کردن در بدنه یک دیو برگردان."
          }
        }),
      });
      const data = await response.json();
      if (data.insights) {
        // Clean markdown backticks if any
        let cleanCode = data.insights;
        if (cleanCode.startsWith("```html")) {
          cleanCode = cleanCode.replace(/^```html/, "").replace(/```$/, "");
        } else if (cleanCode.startsWith("```")) {
          cleanCode = cleanCode.replace(/^```/, "").replace(/```$/, "");
        }
        setAiCode(cleanCode);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setGenerating(false);
    }
  };

  // Simulate Cloudflare CI/CD deploy pipeline
  const handleCloudflareDeploy = () => {
    if (!projectName || !githubUrl) return;
    setDeploying(true);
    setDeployLogs([]);
    const subdomainVal = customSubdomain.trim() || projectName.toLowerCase().replace(/\s+/g, '-');
    const fullSubdomain = `${subdomainVal}.kianhub.workers.dev`;

    const logs = [
      '🔄 ایجاد اتصال جدید به گیت‌هاب (GitHub Octokit API)...',
      `✔ احراز هویت موفق شد. دسترسی به مخزن ${githubUrl}`,
      '⚡ بارگذاری هسته بیلدر کلودفلر (Cloudflare Pages Builder)...',
      '📦 در حال اجرای دستور npm run build...',
      '⚡ کامپایل فایل‌های استاتیک و کدها با موفقیت انجام شد.',
      '🌐 در حال ثبت رکورد دامنه‌های فرعی روی شبکه کلودفلر دی‌ان‌اس...',
      `🔒 تولید گواهینامه SSL امن برای آدرس ${fullSubdomain}...`,
      '🚀 استقرار پروژه در لبه‌های شبکه کلودفلر (Cloudflare Edge Server) نهایی شد!'
    ];

    let logIndex = 0;
    const interval = setInterval(() => {
      if (logIndex < logs.length) {
        setDeployLogs(prev => [...prev, logs[logIndex]]);
        logIndex++;
      } else {
        clearInterval(interval);
        setTimeout(() => {
          const newApp: ConnectedApp = {
            id: 'ca_' + Date.now(),
            projectName,
            githubUrl,
            subdomain: fullSubdomain,
            cloudflareStatus: 'مستقر شده',
            lastDeploy: 'هم‌اکنون'
          };
          setApps([newApp, ...apps]);
          setActivePreviewUrl(fullSubdomain);
          setDeploying(false);
          setProjectName('');
          setGithubUrl('');
          setCustomSubdomain('');
        }, 1000);
      }
    }, 900);
  };

  // Simulated GitHub re-fetch & sync to update project list
  const handleSyncGitHub = () => {
    setIsSyncing(true);
    setTimeout(() => {
      setIsSyncing(false);
      setShowSyncToast(true);
      
      // Check if we already synced to avoid duplicate additions
      const isAlreadySynced = apps.some(app => app.id.startsWith('ca_synced_'));
      if (!isAlreadySynced) {
        const syncedRepo: ConnectedApp = {
          id: 'ca_synced_' + Date.now(),
          projectName: 'قالب وبلاگ شخصی ری‌اکت (KianBlog)',
          githubUrl: 'https://github.com/hulevin/kian-react-blog',
          subdomain: 'kian-blog.kianhub.workers.dev',
          cloudflareStatus: 'مستقر شده',
          lastDeploy: 'هم‌اکنون'
        };
        setApps(prev => [syncedRepo, ...prev]);
      }
      
      // Auto-hide toast after 3 seconds
      setTimeout(() => setShowSyncToast(false), 3000);
    }, 1500);
  };

  // Live test and validate connection key signatures
  const testConnectionSettings = () => {
    setIsTestLoading(true);
    setTestResult(null);
    setTimeout(() => {
      setIsTestLoading(false);
      if (githubPat.trim().length > 10 && cfAccountId.trim().length > 10) {
        setTestResult('success');
      } else {
        setTestResult('error');
      }
    }, 1600);
  };

  // Interactive rendering of preview subdomain websites
  const getSubdomainDemoHTML = (url: string) => {
    if (url.includes('shop')) {
      return `
        <div class="p-6 text-right font-sans" dir="rtl">
          <header class="flex items-center justify-between border-b pb-4 mb-6">
            <span class="font-black text-emerald-600 text-lg">🛍️ آریا شاپ dمو</span>
            <div class="flex gap-2">
              <span class="bg-gray-100 text-gray-700 text-[10px] px-2 py-0.5 rounded-full font-bold">سبد خرید: (۲ کالا)</span>
            </div>
          </header>
          <div class="bg-gradient-to-r from-emerald-500 to-teal-600 p-6 rounded-2xl text-white mb-6">
            <h3 class="font-black text-md">جشنواره شگفت‌انگیز تابستانه!</h3>
            <p class="text-[10px] opacity-80 mt-1">تخفیف‌های استثنایی روی تمامی قالب‌ها و هاست‌های اختصاصی</p>
          </div>
          <div class="grid grid-cols-2 gap-4">
            <div class="border p-3 rounded-xl bg-white space-y-2">
              <div class="h-20 bg-gray-100 rounded-lg flex items-center justify-center font-bold text-gray-400">📱</div>
              <h4 class="text-xs font-bold text-gray-800">قالب موبایل اپ‌فلو</h4>
              <p class="text-[10px] text-emerald-600 font-extrabold">۳۲۰,۰۰۰ تومان</p>
            </div>
            <div class="border p-3 rounded-xl bg-white space-y-2">
              <div class="h-20 bg-gray-100 rounded-lg flex items-center justify-center font-bold text-gray-400">🎨</div>
              <h4 class="text-xs font-bold text-gray-800">لندینگ لایت اسپیس</h4>
              <p class="text-[10px] text-emerald-600 font-extrabold">۴۵۰,۰۰۰ تومان</p>
            </div>
          </div>
        </div>
      `;
    }
    if (url.includes('portfolio') || url.includes('my-portfolio')) {
      return `
        <div class="p-6 text-right font-sans" dir="rtl">
          <div class="flex flex-col items-center justify-center text-center mt-4">
            <div class="w-16 h-16 rounded-full bg-indigo-100 flex items-center justify-center text-2xl mb-3">👨‍💻</div>
            <h3 class="font-black text-gray-900 text-base">پورتفولیو شخصی رضا ملکی</h3>
            <span class="text-[10px] bg-blue-100 text-blue-800 px-3 py-0.5 rounded-full font-bold mt-1">توسعه‌دهنده React & Node</span>
          </div>
          <p class="text-xs text-gray-500 leading-relaxed text-center mt-4 mb-6">من پروژه‌های فوق‌سریع وب را با Tailwind و کلودفلر می‌سازم. برای سفارش خرید پروژه‌های من در فروشگاه کیانهاب پیام دهید.</p>
          <div class="border-t pt-4 space-y-2">
            <h4 class="text-xs font-bold text-gray-800">🎯 آخرین پروژه‌ها</h4>
            <div class="bg-gray-50 p-2 rounded-lg text-[10px] flex justify-between">
              <span>سیستم چت بیدرنگ</span>
              <span class="text-indigo-600 font-bold">مشاهده</span>
            </div>
            <div class="bg-gray-50 p-2 rounded-lg text-[10px] flex justify-between">
              <span>لندینگ بهینه‌سازی شده SEO</span>
              <span class="text-indigo-600 font-bold">مشاهده</span>
            </div>
          </div>
        </div>
      `;
    }
    return `
      <div class="p-6 text-right font-sans" dir="rtl">
        <header class="flex items-center gap-2 mb-4 border-b pb-3">
          <div class="w-5 h-5 rounded-full bg-blue-500"></div>
          <span class="text-xs font-black text-gray-800">دمو عمومی کلودفلر ورکسپیس</span>
        </header>
        <p class="text-xs text-gray-500 mt-2 leading-relaxed">این یک نسخه پیش‌نمایش مستقر شده بر روی وب صادر شده توسط کیانهاب است. وب‌سایت شما هم‌اکنون از مسیر کلودفلر لبه شبکه در آدرس زیر بارگذاری و در دسترس جهانیان قرار گرفته است:</p>
        <div class="my-4 bg-gray-50 p-3 rounded-xl border border-dashed text-left font-mono text-[10px] text-gray-600 font-bold text-center">
          https://${url}
        </div>
        <div class="space-y-2 mt-6">
          <div class="h-3 w-3/4 bg-gray-100 rounded"></div>
          <div class="h-3 w-1/2 bg-gray-100 rounded"></div>
          <div class="h-3 w-5/6 bg-gray-100 rounded"></div>
        </div>
      </div>
    `;
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8"
      dir="rtl"
    >
      {/* Title with Sync with GitHub action & Connection Settings */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 pb-5">
        <div>
          <h2 className="text-2xl font-black text-gray-950 flex items-center gap-2">
            <Terminal className={colorClass} size={28} />
            کارگاه هوش مصنوعی، گیت‌هاب و انتشار روی کلودفلر
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            با کمک هوش مصنوعی کدهای استثنایی بنویسید، پروژه گیت‌هاب بسازید و دمو و آدرس تست زنده کلودفلر بسازید!
          </p>
        </div>

        <div className="flex flex-wrap gap-2.5">
          <button
            onClick={() => setShowSettings(!showSettings)}
            className={`flex items-center justify-center gap-2 px-5 py-3 rounded-2xl text-xs font-bold transition-all ${
              showSettings 
                ? `${bgClass} text-white shadow-lg` 
                : 'bg-white border border-gray-150 text-gray-750 hover:bg-gray-50'
            }`}
          >
            <Settings2 size={15} />
            <span>تنظیمات اتصال API</span>
          </button>

          <button
            id="github-sync-btn"
            onClick={handleSyncGitHub}
            disabled={isSyncing}
            className="flex items-center justify-center gap-2 px-5 py-3 rounded-2xl text-xs font-bold text-white transition-all bg-slate-900 hover:bg-slate-800 disabled:opacity-75 shadow-lg shadow-slate-900/10 cursor-pointer"
          >
            <Github size={15} className={isSyncing ? 'animate-spin' : ''} />
            <span>{isSyncing ? 'در حال دریافت اطلاعات مخازن...' : 'همگام‌سازی با گیت‌هاب'}</span>
          </button>
        </div>
      </div>

      {/* Advanced API connection Settings Collapsible Panel */}
      <AnimatePresence>
        {showSettings && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-gradient-to-br from-slate-950 to-slate-900 text-white rounded-3xl p-6 sm:p-8 space-y-6 overflow-hidden border border-slate-850 shadow-2xl relative"
          >
            <div className="absolute top-0 left-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800/80 pb-4">
              <div className="flex items-center gap-2.5">
                <span className="p-2 rounded-xl bg-white/10 text-amber-300">
                  <Sliders size={18} />
                </span>
                <div>
                  <h3 className="font-extrabold text-white text-sm">پنل ویژه توسعه‌دهندگان (اتصالات و گیت‌هاب)</h3>
                  <p className="text-[10px] text-slate-400 mt-0.5">کلیدها و مدل‌های مورد استفاده برای کوپایلوت و سرویس کلودفلر را سفارشی‌سازی کنید.</p>
                </div>
              </div>
              <span className="text-[10px] bg-indigo-500/10 text-indigo-300 px-3 py-1 rounded-full border border-indigo-500/20 font-bold font-mono">Status: Connected</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-300 block">توکن دسترسی شخصی گیت‌هاب (PAT)</label>
                <input 
                  type="password"
                  value={githubPat}
                  onChange={(e) => setGithubPat(e.target.value)}
                  className="w-full text-xs font-mono font-bold px-4 py-3 bg-white/5 border border-white/10 rounded-xl outline-none focus:bg-white/10 focus:border-amber-500 transition-all text-left text-amber-300"
                />
                <span className="text-[9px] text-slate-400 block font-semibold">استفاده برای استقرار خودکار مخارن، ایجاد هوک‌ها و تست‌های وب‌ویو.</span>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-300 block">Cloudflare Account ID (شناسه کاربری)</label>
                <input 
                  type="text"
                  value={cfAccountId}
                  onChange={(e) => setCfAccountId(e.target.value)}
                  className="w-full text-xs font-mono font-bold px-4 py-3 bg-white/5 border border-white/10 rounded-xl outline-none focus:bg-white/10 focus:border-amber-500 transition-all text-left"
                />
                <span className="text-[9px] text-slate-400 block font-semibold">شناسه هاست کلودفلر برای ایجاد ساب‌دامنه در دموهای .workers.dev</span>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-300 block">مدل هوش مصنوعی هسته (AI Model Engine)</label>
                <select
                  value={selectedAiModel}
                  onChange={(e) => setSelectedAiModel(e.target.value)}
                  className="w-full text-xs font-bold px-4 py-3 bg-slate-900 border border-white/10 rounded-xl outline-none focus:border-amber-500 transition-all text-right text-gray-200"
                >
                  <option value="gemini-2.5-flash">گوگل جمینی ۲.۵ فلش (پیشنهادی)</option>
                  <option value="gemini-1.5-pro">گوگل جمینی ۱.۵ پرو (دقیق‌ترین)</option>
                  <option value="github-codex">مدل تخصصی گیت‌هاب Codex</option>
                  <option value="copilot-pro-api">اتصال به کوپایلوت فارسی (Copilot Pro API)</option>
                </select>
                <span className="text-[9px] text-slate-400 block font-semibold">مدلی که کدهای کلاسی تلویند پروژه را برای شما خلق و اسمبل می‌کند.</span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-4 border-t border-slate-800/80">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={testConnectionSettings}
                  disabled={isTestLoading}
                  className="px-6 py-2.5 bg-amber-500 hover:bg-amber-600 active:bg-amber-700 text-gray-950 font-black text-xs rounded-xl transition-all flex items-center gap-1.5 shadow-md shadow-amber-500/10 cursor-pointer disabled:opacity-50"
                >
                  {isTestLoading ? (
                    <>
                      <RefreshCw size={13} className="animate-spin" />
                      <span>درحال سنجش امضای رمزنگاری...</span>
                    </>
                  ) : (
                    <span>تست صحت کلیدها و اعتبار سنجی اتصال</span>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setGithubPat('ghp_KianHubOktoKitSecureToken2026_xyz');
                    setCfAccountId('cf_3b9952da44c802e9dff77b1e84a20b1c');
                    setTestResult(null);
                  }}
                  className="px-4 py-2.5 text-slate-400 hover:text-white hover:bg-white/5 font-semibold text-xs rounded-xl transition-all"
                >
                  بازنشانی کلیدهای پیش‌فرض
                </button>
              </div>

              <div className="flex items-center gap-2 text-xs">
                {isTestLoading && (
                  <span className="text-amber-400 font-extrabold animate-pulse">شبیه‌ساز در حال پینگ گرفتن از API گیت‌هاب...</span>
                )}
                {testResult === 'success' && (
                  <div className="flex items-center gap-1.5 text-emerald-400 font-bold bg-emerald-500/10 border border-emerald-500/20 px-4 py-2 rounded-xl">
                    <CheckCircle2 size={14} />
                    <span>اتصال موفقیت‌آمیز بود! توکن‌های گیت‌هاب معتبر و کلودفلر آماده سرویس‌دهی است.</span>
                  </div>
                )}
                {testResult === 'error' && (
                  <div className="flex items-center gap-1.5 text-red-400 font-bold bg-red-500/10 border border-red-500/20 px-4 py-2 rounded-xl">
                    <AlertCircle size={14} />
                    <span>خطا در تطابق لایسنس! لطفاً فیلدهای توکن یا شناسه را تصحیح کنید.</span>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left column (8 spans): Code generator + Cloudflare Deploy pipeline */}
        <div className="lg:col-span-8 space-y-8">
          
          {/* Section 1: AI Assistant & Replit/Google AI Studio simulation */}
          <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-sm space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <span className={`p-2 rounded-xl ${getSoftBgClass()} ${colorClass}`}>
                  <Sparkles size={18} />
                </span>
                <div>
                  <h3 className="font-bold text-gray-900 text-sm">دستیار کدهای خلاق (مشابه ریپلیت و هوش مصنوعی گوگل)</h3>
                  <p className="text-[10px] text-gray-400">تولید سریع الگوهای اچ‌تی‌ام‌ال تلویند با هوش مصنوعی</p>
                </div>
              </div>
              <span className="text-[10px] bg-indigo-50 text-indigo-600 px-2.5 py-1 rounded-full font-bold">هوش مصنوعی فعال است</span>
            </div>

            <div className="space-y-4">
              <div className="flex gap-2">
                <input 
                  type="text"
                  value={aiPrompt}
                  onChange={(e) => setAiPrompt(e.target.value)}
                  placeholder="چه قطعه کدی برای سایتت نیاز داری؟ (مثال: جدول قیمت‌گذاری مدرن)"
                  className={`flex-1 pr-4 pl-3 py-3 bg-gray-50 border-none rounded-2xl text-xs font-bold outline-none focus:ring-2 focus:bg-white transition-all ${ringClass}`}
                />
                <button
                  onClick={handleAiGenerate}
                  disabled={generating}
                  className={`px-5 py-3 ${bgClass} text-white font-bold text-xs rounded-2xl flex items-center gap-1.5 shadow-sm transition-all hover:opacity-90 disabled:opacity-50`}
                >
                  {generating ? (
                    <>
                      <RefreshCw size={14} className="animate-spin" />
                      <span>در حال نگارش...</span>
                    </>
                  ) : (
                    <>
                      <Send size={14} />
                      <span>تولید الگو</span>
                    </>
                  )}
                </button>
              </div>

              {/* Splits into Editor & Render Sandbox */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Editor code text */}
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 text-left font-mono text-[10px] text-slate-300 relative flex flex-col justify-between max-h-[220px] overflow-y-auto">
                  <div className="absolute top-2 right-2 text-slate-500 font-sans text-[8px] uppercase font-bold tracking-wider">سورس کد</div>
                  <pre className="whitespace-pre-wrap mt-2 overflow-x-auto text-left leading-relaxed">{aiCode}</pre>
                </div>

                {/* Simulated Sandboxed HTML Preview */}
                <div className="border border-dashed border-gray-100 bg-gray-50/50 rounded-2xl p-4 relative flex items-center justify-center min-h-[220px] overflow-y-auto">
                  <span className="absolute top-2 right-2 text-gray-400 text-[8px] uppercase font-bold tracking-wider">پیش‌نمایش سند زنده</span>
                  <div className="w-full" dangerouslySetInnerHTML={{ __html: aiCode }} />
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: GitHub import to Cloudflare Worker Pages Pipeline */}
          <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-sm space-y-6">
            <div className="flex items-center gap-2.5">
              <span className={`p-2 rounded-xl bg-orange-100 text-orange-600`}>
                <Cloud size={18} />
              </span>
              <div>
                <h3 className="font-bold text-gray-900 text-sm">استقرار مستقیم در هاست اختصاصی (کلودفلر ورکرز)</h3>
                <p className="text-[10px] text-gray-400">مخزن گیت‌هاب خود را تیک بزنید تا لینک دموی تست و آدرس کلودفلر آن فوراً ساخته شود.</p>
              </div>
            </div>

            {/* Deploy pipeline Form */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-gray-400">نام پروژه وب‌سایت</label>
                <input 
                  type="text"
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                  placeholder="مثال: اپلیکیشن صدف"
                  className={`w-full pr-4 pl-3 py-2.5 bg-gray-50 border-none rounded-xl text-xs font-bold outline-none focus:ring-2 focus:bg-white transition-all ${ringClass}`}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-gray-400">آدرس مخزن در گیت‌هاب</label>
                <div className="relative">
                  <input 
                    type="text"
                    value={githubUrl}
                    onChange={(e) => setGithubUrl(e.target.value)}
                    placeholder="https://github.com/..."
                    className={`w-full pr-8 pl-3 py-2.5 bg-gray-50 border-none rounded-xl text-xs font-bold outline-none focus:ring-2 focus:bg-white transition-all ${ringClass} text-left`}
                  />
                  <Github className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-gray-400">ساب‌دومین تست (Kianhub Cloudflare)</label>
                <div className="relative">
                  <input 
                    type="text"
                    value={customSubdomain}
                    onChange={(e) => setCustomSubdomain(e.target.value)}
                    placeholder="sadaf-app"
                    className={`w-full pr-3 pl-24 py-2.5 bg-gray-50 border-none rounded-xl text-xs font-bold outline-none focus:ring-2 focus:bg-white transition-all ${ringClass} text-left`}
                  />
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-mono text-[9px] text-gray-300 font-bold">.workers.dev</span>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2">
              <p className="text-[10px] text-gray-400">کیانهاب از ابزارهای Cloudflare Pages & Webhook برای استقرار بیدرنگ استفاده می‌کند.</p>
              <button
                onClick={handleCloudflareDeploy}
                disabled={deploying || !projectName || !githubUrl}
                className="whitespace-nowrap px-6 py-2.5 bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs rounded-xl shadow-md shadow-orange-600/10 transition-colors disabled:opacity-50"
              >
                {deploying ? 'در حال انتشار روی لبه شبکه...' : '🚀 ایجاد بیدرنگ دمو روی کلودفلر'}
              </button>
            </div>

            {/* Output Deploy Console Logs */}
            <AnimatePresence>
              {deployLogs.length > 0 && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="bg-slate-950 border border-slate-900 rounded-2xl p-4 font-mono text-[10px] text-amber-500 space-y-1.5"
                >
                  <span className="text-[8px] text-gray-500 font-sans font-bold float-left">CI/CD PIPELINE STAGE</span>
                  <div className="text-xs text-white font-sans font-bold mb-2">گزارش فرآیند انتشار (Build Console Logs)</div>
                  {deployLogs.map((log, idx) => (
                    <div key={idx} className="flex gap-2 items-center">
                      <span className="text-gray-600">[{idx + 1}]</span>
                      <span className="text-slate-300 font-semibold">{log}</span>
                    </div>
                  ))}
                  {deploying && (
                    <div className="flex gap-2 items-center text-amber-400 text-xs font-bold animate-pulse mt-2 font-sans">
                      <RefreshCw size={12} className="animate-spin" />
                      <span>در حال کامپایل نهایی لندینگ و دمو...</span>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

          </div>

          {/* Connected Deployments database */}
          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-gray-50">
              <h3 className="font-bold text-gray-900 text-sm">لیست پروژه‌های منتشر شده و دامنه‌های متصل</h3>
              <p className="text-[10px] text-gray-400 mt-0.5">پروژه‌های گیت‌هابی که دمو یا لندینگ تست آنها بر روی کلودفلر آماده است.</p>
            </div>
            
            <div className="divide-y divide-gray-50">
              {apps.map((app) => (
                <div key={app.id} className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-gray-50/50 transition-colors">
                  <div className="flex items-start gap-3">
                    <div className="p-2.5 bg-orange-50 text-orange-600 rounded-xl">
                      <Globe size={18} />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-gray-800">{app.projectName}</h4>
                      <div className="flex items-center gap-1.5 mt-1 font-mono text-[10px] text-gray-400">
                        <Github size={12} />
                        <span>{app.githubUrl}</span>
                      </div>
                    </div>
                  </div>

                  <div className="font-mono text-xs text-gray-700 bg-gray-100 px-3 py-1.5 rounded-xl font-bold border border-gray-200">
                    {app.subdomain}
                  </div>

                  <div className="flex items-center gap-3">
                    <span className={`px-2 py-0.5 font-bold text-[9px] rounded-full ${
                      app.cloudflareStatus === 'مستقر شده' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'
                    }`}>
                      {app.cloudflareStatus}
                    </span>
                    <button 
                      onClick={() => setActivePreviewUrl(app.subdomain)}
                      className={`text-xs font-bold px-3 py-1.5 border border-gray-200 rounded-xl hover:bg-gray-50 transition-all ${
                        activePreviewUrl === app.subdomain ? `${bgClass.replace('bg-', 'text-')} bg-gray-50 font-extrabold border-gray-300` : 'text-gray-600'
                      }`}
                    >
                      دمو زنده
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Right column (4 spans): Live Preview Device Frame Mockup */}
        <div className="lg:col-span-4">
          <div className="sticky top-20 space-y-6">
            
            {/* Elegant browser device frame mockup */}
            <div className="bg-white rounded-3xl border border-gray-100 p-4 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <span className="font-bold text-gray-900 text-xs flex items-center gap-1.5">
                  <Server size={14} className={colorClass} />
                  پیش‌نمایش ریسپانسیو دمو
                </span>
                
                {/* Device switches */}
                <div className="flex items-center gap-1">
                  {[
                    { id: 'desktop', icon: Monitor },
                    { id: 'tablet', icon: Tablet },
                    { id: 'mobile', icon: Smartphone },
                  ].map(d => {
                    const Icon = d.icon;
                    return (
                      <button
                        key={d.id}
                        onClick={() => setPreviewDevice(d.id as any)}
                        className={`p-1.5 rounded-lg transition-colors ${
                          previewDevice === d.id ? 'bg-gray-100 text-gray-800' : 'text-gray-400 hover:text-gray-600'
                        }`}
                      >
                        <Icon size={14} />
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Styled Mock Browser */}
              <div className={`mx-auto bg-gray-100 border border-gray-200 rounded-2xl overflow-hidden shadow-md transition-all duration-300 ${
                previewDevice === 'desktop' ? 'w-full' : previewDevice === 'tablet' ? 'w-[75%]' : 'w-[55%]'
              }`}>
                {/* Browser top address bar */}
                <div className="bg-gray-50 px-3 py-2 border-b border-gray-200 flex items-center gap-2">
                  <div className="flex gap-1">
                    <span className="w-1.5 h-1.5 bg-red-400 rounded-full"></span>
                    <span className="w-1.5 h-1.5 bg-yellow-400 rounded-full"></span>
                    <span className="w-1.5 h-1.5 bg-green-400 rounded-full"></span>
                  </div>
                  <div className="flex-1 bg-white border rounded-lg px-2 py-0.5 text-[8px] font-mono text-gray-400 text-center truncate">
                    https://{activePreviewUrl || 'default.kianhub.workers.dev'}
                  </div>
                </div>

                {/* Simulated Content Loading frame */}
                <div className="bg-white min-h-[300px] shadow-inner max-h-[400px] overflow-y-auto">
                  <div dangerouslySetInnerHTML={{ __html: getSubdomainDemoHTML(activePreviewUrl) }} />
                </div>
              </div>

              <div className="bg-gray-50 p-3 rounded-xl border border-gray-100 text-[10px] text-gray-500 text-center">
                پیش‌نمایش فعال: <span className="font-mono font-bold text-gray-700">{activePreviewUrl}</span>
              </div>
            </div>

          </div>
        </div>

      </div>

      {/* Sync success toast */}
      <AnimatePresence>
        {showSyncToast && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.95 }}
            className="fixed bottom-6 left-6 z-50 bg-slate-900 border border-slate-800 text-white px-5 py-3.5 rounded-2xl shadow-xl flex items-center gap-3"
            style={{ direction: 'rtl' }}
          >
            <div className="w-6 h-6 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-xs font-bold font-mono">✓</div>
            <div className="text-right">
              <p className="text-xs font-extrabold text-white">مخازن گیت‌هاب با موفقیت همگام‌سازی شدند!</p>
              <p className="text-[10px] text-slate-400 mt-0.5">پروژه‌های جدید دریافت شده و لیست پروژه‌ها به‌روزرسانی شد.</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default AIWorkspace;
