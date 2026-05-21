import { useState, useEffect } from "react";
import { Sparkles, Calendar, TrendingUp, AlertTriangle, CheckSquare, Target, Quote, ChevronLeft } from "lucide-react";
import { motion } from "motion/react";
import { Student, Weakness, DailyPlan } from "../../lib/taranom-types";
import GoalTracker from "./GoalTracker";

interface DashboardViewProps {
  student: Student;
  onNavigate: (view: "report" | "schedule" | "counselor" | "progress") => void;
}

export default function DashboardView({ student, onNavigate }: DashboardViewProps) {
  const [quote, setQuote] = useState("تلاش امروز تو، ترازِ درخشان فرداست. امروز هم با قدرت بجنگ؛ تو لایقِ رتبه‌هایِ رویایی هستی!");
  const [loadingQuote, setLoadingQuote] = useState(true);
  const [todayTasks, setTodayTasks] = useState<DailyPlan[]>([
    { day: "امروز", morningPlan: "رفع اشکال جامع مبحث 'حرکت‌شناسی' فیزیک دوازدهم", afternoonPlan: "حل ۴۰ تست شایستگی از کتاب کار ترنم", totalQuestions: 40, completed: false },
    { day: "امروز", morningPlan: "مطالعه فرمول‌های رفع ابهام حد بی‌نهایت", afternoonPlan: "حل ۲۵ تست تالیفی استاندارد کنکور", totalQuestions: 25, completed: true }
  ]);

  const mockWeaknesses: Weakness[] = [
    { topic: "حرکت‌شناسی (نمودارهای سرعت ثابت)", subject: "فیزیک تخصصی", percentage: 25, recommendation: "صفحه ۴۵ جزوه ریاضی فیزیک ترنم؛ حل تست‌های سری دوم", questionsCount: 45, severity: "critical" },
    { topic: "حد و پیوستگی (صفر صفرم)", subject: "حسابان ریاضی", percentage: 32, recommendation: "قاعده هوپیتال و هم‌ارزهای جبری؛ یادگیری از ویدیوی آموزشی", questionsCount: 30, severity: "critical" },
    { topic: "شیمی آلی (واکنش‌های متیل)", subject: "شیمی تخصصی", percentage: 41, recommendation: "مرور جدول تناوبی فرعی؛ ۲۵ تست زمان‌دار", questionsCount: 25, severity: "warning" }
  ];

  // Resilient fetch with exponential backoff retry to guard against startup race conditions
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

  // Fetch motivational quote on mount
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

  const toggleTask = (index: number) => {
    const updated = [...todayTasks];
    updated[index].completed = !updated[index].completed;
    setTodayTasks(updated);
  };

  return (
    <div className="space-y-6" id="dashboard-view-container">
      {/* Dynamic Motivational Quote with gorgeous aesthetic backdrop */}
      <motion.div 
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden bg-gradient-to-r from-blue-900 to-indigo-950 text-white rounded-3xl p-6 shadow-md border border-slate-100"
        id="motivational-banner"
      >
        <div className="absolute -left-10 -bottom-10 text-white/[0.03] rotate-12 pointer-events-none">
          <Quote size={200} />
        </div>
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-400/20 text-amber-300 flex items-center justify-center font-bold text-xl flex-shrink-0 animate-pulse">
              ✨
            </div>
            <div>
              <p className="text-xs text-amber-400 uppercase tracking-widest font-black flex items-center gap-1">
                <Sparkles size={12} />
                <span>پیام مشاوره‌ای و انگیزشی اختصاصی شما</span>
              </p>
              <h1 className="text-lg md:text-xl font-bold mt-1 text-slate-100 leading-relaxed font-sans">
                {loadingQuote ? (
                  <span className="inline-block h-4 w-48 bg-white/20 animate-pulse rounded"></span>
                ) : (
                  quote
                )}
              </h1>
            </div>
          </div>
          <button 
            onClick={() => onNavigate("counselor")}
            className="bg-white/10 hover:bg-white/20 text-white border border-white/10 py-2.5 px-4 rounded-xl text-xs font-bold transition flex items-center gap-1.5 flex-shrink-0 cursor-pointer"
          >
            <span>روانشناسی و صحبت با مشاور AI</span>
            <ChevronLeft size={16} />
          </button>
        </div>
      </motion.div>

      {/* Metrics Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4" id="metrics-grid">
        <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm flex items-center justify-between" id="metric-traz">
          <div className="space-y-1">
            <p className="text-xs font-bold text-slate-400">آخرین برآورد تراز قلم‌چی</p>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black text-blue-950 font-mono">۵,۵۷۵</span>
              <span className="text-xs font-bold px-1.5 py-0.5 rounded-full bg-emerald-50 text-emerald-600">▲ ۱۲۸+</span>
            </div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <TrendingUp size={24} />
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm flex items-center justify-between" id="metric-percentage">
          <div className="space-y-1">
            <p className="text-xs font-bold text-slate-400">میانگین تصحیح درصدها</p>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black text-blue-950 font-mono">۵۹٪</span>
              <span className="text-xs font-bold text-slate-500">هدف لایق: ۶۸٪</span>
            </div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <Target size={24} />
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm flex items-center justify-between" id="metric-weaknesses">
          <div className="space-y-1">
            <p className="text-xs font-bold text-slate-400">مباحث بحرانی و آسیب‌رسان</p>
            <div className="flex items-baseline gap-1">
              <span className="text-3xl font-black text-red-600 font-mono">۳</span>
              <span className="text-xs font-normal text-slate-400">زیرمبحث بحرانی</span>
            </div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-red-50 text-red-600 flex items-center justify-center">
            <AlertTriangle size={24} />
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm flex items-center justify-between" id="metric-streak">
          <div className="space-y-1">
            <p className="text-xs font-bold text-slate-400">پیوستگی مطالعه (استریک)</p>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black text-emerald-700 font-mono">۱۴ روز</span>
              <span className="text-xs font-bold text-emerald-500">رکورد عالی 🔥</span>
            </div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
            <Calendar size={24} />
          </div>
        </div>
      </div>

      {/* Goal Tracking Component */}
      <GoalTracker student={student} />

      {/* Two Columns Section: Tasks of today & AI weaknesses */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Today's study list */}
        <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-4" id="today-remedial-tasks-card">
          <div className="flex justify-between items-center pb-2 border-b border-slate-50">
            <div className="flex items-center gap-2">
              <span className="p-1.5 bg-blue-50 text-blue-600 rounded-lg"><CheckSquare size={18} /></span>
              <h2 className="text-lg font-bold text-slate-900">برنامه بهسازی مطالعه امروز</h2>
            </div>
            <span className="text-xs bg-slate-100 text-slate-500 px-2.5 py-1 rounded-full font-bold">سازماندهی شده با AI</span>
          </div>

          <div className="space-y-3">
            {todayTasks.map((task, idx) => (
              <div 
                key={idx}
                onClick={() => toggleTask(idx)}
                className={`group p-4 rounded-2xl border transition duration-200 cursor-pointer flex gap-4 items-start ${
                  task.completed 
                    ? "bg-emerald-50/45 border-emerald-100/80 hover:bg-emerald-50" 
                    : "bg-slate-50/60 border-slate-100 hover:bg-slate-50 hover:border-slate-200"
                }`}
              >
                <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center flex-shrink-0 transition duration-150 ${
                  task.completed 
                    ? "bg-emerald-600 border-emerald-600 text-white" 
                    : "border-slate-300 group-hover:border-blue-500 bg-white"
                }`}>
                  {task.completed && "✓"}
                </div>
                <div className="flex-1 space-y-1">
                  <h3 className={`font-semibold text-sm leading-relaxed ${task.completed ? "text-slate-400 line-through" : "text-slate-800"}`}>
                    {task.morningPlan}
                  </h3>
                  <p className={`text-xs ${task.completed ? "text-slate-300" : "text-slate-500"}`}>
                     همراه با: {task.afternoonPlan} ({task.totalQuestions} تست تخصصی)
                  </p>
                </div>
              </div>
            ))}
          </div>

          <button 
            onClick={() => onNavigate("schedule")}
            className="w-full bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 py-3 rounded-2xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer mt-2"
          >
            <span>مشاهده و ویرایش برنامه هفتگی کامل</span>
            <ChevronLeft size={14} />
          </button>
        </div>

        {/* AI Identified weaknesses list */}
        <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-4" id="ai-weakness-recs-card">
          <div className="flex justify-between items-center pb-2 border-b border-slate-50">
            <div className="flex items-center gap-2">
              <span className="p-1.5 bg-red-50 text-red-600 rounded-lg"><AlertTriangle size={18} /></span>
              <h2 className="text-lg font-bold text-slate-900">مباحث بحرانی (باید برطرف کنید)</h2>
            </div>
            <span className="text-xs bg-red-50 text-red-600 px-2.5 py-1 rounded-full font-bold">بسیار فوری</span>
          </div>

          <div className="space-y-3">
            {mockWeaknesses.map((weak, idx) => (
              <div key={idx} className="p-4 bg-slate-50/60 rounded-2xl border border-slate-100/90 hover:border-slate-200 transition space-y-2">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping"></span>
                    <strong className="text-sm font-bold text-slate-800">{weak.topic}</strong>
                  </div>
                  <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                    weak.severity === "critical" 
                      ? "bg-red-50 text-red-600 border border-red-100" 
                      : "bg-amber-50 text-amber-600 border border-amber-100"
                  }`}>
                    درصد: {weak.percentage}٪
                  </span>
                </div>
                <p className="text-xs text-slate-500 leading-relaxed">
                  <strong>توصیه مشاور: </strong>{weak.recommendation}
                </p>
              </div>
            ))}
          </div>

          <button 
            onClick={() => onNavigate("report")}
            className="w-full bg-blue-900 hover:bg-blue-950 text-white py-3 rounded-2xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <span>تحلیل عمیق و دانلود جزوه اختصاصی مباحث ضعیف</span>
            <ChevronLeft size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}
