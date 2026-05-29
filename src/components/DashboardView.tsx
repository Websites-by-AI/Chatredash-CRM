import { useState, useEffect } from "react";
import { 
  Sparkles, Calendar, TrendingUp, AlertTriangle, CheckSquare, Target, 
  Quote, ChevronLeft, Zap, Smile, HeartPulse, Brain, Compass, BookOpen, Clock, Check, Layers, Users, ShieldAlert,
  RefreshCw, X
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { Student, Weakness, DailyPlan, TestTrap } from "../types";
import GoalTracker from "./GoalTracker";
import { addSystemLog } from "../lib/syslogs";
import { getTestTraps } from "../lib/traps";
import TrapsTreeMap from "./TrapsTreeMap";

interface DashboardViewProps {
  student: Student;
  onNavigate: (view: "report" | "schedule" | "counselor" | "progress") => void;
}

export default function DashboardView({ student, onNavigate }: DashboardViewProps) {
  const [quote, setQuote] = useState("موفقیت علمی اتفاقی نیست؛ تعهد چتر دانش در ارائه نوین‌ترین شبیه‌سازها و مربیگری علمی، ضامن رتبه‌های برتر آزمون وکالت، قضاوت و سردفتری است.");
  const [loadingQuote, setLoadingQuote] = useState(true);
  
  const [isTroubleshootingOpen, setIsTroubleshootingOpen] = useState<boolean>(false);
  const [trapsRefreshTrigger, setTrapsRefreshTrigger] = useState<number>(0);
  
  const criticalTrapsCount = getTestTraps().filter(t => t.importance === "high").length;
  
  // Dynamic metrics state
  const [qeiValue, setQeiValue] = useState<number>(() => {
    const saved = localStorage.getItem(`arateb_goals_${student.id}`);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.currentQeiValue) return parsed.currentQeiValue;
      } catch (e) {}
    }
    return 5575; // Initial base value
  });

  const [successRate, setSuccessRate] = useState<number>(() => {
    const saved = localStorage.getItem(`arateb_goals_${student.id}`);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.currentSuccessRate) return parsed.currentSuccessRate;
      } catch (e) {}
    }
    return 59; // Initial base percentage (٪)
  });

  const [bottleneckCount, setBottleneckCount] = useState<number>(() => {
    const saved = localStorage.getItem(`arateb_goals_${student.id}`);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.currentBottleneckCount !== undefined) return parsed.currentBottleneckCount;
      } catch (e) {}
    }
    return 3; // Initially 3 flaws
  });

  const [streakDays, setStreakDays] = useState<number>(() => {
    const saved = localStorage.getItem(`arateb_goals_${student.id}`);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.currentStreakDays !== undefined) return parsed.currentStreakDays;
      } catch (e) {}
    }
    return 14; 
  });

  // Kaizen process states
  const [isOptimizing, setIsOptimizing] = useState<boolean>(false);
  const [optimizationStep, setOptimizationStep] = useState<number>(0);
  const [optimizationLogs, setOptimizationLogs] = useState<string[]>([]);
  const [showCelebration, setShowCelebration] = useState<boolean>(false);

  const toPersianNum = (num: number | string) => {
    const persianDigits = ["۰", "۱", "۲", "۳", "۴", "۵", "۶", "۷", "۸", "۹"];
    return num.toString().replace(/\d/g, (x) => persianDigits[parseInt(x)]);
  };

  const startQualityImprovement = () => {
    setIsOptimizing(true);
    setOptimizationStep(0);
    setOptimizationLogs([]);
    setShowCelebration(false);

    const logs = [
      "بخش فنی: تحلیل تله‌های تستی تکراری و بهینه‌سازی بودجه‌بندی دروس حقوقی...",
      "بخش علمی: بررسی و تنظیم تعادل مطالعاتی حقوق مدنی و آیین دادرسی مدنی...",
      "بخش پایش: مانیتورینگ آنلاین ساعت حضور فیزیکی کاندید و ثبات تمرکز ذهنی...",
      "بخش مربیگری: استقرار توصیه‌های کایزن علمی استاد کاتوزیان در پرونده داوطلب...",
      "کارنامه نهایی: بارگذاری تمام پارامترها و همگام‌سازی شاخص تراز نهایی آزمونها..."
    ];

    let currentStep = 0;
    
    const timer = setInterval(() => {
      if (currentStep < logs.length) {
        setOptimizationLogs(prev => [...prev, logs[currentStep]]);
        setOptimizationStep(currentStep + 1);
        currentStep++;
      } else {
        clearInterval(timer);
        
        const targetQei = 6850;
        const targetSuccess = 85;
        const targetBottlenecks = 0;
        const targetDays = 15;

        setQeiValue(targetQei);
        setSuccessRate(targetSuccess);
        setBottleneckCount(targetBottlenecks);
        setStreakDays(targetDays);

        const savedData = localStorage.getItem(`arateb_goals_${student.id}`);
        let parsed = {};
        if (savedData) {
          try {
            parsed = JSON.parse(savedData);
          } catch (e) {}
        }
        
        const updatedData = {
          ...parsed,
          currentQeiValue: targetQei,
          currentSuccessRate: targetSuccess,
          currentBottleneckCount: targetBottlenecks,
          currentStreakDays: targetDays,
          latestQuizScore: targetSuccess
        };
        localStorage.setItem(`arateb_goals_${student.id}`, JSON.stringify(updatedData));
        
        addSystemLog("فعال‌سازی کایزن", student.name, `فرآیند بهبود کیفیت (Kaizen) برای پرونده داوطلب با موفقیت اجرا شد. تراز هدف به ${targetQei} افزایش یافت.`);

        const savedTrend = localStorage.getItem(`arateb_history_${student.id}`);
        if (savedTrend) {
          try {
            const parsedTrend = JSON.parse(savedTrend);
            if (Array.isArray(parsedTrend) && parsedTrend.length > 0) {
              const lastIdx = parsedTrend.length - 1;
              parsedTrend[lastIdx].actualTraz = targetQei;
              localStorage.setItem(`arateb_history_${student.id}`, JSON.stringify(parsedTrend));
            }
          } catch (e) {}
        }

        setIsOptimizing(false);
        setShowCelebration(true);
      }
    }, 1000);
  };

  const resetQualityStatus = () => {
    if (confirm("آیا مایلید وضعیت شاخص‌های تحصیلی را به مقادیر اولیه کایزن بازنشانی کنید؟")) {
      const targetQei = 5575;
      const targetSuccess = 59;
      const targetBottlenecks = 3;
      const targetDays = 14;

      setQeiValue(targetQei);
      setSuccessRate(targetSuccess);
      setBottleneckCount(targetBottlenecks);
      setStreakDays(targetDays);

      const savedData = localStorage.getItem(`arateb_goals_${student.id}`);
      let parsed = {};
      if (savedData) {
        try {
          parsed = JSON.parse(savedData);
        } catch (e) {}
      }
      
      const updatedData = {
        ...parsed,
        currentQeiValue: targetQei,
        currentSuccessRate: targetSuccess,
        currentBottleneckCount: targetBottlenecks,
        currentStreakDays: targetDays,
        latestQuizScore: targetSuccess
      };
      localStorage.setItem(`arateb_goals_${student.id}`, JSON.stringify(updatedData));

      const savedTrend = localStorage.getItem(`arateb_history_${student.id}`);
      if (savedTrend) {
        try {
          const parsedTrend = JSON.parse(savedTrend);
          if (Array.isArray(parsedTrend) && parsedTrend.length > 0) {
            const lastIdx = parsedTrend.length - 1;
            parsedTrend[lastIdx].actualTraz = targetQei;
            localStorage.setItem(`arateb_history_${student.id}`, JSON.stringify(parsedTrend));
          }
        } catch (e) {}
      }

      setShowCelebration(false);
    }
  };

  // پایش پایداری ذهنی داوطلب و خستگی روانی
  const [machineState, setMachineState] = useState<string | null>(null);
  const [hardwareAdvice, setHardwareAdvice] = useState<string>("");

  const [todayTasks, setTodayTasks] = useState<DailyPlan[]>([
    { day: "امروز", morningPlan: "تحلیل نص صریح قانون مدنی (عقود معین و تعهدات کانون وکالت)", afternoonPlan: "حل تشریحی ۵۰ تست زمان‌دار ویژه صلاحیت محاکم دادرسی مدنی", totalQuestions: 50, completed: false },
    { day: "امروز", morningPlan: "مرور صوتی لغات اصول فقه مظفر مبحث مفاهیم و اوامر", afternoonPlan: "بررسی لایه‌های جزایی نهادهای ارفاقی جرم‌شناسی و کانون", totalQuestions: 25, completed: true },
    { day: "امروز", morningPlan: "قوانین خاص ثبتی و آیین‌نامه دفاتر اسناد رسمی چتر دانش", afternoonPlan: "تحلیل آزمون شبیه‌ساز سردفتری سال ۱۴۰۴ و پایش تراز", totalQuestions: 40, completed: false }
  ]);

  const mockWeaknesses: Weakness[] = [
    { topic: "سقوط تعهدات و عقود معین (ماده ۲۶۴ قانون مدنی)", subject: "حقوق مدنی کانون وکالت", percentage: 25, recommendation: "بهینه‌سازی ساعات مطالعه مباحث سقوط تعهدات؛ حتما مطالعه کتاب شرح جامع قانون مدنی کاتوزیان انجام شده و ۳۰ تست موازی کانون حل گردد.", questionsCount: 45, severity: "critical" },
    { topic: "ورشکستگی شرکت همبسته و اسناد تجارتی چک و سفته", subject: "حقوق تجارت و شرکت‌ها", percentage: 32, recommendation: "مرور مجدد مواد ۳۱۰ تا ۳۱۷ قانون تجارت؛ تحلیل قواعد مسئولیت تضامنی در ظهرنویسی سفته و چک با رفرنس چتر دانش.", questionsCount: 30, severity: "critical" },
    { topic: "صلاحیت مراجع کیفری و شگردهای دادرسی عمومی و اختصاصی", subject: "آیین دادرسی کیفری و جزا", percentage: 41, recommendation: "مرور صلاحیت دادگاه‌های کیفری یک، کیفری دو، اطفال و تجدیدنظر؛ انجام ۲۵ تست شبیه‌ساز در انتهای هر مبحث تستی.", questionsCount: 25, severity: "warning" },
    { topic: "اصول لفظی و تعارض ادله (ظواهر کتاب و سنت)", subject: "اصول فقه و متون فقه", percentage: 38, recommendation: "فهم عمیق دلالت‌های اقتضا، تنبیه و اشاره؛ بازخوانی دسته‌بندی عام و خاص در کتاب اصول فقه دانشگاهی چتر دانش.", questionsCount: 35, severity: "warning" }
  ];

  const fetchWithRetry = async (url: string, options?: RequestInit, retries = 4, delay = 600): Promise<Response> => {
    try {
      const response = await fetch(url, options);
      if (!response.ok && retries > 0 && [500, 502, 503, 504].includes(response.status)) {
        await new Promise((resolve) => setTimeout(resolve, delay));
        return fetchWithRetry(url, options, retries - 1, delay * 1.5);
      }
      return response;
    } catch (err) {
      if (retries > 0) {
        await new Promise((resolve) => setTimeout(resolve, delay));
        return fetchWithRetry(url, options, retries - 1, delay * 1.5);
      }
      throw err;
    }
  };

  // دریافت رهنمود مربیگری از سرور
  useEffect(() => {
    let active = true;
    async function fetchQuote() {
      try {
        const res = await fetchWithRetry("/api/motivational");
        if (res.ok) {
          const data = await res.json();
          if (active && data.quote) {
            setQuote(data.quote);
          }
        }
      } catch (err) {
        console.warn("Could not fetch fresh motivational quote, using local offline fallback quote.", err);
      } finally {
        if (active) {
          setLoadingQuote(false);
        }
      }
    }
    fetchQuote();
    return () => {
      active = false;
    };
  }, []);

  const handleMachineStateChange = (state: string) => {
    setMachineState(state);
    switch (state) {
      case "normal":
        setHardwareAdvice("🔥 سطح تمرکز داوطلب در بالاترین و پایدارترین حد ممکن قرار دارد. پیشنهاد می‌شود از این فاز طلایی برای حل تست‌های دوره‌ای سخت (مثل تست‌های جامع سردفتری) استفاده نمایید.");
        break;
      case "warm":
        setHardwareAdvice("🥱 ذهن داوطلب روبه خستگی خفیف است. لطفاً ساعات مطالعه را پومودورو کنید؛ یعنی ۵۰ دقیقه مطالعه عمیق و ۱۰ دقیقه استراحت متمرکز جهت ریکاوری پالس‌های فکری.");
        break;
      case "error_risk":
        setHardwareAdvice("😰 ناپایداری در یادآوری قوانین خاص حقوق ثبت گزارش شده است! لطفاً تندخوانی قوانین ثبتی را فعال کنید و ۵ دور تست تحلیلی تعاملی برای تسلط مجدد بزنید.");
        break;
      case "optimal":
        setHardwareAdvice("🎯 شاخص تمرکز، انگیزه و آرامش ذهنی داوطلب روی نمره کمال تحصیلی است. بسیار عالی! ثبت خلاصه تراز در دیتابیس پشتیبانی مربیگری چتر دانش با موفقیت انجام شد.");
        break;
      default:
        setHardwareAdvice("");
    }
  };

  const toggleTask = (index: number) => {
    const updated = [...todayTasks];
    updated[index].completed = !updated[index].completed;
    setTodayTasks(updated);
  };

  const totalTasksCount = todayTasks.length;
  const completedTasksCount = todayTasks.filter(t => t.completed).length;
  const taskProgressPercent = totalTasksCount > 0 ? Math.round((completedTasksCount / totalTasksCount) * 100) : 0;

  return (
    <div className="space-y-6" id="dashboard-view-container">
      
      {/* Prime Header Dashboard Welcomer */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-100 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50/40 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-blue-50/40 rounded-full blur-2xl pointer-events-none" />
        
        <div className="relative z-10 space-y-1 text-right">
          <h1 className="text-xl md:text-2xl font-black text-slate-800">
            خوش آمدید، {student.name} گرامی 👋
          </h1>
          <p className="text-xs text-slate-400 font-medium">
            مدیریت تراز تحصیلی، مانیتورینگ زنده پرونده و حل علمی تله‌های تستی چتر دانش
          </p>
        </div>
        
        <div className="relative z-10 font-mono text-left bg-slate-50 border border-slate-100 p-3 rounded-2xl flex items-center gap-3">
          <div className="text-right">
            <span className="text-[10px] text-slate-400 block font-sans font-bold">شماره داوطلبی</span>
            <span className="text-xs font-black text-indigo-950">{toPersianNum(student.code)}</span>
          </div>
        </div>
      </div>

      {/* Cloud & System Operational Status Card */}
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-slate-900 text-white p-5 rounded-3xl border border-slate-800 shadow-2xl relative overflow-hidden" id="cloud-system-status-card"
      >
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center shrink-0 shadow-inner">
              <Layers size={28} className="text-indigo-400 animate-pulse" />
            </div>
            <div className="space-y-1 text-right">
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-black text-white">زیرساخت ابری هوشمند چتر دانش</h3>
                <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-400 text-[8px] font-black rounded-full border border-emerald-500/20 flex items-center gap-1 uppercase">
                   <div className="w-1 h-1 rounded-full bg-emerald-400" />
                   <span>عملیاتی</span>
                </span>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed font-medium">
                توزیع میکروسرویسی بار بر روی خوشه‌های کلاود اختصاصی؛ تمام داده‌های تراز و فرآیندهای مربیگری تحت پروتکل امنیتی Admin-v2 فعال و همگام است.
              </p>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-3 min-w-[200px]">
            <div className="bg-white/5 border border-white/10 p-2 rounded-xl text-center">
              <span className="text-[8px] text-slate-500 block font-bold">Latency</span>
              <span className="text-[11px] font-mono font-black text-amber-400">42ms</span>
            </div>
            <div className="bg-white/5 border border-white/10 p-2 rounded-xl text-center">
              <span className="text-[8px] text-slate-500 block font-bold">Uptime S1</span>
              <span className="text-[11px] font-black text-indigo-300">99.9%</span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Visual pulsing warning indicator for qeiValue < 5200 */}
      <AnimatePresence>
        {qeiValue < 5200 && (() => {
          const isSevere = qeiValue < 5000;
          return (
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -10 }}
              transition={{ duration: 0.3 }}
              onClick={() => setIsTroubleshootingOpen(true)}
              className={`p-5 border-2 rounded-3xl flex flex-col sm:flex-row items-center justify-between gap-4 animate-pulse hover:scale-[1.01] hover:shadow-xl active:scale-[0.99] cursor-pointer transition-all duration-300 text-right font-sans ${
                isSevere 
                  ? "bg-red-50 border-red-400 text-red-950 hover:border-red-650" 
                  : "bg-amber-50 border-amber-400 text-amber-950 hover:border-amber-650"
              }`}
              id="qei-critical-warning-alert-top"
              title="جهت مشاهده راهنمای گام‌به‌گام رفع تله تستی کلیک کنید"
            >
              <div className="flex items-start gap-3.5">
                <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 ${
                  isSevere ? "bg-red-150 text-red-650" : "bg-amber-150 text-amber-650"
                }`}>
                  <ShieldAlert size={22} className={`animate-bounce ${isSevere ? "text-red-600" : "text-amber-600"}`} />
                </div>
                <div className="space-y-1">
                  <strong className={`text-sm font-black block ${isSevere ? "text-red-700" : "text-amber-700"}`}>
                    {isSevere 
                      ? "🚨 هشدار بحرانی: تراز شبیه‌ساز کانون وکالت (QEI) به شدت کاهش یافته است!" 
                      : "⚠️ هشدار تراز: تراز آزمایشی (QEI) در وضعیت هشدار ممیزی است!"
                    }
                  </strong>
                  <p className={`text-xs leading-relaxed font-semibold ${isSevere ? "text-red-900" : "text-amber-900"}`}>
                    {isSevere ? (
                      <>
                        شاخص تراز پرونده در حال حاضر روی عدد <span className="font-black font-mono bg-red-100 px-1.5 py-0.5 rounded text-red-800">{toPersianNum(qeiValue)} QEI</span> است که از حد نصاب قبولی عملیاتی (۵۰۰۰) پائین‌تر می‌باشد. برای اصلاح تله‌های تستی و رفع اشتباهات، ترجیحاً فرآیند خودکار بهبود تراز (کایزن تحصیلی) را آغاز نمایید.
                      </>
                    ) : (
                      <>
                        شاخص تراز پرونده در حال حاضر روی عدد <span className="font-black font-mono bg-amber-100 px-1.5 py-0.5 rounded text-amber-850">{toPersianNum(qeiValue)} QEI</span> است که در محدوده هشدار متوسط (۵۰۰۰ تا ۵۲۰۰) قرار دارد. برای جلوگیری از انباشت اشتباهات و افت تراز، تفکر کایزن درسی را پایش نمایید.
                      </>
                    )}
                  </p>
                  
                  <div className="pt-1.5">
                    <span className={`text-[10px] font-black block ${isSevere ? "text-red-805" : "text-amber-855"}`}>💡 اقدام توصیه شده داوطلب:</span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onNavigate("counselor");
                      }}
                      className={`text-xs font-bold underline transition-colors cursor-pointer inline-flex items-center gap-1 ${
                        isSevere 
                          ? "text-red-850 hover:text-red-950" 
                          : "text-amber-855 hover:text-amber-955"
                      }`}
                    >
                      جهت عارضه‌یابی تفصیلی و دریافت نقشه راه مطالعه فوری به صفحه مشاور علمی مراجعه نمایید ←
                    </button>
                  </div>
                </div>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  startQualityImprovement();
                }}
                className={`px-5 py-2.5 text-white rounded-xl text-xs font-black tracking-tight transition cursor-pointer shrink-0 hover:scale-[1.02] active:scale-95 shadow font-semibold ${
                  isSevere ? "bg-red-600 hover:bg-red-700" : "bg-amber-600 hover:bg-amber-700"
                }`}
              >
                کایزن درسی اضطراری
              </button>
            </motion.div>
          );
        })()}
      </AnimatePresence>

      {/* Troubleshooting Modal container */}
      <AnimatePresence>
        {isTroubleshootingOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm" id="qei-troubleshooting-modal-overlay">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-2xl overflow-hidden bg-white border border-slate-100 rounded-3xl shadow-2xl flex flex-col text-right font-sans"
              id="qei-troubleshooting-modal"
            >
              {/* Header */}
              <div className="flex items-center justify-between p-5 border-b border-slate-100 bg-slate-50">
                <button
                  onClick={() => setIsTroubleshootingOpen(false)}
                  className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-200 rounded-lg transition-all cursor-pointer"
                  id="qei-troubleshooting-modal-close-btn"
                >
                  <X size={18} />
                </button>
                <div className="flex items-center gap-2.5">
                  <span className={`p-2 rounded-xl ${qeiValue < 5000 ? "bg-red-50 text-red-600" : "bg-amber-50 text-amber-600"}`}>
                    <ShieldAlert size={18} />
                  </span>
                  <div>
                    <div className="flex items-center gap-2 mb-0.5">
                      <h3 className="text-sm font-black text-slate-800">
                        راهنمای افزایش تراز و عیب‌یابی ممیزی {toPersianNum(qeiValue)} QEI
                      </h3>
                      {criticalTrapsCount > 0 && (
                        <span className="bg-rose-500 text-white text-[9px] font-black px-2 py-0.5 rounded-full animate-pulse flex items-center gap-1">
                          <Target size={10} />
                          <span>{toPersianNum(criticalTrapsCount)} تله بحرانی در حال بررسی</span>
                        </span>
                      )}
                    </div>
                    <p className="text-[10px] text-slate-400 font-bold">
                      راهنمای جامع برنامه‌ریزی تحصیلی و برطرف‌سازی خطای تستی داوطلبان کانون
                    </p>
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="p-6 overflow-y-auto max-h-[70vh] space-y-5">
                <div className={`p-4 rounded-2xl border ${
                  qeiValue < 5000 
                    ? "bg-red-50 border-red-200 text-slate-850" 
                    : "bg-amber-50 border-amber-200 text-slate-850"
                }`}>
                  <strong className="text-xs font-black block mb-2">
                    {qeiValue < 5000 
                      ? "🚨 وضعیت داوطلب: بحرانی (بازه خطای مهلک در حقوق مدنی و تجارت)" 
                      : "⚠️ وضعیت داوطلب: هشدار افت تندخوانی قوانین"
                    }
                  </strong>
                  <p className="text-xs leading-relaxed">
                    {qeiValue < 5000 ? (
                      <>
                        شاخص تراز شما در حال حاضر روی عدد <span className="font-black font-mono bg-red-100 px-1.5 py-0.5 rounded text-red-800">{toPersianNum(qeiValue)} QEI</span> است که پایین‌تر از سطح رقابت امن قبولی کانون (۵۰۰۰) است. برای فایق آمدن بر گزینه‌های انحرافی حقوق مدنی، ترجیحاً فرآیند خودکار بهبود تراز را فعال نمایید.
                      </>
                    ) : (
                      <>
                        شاخص تراز شما در حال حاضر روی عدد <span className="font-black font-mono bg-amber-100 px-1.5 py-0.5 rounded text-amber-850">{toPersianNum(qeiValue)} QEI</span> است که در حوزه خستگی مطالعاتی یا ضعف در قوانین خاص است.
                      </>
                    )}
                  </p>
                  
                  <div className="pt-2 border-t border-slate-100/50 mt-2 flex flex-col gap-1.5">
                    <span className={`text-[10px] font-black block ${qeiValue < 5000 ? "text-red-800" : "text-amber-800"}`}>💡 اقدام توصیه شده:</span>
                    <button
                      onClick={() => {
                        setIsTroubleshootingOpen(false);
                        onNavigate("counselor");
                      }}
                      className={`text-xs font-bold underline text-right transition-colors cursor-pointer inline-flex items-center gap-1 ${
                        qeiValue < 5000 
                          ? "text-red-700 hover:text-red-950" 
                          : "text-amber-700 hover:text-amber-950"
                      }`}
                    >
                      جهت تحلیل کارنامه فنی و کالیبراسیون برنامه درسی با هوش مصنوعی به صفحه مشاور فرآیند مراجعه کنید ←
                    </button>
                  </div>
                </div>

                {/* Step-by-step Troubleshooting Steps */}
                <div className="space-y-4">
                  <h4 className="text-xs font-black text-slate-700 block mb-1">گام‌های مربیگری رفع تله تستی به تفکیک تراز علمی:</h4>
                  
                  {qeiValue < 5000 ? (
                    <div className="space-y-3">
                      <div className="flex items-start gap-3.5" id="step-1">
                        <span className="w-6 h-6 shrink-0 rounded-full bg-red-600 text-white font-black text-xs flex items-center justify-center font-mono">
                          ۱
                        </span>
                        <div className="space-y-1">
                          <strong className="text-xs font-bold text-slate-800 block">ریست فکری و مرور نص صریح</strong>
                          <p className="text-[11px] text-slate-600 leading-relaxed">
                            تست‌زنی تفننی بدون پایه مطالعاتی را فوراً متوقف کرده، کتب قانون صریح را باز کرده و مواعد قانونی آیین دادرسی مدنی را دوباره بنویسید.
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start gap-3.5" id="step-2">
                        <span className="w-6 h-6 shrink-0 rounded-full bg-red-600 text-white font-black text-xs flex items-center justify-center font-mono">
                          ۲
                        </span>
                        <div className="space-y-1">
                          <strong className="text-xs font-bold text-slate-800 block">بررسی زمان تلف‌شده روی پاسخ‌های اشتباه</strong>
                          <p className="text-[11px] text-slate-600 leading-relaxed">
                            از اصرار بر پاسخگویی به سوالات طولانی یا مباحث مبهم حقوق تجارت خودداری کنید. گزینه‌های شک‌دار را علامت قرمزی بگذارید و رد شوید.
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start gap-3.5" id="step-3">
                        <span className="w-6 h-6 shrink-0 rounded-full bg-red-600 text-white font-black text-xs flex items-center justify-center font-mono">
                          ۳
                        </span>
                        <div className="space-y-1">
                          <strong className="text-xs font-bold text-slate-800 block">اصلاح ساعت تعادل اصول فقه</strong>
                          <p className="text-[11px] text-slate-600 leading-relaxed">
                            ضریب تعادل اصول فقه را با توجه به کتاب‌های آموزشی چتر دانش روی ۳۰ درصد بودجه‌بندی ثابت نگه دارید تا مابقی دروس از موازنه خارج نشوند.
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start gap-3.5" id="step-4">
                        <span className="w-6 h-6 shrink-0 rounded-full bg-red-600 text-white font-black text-xs flex items-center justify-center font-mono">
                          ۴
                        </span>
                        <div className="space-y-1">
                          <strong className="text-xs font-bold text-slate-800 block">اجرای مربیگری هوشمند کایزن درسی</strong>
                          <p className="text-[11px] text-slate-600 leading-relaxed">
                            بعد از تمهیدات فوق، دکمه زرد <strong className="font-bold">«اجرای فرآیند خودکار بهبود کیفیت (کایزن)»</strong> را فشار دهید تا آمارهای تراز در ریلم لوکال کالیبره شده و مجدد در محدوده تایید قرار گیرد.
                          </p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div className="flex items-start gap-3.5" id="step-1">
                        <span className="w-6 h-6 shrink-0 rounded-full bg-amber-500 text-white font-black text-xs flex items-center justify-center font-mono">
                          ۱
                        </span>
                        <div className="space-y-1">
                          <strong className="text-xs font-bold text-slate-800 block">تنظیم فرکانس مرورهای هفتگی</strong>
                          <p className="text-[11px] text-slate-600 leading-relaxed">
                            خلاصه‌نویسی مباحث عقود معین کانون را در زمان‌های خستگی (ساعات پایانی شب) بازخوانی نمایید تا پایداری شناختی حفظ شود.
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start gap-3.5" id="step-2">
                        <span className="w-6 h-6 shrink-0 rounded-full bg-amber-500 text-white font-black text-xs flex items-center justify-center font-mono">
                          ۲
                        </span>
                        <div className="space-y-1">
                          <strong className="text-xs font-bold text-slate-800 block">رفع نقص حین تست‌های تالیفی</strong>
                          <p className="text-[11px] text-slate-600 leading-relaxed">
                            اشتباهات تست‌های تالیفی چتر دانش را سریعاً در دفترچه پاسخ تشریحی پیگیری کنید تا در آزمون کانون تکرار نگردند.
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start gap-3.5" id="step-3">
                        <span className="w-6 h-6 shrink-0 rounded-full bg-amber-500 text-white font-black text-xs flex items-center justify-center font-mono">
                          ۳
                        </span>
                        <div className="space-y-1">
                          <strong className="text-xs font-bold text-slate-800 block">سنکرون‌سازی مطالعه با مربی ناظر</strong>
                          <p className="text-[11px] text-slate-600 leading-relaxed">
                            تقویم مربیگری را با اهداف آزمون‌های آزمایشی چتر دانش هماهنگ کنید تا انحرافی در آمارهای پیشرفت بصری رخ ندهد.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Footer */}
              <div className="p-5 border-t border-slate-100 bg-slate-50 flex items-center justify-between">
                <button
                  onClick={() => setIsTroubleshootingOpen(false)}
                  className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-xl text-xs font-bold transition-all cursor-pointer"
                  id="qei-troubleshooting-modal-cancel-btn"
                >
                  بستن و انصراف
                </button>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setIsTroubleshootingOpen(false);
                      onNavigate("counselor");
                    }}
                    className="px-4 py-2 bg-blue-50 text-blue-900 border border-blue-200 hover:bg-blue-100 rounded-xl text-xs font-bold transition-all cursor-pointer"
                    id="qei-troubleshooting-modal-counselor-btn"
                  >
                    مراجعه به مشاور علمی چتر دانش (AI)
                  </button>
                  <button
                    onClick={() => {
                      setIsTroubleshootingOpen(false);
                      startQualityImprovement();
                    }}
                    className={`px-4 py-2 text-white rounded-xl text-xs font-black transition-all cursor-pointer ${
                      qeiValue < 5000 ? "bg-red-600 hover:bg-red-700" : "bg-amber-600 hover:bg-amber-700"
                    }`}
                    id="qei-troubleshooting-modal-kaizen-btn"
                  >
                    شروع بهبود تراز کایزن علمی
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Dynamic Motivational Quote featuring deep beautiful mesh background */}
      <motion.div 
         initial={{ opacity: 0, y: -10 }}
         animate={{ opacity: 1, y: 0 }}
         className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-indigo-950 to-indigo-950 text-white rounded-3xl p-6 md:p-8 shadow-xl border border-indigo-950/20"
         id="motivational-banner"
      >
        <div className="absolute right-0 top-0 bottom-0 left-0 w-full h-full bg-[radial-gradient(circle_at_bottom_left,rgba(99,102,241,0.15),transparent)] pointer-events-none" />
        <div className="absolute -left-12 -bottom-12 text-white/[0.04] rotate-12 pointer-events-none">
          <Quote size={240} />
        </div>
        
        <div className="relative z-10 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
          <div className="space-y-3 max-w-3xl">
            <div className="flex items-center gap-2">
              <span className="p-1 px-2.5 bg-amber-400/10 text-amber-300 border border-amber-400/20 rounded-lg text-[9px] font-black tracking-wider flex items-center gap-1 uppercase">
                <Sparkles size={11} className="text-amber-400 animate-spin-slow" />
                <span>رهنمود مدیریتی و مربیگری علمی چتر دانش</span>
              </span>
            </div>
            
            <h2 className="text-base md:text-lg font-bold text-slate-100 leading-relaxed font-sans first-letter:capitalize">
              {loadingQuote ? (
                <span className="inline-block h-4 w-48 bg-white/20 animate-pulse rounded"></span>
              ) : (
                `« {quote} »`
              )}
            </h2>
            
            <p className="text-[11px] text-indigo-250">صادر شده توسط هوش تجمیعی مشاور ارشد چتر دانش (دستیار علمی آزمون‌های حقوقی)</p>
          </div>

          <div className="flex-shrink-0 bg-white/5 border border-white/10 rounded-2xl p-4 w-full lg:w-85 backdrop-blur-sm space-y-3">
            <h3 className="text-[11px] font-black text-amber-300 flex items-center gap-1.5 justify-start">
              <HeartPulse size={12} />
              <span>پایش ثبات ذهنی، انگیزه مطالعاتی و فرسودگی داوطلب</span>
            </h3>
            <div className="grid grid-cols-4 gap-1.5">
              {[
                { id: "optimal", icon: "✨", label: "ایده‌آل" },
                { id: "warm", icon: "🌡️", label: "خسته" },
                { id: "normal", icon: "⚡", label: "پایدار" },
                { id: "error_risk", icon: "⚠️", label: "پریشان" }
              ].map((m) => (
                <button
                  key={m.id}
                  onClick={() => handleMachineStateChange(m.id)}
                  type="button"
                  className={`py-1.5 px-1 rounded-xl text-center transition-all cursor-pointer flex flex-col items-center gap-1 border ${
                    machineState === m.id
                      ? "bg-amber-400 border-amber-450 text-slate-950 font-black scale-105 animate-pulse"
                      : "bg-white/5 border-white/5 hover:bg-white/10 text-slate-300"
                  }`}
                >
                  <span className="text-base">{m.icon}</span>
                  <span className="text-[9px]">{m.label}</span>
                </button>
              ))}
            </div>

            <AnimatePresence mode="wait">
              {machineState && (
                <motion.div 
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                  className="bg-slate-950/80 border border-indigo-400/20 p-2.5 rounded-xl text-[10px] text-indigo-100 leading-relaxed text-right"
                >
                  {hardwareAdvice}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </motion.div>

      {/* Kaizen Quality Optimization Center */}
      <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-4 text-right" id="kaizen-quality-optimization-center">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="space-y-1">
            <h3 className="font-sans font-black text-slate-900 text-base flex items-center gap-2 justify-start">
              <span className="p-1 px-2.5 bg-indigo-50 text-indigo-700 text-[10px] rounded-lg font-black border border-indigo-150">کایزن فعال</span>
              <span>⚙️ پرتال تخصصی برنامه‌ریزی و بهبود علمی تراز داوطلبان</span>
            </h3>
            <p className="text-slate-500 text-xs">
              بر پایه متدهای نوین بهینه‌سازی کایزن درسی چتر دانش، مهار نمره‌های منفی مباحث سخت حقوق مصلحت کانون.
            </p>
          </div>
          
          {!isOptimizing && (
            <div className="flex flex-wrap gap-2">
              {!showCelebration ? (
                <button
                  onClick={startQualityImprovement}
                  className="px-5 py-3 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-black text-xs rounded-xl shadow-md cursor-pointer flex items-center gap-2 transition-all hover:scale-[1.02] active:scale-95 shrink-0"
                  id="btn-trigger-kaizen-optimize"
                >
                  <Zap size={15} className="fill-slate-950 hover:animate-bounce" />
                  <span>اجرای فرآیند خودکار بهبود تراز (کایزن درسی)</span>
                </button>
              ) : (
                <button
                  onClick={resetQualityStatus}
                  className="px-4 py-2.5 bg-slate-50 hover:bg-slate-100 text-slate-650 font-extrabold text-xs rounded-xl border border-dashed border-slate-300 cursor-pointer transition-all flex items-center gap-1 shrink-0"
                  id="btn-reset-kaizen-optimize"
                >
                  <span>بازنشانی تراز به مقدار پایه</span>
                </button>
              )}

              <button
                onClick={() => {
                  const targetQei = 4850;
                  setQeiValue(targetQei);
                  setShowCelebration(false);
                  
                  const savedData = localStorage.getItem(`arateb_goals_${student.id}`);
                  let parsed = {};
                  if (savedData) {
                    try {
                      parsed = JSON.parse(savedData);
                    } catch (e) {}
                  }
                  
                  const updatedData = {
                    ...parsed,
                    currentQeiValue: targetQei,
                  };
                  localStorage.setItem(`arateb_goals_${student.id}`, JSON.stringify(updatedData));
                }}
                className="px-4 py-3 bg-red-50 hover:bg-red-150 text-red-700 font-extrabold text-xs rounded-xl border border-red-200 cursor-pointer transition-all flex items-center gap-1.5 shrink-0 shadow-sm font-sans"
                id="btn-simulate-qei-drop"
              >
                <AlertTriangle size={13} className="animate-pulse text-red-650" />
                <span>شبیه‌سازی افت شدید تراز (به ۴,۸۵۰ QEI)</span>
              </button>

              <button
                onClick={() => {
                  const targetQei = 5100;
                  setQeiValue(targetQei);
                  setShowCelebration(false);
                  
                  const savedData = localStorage.getItem(`arateb_goals_${student.id}`);
                  let parsed = {};
                  if (savedData) {
                    try {
                      parsed = JSON.parse(savedData);
                    } catch (e) {}
                  }
                  
                  const updatedData = {
                    ...parsed,
                    currentQeiValue: targetQei,
                  };
                  localStorage.setItem(`arateb_goals_${student.id}`, JSON.stringify(updatedData));
                }}
                className="px-4 py-3 bg-amber-50 hover:bg-amber-100 text-amber-800 font-extrabold text-xs rounded-xl border border-amber-200 cursor-pointer transition-all flex items-center gap-1.5 shrink-0 shadow-sm font-sans"
                id="btn-simulate-qei-warn"
              >
                <AlertTriangle size={13} className="animate-pulse text-amber-600" />
                <span>شبیه‌سازی افت متوسط تراز (به ۵,۱۰۰ QEI)</span>
              </button>
            </div>
          )}
        </div>

        {/* Optimizing State */}
        {isOptimizing && (
          <div className="bg-indigo-50/50 p-5 rounded-2xl border border-indigo-100/50 space-y-4 animate-pulse">
            <div className="flex justify-between items-center">
              <span className="text-xs font-black text-indigo-950 flex items-center gap-2 select-none">
                <RefreshCw size={14} className="animate-spin text-indigo-700" />
                <span>فرآیند کایزن علمی در حال تحلیل پرونده مطالعاتی شماست...</span>
              </span>
              <span className="text-xs font-mono font-black text-indigo-700">
                {toPersianNum(Math.round((optimizationStep / 5) * 100))}%
              </span>
            </div>

            {/* Progress bar */}
            <div className="w-full bg-slate-200/80 h-3 rounded-full overflow-hidden">
              <div 
                className="bg-indigo-600 h-full rounded-full transition-all duration-300"
                style={{ width: `${(optimizationStep / 5) * 100}%` }}
              />
            </div>

            {/* Simulated Live logs */}
            <div className="space-y-1.5 font-mono text-[11px] text-slate-600 tracking-tight text-right bg-white p-4 rounded-xl border border-slate-100/50 max-h-32 overflow-y-auto">
              {optimizationLogs.map((log, index) => (
                <div key={index} className="flex items-center gap-2 text-indigo-950 justify-start">
                  <span className="text-emerald-500 font-bold">✓</span>
                  <span>{log}</span>
                </div>
              ))}
              <div className="flex items-center gap-2 text-indigo-700 animate-pulse justify-start mt-2">
                <span className="animate-ping block w-1.5 h-1.5 rounded-full bg-indigo-500" />
                <span className="font-bold">در حال پردازش گام ممیزی و محاسبات ریاضی...</span>
              </div>
            </div>
          </div>
        )}

        {/* Celebration State */}
        {showCelebration && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-emerald-50 text-emerald-950 p-5 rounded-2xl border border-emerald-200 flex flex-col md:flex-row items-center justify-between gap-6"
          >
            <div className="space-y-2 flex-1 text-right border-l border-emerald-100/80 pl-4 md:pl-6">
              <div className="flex items-center gap-2 justify-start">
                <span className="p-1 px-2.5 bg-emerald-600 text-white text-[9px] font-black rounded-full shadow-sm">
                  رفع اشکال ۱۰۰٪ 🌟
                </span>
                <h4 className="font-extrabold text-sm text-emerald-900 font-sans">
                  بهینه‌سازی کایزن با موفقیت بر برنامه درسی اعمال شد!
                </h4>
              </div>
              <p className="text-xs leading-relaxed text-emerald-800 font-semibold">
                با پایش پیوسته ساعات مطالعه و بودجه‌بندی دروس تستی و با کاهش پاسخ‌های غلط آزمون‌ها به صفر، تراز کارنامه به شکل ایده‌آلی موازنه گردید. تراز آزمایشی طلایی ۶,۸۵۰ در پرونده داوطلبی چتر دانش ثبت گردید و پیش‌بینی قبولی کانون وکلا به سطح سبز ممتاز رسید.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 w-full md:w-auto text-center font-sans">
              <div className="bg-white px-5 py-3 rounded-xl border border-emerald-100 shadow-sm min-w-[130px]">
                <span className="text-[10px] text-slate-400 block pb-0.5 font-bold">تراز کارنامه جدید</span>
                <span className="text-sm font-black text-emerald-600 font-mono">۶,۸۵۰ QEI</span>
              </div>
              <div className="bg-white px-5 py-3 rounded-xl border border-emerald-100 shadow-sm min-w-[130px]">
                <span className="text-[10px] text-slate-400 block pb-0.5 font-bold">پاسخ‌دهی بدون اشتباه</span>
                <span className="text-sm font-black text-emerald-600 font-mono">۸۵٪ پاسخ صحیح</span>
              </div>
            </div>
          </motion.div>
        )}

        {/* Idle Mode description of quality challenges */}
        {!isOptimizing && !showCelebration && (
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-150 grid grid-cols-1 md:grid-cols-3 gap-4 text-right">
            <div className="space-y-1">
              <span className="text-slate-700 text-xs font-extrabold block">۱. کورتکس و حل تله‌های تستی کانون</span>
              <p className="text-[11px] text-slate-500 leading-relaxed font-semibold">
                به دلیل عدم تثبیت واژگان اصول فقه، بیشترین نمره منفی در آزمون کانون ثبت شده که مطالعه تطبیقی این مبحث با منابع چتر دانش آن را برطرف می‌کند.
              </p>
            </div>
            <div className="space-y-1">
              <span className="text-slate-700 text-xs font-extrabold block">۲. مبانی تعهدات و عقود معین کاتوزیان</span>
              <p className="text-[11px] text-slate-500 leading-relaxed font-semibold">
                برای درک بهتر مواد عقد مضاربه، حتماً مواد آن را با مثال‌های تشریحی و آراف ثبت وکالت بازخوانی نمایید.
              </p>
            </div>
            <div className="space-y-1">
              <span className="text-slate-700 text-xs font-extrabold block">۳. قوانین خاص حقوق ثبت اسناد</span>
              <p className="text-[11px] text-slate-500 leading-relaxed font-semibold">
                تسلط تندخوانی بر مواد ۲۲، ۴۶، ۴۷ و ۴۸ ثبت جهت موفقیت قطعی در آزمون طاقت‌فرسای سردفتری.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Metrics Cards Grid - Ultra Slick Redesigned */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4" id="metrics-grid">
        
        {/* Traz Score Metric Card */}
        <div 
          className={`rounded-3xl p-5 border shadow-sm hover:shadow-md transition-all group flex flex-col justify-between h-[124px] ${
            qeiValue < 5000 
              ? "bg-red-50/70 border-red-300 ring-2 ring-red-500/25 animate-pulse text-red-950" 
              : qeiValue < 5200
                ? "bg-amber-50/70 border-amber-300 ring-2 ring-amber-500/25 animate-pulse text-amber-950"
                : "bg-white border-slate-100 text-slate-800"
          }`} 
          id="metric-traz"
        >
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <span className={`text-[10px] font-bold block pb-0.5 ${
                qeiValue < 5000 
                  ? "text-red-700" 
                  : qeiValue < 5200 
                    ? "text-amber-700" 
                    : "text-slate-400"
              }`}>
                تراز و موقعیت رقبای کانون
              </span>
              <p className="text-xs font-black">تراز تجمعی آزمون کل (QEI)</p>
            </div>
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110 ${
              qeiValue < 5000 
                ? "bg-red-100 text-red-650" 
                : qeiValue < 5200 
                  ? "bg-amber-100 text-amber-600" 
                  : "bg-blue-50 text-blue-600"
            }`}>
              {qeiValue < 5200 ? <ShieldAlert size={20} className={qeiValue < 5000 ? "animate-bounce" : "animate-pulse"} /> : <TrendingUp size={20} />}
            </div>
          </div>
          <div className={`flex items-center justify-between mt-3 pt-2 border-t ${
            qeiValue < 5000 
              ? "border-red-200" 
              : qeiValue < 5200 
                ? "border-amber-200" 
                : "border-slate-50"
          }`}>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-black font-mono">{toPersianNum(qeiValue.toLocaleString())}</span>
              <span className={`text-[9px] font-black px-1.5 py-0.5 rounded-md border ${
                qeiValue < 5000 
                  ? "bg-red-600 text-white border-red-500"
                  : qeiValue < 5200
                    ? "bg-amber-500 text-white border-amber-400"
                    : qeiValue > 5575 
                      ? "bg-emerald-50 text-emerald-600 border-emerald-100" 
                      : "bg-slate-50 text-slate-400 border-slate-100"
              }`}>
                {qeiValue < 5000 
                  ? "بحرانی" 
                  : qeiValue < 5200
                    ? "هشدار تراز"
                    : qeiValue > 5575 
                      ? `▲ ${toPersianNum(qeiValue - 5575)}+` 
                      : "تراز پایه"
                }
              </span>
            </div>
            <span className={`text-[9px] ${
              qeiValue < 5000 
                ? "text-red-700 font-black animate-pulse" 
                : qeiValue < 5200
                  ? "text-amber-700 font-black animate-pulse"
                  : "text-slate-400"
            }`}>
              {qeiValue < 5000 
                ? "⚠️ افت شدید تراز" 
                : qeiValue < 5200
                  ? "⚠️ روند نزولی ممیزی"
                  : "پایش برخط چتر دانش"
              }
            </span>
          </div>
        </div>

        {/* Avg Correct Percentage Card */}
        <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-sm hover:shadow-md transition-all group flex flex-col justify-between h-[124px]" id="metric-percentage">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-slate-400 block pb-0.5">درصد پاسخگویی و کالباره کانون</span>
              <p className="text-xs font-black text-slate-600">نرخ پاسخگویی صحیح (سالم)</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center transition-transform group-hover:scale-110">
              <Target size={20} />
            </div>
          </div>
          <div className="flex items-center justify-between mt-3 pt-2 border-t border-slate-50">
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-black text-slate-800 font-mono">{toPersianNum(successRate)}٪</span>
              <span className="text-[9px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-100">سقف مطلوب: ۸۵٪</span>
            </div>
            <span className="text-[9px] text-slate-400 text-left">
              {successRate >= 85 ? "پیش‌بینی رتبه ۲ رقمی کانون" : `فاصله ${toPersianNum(85 - successRate)} پله‌ای`}
            </span>
          </div>
        </div>

        {/* Severe Weakness Count Card */}
        <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-sm hover:shadow-md transition-all group flex flex-col justify-between h-[124px]" id="metric-weaknesses">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-slate-400 block pb-0.5">آنالیز اشتباهات تصحیح کارنامه</span>
              <p className="text-xs font-black text-slate-655">تعداد دروس نمره منفی بحرانی</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-red-50 text-red-600 flex items-center justify-center transition-transform group-hover:scale-110">
              <AlertTriangle size={20} className={bottleneckCount > 0 ? "animate-pulse" : ""} />
            </div>
          </div>
          <div className="flex items-center justify-between mt-3 pt-2 border-t border-slate-50">
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-black text-red-600 font-mono">{toPersianNum(bottleneckCount)}</span>
              <span className="text-[10px] text-slate-500 font-bold">مبحث قانونی ضعیف</span>
            </div>
            <span className={`text-[9px] px-1.5 py-0.5 rounded-md font-bold border ${
              bottleneckCount > 0 ? "bg-red-50 text-red-600 border-red-100" : "bg-emerald-50 text-emerald-600 border-emerald-100"
            }`}>
              {bottleneckCount > 0 ? "نیاز مبرم به تست" : "تراز آمادگی کامل"}
            </span>
          </div>
        </div>

        {/* Study Streak Card */}
        <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-sm hover:shadow-md transition-all group flex flex-col justify-between h-[124px]" id="metric-streak">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-slate-400 block pb-0.5">پیوستگی مطالعه روزانه داوطلب</span>
              <p className="text-xs font-black text-slate-600">پیوستگی مطالعه (روز)</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center transition-transform group-hover:scale-110">
              <Zap size={20} className="text-emerald-600 fill-emerald-100" />
            </div>
          </div>
          <div className="flex items-center justify-between mt-3 pt-2 border-t border-slate-50">
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black text-emerald-800 font-mono">{toPersianNum(streakDays)} روز</span>
              <span className="text-[9px] font-black px-1.5 py-0.5 bg-emerald-50 text-emerald-700 rounded-md border border-emerald-100">انگیزه مطالعاتی پایدار 🔥</span>
            </div>
            <span className="text-[9px] text-slate-400 font-bold">بدون خلاء برنامه‌ریزی</span>
          </div>
        </div>
      </div>

      {/* Goal Tracking Core Section */}
      <div className="relative">
        <div className="absolute top-0 left-0 bg-blue-100/30 text-blue-900 border border-blue-200/50 py-1 px-3.5 rounded-bl-3xl rounded-tr-3xl text-[9px] font-extrabold z-10 pointer-events-none">
          پروژه مانیتورینگ عملکرد و برنامه‌ریزی تراز داوطلبان چتر دانش
        </div>
        <GoalTracker 
          key={`${student.id}_${qeiValue}_${successRate}`} 
          student={student} 
          currentTraz={qeiValue} 
          currentPercentage={successRate} 
        />
      </div>

      {/* Two Columns Bento-Grid: Tasks of today & AI weaknesses */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Today's study list */}
        <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-4 flex flex-col justify-between" id="today-remedial-tasks-card">
          <div className="space-y-4">
            <div className="flex justify-between items-center pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <span className="p-2 bg-blue-50 text-blue-600 rounded-xl">
                  <CheckSquare size={16} />
                </span>
                <div className="text-right">
                  <h2 className="text-base font-black text-slate-800">برنامه مربیگری کایزن مطالعاتی امروز شما</h2>
                  <p className="text-[10px] text-slate-400">تنظیم شده بر مبنای برطرف‌سازی نقاط بحرانی پرونده تحصیلی داوطلب</p>
                </div>
              </div>
              <div className="flex items-center gap-1.5 text-[10px] bg-slate-50 text-slate-600 font-bold px-2 py-1 rounded-lg border border-slate-100">
                <Brain size={12} className="text-indigo-600" />
                <span>شبیه‌ساز مربیگری</span>
              </div>
            </div>

            {/* Task Progression Header */}
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/50 space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-500 font-bold">پیشرفت فیزیکی وظایف و کارهای خطوط دوره‌ای Study Progress:</span>
                <span className="font-mono font-black text-blue-950">{completedTasksCount} از {totalTasksCount} مورد ({taskProgressPercent}٪)</span>
              </div>
              <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                <div 
                  className="bg-blue-950 h-full rounded-full transition-all duration-300"
                  style={{ width: `${taskProgressPercent}%` }}
                />
              </div>
            </div>

            <div className="space-y-3">
              {todayTasks.map((task, idx) => (
                <div 
                  key={idx}
                  onClick={() => toggleTask(idx)}
                  className={`group p-4 rounded-2xl border transition-all duration-200 cursor-pointer flex gap-4 items-start select-none ${
                    task.completed 
                      ? "bg-emerald-50/30 border-emerald-200/80 hover:bg-emerald-50/50" 
                      : "bg-white border-slate-100/90 hover:border-slate-200 hover:shadow-sm"
                  }`}
                >
                  <div className={`w-5 h-5 rounded-lg border-2 flex items-center justify-center flex-shrink-0 transition duration-150 mt-0.5 ${
                    task.completed 
                      ? "bg-emerald-600 border-emerald-600 text-white" 
                      : "border-slate-300 group-hover:border-blue-900 bg-white"
                  }`}>
                    {task.completed && <Check size={11} strokeWidth={3} />}
                  </div>
                  <div className="flex-1 space-y-1 text-right">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className={`font-bold text-sm leading-6 ${task.completed ? "text-slate-400 line-through" : "text-slate-800"}`}>
                        {task.morningPlan}
                      </h3>
                      <span className={`px-2 py-0.5 rounded-lg text-[9px] font-black border ${
                        task.completed 
                          ? "bg-slate-100 text-slate-400 border-slate-200" 
                          : idx === 0 
                            ? "bg-indigo-50 text-indigo-700 border-indigo-150" 
                            : "bg-amber-50 text-amber-700 border-amber-150"
                      }`}>
                        {idx === 0 ? "⚠️ درس ضریب دار بالا" : "📦 پایش سرعت تستی"}
                      </span>
                    </div>
                    <p className={`text-xs leading-relaxed ${task.completed ? "text-slate-450" : "text-slate-500"}`}>
                      عصر: {task.afternoonPlan} <span className="font-mono text-[10px] bg-slate-100 px-1.5 py-0.5 rounded text-slate-700 font-bold">({task.totalQuestions} تست زمان‌دار هدف)</span>
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <button 
            onClick={() => onNavigate("schedule")}
            className="w-full bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-705 py-3 rounded-2xl text-[11px] font-bold transition flex items-center justify-center gap-1.5 cursor-pointer mt-4 hover:text-slate-950 font-sans"
          >
            <span>مشاهده سیستم برنامه‌ریزی هفتگی و مربیگری ناظر چتر دانش</span>
            <ChevronLeft size={14} />
          </button>
        </div>

        {/* AI Identified weaknesses list */}
        <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-4 flex flex-col justify-between" id="ai-weakness-recs-card">
          <div className="space-y-4">
            <div className="flex justify-between items-center pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2 text-right">
                <span className="p-2 bg-red-50 text-red-600 rounded-xl">
                  <AlertTriangle size={16} />
                </span>
                <div className="text-right">
                  <h2 className="text-base font-black text-slate-800">نقاط ضعف تستی نیازمند مرور ویژه</h2>
                  <p className="text-[10px] text-slate-400">مباحث دارای پاسخ‌های منفی بالا که رتبه و تراز کل را تحت تاثیر شدید قرار داده است</p>
                </div>
              </div>
              <span className="text-[10px] bg-rose-50 text-rose-600 px-2.5 py-1 rounded-lg font-black border border-rose-150 animate-pulse">
                بررسی فوری اشتباهات
              </span>
            </div>

            <div className="space-y-3">
              {mockWeaknesses.map((weak, idx) => (
                <div key={idx} className="p-4 bg-slate-50/50 rounded-2xl border border-slate-100/95 hover:border-slate-250 hover:bg-slate-50 transition space-y-2.5 relative">
                  <div className="flex justify-between items-start gap-4 text-right">
                    <div className="space-y-0.5 text-right flex-1">
                      <span className="text-[9px] font-black text-indigo-700 block">{weak.subject}</span>
                      <strong className="text-xs font-extrabold text-slate-800 block leading-relaxed">{weak.topic}</strong>
                    </div>
                    <span className={`text-[10px] font-mono font-black px-2 py-0.5 rounded-lg border shrink-0 ${
                      weak.severity === "critical" 
                        ? "bg-rose-50 text-rose-600 border-rose-100" 
                        : "bg-amber-50 text-amber-600 border-amber-100"
                    }`}>
                      بازدهی: {weak.percentage}٪
                    </span>
                  </div>
                  
                  {/* Mastery Progress Bar */}
                  <div className="space-y-1">
                    <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full ${weak.severity === "critical" ? "bg-red-500" : "bg-amber-500"}`}
                        style={{ width: `${weak.percentage}%` }}
                      />
                    </div>
                    <div className="flex justify-between text-[9px] text-slate-405 font-mono">
                      <span>ضریب انطباق صحت علمی: {weak.percentage}٪</span>
                      <span>تخمین بار منفی اشتباهات: ~{100 - weak.percentage}%</span>
                    </div>
                  </div>

                  <p className="text-xs text-slate-600 leading-relaxed bg-white/70 p-2.5 rounded-xl border border-slate-100 text-right">
                    <span className="font-extrabold text-indigo-800">توصیه مربی چتر دانش: </span>{weak.recommendation}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <button 
            onClick={() => onNavigate("report")}
            className="w-full bg-blue-950 hover:bg-slate-900 text-white py-3 rounded-2xl text-[11px] font-bold transition flex items-center justify-center gap-1.5 cursor-pointer mt-4 hover:scale-[1.01]"
          >
            <span>مشاهده ریز درصدها، کارنامه خام و گواهی های تستی چتر دانش</span>
            <ChevronLeft size={14} />
          </button>
        </div>

      </div>

      {/* Visual active traps tree diagram based on legal subjects (Civil, Commercial, Criminal) */}
      <TrapsTreeMap 
        studentId={student.id} 
        studentName={student.name} 
        onRefreshStats={() => {
          setTrapsRefreshTrigger(prev => prev + 1);
        }} 
      />

      {/* Advanced AI Resources & Tips Panel */}
      <div className="bg-gradient-to-l from-indigo-50/50 to-blue-50/50 rounded-3xl p-6 border border-indigo-100/40 grid grid-cols-1 md:grid-cols-3 gap-5 text-right font-sans">
        <div className="flex gap-3.5 items-start justify-end">
          <div className="space-y-1 text-right flex-1">
            <h4 className="text-xs font-black text-slate-800">پشتیبانی و مربیگری ۲۴ ساعته (AI)</h4>
            <p className="text-[10px] text-slate-500 leading-relaxed">
              هر زمان حین خواندن عقود معین کاتوزیان یا اصول فقه دچار ابهام علمی شدید، سوال خود را از چت مشاور هوشمند بپرسید.
            </p>
          </div>
          <div className="p-3 bg-white text-indigo-850 rounded-2xl shadow-sm border border-slate-100 flex-shrink-0">
            <Compass size={18} />
          </div>
        </div>

        <div className="flex gap-3.5 items-start justify-end">
          <div className="space-y-1 text-right flex-1">
            <h4 className="text-xs font-black text-slate-800">کتابچه قوانین خاص حقوقی کانون</h4>
            <p className="text-[10px] text-slate-500 leading-relaxed">
              تطابق مطلق کارهای کلاسی با قوانین روابط موجر و مستأجر سال ۵۶ و ۷۶ جهت تثبیت حداکثر تراز تستی.
            </p>
          </div>
          <div className="p-3 bg-white text-amber-600 rounded-2xl shadow-sm border border-slate-100 flex-shrink-0">
            <BookOpen size={18} />
          </div>
        </div>

        <div className="flex gap-3.5 items-start justify-end">
          <div className="space-y-1 text-right flex-1">
            <h4 className="text-xs font-black text-slate-800">تکنیک تندخوانی و زمان‌بندی تستی</h4>
            <p className="text-[10px] text-slate-500 leading-relaxed">
              برای پیشگیری از کمبود زمان در جلسه آزمون حقوق تجارت کانون، تکرار دوره مکرر تست‌های سنوات را در اولویت عصر بگذارید.
            </p>
          </div>
          <div className="p-3 bg-white text-emerald-600 rounded-2xl shadow-sm border border-slate-100 flex-shrink-0">
            <Clock size={18} />
          </div>
        </div>
      </div>

    </div>
  );
}
