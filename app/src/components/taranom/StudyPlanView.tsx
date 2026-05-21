import { useState } from "react";
import { Sparkles, CheckCircle2, RefreshCw, Calendar, Clock, BookOpen, ArrowUp, ArrowDown } from "lucide-react";
import { motion } from "motion/react";
import { DailyPlan } from "../../lib/taranom-types";

export default function StudyPlanView() {
  const [loading, setLoading] = useState(false);
  const [plans, setPlans] = useState<DailyPlan[]>([
    { day: "شنبه", morningPlan: "ریاضی (مبحث حد و پیوستگی) - مطالعه خلاصه‌ها", afternoonPlan: "حل ۲۵ تست تالیفی حد نوظهور کانون", totalQuestions: 25, completed: true },
    { day: "یکشنبه", morningPlan: "زیست (ژنتیک و تقسیم کروموزوم) - مرور شکل‌ها", afternoonPlan: "حل ۴۰ تست مبحثی سراسری ۹۸ تا ۱۴۰۲", totalQuestions: 40, completed: false },
    { day: "دوشنبه", morningPlan: "فیزیک (حرکت‌شناسی شتاب‌دار) - مرور فرمول‌ها", afternoonPlan: "حل ۲۵ تست نموداری شتاب ثابت", totalQuestions: 25, completed: false },
    { day: "سه‌شنبه", morningPlan: "شیمی (ترموشیمی و پیشرفت آنتالپی) - حل تشریحی", afternoonPlan: "حل ۳۰ تست کنکور تجربی سراسری", totalQuestions: 30, completed: false },
    { day: "چهارشنبه", morningPlan: "عربی (ترجمه و تعریب موضوعی) - یادگیری تکنیک‌ها", afternoonPlan: "حل ۱۵ تست متن کنکورهای نوین", totalQuestions: 15, completed: true },
    { day: "پنجشنبه", morningPlan: "مرور سراسری فرمول‌های بحرانی هفته جاری", afternoonPlan: "آزمون ۲ ساعت جامع شبیه‌سازی خانگی کانون", totalQuestions: 40, completed: false },
    { day: "جمعه", morningPlan: "تحلیل آزمون کانون در کنار مشاور ترنم مهر", afternoonPlan: "خلاصه‌نویسی مباحث آزمون بعدی", totalQuestions: 10, completed: false }
  ]);

  const handleToggleTask = (index: number) => {
    const updated = [...plans];
    updated[index].completed = !updated[index].completed;
    setPlans(updated);
  };

  const handleRegeneratePlan = () => {
    setLoading(true);
    setTimeout(() => {
      // Modify values to simulate intelligent AI reconfiguration based on students current weakness
      const aiUpdates = [
        { day: "شنبه", morningPlan: "فیزیک تخصصی - رفع اشکال نمودارهای شتاب متناوب", afternoonPlan: "حل ۴۵ تست طبقه‌بندی از جزوه ترنم", totalQuestions: 45, completed: false },
        { day: "یکشنبه", morningPlan: "ریاضی عمومی - حل مسائل حد با هوپیتال سریع", afternoonPlan: "حل ۳۵ تست کنکور تجربی و ریاضی", totalQuestions: 35, completed: false },
        { day: "دوشنبه", morningPlan: "زیست‌شناسی - بازخوانی بافت‌های گوارش و تنفس", afternoonPlan: "حل ۴۰ تست زمان‌دار با تکنیک استراحت", totalQuestions: 40, completed: false },
        { day: "سه‌شنبه", morningPlan: "شیمی آلی - ساختارهای کربنی متیل و اتیل", afternoonPlan: "حل ۳۰ تست از کتاب تکمیلی ترنم", totalQuestions: 30, completed: false },
        { day: "چهارشنبه", morningPlan: "ادبیات فارسی - آرایه‌های ادبی و اسلوب معادله", afternoonPlan: "درک متن با ۱۵ تست کلمات هم‌آوا", totalQuestions: 15, completed: false },
        { day: "پنجشنبه", morningPlan: "مرور نهایی خلاصه‌نویسی‌های فیزیک و شیمی", afternoonPlan: "آزمون ۱.۵ ساعت تکوینی و تحلیلی ترنم", totalQuestions: 30, completed: false },
        { day: "جمعه", morningPlan: "تحلیل آزمون با روش کارت‌های رنگی انگیزشی", afternoonPlan: "تعیین اهداف دقیق تراز آزمون بعد", totalQuestions: 10, completed: false }
      ];
      setPlans(aiUpdates);
      setLoading(false);
      alert("✨ برنامه درسی شخصی‌سازی شده مجدداً توسط هوش مصنوعی ترنم مهر بر اساس آخرین پیشرفت‌ها بهینه‌سازی و تولید شد!");
    }, 1500);
  };

  const handleMoveUp = (idx: number) => {
    if (idx === 0) return;
    const updated = [...plans];
    const prev = updated[idx - 1];
    updated[idx - 1] = { ...updated[idx], day: prev.day };
    updated[idx] = { ...prev, day: updated[idx].day };
    setPlans(updated);
  };

  const handleMoveDown = (idx: number) => {
    if (idx === plans.length - 1) return;
    const updated = [...plans];
    const next = updated[idx + 1];
    updated[idx + 1] = { ...updated[idx], day: next.day };
    updated[idx] = { ...next, day: updated[idx].day };
    setPlans(updated);
  };

  const completedCount = plans.filter(p => p.completed).length;
  const progressRatio = Math.round((completedCount / plans.length) * 100);

  return (
    <div className="space-y-6" id="study-plan-view-container">
      {/* Top action header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
        <div>
          <h2 className="text-xl font-black text-slate-900">برنامه‌ریزی هوشمند هفتگی (AI)</h2>
          <p className="text-slate-500 text-xs mt-1">
            برنامه تحصیلی هفتگی شما به صورت هوشمند بر اساس میزان ضعف، سختی مباحث و هدف‌گذاری تراز کانون سازماندهی شده است.
          </p>
        </div>
        <button
          onClick={handleRegeneratePlan}
          disabled={loading}
          className="bg-blue-900 hover:bg-blue-950 text-white font-bold text-xs py-3.5 px-6 rounded-xl transition inline-flex items-center gap-2 cursor-pointer shadow-md w-full md:w-auto justify-center"
          id="btn-ai-replan"
        >
          {loading ? (
            <RefreshCw className="animate-spin" size={16} />
          ) : (
            <Sparkles size={16} className="text-amber-400" />
          )}
          <span>بهینه‌سازی و تولید برنامه جدید با AI</span>
        </button>
      </div>

      {/* Progress tracking KPI bar */}
      <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-3" id="plan-weekly-progress-bar">
        <div className="flex justify-between items-center text-sm font-bold text-slate-800">
          <span>میزان پیشرفت و پوشش تسک‌های این هفته</span>
          <span className="font-mono text-emerald-700">{progressRatio}٪ تکمیل شده</span>
        </div>
        <div className="w-full bg-slate-100 h-3.5 rounded-full overflow-hidden">
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: `${progressRatio}%` }}
            transition={{ duration: 0.6 }}
            className="bg-emerald-600 h-full rounded-full"
          ></motion.div>
        </div>
        <div className="flex justify-between items-center text-xs text-slate-400">
          <span>{completedCount} روز با موفقیت به اتمام رسیده</span>
          <span>آزمون بعدی قلم‌چی: ۳ روز دیگر</span>
        </div>
      </div>

      {/* Days details cards list */}
      <div className="space-y-4" id="plan-days-detailed-list">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 bg-white rounded-3xl border border-slate-100">
            <div className="w-10 h-10 border-4 border-blue-950 border-t-amber-400 rounded-full animate-spin"></div>
            <p className="font-bold text-slate-600 mt-4">هوش مصنوعی در حال چیدمان بهینه تست‌ها بر اساس اولویت‌ها...</p>
          </div>
        ) : (
          plans.map((plan, idx) => (
            <div 
              key={idx}
              className={`bg-white rounded-2xl p-5 border transition duration-200 flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                plan.completed ? "border-emerald-100 shadow-sm bg-gradient-to-tr from-emerald-50/15 to-transparent" : "border-slate-100 shadow-sm"
              }`}
            >
              <div className="flex items-start md:items-center gap-4 flex-1">
                {/* Checkbox toggle */}
                <button
                  type="button"
                  onClick={() => handleToggleTask(idx)}
                  className={`w-7 h-7 rounded-xl border flex items-center justify-center transition flex-shrink-0 cursor-pointer ${
                    plan.completed 
                      ? "bg-emerald-600 border-emerald-600 text-white shadow-sm" 
                      : "border-slate-300 hover:border-blue-700 bg-slate-50"
                  }`}
                  id={`checkbox-day-${idx}`}
                >
                  <CheckCircle2 size={16} />
                </button>

                {/* Day Header */}
                <div className="w-16 flex-shrink-0">
                  <span className="font-black text-slate-900 block text-base">{plan.day}</span>
                  <span className="text-[10px] text-slate-400 font-bold block mt-0.5">برنامه روزانه</span>
                </div>

                {/* Inner Text with Morning/Afternoon Plans */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-1">
                  <div className="space-y-1">
                    <span className="text-[10px] font-black uppercase text-slate-400 tracking-wide flex items-center gap-1">
                      <Clock size={12} />
                      <span>☀️ نوبت صبح</span>
                    </span>
                    <p className={`text-xs font-semibold ${plan.completed ? "text-slate-400 line-through" : "text-slate-700"}`}>
                      {plan.morningPlan}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <span className="text-[10px] font-black uppercase text-slate-400 tracking-wide flex items-center gap-1">
                      <BookOpen size={12} />
                      <span>🌙 نوبت عصر</span>
                    </span>
                    <p className={`text-xs font-semibold ${plan.completed ? "text-slate-400 line-through" : "text-slate-700"}`}>
                      {plan.afternoonPlan}
                    </p>
                  </div>
                </div>
              </div>

              {/* Action columns: Reorder arrows and Questions Count */}
              <div className="flex items-center justify-between md:justify-end gap-6 pt-4 md:pt-0 border-t md:border-t-0 border-slate-50">
                <span className="text-xs font-mono font-bold bg-blue-50 text-blue-800 px-3 py-1 rounded-full border border-blue-100/60 font-bold">
                  تعداد: {plan.totalQuestions} تست
                </span>
                
                {/* Shift arrows to simulate drag and drop optimization */}
                <div className="flex gap-1.5" id={`plan-reorder-${idx}`}>
                  <button 
                    disabled={idx === 0}
                    onClick={() => handleMoveUp(idx)}
                    className="p-1.5 bg-slate-50 border border-slate-100 rounded-lg hover:bg-slate-100 transition disabled:opacity-30 cursor-pointer"
                    title="انتقال به بالا"
                  >
                    <ArrowUp size={14} className="text-slate-600" />
                  </button>
                  <button 
                    disabled={idx === plans.length - 1}
                    onClick={() => handleMoveDown(idx)}
                    className="p-1.5 bg-slate-50 border border-slate-100 rounded-lg hover:bg-slate-100 transition disabled:opacity-30 cursor-pointer"
                    title="انتقال به پایین"
                  >
                    <ArrowDown size={14} className="text-slate-600" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
