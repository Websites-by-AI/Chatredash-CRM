import { useState } from "react";
import { Sparkles, TrendingUp, Calendar, AlertCircle, ArrowUpRight, BarChart3, Star } from "lucide-react";
import { motion } from "motion/react";

export default function ProgressView() {
  const [selectedTopic, setSelectedTopic] = useState<"traz" | "lessons">("traz");

  // Historic data points for 8 mock Ghalanchi exams
  const historyData = [
    { examName: "آزمون ۱ کانون", traz: 5120, percentage: 48, date: "۵ مهر" },
    { examName: "آزمون ۲ کانون", traz: 5240, percentage: 51, date: "۱۹ مهر" },
    { examName: "آزمون ۳ کانون", traz: 5575, percentage: 59, date: "۱۵ آبان" },
    { examName: "آزمون ۴ کانون", traz: 5720, percentage: 63, date: "۲۹ آذر" },
    { examName: "آزمون ۵ کانون", traz: 5690, percentage: 61, date: "۱۲ دی" },
    { examName: "آزمون ۶ کانون", traz: 5880, percentage: 65, date: "۲۶ دی" },
    { examName: "آزمون ۷ کانون", traz: 6010, percentage: 67, date: "۱۰ بهمن" },
    { examName: "آزمون ۸ کانون", traz: 6150, percentage: 70, date: "۲۴ بهمن" }
  ];

  const lessonsStats = [
    { name: "حسابان و دیفرانسیل", current: 35, previous: 25, progress: 10, count: 120 },
    { name: "فیزیک پیشرفته دوازدهم", current: 45, previous: 32, progress: 13, count: 145 },
    { name: "شیمی آلی", current: 52, previous: 41, progress: 11, count: 85 },
    { name: "ادبیات فارسی عمومی", current: 75, previous: 72, progress: 3, count: 40 },
    { name: "دین و زندگی عمومی", current: 84, previous: 80, progress: 4, count: 45 }
  ];

  // Calculations for custom SVG graph
  const maxTraz = 7000;
  const minTraz = 4500;
  const width = 800;
  const height = 240;
  const padding = 40;

  const points = historyData.map((d, i) => {
    const x = padding + (i * (width - padding * 2)) / (historyData.length - 1);
    const y = height - padding - ((d.traz - minTraz) * (height - padding * 2)) / (maxTraz - minTraz);
    return { x, y, ...d };
  });

  const pathD = points.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ");

  return (
    <div className="space-y-6" id="progress-view-container">
      {/* Visual Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
        <div>
          <h2 className="text-xl font-black text-slate-900">پیشرفت تحصیلی و برآمدها</h2>
          <p className="text-slate-500 text-xs mt-1">نمایه تغییرات رشد تراز، درصد و پیش‌بینی‌های هوش مصنوعی کانون ترنم مهر را تعقیب کنید.</p>
        </div>
        <div className="flex bg-slate-100 p-1.5 rounded-xl gap-1.5 self-stretch md:self-auto justify-center">
          <button
            onClick={() => setSelectedTopic("traz")}
            className={`px-4 py-2 text-xs font-bold rounded-lg cursor-pointer transition ${
              selectedTopic === "traz" ? "bg-blue-900 text-white shadow-sm" : "text-slate-500 hover:text-slate-700"
            }`}
          >
            روند نمودار تراز
          </button>
          <button
            onClick={() => setSelectedTopic("lessons")}
            className={`px-4 py-2 text-xs font-bold rounded-lg cursor-pointer transition ${
              selectedTopic === "lessons" ? "bg-blue-900 text-white shadow-sm" : "text-slate-500 hover:text-slate-700"
            }`}
          >
            پیشرفت مبحثی دروس
          </button>
        </div>
      </div>

      {/* Main Graph Content */}
      <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm" id="progress-graph-card">
        {selectedTopic === "traz" ? (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <span className="font-bold text-slate-800 text-base flex items-center gap-2">
                <BarChart3 className="text-blue-900" size={20} />
                <span>روند صعودی تراز در کانون قلم‌چی (۸ دوره اخیر)</span>
              </span>
              <span className="text-xs bg-emerald-50 text-emerald-700 px-3 py-1 rounded-full border border-emerald-100 font-bold flex items-center gap-1">
                <Sparkles size={12} className="animate-spin" />
                <span>۱۹.۲٪ نرخ رشد عملکرد</span>
              </span>
            </div>

            {/* Render Custom Beautiful SVG Graph with dynamic hover-dots */}
            <div className="relative overflow-x-auto select-none" id="svg-graph-scroller">
              <svg viewBox={`0 0 ${width} ${height}`} className="w-full min-w-[700px] h-60 text-slate-300">
                {/* Grid horizontal guidelines */}
                {[0, 0.25, 0.5, 0.75, 1].map((ratio, idx) => {
                  const y = padding + ratio * (height - padding * 2);
                  const stepTraz = Math.round(maxTraz - ratio * (maxTraz - minTraz));
                  return (
                    <g key={idx}>
                      <line x1={padding} y1={y} x2={width - padding} y2={y} stroke="#f1f5f9" strokeWidth="1.5" strokeDasharray="4 4" />
                      <text x={padding - 10} y={y + 4} textAnchor="end" className="text-[10px] font-mono font-bold fill-slate-400">{stepTraz}</text>
                    </g>
                  );
                })}

                {/* Main Path Curve Line */}
                <motion.path
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 1 }}
                  d={pathD}
                  fill="none"
                  stroke="#1e3a8a"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                />

                {/* Circles and metadata text mapping */}
                {points.map((p, idx) => (
                  <g key={idx}>
                    <line x1={p.x} y1={padding} x2={p.x} y2={height - padding} stroke="#f8fafc" strokeWidth="1.5" />
                    <circle cx={p.x} cy={p.y} r="6" className="fill-amber-400 stroke-blue-950 stroke-2 cursor-pointer hover:r-8 transition duration-150" />
                    <text x={p.x} y={p.y - 12} textAnchor="middle" className="text-[11px] font-mono font-black fill-slate-800 bg-white">{p.traz}</text>
                    <text x={p.x} y={height - padding + 16} textAnchor="middle" className="text-[10px] font-bold fill-slate-500">{p.date}</text>
                  </g>
                ))}
              </svg>
            </div>
          </div>
        ) : (
          <div className="space-y-4 animate-fade-in" id="lessons-stats-panel">
            <span className="font-bold text-slate-800 text-base flex items-center gap-1.5 pb-2 border-b border-slate-50">
              <Star className="text-amber-500" size={18} />
              <span>پیشرفت علمی تفصیلی به تفکیک دروس تخصصی کنکور</span>
            </span>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {lessonsStats.map((stat, idx) => (
                <div key={idx} className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between">
                  <div className="space-y-1">
                    <strong className="text-sm font-black text-slate-800 block">{stat.name}</strong>
                    <span className="text-xs text-slate-400 block">تعداد تست بهسازی: {stat.count} تست سراسری</span>
                  </div>
                  <div className="flex gap-4 items-center">
                    <div className="text-left space-y-0.5">
                      <span className="text-base font-black text-slate-800 font-mono block">{stat.current}٪</span>
                      <span className="text-[10px] text-slate-400 font-medium block">قبلی {stat.previous}٪</span>
                    </div>
                    <span className="px-2 py-1 text-[11px] font-bold bg-emerald-50 text-emerald-700 rounded-lg">
                      ▲ {stat.progress}+
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* RAG-based predictions and forecast */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4" id="progress-ai-forecast">
        <div className="bg-gradient-to-tr from-blue-900 to-indigo-950 text-white rounded-3xl p-6 relative overflow-hidden">
          <div className="absolute top-2 left-2 text-white/5 opacity-10 scale-150 pointer-events-none">
            <Sparkles size={100} />
          </div>
          <span className="text-xs font-black uppercase tracking-widest text-amber-400 flex items-center gap-1.5">
            <Sparkles size={14} />
            <span>پیش‌بینی و تخمین هوش مصنوعی کانون</span>
          </span>
          <h3 className="text-lg font-bold mt-2">اهداف پیش‌روی تراز {historyData[historyData.length - 1].traz + 250}</h3>
          <p className="text-sm text-blue-100/90 mt-2 leading-relaxed">
             با غلبه بر ۳ زیرمبحث بحرانی (بخصوص حد صفر صفرم و حرکت‌شناسی شتاب‌دار) طبق برنامه ۷ روزه اصلاحی، برآورد تراز بعدی شما در سنجش قلم‌چی رشد پایداری را تجربه خواهد کرد.
          </p>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-4">
          <span className="text-slate-800 font-bold text-sm block">اهداف و آرزوهای تراز گذاری شده شما</span>
          <div className="space-y-3">
            <div className="space-y-1">
              <div className="flex justify-between items-center text-xs">
                <span className="font-semibold text-slate-600">هدف دانشگاهی: مهندسی کامپیوتر تهران</span>
                <span className="font-bold text-blue-900 font-mono">ترازو لازم: ۶,۲۰۰</span>
              </div>
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                <div className="bg-blue-950 h-full rounded-full w-[90%]"></div>
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex justify-between items-center text-xs">
                <span className="font-semibold text-slate-600">هدف منطقه‌ای: رتبه زیر ۸۰۰ کشوری</span>
                <span className="font-bold text-blue-900 font-mono">تراز لازم: ۶,۵۰۰</span>
              </div>
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                <div className="bg-amber-500 h-full rounded-full w-[75%]"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
