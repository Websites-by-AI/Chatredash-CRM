import React, { useState, useEffect, FormEvent } from "react";
import { 
  Target, TrendingUp, Sparkles, Edit2, Check, Award, 
  ChevronLeft, LayoutList, CheckCircle, Brain, RefreshCw, AlertCircle, HelpCircle, Flame 
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { Student } from "../../lib/taranom-types";

export interface AIInsight {
  likelihood: number;
  text: string;
  recommendations: string[];
}

interface GoalTrackerProps {
  student: Student;
  currentTraz?: number;
  currentPercentage?: number;
}

export default function GoalTracker({ student, currentTraz = 5575, currentPercentage = 59 }: GoalTrackerProps) {
  // Goals State
  const [targetTraz, setTargetTraz] = useState<number>(6200);
  const [targetGrowth, setTargetGrowth] = useState<number>(10); // +10%
  const [latestQuizScore, setLatestQuizScore] = useState<number>(63); // recent practice quiz score, default is 63% (which is +4% above current 59%)
  
  // AI Insights State
  const [aiInsight, setAiInsight] = useState<AIInsight | null>(null);
  const [loadingInsight, setLoadingInsight] = useState<boolean>(false);
  const [insightError, setInsightError] = useState<string | null>(null);

  // UI State
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [tempTraz, setTempTraz] = useState<number>(6200);
  const [tempGrowth, setTempGrowth] = useState<number>(10);
  const [quizInput, setQuizInput] = useState<string>("63");
  const [saveSuccess, setSaveSuccess] = useState<boolean>(false);
  const [quizSuccess, setQuizSuccess] = useState<boolean>(false);

  // Load saved goals on mount or student change
  useEffect(() => {
    const saved = localStorage.getItem(`taranom_mehr_goals_${student.id}`);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.targetTraz) {
          setTargetTraz(parsed.targetTraz);
          setTempTraz(parsed.targetTraz);
        }
        if (parsed.targetGrowth) {
          setTargetGrowth(parsed.targetGrowth);
          setTempGrowth(parsed.targetGrowth);
        }
        if (parsed.latestQuizScore !== undefined) {
          setLatestQuizScore(parsed.latestQuizScore);
          setQuizInput(parsed.latestQuizScore.toString());
        }
        if (parsed.lastInsight) {
          setAiInsight(parsed.lastInsight);
        } else {
          setAiInsight(null);
        }
      } catch (e) {
        console.error("Failed to parse saved goals", e);
      }
    } else {
      // Default initial states if no saved storage
      setTargetTraz(6200);
      setTempTraz(6200);
      setTargetGrowth(10);
      setTempGrowth(10);
      setLatestQuizScore(63);
      setQuizInput("63");
      setAiInsight(null);
    }
  }, [student.id]);

  const handleSaveGoals = (e: React.FormEvent) => {
    e.preventDefault();
    setTargetTraz(tempTraz);
    setTargetGrowth(tempGrowth);
    setIsEditing(false);

    // Save to localStorage
    const dataToSave = {
      targetTraz: tempTraz,
      targetGrowth: tempGrowth,
      latestQuizScore,
      lastInsight: aiInsight
    };
    localStorage.setItem(`taranom_mehr_goals_${student.id}`, JSON.stringify(dataToSave));
    
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const handleLogQuiz = (e: React.FormEvent) => {
    e.preventDefault();
    const scoreVal = parseFloat(quizInput);
    if (!isNaN(scoreVal) && scoreVal >= 0 && scoreVal <= 100) {
      setLatestQuizScore(scoreVal);
      
      const dataToSave = {
        targetTraz,
        targetGrowth,
        latestQuizScore: scoreVal,
        lastInsight: aiInsight
      };
      localStorage.setItem(`taranom_mehr_goals_${student.id}`, JSON.stringify(dataToSave));
      
      setQuizSuccess(true);
      setTimeout(() => setQuizSuccess(false), 3000);
    }
  };

  // Fetch AI Insights callback
  const fetchGoalInsight = async () => {
    setLoadingInsight(true);
    setInsightError(null);

    // Dynamic fetch configuration with exponent-backoff
    const fetchWithRetry = async (url: string, options?: RequestInit, retries = 3, delay = 600): Promise<Response> => {
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

    try {
      const res = await fetchWithRetry("/api/goal-insight", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          student,
          currentTraz,
          currentPercentage,
          targetTraz,
          targetGrowth,
          latestQuizScore
        })
      });

      if (!res.ok) {
        throw new Error("خطا در پاسخ‌دهی سرور مشاوره");
      }

      const data = await res.json();
      if (data && typeof data.likelihood === "number") {
        setAiInsight(data);
        
        // Save to localStorage
        const dataToSave = {
          targetTraz,
          targetGrowth,
          latestQuizScore,
          lastInsight: data
        };
        localStorage.setItem(`taranom_mehr_goals_${student.id}`, JSON.stringify(dataToSave));
      } else {
        throw new Error("داده‌های نامعتبر از هوش مصنوعی دریافت شد.");
      }
    } catch (err: any) {
      console.error("AI Insight retrieval failed:", err);
      setInsightError("ارتباط با تخمین‌گر هوش مصنوعی برقرار نشد؛ لطفاً چند لحظه بعد تلاش کنید.");
    } finally {
      setLoadingInsight(false);
    }
  };

  // Calculations
  const trazProgressPercent = Math.min(100, Math.max(0, Math.round((currentTraz / targetTraz) * 100)));
  const targetPercentage = currentPercentage + targetGrowth;
  const actualGrowth = Math.max(0, latestQuizScore - currentPercentage);
  const growthProgressPercent = targetGrowth > 0 
    ? Math.min(100, Math.round((actualGrowth / targetGrowth) * 100)) 
    : 100;

  // Formatted Persian numbers helper
  const toPersianNum = (num: number | string) => {
    const persianDigits = ["۰", "۱", "۲", "۳", "۴", "۵", "۶", "۷", "۸", "۹"];
    return num.toString().replace(/\d/g, (x) => persianDigits[parseInt(x)]);
  };

  return (
    <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-6" id="goal-tracker-container">
      {/* Header */}
      <div className="flex justify-between items-center pb-2 border-b border-slate-50">
        <div className="flex items-center gap-2">
          <span className="p-1.5 bg-amber-50 text-amber-600 rounded-lg">
            <Target size={18} />
          </span>
          <h2 className="text-lg font-bold text-slate-900">سامانه هدف‌گذاری و رصد رشد علمی</h2>
        </div>
        <button
          onClick={() => {
            setTempTraz(targetTraz);
            setTempGrowth(targetGrowth);
            setIsEditing(!isEditing);
          }}
          className="text-xs bg-slate-50 hover:bg-slate-100 border border-slate-100 hover:border-slate-200 text-slate-600 font-bold px-3 py-1.5 rounded-xl transition flex items-center gap-1 cursor-pointer"
          id="btn-edit-goals"
        >
          {isEditing ? "انصراف" : "ویرایش اهداف"}
          {!isEditing && <Edit2 size={12} className="mr-0.5" />}
        </button>
      </div>

      {/* Edit Form */}
      {isEditing ? (
        <motion.form 
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          onSubmit={handleSaveGoals}
          className="bg-slate-50 p-4 rounded-2xl border border-slate-200/65 space-y-4"
          id="goals-edit-form"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Traz Input */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-600 block">تراز هدف آزمون بعدی</label>
              <div className="flex gap-2 items-center">
                <input
                  type="range"
                  min="5000"
                  max="8000"
                  step="50"
                  value={tempTraz}
                  onChange={(e) => setTempTraz(parseInt(e.target.value))}
                  className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-900"
                />
                <span className="text-xs font-black text-blue-950 font-mono bg-white border border-slate-200 px-2.5 py-1 rounded-lg w-16 text-center">
                  {toPersianNum(tempTraz)}
                </span>
              </div>
              <p className="text-[10px] text-slate-400">تراز فعلی شما: {toPersianNum(currentTraz)}</p>
            </div>

            {/* Growth Percentage Input */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-600 block">درصد رشد هدف (رشد میانگین)</label>
              <div className="flex gap-2 items-center">
                <input
                  type="range"
                  min="2"
                  max="30"
                  step="1"
                  value={tempGrowth}
                  onChange={(e) => setTempGrowth(parseInt(e.target.value))}
                  className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-amber-500"
                />
                <span className="text-xs font-black text-amber-700 font-mono bg-white border border-slate-200 px-2.5 py-1 rounded-lg w-14 text-center">
                  {toPersianNum(tempGrowth)}٪+
                </span>
              </div>
              <p className="text-[10px] text-slate-400">میانگین فعلی شما: {toPersianNum(currentPercentage)}٪ (هدف نهایی: {toPersianNum(currentPercentage + tempGrowth)}٪)</p>
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              className="bg-blue-900 hover:bg-blue-950 text-white text-xs font-bold py-2 px-4 rounded-xl shadow transition duration-150 flex items-center gap-1.5 cursor-pointer"
            >
              <Check size={14} />
              <span>ذخیره اهداف جدید</span>
            </button>
          </div>
        </motion.form>
      ) : null}

      {/* Success Notification */}
      {saveSuccess && (
        <motion.div 
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-emerald-50 text-emerald-700 p-3 rounded-xl border border-emerald-100 text-xs font-bold flex items-center gap-1.5"
        >
          <CheckCircle size={14} />
          <span>اهداف تحصیلی شما با موفقیت به‌روزرسانی شد. مشاور بر اساس این اهداف برنامه‌ریزی می‌کند.</span>
        </motion.div>
      )}

      {/* Tracking Visualization Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5" id="goals-tracking-cards">
        {/* Traz Goal Progress */}
        <div className="bg-slate-50/60 p-4 rounded-2xl border border-slate-100 space-y-3 flex flex-col justify-between">
          <div className="space-y-1">
            <div className="flex justify-between items-center">
              <span className="text-xs text-slate-500 font-medium flex items-center gap-1">
                <Award size={14} className="text-blue-600" />
                <span>مسیر رسیدن به تراز هدف</span>
              </span>
              <span className="text-xs font-black text-blue-900 font-mono bg-blue-50 px-2 py-0.5 rounded-full">
                {toPersianNum(trazProgressPercent)}٪
              </span>
            </div>
            
            <div className="flex justify-between items-end pt-1">
              <div>
                <span className="text-[10px] text-slate-400 block">آخرین تراز ثبت‌شده</span>
                <span className="text-lg font-black text-slate-500 font-mono">{toPersianNum(currentTraz)}</span>
              </div>
              <div className="text-left">
                <span className="text-[10px] text-blue-900 font-black block">تراز هدف‌گذاری شده</span>
                <span className="text-2xl font-black text-blue-950 font-mono">{toPersianNum(targetTraz)}</span>
              </div>
            </div>
          </div>

          {/* Progress bar container */}
          <div className="space-y-1">
            <div className="w-full bg-slate-200 rounded-full h-2.5 overflow-hidden">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${trazProgressPercent}%` }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="bg-gradient-to-r from-blue-500 to-blue-900 h-2.5 rounded-full"
              />
            </div>
            <div className="flex justify-between text-[10px] text-slate-400">
              <span>{toPersianNum(5000)}</span>
              <span>فاصله تا قله: {toPersianNum(Math.max(0, targetTraz - currentTraz))} واحد</span>
              <span>{toPersianNum(targetTraz)}</span>
            </div>
          </div>
        </div>

        {/* Growth Percentage Progress */}
        <div className="bg-slate-50/60 p-4 rounded-2xl border border-slate-100 space-y-3 flex flex-col justify-between">
          <div className="space-y-1">
            <div className="flex justify-between items-center">
              <span className="text-xs text-slate-500 font-medium flex items-center gap-1">
                <TrendingUp size={14} className="text-amber-600" />
                <span>رشد هدف نسبت به پایه اولیه ({toPersianNum(currentPercentage)}٪)</span>
              </span>
              <span className="text-xs font-black text-amber-700 font-mono bg-amber-50 px-2 py-0.5 rounded-full">
                {toPersianNum(growthProgressPercent)}٪
              </span>
            </div>
            
            <div className="flex justify-between items-end pt-1">
              <div>
                <span className="text-[10px] text-slate-400 block">میانگین تصحیح فعلی</span>
                <span className="text-lg font-black text-slate-500 font-mono">{toPersianNum(currentPercentage)}٪</span>
              </div>
              <div className="text-left">
                <span className="text-[10px] text-amber-700 font-black block">درصد رشد و هدف نهایی</span>
                <span className="text-2xl font-black text-amber-900 font-mono">{toPersianNum(targetPercentage)}٪ <span className="text-xs text-amber-500">({toPersianNum(targetGrowth)}٪+)</span></span>
              </div>
            </div>
          </div>

          {/* Progress bar container */}
          <div className="space-y-1">
            <div className="w-full bg-slate-200 rounded-full h-2.5 overflow-hidden">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${growthProgressPercent}%` }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="bg-gradient-to-r from-amber-400 to-amber-600 h-2.5 rounded-full"
              />
            </div>
            <div className="flex justify-between text-[10px] text-slate-400">
              <span>{toPersianNum(currentPercentage)}٪</span>
              <span>درصد آزمون اخیر: {toPersianNum(latestQuizScore)}٪</span>
              <span>{toPersianNum(targetPercentage)}٪</span>
            </div>
          </div>
        </div>
      </div>

      {/* Interactive Activity: Quiz Assessment Logger to update progress! */}
      <div className="bg-gradient-to-l from-slate-50 to-blue-50/40 p-4 rounded-2xl border border-slate-100 flex flex-col md:flex-row items-start md:items-center justify-between gap-4" id="quiz-refiner-panel">
        <div className="space-y-1">
          <h4 className="text-xs font-bold text-slate-800 flex items-center gap-1">
            <Sparkles size={12} className="text-amber-500" />
            <span>کوییز فرعی دادید؟ ثبت درصد برای رصد واقعی پیشرفت</span>
          </h4>
          <p className="text-[11px] text-slate-500 leading-relaxed">
            با وارد کردن درصد آزمون یا تمرین آخر خود، میزان پیشرفت واقعی به سمت هدف رشد ({toPersianNum(targetGrowth)}٪+) را در لحظه مشاهده کنید.
          </p>
        </div>

        <form onSubmit={handleLogQuiz} className="flex gap-2 w-full md:w-auto items-center">
          <div className="relative">
            <input
              type="number"
              min="0"
              max="100"
              value={quizInput}
              onChange={(e) => setQuizInput(e.target.value)}
              className="bg-white border border-slate-200 px-3 py-2 rounded-xl text-xs font-bold font-mono w-24 text-left focus:outline-none focus:border-blue-900"
              placeholder="مثلا ۶۵"
              required
            />
            <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400 pointer-events-none">٪</span>
          </div>
          <button
            type="submit"
            className="bg-slate-950 hover:bg-slate-850 text-white text-xs font-semibold py-2 px-3 rounded-xl transition cursor-pointer shrink-0"
          >
            ثبت کوییز
          </button>
        </form>
      </div>

      {quizSuccess && (
        <motion.div 
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-[11px] text-emerald-700 bg-emerald-50/70 border border-emerald-100 p-2.5 rounded-xl block font-medium"
        >
          ✓ عالی است! درصد فرعی جدید ({toPersianNum(latestQuizScore)}٪) با موفقیت ثبت شد و نمودار رشد مجدداً کالیبره شد.
        </motion.div>
      )}

      {/* AI-Powered Goal Hit Likelihood Estimator Section */}
      <div className="border border-indigo-100 bg-indigo-50/20 rounded-2xl p-5 space-y-4" id="ai-insight-panel">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <span className="p-1.5 bg-indigo-50 text-indigo-600 rounded-lg animate-pulse">
              <Brain size={18} />
            </span>
            <div>
              <h3 className="text-xs font-extrabold text-indigo-950">تخمین احتمال رسیدن به اهداف با هوش مصنوعی (Gemini)</h3>
              <p className="text-[10px] text-indigo-600/80">ارزیابی کلاستر استرس، تراز هدف و سوابق استمرار روازنه کانون</p>
            </div>
          </div>

          {aiInsight && !loadingInsight && (
            <button 
              onClick={fetchGoalInsight}
              className="p-1.5 hover:bg-indigo-100/60 rounded-lg text-indigo-600 transition flex items-center gap-1 text-[10px] font-bold cursor-pointer"
              title="بروزرسانی تحلیل"
            >
              <RefreshCw size={12} />
              <span>تحلیل مجدد</span>
            </button>
          )}
        </div>

        <AnimatePresence mode="wait">
          {loadingInsight ? (
            <motion.div 
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="p-4 bg-white/70 rounded-xl space-y-3 border border-indigo-50"
            >
              <div className="flex items-center gap-3">
                <RefreshCw className="animate-spin text-indigo-500" size={16} />
                <span className="text-xs font-black text-indigo-950 animate-pulse">مشاور هوش مصنوعی در حال ارزیابی متدهای مطالعه شماست...</span>
              </div>
              <div className="space-y-1.5 pt-1">
                <div className="h-2 bg-indigo-100 rounded-full w-full animate-pulse" />
                <div className="h-2 bg-indigo-50 rounded-full w-5/6 animate-pulse" />
              </div>
            </motion.div>
          ) : insightError ? (
            <motion.div 
              key="error"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="p-3 bg-red-50 text-red-700 rounded-xl border border-red-100 text-[11px] font-bold flex items-center gap-2"
            >
              <AlertCircle size={14} />
              <span>{insightError}</span>
              <button 
                onClick={fetchGoalInsight}
                className="bg-white border border-red-200 px-3 py-1 rounded-lg text-red-600 hover:bg-neutral-50 transition mr-auto text-[10px]"
              >
                تلاش مجدد
              </button>
            </motion.div>
          ) : aiInsight ? (
            <motion.div 
              key="result"
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
              {/* Likelihood Meter & Analysis Text */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
                
                {/* Visual Dial Column */}
                <div className="flex flex-col items-center justify-center bg-white p-3.5 rounded-xl border border-indigo-100/60 shadow-sm relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-1 text-slate-100/60 pointer-events-none">
                    <Flame size={44} />
                  </div>
                  
                  {/* Gauge indicator */}
                  <div className="relative w-20 h-20 flex items-center justify-center">
                    {/* SVG Progress Circle */}
                    <svg className="w-full h-full transform -rotate-90">
                      <circle
                        cx="40"
                        cy="40"
                        r="32"
                        className="stroke-slate-100"
                        strokeWidth="5"
                        fill="transparent"
                      />
                      <motion.circle
                        cx="40"
                        cy="40"
                        r="32"
                        className={
                          aiInsight.likelihood >= 80 
                            ? "stroke-emerald-500" 
                            : aiInsight.likelihood >= 50 
                              ? "stroke-amber-500" 
                              : "stroke-red-500"
                        }
                        strokeWidth="5"
                        fill="transparent"
                        strokeDasharray={2 * Math.PI * 32}
                        initial={{ strokeDashoffset: 2 * Math.PI * 32 }}
                        animate={{ strokeDashoffset: 2 * Math.PI * 32 * (1 - aiInsight.likelihood / 100) }}
                        transition={{ duration: 1.2, ease: "easeOut" }}
                      />
                    </svg>
                    <span className="absolute text-sm font-extrabold text-slate-900 font-mono">
                      {toPersianNum(aiInsight.likelihood)}٪
                    </span>
                  </div>
                  <span className="text-[10px] font-black text-indigo-900 mt-2 block text-center">شانس تخمینی معقول</span>
                </div>

                {/* Analysis Description text */}
                <div className="md:col-span-3 space-y-1">
                  <div className="text-[11px] font-semibold text-slate-700 leading-relaxed text-justify">
                    {aiInsight.text}
                  </div>
                  <div className="flex items-center gap-1.5 pt-1">
                    <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                    <span className="text-[10px] text-indigo-600 font-medium">مشاوره تراز شده بر مبنای آخرین نمره کوییز ({toPersianNum(latestQuizScore)}٪)</span>
                  </div>
                </div>

              </div>

              {/* Action Plan Suggestions */}
              <div className="bg-white/60 p-3.5 rounded-xl border border-indigo-100/40 space-y-2">
                <span className="text-[11px] font-bold text-indigo-950 block">پیشنهادات فنی مربی هوش مصنوعی برای دستیابی قطعی به تراز هدف:</span>
                <ul className="space-y-1.5">
                  {aiInsight.recommendations.map((rec, i) => (
                    <motion.li 
                      key={i}
                      initial={{ opacity: 0, x: 5 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.15 }}
                      className="text-[11px] text-slate-600 flex items-start gap-1.5 leading-normal"
                    >
                      <span className="p-0.5 bg-indigo-50 text-indigo-500 rounded-md shrink-0 block mt-0.5">
                        <CheckCircle size={10} />
                      </span>
                      <span>{rec}</span>
                    </motion.li>
                  ))}
                </ul>
              </div>

            </motion.div>
          ) : (
            <motion.div 
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white/50 p-4 rounded-xl border border-indigo-50"
            >
              <div className="space-y-1 max-w-lg">
                <span className="text-xs font-bold text-indigo-950 block">آیا دوست دارید شانس صعود خود را بدانید؟</span>
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  هوش مصنوعی به کمک مدل قدرتمند <span className="font-mono text-indigo-700 font-bold">gemini-3.5-flash</span> ترازهای جاری مهد، فاصله تراز هدف ({toPersianNum(targetTraz)}) و درصد آزمون اخیر ({toPersianNum(latestQuizScore)}٪) شما را آنالیز کرده و احتمال تقریبی به همرا برآورد استراتژیک ارائه می‌دهد.
                </p>
              </div>
              <button
                onClick={fetchGoalInsight}
                className="bg-gradient-to-tr from-indigo-900 to-blue-950 hover:from-indigo-950 hover:to-black text-white text-xs font-bold py-2.5 px-4 rounded-xl shadow transition duration-150 flex items-center gap-1.5 shrink-0 self-end md:self-center cursor-pointer"
              >
                <Sparkles size={14} />
                <span>تخمین هوشمند فرآیند رشد</span>
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

    </div>
  );
}
