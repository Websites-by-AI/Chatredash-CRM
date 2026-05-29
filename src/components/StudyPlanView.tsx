import { useState } from "react";
import { Sparkles, CheckCircle2, RefreshCw, Calendar, Clock, BookOpen, ArrowUp, ArrowDown } from "lucide-react";
import { motion } from "motion/react";
import { DailyPlan } from "../types";

export default function StudyPlanView() {
  const [loading, setLoading] = useState(false);
  const [plans, setPlans] = useState<DailyPlan[]>([
    { day: "شنبه", morningPlan: "حقوق مدنی - مرور بحث کتبی عقود معین و تعهدات ثالث و شرایط صحت معامله", afternoonPlan: "حل و تحلیل ۴۵ تست شبیه‌ساز مدنی از آزمون‌های گذشته چتر دانش", totalQuestions: 45, completed: true },
    { day: "یکشنبه", morningPlan: "آیین دادرسی مدنی - مرور صلاحیت مراجع و صلاحیت ذاتی و محلی دادگاه‌ها", afternoonPlan: "تحلیل تله‌های دادرسی مدنی و تطبیق با مواد قانون صریح (۴۰ تست)", totalQuestions: 40, completed: false },
    { day: "دوشنبه", morningPlan: "حقوق تجارت - مطالعه اسناد تجاری با تاکید بر قوانین جدید سند چک و سفته", afternoonPlan: "تست‌زنی موضوعی تجارت و قوانین خاص تجاری (۲۵ تست)", totalQuestions: 25, completed: false },
    { day: "سه‌شنبه", morningPlan: "اصول فقه - مرور تعاریف عام و خاص، مطلق و مقید و ادله اجتهادی", afternoonPlan: "انجام ۳۰ تست انطباق اصولی با پاسخ صریح مکتوب شرح چتر دانش", totalQuestions: 30, completed: false },
    { day: "چهارشنبه", morningPlan: "حقوق جزا - مطالعه قواعد عمومی جرم، معاونت و مشارکت در جرایم تعزیری", afternoonPlan: "تست‌زنی قوانین خاص کیفری و تحلیل رویکردهای نوین قانون مجازات (۱۵ تست)", totalQuestions: 15, completed: true },
    { day: "پنجشنبه", morningPlan: "آیین دادرسی کیفری - مرور تحقیقات مقدماتی، صلاحیت بازپرس و وظایف دادستان", afternoonPlan: "شبیه‌ساز آزمون آزمایشی دادرسی کیفری و ثبت نتایج در کارتابل داوطلب (۴۰ تست)", totalQuestions: 40, completed: false },
    { day: "جمعه", morningPlan: "جلسه مشاوره کایزن و عارضه‌یابی هفتگی با مشاور ارشد چتر دانش", afternoonPlan: "کارنامه خوانی آزمون کانون و برنامه‌ریزی اصلاحی برای کاهش نمرات منفی", totalQuestions: 10, completed: false }
  ]);

  const handleToggleTask = (index: number) => {
    const updated = [...plans];
    updated[index].completed = !updated[index].completed;
    setPlans(updated);
  };

  const handleRegeneratePlan = () => {
    setLoading(true);
    setTimeout(() => {
      const aiUpdates = [
        { day: "شنبه", morningPlan: "حقوق مدنی - مطالعه مبحث شروط در ضمن عقد و ارث کاداستر", afternoonPlan: "انجام ۴۵ نمونه تست اصطکاک و تله تستی مدنی دپارتمان تالیف", totalQuestions: 45, completed: false },
        { day: "یکشنبه", morningPlan: "آیین دادرسی مدنی - مبحث واخواهی و فرجام‌خواهی همراه آرای وحدت رویه", afternoonPlan: "پایش تله‌های ۳۵ ماده از آخرین وبینارهای تخصصی چتر دانش", totalQuestions: 35, completed: false },
        { day: "دوشنبه", morningPlan: "حقوق اساسی و قوانین خاص ثبتی - مرور صلاحیت‌های دیوان عدالت اداری", afternoonPlan: "حل ۴۰ تست کشسانی در حضور ناظر آموزشی چتر دانش", totalQuestions: 40, completed: false },
        { day: "سه‌شنبه", morningPlan: "اصول فقه - قیاس، امارات، اصول عملیه و واژگان تخصصی متلق و مقید", afternoonPlan: "اجرای ۳۰ نمونه تستی مفاهمه اصول بدون نمره منفی اضافی", totalQuestions: 30, completed: false },
        { day: "چهارشنبه", morningPlan: "حقوق تجارت - مبحث ورشکستگی، تصفیه و وظایف مدیر تصفیه", afternoonPlan: "تست‌زنی تجارت با تاکید بر مواد صریح قانون تجارت و قوانین ملحقه و خاص", totalQuestions: 15, completed: false },
        { day: "پنجشنبه", morningPlan: "آیین دادرسی کیفری - قرار بازداشت موقت، وثیقه و صلاحیت‌های دادگاه کیفری یک", afternoonPlan: "پایش آزمون شبیه‌ساز پیشرفته و خلاصه نویسی نکات در دفترچه طلایی", totalQuestions: 30, completed: false },
        { day: "جمعه", morningPlan: "تحویل مکتوب آمار پایش کیفی به پنل مشاور ارشد چتر دانش جهت عارضه‌یابی", afternoonPlan: "بررسی تراز مانیتورینگ کارایی و تدوین توصیه‌های کایزن مطالعاتی", totalQuestions: 10, completed: false }
      ];
      setPlans(aiUpdates);
      setLoading(false);
      alert("✨ جدول برنامه‌ریزی و کایزن هفتگی داوطلب مجدداً توسط هوش مصنوعی چتر دانش بر اساس ضرایب سخت آزمون بهینه‌سازی شد!");
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
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-3xl border border-slate-100 shadow-sm text-right">
        <div>
          <h2 className="text-xl font-black text-slate-900">برنامه‌ریزی هوشمند کایزن درسی بر پایه ضرایب آزمون کانون (AI)</h2>
          <p className="text-slate-500 text-xs mt-1 leading-relaxed">
            برنامه درسی داوطلب به صورت هفتگی برای تخصیص بهینه زمان یادگیری مباحث صریح قانون در شیفت صبح و تست‌زنی در شیفت عصر منطبق بر عملکرد آزمون‌های آزمایشی کالیبره می‌شود.
          </p>
        </div>
        <button
          onClick={handleRegeneratePlan}
          disabled={loading}
          className="bg-blue-950 hover:bg-slate-900 text-white font-bold text-xs py-3.5 px-6 rounded-xl transition inline-flex items-center gap-2 cursor-pointer shadow-md w-full md:w-auto justify-center"
          id="btn-ai-replan"
        >
          {loading ? (
            <RefreshCw className="animate-spin" size={16} />
          ) : (
            <Sparkles size={16} className="text-amber-450" />
          )}
          <span>بهینه‌سازی برنامه مطالعاتی با AI</span>
        </button>
      </div>

      {/* Progress tracking KPI bar */}
      <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-3" id="plan-weekly-progress-bar">
        <div className="flex justify-between items-center text-sm font-bold text-slate-800 text-right">
          <span>درصد تطابق با اهداف کایزن آموزشی داوطلب در هفته جاری</span>
          <span className="font-mono text-emerald-700">{progressRatio}٪ انجام شد</span>
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
          <span>{completedCount} روز مطالعه و تست‌زنی با موفقیت تایید شده</span>
          <span>آزمون آزمایشی بعدی چتر دانش: ۴ روز دیگر</span>
        </div>
      </div>

      {/* Days details cards list */}
      <div className="space-y-4" id="plan-days-detailed-list">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 bg-white rounded-3xl border border-slate-100 space-y-4">
            <div className="w-10 h-10 border-4 border-blue-950 border-t-amber-400 rounded-full animate-spin"></div>
            <p className="font-bold text-slate-600">هوش کایزن چتر دانش در حال تجدید چیدمان مواد آزمونی کانون وکلا...</p>
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
                      : "border-slate-300 hover:border-blue-950 bg-slate-50"
                  }`}
                  id={`checkbox-day-${idx}`}
                >
                  <CheckCircle2 size={16} />
                </button>

                {/* Day Header */}
                <div className="w-16 flex-shrink-0 text-right">
                  <span className="font-black text-slate-900 block text-base">{plan.day}</span>
                  <span className="text-[10px] text-slate-400 font-bold block mt-0.5">پارت مطالعه</span>
                </div>

                {/* Inner Text with Morning/Afternoon Plans */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-1 text-right">
                  <div className="space-y-1">
                    <span className="text-[10px] font-black uppercase text-indigo-700 tracking-wide flex items-center gap-1 justify-start">
                      <Clock size={12} />
                      <span>☀️ شیفت صبح (قوانین و متون)</span>
                    </span>
                    <p className={`text-xs font-semibold leading-relaxed ${plan.completed ? "text-slate-400 line-through" : "text-slate-700"}`}>
                      {plan.morningPlan}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <span className="text-[10px] font-black uppercase text-amber-700 tracking-wide flex items-center gap-1 justify-start">
                      <BookOpen size={12} />
                      <span>🌙 شیفت عصر (تست‌زنی و تفکیک)</span>
                    </span>
                    <p className={`text-xs font-semibold leading-relaxed ${plan.completed ? "text-slate-400 line-through" : "text-slate-700"}`}>
                      {plan.afternoonPlan}
                    </p>
                  </div>
                </div>
              </div>

              {/* Action columns */}
              <div className="flex items-center justify-between md:justify-end gap-6 pt-4 md:pt-0 border-t md:border-t-0 border-slate-50">
                <span className="text-xs font-mono font-bold bg-blue-50 text-blue-950 px-3 py-1 rounded-full border border-blue-100/60">
                  {plan.totalQuestions} پرسش تستی
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
