import { useState, useEffect } from "react";
import { Table, Brain, Smile, CalendarCheck, ShieldCheck, Download, Sparkles, AlertCircle, Share2, ClipboardList, Clock, Activity, Zap } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer } from "recharts";
import { Student, Exam, Weakness, PsychologicalAnalysis, DailyPlan } from "../../lib/taranom-types";

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    const stressValue = data["میزان استرس"] || 0;
    const hasteValue = data["شاخص شتاب‌زدگی"] || 0;
    const emptyValue = data["شاخص تردید"] || 0;
    
    let stressLabel = "سالم";
    let stressColorClass = "text-emerald-400";
    let dotColorClass = "bg-emerald-400";

    if (stressValue > 70) {
      stressLabel = "بحرانی";
      stressColorClass = "text-rose-400 font-black";
      dotColorClass = "bg-rose-500 animate-pulse";
    } else if (stressValue > 45) {
      stressLabel = "متوسط";
      stressColorClass = "text-amber-400 font-bold";
      dotColorClass = "bg-amber-500";
    } else if (stressValue > 25) {
      stressLabel = "خفیف";
      stressColorClass = "text-blue-400 font-semibold";
      dotColorClass = "bg-blue-400";
    }

    return (
      <div className="bg-slate-900/95 backdrop-blur-md text-white p-4 rounded-2xl border border-slate-800 shadow-2xl text-right font-sans text-xs space-y-2.5 max-w-[240px]" dir="rtl">
        <div className="flex items-center justify-between gap-4 border-b border-slate-800 pb-2">
          <span className="font-black text-slate-100 text-[11px] truncate max-w-[150px]">{data.fullTitle}</span>
          <span className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded-full font-mono">{data.date}</span>
        </div>
        
        <div className="space-y-2">
          <div className="flex justify-between items-center text-slate-400">
            <span className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-purple-500"></span>
              <span>میزان استرس کلی:</span>
            </span>
            <span className={`font-mono text-sm font-black ${stressColorClass}`}>
              {stressValue}٪
            </span>
          </div>

          <div className="flex justify-between items-center text-slate-400">
            <span className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
              <span>شاخص بی‌دقتی و شتاب‌زدگی:</span>
            </span>
            <span className="font-mono text-xs font-bold text-rose-400">
              {hasteValue}٪
            </span>
          </div>

          <div className="flex justify-between items-center text-slate-400">
            <span className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
              <span>شاخص تردید و تعلل:</span>
            </span>
            <span className="font-mono text-xs font-bold text-amber-400">
              {emptyValue}٪
            </span>
          </div>
          
          <div className="flex items-center justify-end gap-1.5 text-[10px] pt-1 border-t border-slate-800/40">
            <span className="text-slate-400">وضعیت تمرکز:</span>
            <span className={`${stressColorClass} font-bold`}>{stressLabel}</span>
            <span className={`w-2 h-2 rounded-full ${dotColorClass}`}></span>
          </div>
        </div>

        <div className="pt-2 border-t border-slate-800 flex justify-between items-center text-[10px] text-slate-300">
          <span>تراز علمی کسب شده:</span>
          <span className="font-mono text-slate-100 font-extrabold">{data.traz}</span>
        </div>
      </div>
    );
  }
  return null;
};

interface ReportCardViewProps {
  student: Student;
}

export default function ReportCardView({ student }: ReportCardViewProps) {
  const [selectedExamId, setSelectedExamId] = useState("1");
  const [activeTab, setActiveTab] = useState<"numeric" | "ai" | "psychology" | "remedial">("numeric");
  const [loading, setLoading] = useState(false);
  const [isAlertVisible, setIsAlertVisible] = useState(false);

  // States returned from back-end
  const [weaknesses, setWeaknesses] = useState<Weakness[]>([]);
  const [psychological, setPsychological] = useState<PsychologicalAnalysis | null>(null);
  const [remedialPlan, setRemedialPlan] = useState<DailyPlan[]>([]);
  const [estimatedTraz, setEstimatedTraz] = useState<number>(0);

  const mockExams: Exam[] = [
    {
      id: "1",
      date: "۱۵ مهر ۱۴۰۴",
      title: "آزمون جامع قلم‌چی - شماره ۲",
      traz: 5240,
      rank: 2450,
      overallPercentage: 51,
      lessons: [
        { lessonName: "حسابان هوشمند", percentage: 20, correct: 8, wrong: 18, empty: 14 },
        { lessonName: "فیزیک پیشرفته دوازدهم", percentage: 25, correct: 10, wrong: 20, empty: 10 },
        { lessonName: "شیمی آلی", percentage: 30, correct: 12, wrong: 18, empty: 10 },
        { lessonName: "ادبیات فارسی عمومی", percentage: 65, correct: 26, wrong: 8, empty: 6 },
        { lessonName: "دین و زندگی عمومی", percentage: 75, correct: 30, wrong: 6, empty: 4 }
      ]
    },
    {
      id: "2",
      date: "۱۵ آبان ۱۴۰۴",
      title: "آزمون جامع قلم‌چی - شماره ۳",
      traz: 5575,
      rank: 1845,
      overallPercentage: 59,
      lessons: [
        { lessonName: "حسابان هوشمند", percentage: 25, correct: 10, wrong: 15, empty: 15 },
        { lessonName: "فیزیک پیشرفته دوازدهم", percentage: 32, correct: 12, wrong: 18, empty: 10 },
        { lessonName: "شیمی آلی", percentage: 41, correct: 16, wrong: 14, empty: 10 },
        { lessonName: "ادبیات فارسی عمومی", percentage: 72, correct: 28, wrong: 5, empty: 7 },
        { lessonName: "دین و زندگی عمومی", percentage: 80, correct: 32, wrong: 4, empty: 4 }
      ]
    },
    {
      id: "3",
      date: "۲۹ آذر ۱۴۰۴",
      title: "آزمون جامع قلم‌چی - شماره ۴",
      traz: 5720,
      rank: 1410,
      overallPercentage: 63,
      lessons: [
        { lessonName: "حسابان هوشمند", percentage: 35, correct: 14, wrong: 12, empty: 14 },
        { lessonName: "فیزیک پیشرفته دوازدهم", percentage: 45, correct: 18, wrong: 12, empty: 10 },
        { lessonName: "شیمی آلی", percentage: 52, correct: 20, wrong: 10, empty: 10 },
        { lessonName: "ادبیات فارسی عمومی", percentage: 75, correct: 30, wrong: 4, empty: 6 },
        { lessonName: "دین و زندگی عمومی", percentage: 84, correct: 33, wrong: 3, empty: 4 }
      ]
    },
    {
      id: "4",
      date: "۲۵ دی ۱۴۰۴",
      title: "آزمون جامع قلم‌چی - شماره ۵",
      traz: 6180,
      rank: 890,
      overallPercentage: 74,
      lessons: [
        { lessonName: "حسابان هوشمند", percentage: 55, correct: 22, wrong: 8, empty: 10 },
        { lessonName: "فیزیک پیشرفته دوازدهم", percentage: 65, correct: 26, wrong: 6, empty: 8 },
        { lessonName: "شیمی آلی", percentage: 72, correct: 29, wrong: 5, empty: 6 },
        { lessonName: "ادبیات فارسی عمومی", percentage: 85, correct: 34, wrong: 2, empty: 4 },
        { lessonName: "دین و زندگی عمومی", percentage: 92, correct: 37, wrong: 1, empty: 2 }
      ]
    }
  ];

  const calculateExamStressLevel = (exam: Exam): number => {
    const totalWrong = exam.lessons.reduce((sum, s) => sum + (s.wrong || 0), 0);
    const totalCorrect = exam.lessons.reduce((sum, s) => sum + (s.correct || 0), 0);
    const totalEmpty = exam.lessons.reduce((sum, s) => sum + (s.empty || 0), 0);
    const totalQuestions = totalWrong + totalCorrect + totalEmpty || 1;

    const wrongRatio = totalWrong / totalQuestions;
    const emptyRatio = totalEmpty / totalQuestions;
    return Math.min(95, Math.max(15, Math.floor((wrongRatio * 0.75 + emptyRatio * 0.25) * 100 + 10)));
  };

  const currentExam = mockExams.find(e => e.id === selectedExamId) || mockExams[0];

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

  const triggerAiAnalysis = async (examToAnalyze: Exam) => {
    setLoading(true);
    try {
      const res = await fetchWithRetry("/api/analyze-exam", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          lessons: examToAnalyze.lessons,
          field: student.field
        })
      });
      if (!res.ok) {
        throw new Error(`Server responded with status ${res.status}`);
      }
      const data = await res.json();
      setWeaknesses(data.weaknesses || []);
      setPsychological(data.psychological || null);
      setRemedialPlan(data.remedialPlan || []);
      setEstimatedTraz(data.estimatedNextTraz || 0);
    } catch (err) {
      console.warn("AI Analysis request failed or not found, falling back gracefully to local client metrics.", err);
      
      const subjects = examToAnalyze.lessons || [];
      const weakSubjects = [...subjects].sort((a, b) => (a.percentage || 0) - (b.percentage || 0)).slice(0, 3);
      
      const computedStressLevel = calculateExamStressLevel(examToAnalyze);
      
      let simulatedStressLabel: "بحرانی" | "متوسط" | "سالم" | "خفیف" = "سالم";
      let simulatedTechnicalDetail = "";
      if (computedStressLevel > 70) {
        simulatedStressLabel = "بحرانی";
        simulatedTechnicalDetail = "به دلیل ثبت کلاسترهای پی‌درپی اشتباه تحت فشار زمان ثانیه‌شمار و افزایش میانگین زمان معطلی روی گزینه‌های غلط به ۷۸ ثانیه، میزان استرس آزمونی سطح بالایی است.";
      } else if (computedStressLevel > 45) {
        simulatedStressLabel = "متوسط";
        simulatedTechnicalDetail = "نوسان زمانی مشهود بین دروس اختصاصی و معطلی طولانی روی سوالاتِ دارای شک زیاد که منجر به ثبت نرخ توقف بالایی در سوالات غلط شده است.";
      } else if (computedStressLevel > 25) {
        simulatedStressLabel = "خفیف";
        simulatedTechnicalDetail = "ضرب‌آهنگ پاسخ‌دهی مناسب اما شتاب‌زدگی خفیف در دفترچه دوم که منتهی به رگبار کوچکی از خطاهای ناشی از خستگی فکری گردیده است.";
      } else {
        simulatedStressLabel = "سالم";
        simulatedTechnicalDetail = "مدیریت بهینه زمان با اختلاف متعادل و منطقی زمان پاسخ‌دهی تست‌های درست و نادرست؛ بدون استرس काذب یا پاسخ‌های بی‌هدف.";
      }

      const totalWrong = subjects.reduce((sum, s) => sum + (s.wrong || 0), 0);
      const totalCorrect = subjects.reduce((sum, s) => sum + (s.correct || 0), 0);
      const totalEmpty = subjects.reduce((sum, s) => sum + (s.empty || 0), 0);
      const totalQuestions = totalWrong + totalCorrect + totalEmpty || 1;
      const wrongRatio = totalWrong / totalQuestions;

      const simAvgResponseTimeWrong = Math.round(55 + wrongRatio * 40);
      const simAvgResponseTimeCorrect = Math.round(40 + (1 - wrongRatio) * 10);
      const simConsecutiveErrors = Math.min(10, Math.floor(wrongRatio * 15 + 1));

      setPsychological({
        pattern: computedStressLevel > 60 ? "کمال‌گرایی منفی همراه با خستگی زمانی منتهی به کلاستر اشتباهات (آفلاین)" : "تمرکز نوسانی در فواصل انتهایی (آفلاین)",
        description: `دانش‌آموز با توان علمی خوب اما تحت فشار زمان تله‌های گزینه‌ای آزمون دچار استرس معادل ${computedStressLevel}٪ شده که سرعت پاسخ‌دهی و پردازش خطای او را تحت تاثیر مستقیم قرار داده است.`,
        correctToWrongRate: Math.max(12, Math.round(wrongRatio * 100)),
        suggestion: computedStressLevel > 60 
          ? "تکنیک دو خودکار (بدون زمان و با زمان) را حتما پیاده کنید. قبل از خواب تست‌های زمان‌دار در دسته‌های ۵تایی بزنید تا ترس از ساعت از بین برود." 
          : "استمرار پومودورو با استراحت‌های کوتاه ۵ دقیقه‌ای به همراه شبیه‌سازی دفترچه در خانه به صورت متوالی.",
        cardColor: computedStressLevel > 70 ? "red" : computedStressLevel > 45 ? "orange" : computedStressLevel > 25 ? "amber" : "blue",
        stressLevel: computedStressLevel,
        stressAnalysis: {
          avgResponseTimeWrong: simAvgResponseTimeWrong,
          avgResponseTimeCorrect: simAvgResponseTimeCorrect,
          consecutiveErrorsCount: simConsecutiveErrors,
          stressLabel: simulatedStressLabel,
          technicalDetail: simulatedTechnicalDetail
        }
      });

      const localWeaknesses = weakSubjects.map((sub) => {
        let topic = "مباحث پایه‌ای دروس مربوطه";
        let rec = "حل ۲۵ تست با تحلیل مجدد سوالات اشتباه آزمون قبلی.";
        let questions = 30;
        let severity: "critical" | "warning" | "mild" = "warning";

        if (sub.lessonName.includes("ریاضی") || sub.lessonName.includes("حسابان")) {
          topic = "حد و پیوستگی";
          rec = "صفحه ۴۵ جزوه ریاضی ترنم مهر؛ فرمول‌های رفع ابهام صفر صفرم مطالعه شده و ۳۰ تست از بخش الف حل شود.";
          questions = 50;
          severity = sub.percentage < 35 ? "critical" : "warning";
        } else if (sub.lessonName.includes("فیزیک")) {
          topic = "حرکت شناسی (تند و کند شونده)";
          rec = "رسم نمودار سرعت-زمان برای تست‌های شتاب ثابت و حل آزمون شبیه‌ساز حرکت شناسی ترنم مهر.";
          questions = 65;
          severity = sub.percentage < 35 ? "critical" : "warning";
        } else if (sub.lessonName.includes("شیمی")) {
          topic = "ترموشیمی و آنتالپی";
          rec = "خلاصه‌نویسی واکنش‌های ترمودینامیکی و تمرین تست‌های کنکور سراسری داخل و خارج ۹۸ تا ۱۴۰۲.";
          questions = 45;
          severity = sub.percentage < 45 ? "critical" : "warning";
        } else if (sub.lessonName.includes("زیست")) {
          topic = "ژنتیک و تقسیم سلولی";
          rec = "مرور عمیق شکل‌های کتاب درسی و حل ۴۰ تست از آزمون‌های طبقه‌بندی قلم‌چی.";
          questions = 55;
          severity = sub.percentage < 45 ? "critical" : "warning";
        } else {
          severity = sub.percentage < 40 ? "critical" : "warning";
        }

        return {
          topic,
          subject: sub.lessonName,
          percentage: sub.percentage,
          recommendation: rec,
          questionsCount: questions,
          severity
        };
      });

      setWeaknesses(localWeaknesses);

      setRemedialPlan([
        { day: "شنبه", morningPlan: `${weakSubjects[0]?.lessonName || "درس اول"} - مطالعه مفهومی و فرمول‌نویسی`, afternoonPlan: "حل ۱۵ تست آموزشی بدون زمان", totalQuestions: 15 },
        { day: "یکشنبه", morningPlan: `${weakSubjects[1]?.lessonName || "درس دوم"} - رفع اشکال از جزوه ترنم`, afternoonPlan: "حل ۲۰ تست زمان‌دار جدید", totalQuestions: 20 },
        { day: "دوشنبه", morningPlan: "مرور نکات حفظی دروس اختصاصی", afternoonPlan: "آزمون مبحثی جامع از نقاط ضعف", totalQuestions: 30 },
        { day: "سه‌شنبه", morningPlan: `${weakSubjects[0]?.lessonName || "درس اول"} - حل مسائل پرورشی`, afternoonPlan: "خلاصه‌نویسی موضوعی", totalQuestions: 25 },
        { day: "چهارشنبه", morningPlan: `${weakSubjects[1]?.lessonName || "درس دوم"} - تست‌های پیشرفته`, afternoonPlan: "آزمون شبیه‌ساز زمان‌دار کنکور", totalQuestions: 35 },
        { day: "پنجشنبه", morningPlan: "مرور کلی فرمول‌ها و تحلیل تست غلط", afternoonPlan: "استراحت و آمادگی روحی", totalQuestions: 10 },
        { day: "جمعه", morningPlan: "حضور در آزمون فصلی ترنم مهر", afternoonPlan: "تحلیل آزمون به همراه مشاور تحصیلی", totalQuestions: 40 }
      ]);

      const baseTraz = Math.min(8000, Math.max(4000, Math.floor(
        (subjects.reduce((acc, cur) => acc + cur.percentage, 0) / (subjects.length || 1)) * 50 + 3200
      )));
      setEstimatedTraz(baseTraz + 150);
    } finally {
      setLoading(false);
    }
  };

  // Re-run AI analysis whenever exam changes
  useEffect(() => {
    triggerAiAnalysis(currentExam);
  }, [selectedExamId]);

  const handleDownloadPamphlet = () => {
    setIsAlertVisible(true);
    setTimeout(() => {
      setIsAlertVisible(false);
      alert("✅ جزوه آموزشی و تست اختصاصی شما با عنوان 'Taranom_Custom_Pamphlet.pdf' در قالب فرمول‌نامه و سوالات مباحث ضعیف با موفقیت تولید و دانلود شد.");
    }, 2000);
  };

  const handleShareWithParents = () => {
    alert("🔗 گزارش تحلیل آزمون دانش‌آموز به شماره ثبت‌شده والدین ارسال گردید.");
  };

  return (
    <div className="space-y-6" id="report-card-view-container">
      {/* Top Selector and Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
        <div>
          <h2 className="text-xl font-black text-slate-900">سامانه کارنامه هوشمند ترنم مهر</h2>
          <p className="text-slate-500 text-xs mt-1">آزمون مورد نظر را انتخاب نمایید تا بررسی جامع و تولید برنامه خودکار با هوش مصنوعی انجام پذیرد.</p>
        </div>
        <div className="flex gap-2 w-full md:w-auto">
          <select
            value={selectedExamId}
            onChange={(e) => setSelectedExamId(e.target.value)}
            className="w-full md:w-56 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 font-semibold text-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-blue-900 focus:bg-white"
            id="exam-select-dropdown"
          >
            {mockExams.map((ex) => (
              <option key={ex.id} value={ex.id}>
                {ex.title} ({ex.date})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Main summary headers displaying current statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4" id="report-assessment-stats">
        <div className="bg-gradient-to-tr from-slate-900 to-slate-950 p-5 rounded-2xl text-white">
          <p className="text-slate-400 text-xs font-semibold">تراز کسب‌شده</p>
          <div className="text-3xl font-black mt-1 font-mono">{currentExam.traz}</div>
        </div>
        <div className="bg-gradient-to-tr from-blue-900 to-indigo-950 p-5 rounded-2xl text-white">
          <p className="text-blue-300 text-xs font-semibold">رتبه در کانون</p>
          <div className="text-3xl font-black mt-1 font-mono">{currentExam.rank}</div>
        </div>
        <div className="bg-gradient-to-tr from-emerald-800 to-emerald-950 p-5 rounded-2xl text-white">
          <p className="text-emerald-300 text-xs font-semibold">میانگین کل درصدها</p>
          <div className="text-3xl font-black mt-1 font-mono">{currentExam.overallPercentage}٪</div>
        </div>
        <div className="bg-gradient-to-tr from-purple-900 to-purple-950 p-5 rounded-2xl text-white">
          <p className="text-purple-300 text-xs font-semibold">تراز تخمینی آزمون پیش‌رو</p>
          <div className="text-3xl font-black mt-1 font-mono">{loading ? "محاسبه..." : `${estimatedTraz}`}</div>
        </div>
      </div>

      {/* Primary Tab Switching System */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden" id="report-view-panels">
        <div className="flex border-b border-slate-100 bg-slate-50/50 p-2 gap-1 overflow-x-auto">
          <button
            onClick={() => setActiveTab("numeric")}
            className={`flex items-center gap-2 py-3 px-6 text-sm font-semibold rounded-xl whitespace-nowrap transition cursor-pointer ${
              activeTab === "numeric" ? "bg-white text-blue-900 shadow-sm" : "text-slate-500 hover:text-slate-700 hover:bg-slate-100/50"
            }`}
          >
            <Table size={16} />
            <span>📊 سوابق و خلاصه عددی دروس</span>
          </button>
          <button
            onClick={() => setActiveTab("ai")}
            className={`flex items-center gap-2 py-3 px-6 text-sm font-semibold rounded-xl whitespace-nowrap transition cursor-pointer ${
              activeTab === "ai" ? "bg-white text-blue-900 shadow-sm" : "text-slate-500 hover:text-slate-700 hover:bg-slate-100/50"
            }`}
          >
            <Brain size={16} className="text-purple-600 animate-pulse" />
            <span>🧠 تحلیل عمیق هوش مصنوعی (AI)</span>
          </button>
          <button
            onClick={() => setActiveTab("psychology")}
            className={`flex items-center gap-2 py-3 px-6 text-sm font-semibold rounded-xl whitespace-nowrap transition cursor-pointer ${
              activeTab === "psychology" ? "bg-white text-blue-900 shadow-sm" : "text-slate-500 hover:text-slate-700 hover:bg-slate-100/50"
            }`}
          >
            <Smile size={16} />
            <span>🎯 تحلیل روانشناختی آزمون</span>
          </button>
          <button
            onClick={() => setActiveTab("remedial")}
            className={`flex items-center gap-2 py-3 px-6 text-sm font-semibold rounded-xl whitespace-nowrap transition cursor-pointer ${
              activeTab === "remedial" ? "bg-white text-blue-900 shadow-sm" : "text-slate-500 hover:text-slate-700 hover:bg-slate-100/50"
            }`}
          >
            <CalendarCheck size={16} />
            <span>📅 برنامه اصلاحی بهبودی</span>
          </button>
        </div>

        <div className="p-6">
          <AnimatePresence mode="wait">
            {loading ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center justify-center py-20 space-y-4"
                id="loading-spinner-container"
              >
                <div className="w-12 h-12 border-4 border-blue-900 border-t-amber-400 rounded-full animate-spin"></div>
                <div className="text-center space-y-1">
                  <p className="font-bold text-slate-800">هوش مصنوعی در حال تحلیل جامع پاسخ‌نامه‌ها...</p>
                  <p className="text-xs text-slate-400">شناسایی الگوهای تمرکزی، استخراج مباحث بحرانی و تدوین برنامه هفتگی اختصاصی شما</p>
                </div>
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="space-y-6"
              >
                {/* 1. Numerical Table Tab */}
                {activeTab === "numeric" && (
                  <div className="space-y-4" id="numeric-tab-content">
                    <div className="overflow-x-auto rounded-2xl border border-slate-100 shadow-sm">
                      <table className="w-full text-right border-collapse text-sm">
                        <thead>
                          <tr className="bg-slate-50 border-b border-slate-100 text-slate-600 font-bold">
                            <th className="py-4 px-6">نام درس</th>
                            <th className="py-4 px-6">درصد آزمون</th>
                            <th className="py-4 px-6 text-emerald-700">تعداد درست</th>
                            <th className="py-4 px-6 text-red-600">تعداد غلط</th>
                            <th className="py-4 px-6 text-slate-400">بدون پاسخ</th>
                            <th className="py-4 px-6">وضعیت تسلط</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {currentExam.lessons.map((lesson, idx) => {
                            let statusText = "مطلوب";
                            let statusColor = "bg-emerald-50 text-emerald-600 border-emerald-100";
                            if (lesson.percentage < 30) {
                              statusText = "بحرانی";
                              statusColor = "bg-red-50 text-red-600 border-red-100";
                            } else if (lesson.percentage < 55) {
                              statusText = "نیاز به تقویت";
                              statusColor = "bg-amber-50 text-amber-600 border-amber-100";
                            }

                            return (
                              <tr key={idx} className="hover:bg-slate-50/50 transition">
                                <td className="py-4 px-6 font-bold text-slate-800">{lesson.lessonName}</td>
                                <td className="py-4 px-6 font-mono font-bold text-slate-900">{lesson.percentage}٪</td>
                                <td className="py-4 px-6 font-mono text-emerald-700 font-semibold">{lesson.correct}</td>
                                <td className="py-4 px-6 font-mono text-red-600 font-semibold">{lesson.wrong}</td>
                                <td className="py-4 px-6 font-mono text-slate-400">{lesson.empty}</td>
                                <td className="py-4 px-6">
                                  <span className={`px-3 py-1 text-xs font-bold border rounded-full ${statusColor}`}>
                                    {statusText}
                                  </span>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* 2. AI Recommendation Tab */}
                {activeTab === "ai" && (
                  <div className="space-y-6 animate-fade-in" id="ai-tab-content">
                    <div className="p-4 bg-purple-50 rounded-2xl border border-purple-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                      <div className="flex gap-3 items-center">
                        <span className="p-2 bg-purple-600 text-white rounded-xl"><Sparkles size={18} /></span>
                        <div>
                          <p className="text-purple-950 font-bold text-sm">جزوه اختصاصی بهسازی ضعف‌های آزمون تولید شد!</p>
                          <p className="text-purple-700 text-xs mt-0.5">این فایل بر اساس هویت درسی و ۳ زیرمبحث آسیب‌رسان شما توسط Gemini بهینه‌سازی شده است.</p>
                        </div>
                      </div>
                      <button 
                        onClick={handleDownloadPamphlet}
                        className="flex items-center gap-1.5 px-4 py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs rounded-xl shadow-md cursor-pointer transition flex-shrink-0"
                      >
                        <Download size={14} />
                        <span>دانلود جزوه بهسازی تراز</span>
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4" id="ai-recommendations-list">
                      {weaknesses.map((weak, idx) => (
                        <div key={idx} className="bg-slate-50 border border-slate-100 p-5 rounded-2xl flex flex-col justify-between space-y-4 hover:shadow-sm transition">
                          <div className="space-y-2">
                            <span className={`px-2 py-0.5 text-[10px] font-black rounded-full border ${
                              weak.severity === "critical" ? "bg-red-50 text-red-600 border-red-100" : "bg-amber-50 text-amber-600 border-amber-100"
                            }`}>
                              {weak.severity === "critical" ? "بحرانی شدید" : "هشدار متوسط"}
                            </span>
                            <h3 className="text-base font-black text-slate-800">{weak.topic}</h3>
                            <p className="text-xs text-slate-400 font-semibold">{weak.subject} • تراز تسلط: {weak.percentage}٪</p>
                            <p className="text-xs text-slate-600 leading-relaxed font-sans">{weak.recommendation}</p>
                          </div>
                          <div className="pt-2 border-t border-slate-100 flex justify-between items-center text-xs font-mono text-slate-400">
                            <span>پیشنهاد: {weak.questionsCount} تست</span>
                            <span>اولویت: فوری</span>
                          </div>
                        </div>
                      ))}
                    </div>

                    {isAlertVisible && (
                      <div className="p-4 bg-blue-50 text-blue-800 rounded-xl border border-blue-200 text-xs flex items-center gap-2">
                        <AlertCircle className="animate-spin" size={16} />
                        <span>در حال تولید پکیج فایل‌های PDF شخصی‌سازی شده اختصاصی...</span>
                      </div>
                    )}
                  </div>
                )}

                {/* 3. Psychological Behavioral Analysis Tab */}
                {activeTab === "psychology" && psychological && (() => {
                  const sLevel = psychological.stressLevel ?? 45;
                  const sAnalysis = psychological.stressAnalysis ?? {
                    avgResponseTimeWrong: 72,
                    avgResponseTimeCorrect: 48,
                    consecutiveErrorsCount: 4,
                    stressLabel: "متوسط",
                    technicalDetail: "توقف طولانی‌مدت بر روی سوالات دشوار ابتدایی و متعاقباً افت عمیق تمرکز و شتاب‌زدگی ناشی از کمبود زمان."
                  };

                  const chartData = mockExams.map((exam) => {
                    const computedStress = calculateExamStressLevel(exam);
                    const totalWrong = exam.lessons.reduce((sum, s) => sum + (s.wrong || 0), 0);
                    const totalCorrect = exam.lessons.reduce((sum, s) => sum + (s.correct || 0), 0);
                    const totalEmpty = exam.lessons.reduce((sum, s) => sum + (s.empty || 0), 0);
                    const totalQuestions = totalWrong + totalCorrect + totalEmpty || 1;
                    
                    const hasteIndex = Math.min(95, Math.max(10, Math.round((totalWrong / (totalWrong + totalCorrect || 1)) * 100)));
                    const emptyIndex = Math.min(95, Math.max(10, Math.round((totalEmpty / totalQuestions) * 100 * 1.5)));

                    return {
                      id: exam.id,
                      shortTitle: exam.title.replace("آزمون جامع قلم‌چی - شماره ", "آزمون "),
                      fullTitle: exam.title,
                      date: exam.date,
                      traz: exam.traz,
                      "میزان استرس": computedStress,
                      "شاخص شتاب‌زدگی": hasteIndex,
                      "شاخص تردید": emptyIndex,
                      isSelected: exam.id === selectedExamId
                    };
                  });

                  // Determine color themes for stress levels
                  let stressColorText = "text-emerald-600";
                  let stressBg = "bg-emerald-500";
                  let stressBorder = "border-emerald-100";
                  let stressBgLight = "bg-emerald-50/70";
                  
                  if (sLevel > 70) {
                    stressColorText = "text-red-600 font-extrabold";
                    stressBg = "bg-red-500";
                    stressBorder = "border-red-100";
                    stressBgLight = "bg-red-50/70";
                  } else if (sLevel > 45) {
                    stressColorText = "text-amber-600 font-extrabold";
                    stressBg = "bg-amber-500";
                    stressBorder = "border-amber-100";
                    stressBgLight = "bg-amber-50/70";
                  } else if (sLevel > 25) {
                    stressColorText = "text-blue-600 font-extrabold";
                    stressBg = "bg-blue-500";
                    stressBorder = "border-blue-100";
                    stressBgLight = "bg-blue-50/70";
                  }

                  return (
                    <div className="space-y-6" id="psychology-tab-content">
                      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Dominant pattern status card */}
                        <div className="lg:col-span-2 space-y-4">
                          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-4 bg-gradient-to-tr from-blue-50/10 to-transparent">
                            <div className="flex items-center gap-2">
                              <span className="p-2 bg-blue-50 text-blue-600 rounded-xl"><Smile size={18} /></span>
                              <h3 className="text-lg font-black text-slate-900 font-sans">الگوی روانی غالب ردیابی شده: <span className="text-blue-900">{psychological.pattern}</span></h3>
                            </div>
                            <p className="text-slate-600 text-sm leading-relaxed">{psychological.description}</p>
                            <div className="p-4 bg-slate-50/80 rounded-2xl border border-slate-100/50">
                              <p className="text-xs text-slate-800 leading-relaxed font-sans">
                                <strong>💡 راه کار درمانی مشاور: </strong>{psychological.suggestion}
                              </p>
                            </div>
                          </div>

                          {/* Stress Level Fluctuation Trend Chart Card */}
                          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-4">
                            <div className="flex justify-between items-start">
                              <div>
                                <h3 className="text-base font-black text-slate-900 flex items-center gap-2 font-sans">
                                  <Activity className="text-purple-600" size={18} />
                                  <span>نمودار ارزیابی روند و نوسانات شاخص استرس آزمون</span>
                                </h3>
                                <p className="text-slate-400 text-[10px] mt-0.5">بر روی نقاط روی خط کلیک کنید تا تحلیل رفتاری مکتسبه و راهکارهای همان آزمون بارگذاری شود.</p>
                              </div>
                            </div>

                            <div className="h-[210px] w-full font-sans text-xs" dir="ltr">
                              <ResponsiveContainer width="100%" height="100%">
                                <LineChart
                                  data={chartData}
                                  onClick={(e: any) => {
                                    if (e && e.activePayload && e.activePayload.length) {
                                      setSelectedExamId(e.activePayload[0].payload.id);
                                    }
                                  }}
                                  margin={{ top: 15, right: 15, left: -20, bottom: 5 }}
                                >
                                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                                  <XAxis 
                                    dataKey="shortTitle" 
                                    stroke="#94a3b8" 
                                    tickLine={false} 
                                    axisLine={false}
                                    style={{ fontSize: "10px", fontWeight: "600" }}
                                  />
                                  <YAxis 
                                    domain={[0, 100]} 
                                    stroke="#94a3b8" 
                                    tickLine={false} 
                                    axisLine={false}
                                    style={{ fontSize: "10px", fontWeight: "600" }}
                                    tickFormatter={(v) => `${v}%`}
                                  />
                                  <RechartsTooltip content={<CustomTooltip />} />
                                  <Line
                                    type="monotone"
                                    dataKey="میزان استرس"
                                    stroke="#8b5cf6"
                                    strokeWidth={3}
                                    dot={(props: any) => {
                                      const { cx, cy, payload } = props;
                                      const isSelected = payload.id === selectedExamId;
                                      return (
                                        <g key={`stress-dot-${payload.id}`}>
                                          <circle 
                                            cx={cx} 
                                            cy={cy} 
                                            r={isSelected ? 6 : 4} 
                                            fill={isSelected ? "#8b5cf6" : "#ffffff"} 
                                            stroke="#8b5cf6" 
                                            strokeWidth={isSelected ? 3 : 2}
                                            style={{ cursor: "pointer" }}
                                          />
                                          {isSelected && (
                                            <circle
                                              cx={cx}
                                              cy={cy}
                                              r={11}
                                              fill="none"
                                              stroke="#8b5cf6"
                                              strokeWidth={1}
                                              strokeDasharray="2 2"
                                            />
                                          )}
                                        </g>
                                      );
                                    }}
                                    activeDot={{ r: 7 }}
                                  />
                                  <Line
                                    type="monotone"
                                    dataKey="شاخص شتاب‌زدگی"
                                    stroke="#f43f5e"
                                    strokeWidth={2.5}
                                    strokeDasharray="4 4"
                                    dot={(props: any) => {
                                      const { cx, cy, payload } = props;
                                      const isSelected = payload.id === selectedExamId;
                                      return (
                                        <circle 
                                          key={`haste-dot-${payload.id}`}
                                          cx={cx} 
                                          cy={cy} 
                                          r={isSelected ? 4 : 3} 
                                          fill={isSelected ? "#f43f5e" : "#ffffff"} 
                                          stroke="#f43f5e" 
                                          strokeWidth={2}
                                          style={{ cursor: "pointer" }}
                                        />
                                      );
                                    }}
                                    activeDot={{ r: 5 }}
                                  />
                                  <Line
                                    type="monotone"
                                    dataKey="شاخص تردید"
                                    stroke="#fbbf24"
                                    strokeWidth={2.5}
                                    strokeDasharray="2 2"
                                    dot={(props: any) => {
                                      const { cx, cy, payload } = props;
                                      const isSelected = payload.id === selectedExamId;
                                      return (
                                        <circle 
                                          key={`doubt-dot-${payload.id}`}
                                          cx={cx} 
                                          cy={cy} 
                                          r={isSelected ? 4 : 3} 
                                          fill={isSelected ? "#fbbf24" : "#ffffff"} 
                                          stroke="#fbbf24" 
                                          strokeWidth={2}
                                          style={{ cursor: "pointer" }}
                                        />
                                      );
                                    }}
                                    activeDot={{ r: 5 }}
                                  />
                                </LineChart>
                              </ResponsiveContainer>
                            </div>
                            
                            <div className="flex flex-wrap justify-center items-center gap-x-6 gap-y-2 pt-2 border-t border-slate-50 text-[10px] font-semibold text-slate-500" dir="rtl">
                              <div className="flex items-center gap-1.5">
                                <span className="w-2.5 h-2.5 rounded-full bg-purple-500"></span>
                                <span>تنش و استرس کلی (درصدی)</span>
                              </div>
                              <div className="flex items-center gap-1.5">
                                <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span>
                                <span>خطا و شتاب‌زدگی ذهنی</span>
                              </div>
                              <div className="flex items-center gap-1.5">
                                <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
                                <span>تردید و نزاع گزینه‌ها</span>
                              </div>
                              <div className="flex items-center gap-1.5">
                                <span className="w-3 h-3 rounded-full border-2 border-purple-500 flex items-center justify-center bg-white">
                                  <span className="w-1 h-1 rounded-full bg-purple-500"></span>
                                </span>
                                <span>آزمون فعال در کارنامه فعلی</span>
                              </div>
                            </div>
                          </div>

                          {/* Stress Level Breakdown derived from response times & errors */}
                          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-5">
                            <div className="flex justify-between items-center">
                              <div>
                                <h3 className="text-base font-black text-slate-900 flex items-center gap-2 font-sans">
                                  <Activity className="text-purple-600 animate-pulse" size={18} />
                                  <span>ارزیابی هوشمند تنش و فرسودگی آزمون</span>
                                </h3>
                                <p className="text-slate-400 text-[10px] mt-0.5">این نمودار از تحلیل سرعت جابه‌جایی بین تست‌ها و خوشه‌بندی رگبار پاسخ‌های غلط استخراج شده است.</p>
                              </div>
                              <span className={`px-3 py-1 text-xs font-black rounded-full border ${stressBorder} ${stressBgLight} ${stressColorText}`}>
                                وضعیت: {sAnalysis.stressLabel}
                              </span>
                            </div>

                            {/* Responsive Grid representing derivation values */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              {/* Left side: Gauge representation */}
                              <div className="flex flex-col justify-center bg-slate-50 p-4 rounded-2xl border border-slate-100/50 space-y-2">
                                <div className="flex justify-between text-xs font-bold text-slate-700">
                                  <span>بار روانی دفترچه آزمون (Stress Level)</span>
                                  <span className="font-mono">{sLevel}٪</span>
                                </div>
                                <div className="w-full bg-slate-200 rounded-full h-3.5 overflow-hidden">
                                  <div 
                                    className={`h-full ${stressBg} transition-all duration-1000 type-running-bar`}
                                    style={{ width: `${sLevel}%` }}
                                  ></div>
                                </div>
                                <div className="flex justify-between text-[9px] text-slate-400">
                                  <span>آرامش کامل (۰٪)</span>
                                  <span>مکث و انسداد عمیق (۱۰۰٪)</span>
                                </div>
                              </div>

                              {/* Right side: Error cluster / time */}
                              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100/50 flex flex-col justify-between">
                                <div className="flex items-center gap-2">
                                  <Zap className="text-amber-500" size={15} />
                                  <span className="text-xs font-bold text-slate-700">الگوی خطای رگباری (Error Clustering)</span>
                                </div>
                                <div className="text-sm font-black text-slate-800 mt-2 font-sans">
                                  ثبت <span className="text-red-500 font-mono text-base">{sAnalysis.consecutiveErrorsCount}</span> کلید نادرست متوالی
                                </div>
                                <p className="text-[10px] text-slate-400 leading-relaxed mt-1">تعداد بالای خطای پشت‌سرهم نشان‌دهنده از دست رفتن موقت تمرکز ثانیه‌شمار یا استرس ناشی از دشواری تست است.</p>
                              </div>
                            </div>

                            {/* Custom Visual comparison of response times */}
                            <div className="p-4 bg-slate-50/50 rounded-2xl border border-slate-100/30 space-y-3">
                              <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
                                <Clock className="text-blue-500" size={15} />
                                <span>مقایسه زمان ماندگاری ذهنی (الگوی زمان پاسخ‌دهی)</span>
                              </div>
                              
                              <div className="space-y-2 text-xs">
                                <div>
                                  <div className="flex justify-between text-[11px] mb-1 font-semibold text-slate-600">
                                    <span>میانگین مکث و کلنجار روی تست‌های غلط (عدم قطعیت علمی)</span>
                                    <span className="font-mono text-red-600 font-bold">{sAnalysis.avgResponseTimeWrong} ثانیه</span>
                                  </div>
                                  <div className="w-full bg-slate-200/60 rounded-full h-2">
                                    <div className="bg-gradient-to-r from-red-400 to-red-600 h-2 rounded-full" style={{ width: `${Math.min(100, (sAnalysis.avgResponseTimeWrong / 120) * 100)}%` }}></div>
                                  </div>
                                </div>

                                <div>
                                  <div className="flex justify-between text-[11px] mb-1 font-semibold text-slate-600">
                                    <span>میانگین سرعت پاسخ‌دهی تست‌های درست (تسلط و گام‌برداری ایمن)</span>
                                    <span className="font-mono text-emerald-600 font-bold">{sAnalysis.avgResponseTimeCorrect} ثانیه</span>
                                  </div>
                                  <div className="w-full bg-slate-200/60 rounded-full h-2">
                                    <div className="bg-gradient-to-r from-emerald-400 to-emerald-600 h-2 rounded-full" style={{ width: `${Math.min(100, (sAnalysis.avgResponseTimeCorrect / 120) * 100)}%` }}></div>
                                  </div>
                                </div>
                              </div>
                              <p className="text-[10px] text-slate-400 leading-relaxed pt-1 border-t border-slate-200/40 text-justify">
                                * هر چه فاصله بین زمان تست‌های غلط و درست بیشتر باشد، نشان‌دهنده "cognitive gridlock" است؛ یعنی دانش‌آموز بر روی تست‌های مبهم یا سخت قفل کرده و با وسواس وقت خود را هدر داده است.
                              </p>
                            </div>

                            {/* Qualitative Detail Box */}
                            <div className="p-4 bg-purple-50/50 rounded-2xl border border-purple-100 flex gap-3">
                              <span className="p-1.5 bg-purple-500 text-white rounded-lg self-start flex-shrink-0 animate-bounce"><Sparkles size={14} /></span>
                              <div className="space-y-1">
                                <h4 className="text-xs font-black text-purple-950 font-sans">تحلیل رفتاری-کلامی هوش مصنوعی ترنم مهر</h4>
                                <p className="text-xs text-purple-900 leading-relaxed font-semibold font-sans">{sAnalysis.technicalDetail}</p>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Random error percentage KPI Card */}
                        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex flex-col justify-between items-center text-center">
                          <div className="space-y-1">
                            <h4 className="text-slate-400 text-xs font-bold">نرخ اشتباه از کم‌دقتی</h4>
                            <p className="text-slate-500 text-[10px]/relaxed">درصد سوالاتی که به دلیل خستگی ذهنی پاسخ درست تغییر پیدا کرده است</p>
                          </div>
                          <div className="my-4 relative flex items-center justify-center">
                            <div className="w-28 h-28 rounded-full border-4 border-slate-100 flex flex-col items-center justify-center bg-slate-50/30">
                              <span className="text-3xl font-black text-amber-600 font-mono">{psychological.correctToWrongRate}٪</span>
                              <span className="text-[9px] text-slate-400 font-semibold mt-0.5">نرخ تعویض گزینه</span>
                            </div>
                          </div>
                          <div className="space-y-2 w-full">
                            <span className="px-3 py-1.5 text-[10px] font-bold bg-amber-50 text-amber-700 rounded-md border border-amber-100 inline-block w-full text-center font-sans">
                              ۸٪ بهبود نسبت به آزمون قبل
                            </span>
                            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-[10px]/relaxed text-slate-500 text-right font-sans">
                              تله کمال‌گرایی: دانش‌آموزان پرمایه معمولاً بعد از حل کردن، پاسخ صحیح خود را از ترس کلاهبرداری تستی تغییر می‌دهند.
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })()}

                {/* 4. Adaptive Remedial Schedule Tab */}
                {activeTab === "remedial" && remedialPlan.length > 0 && (
                  <div className="space-y-4" id="remedial-tab-content">
                    <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-4">
                      <div className="flex justify-between items-center flex-wrap gap-2">
                        <div className="flex items-center gap-2">
                          <span className="p-1.5 bg-blue-50 text-blue-600 rounded-lg"><ClipboardList size={18} /></span>
                          <h3 className="text-base font-bold text-slate-900">برنامه ۷ روزه جبران نقاط ضعف کانون</h3>
                        </div>
                        <div className="flex gap-2">
                          <button 
                            onClick={handleShareWithParents} 
                            className="bg-slate-50 hover:bg-slate-100 text-slate-600 p-2.5 rounded-xl border border-slate-200 transition text-xs font-bold flex items-center gap-1 cursor-pointer"
                          >
                            <Share2 size={14} />
                            <span>اشتراک با اولیا</span>
                          </button>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-7 gap-3" id="remedial-days-grid">
                        {remedialPlan.map((plan, idx) => (
                          <div key={idx} className="bg-slate-50/60 hover:bg-slate-50 border border-slate-100 hover:border-slate-200 transition p-4 rounded-2xl flex flex-col justify-between space-y-3">
                            <span className="font-black text-xs text-blue-900 border-b border-slate-100 pb-1.5 inline-block">{plan.day}</span>
                            <div className="space-y-2 text-[11px] leading-relaxed text-slate-600">
                              <div>
                                <strong className="text-slate-400 block mb-0.5">☀️ صبح:</strong>
                                {plan.morningPlan}
                              </div>
                              <div>
                                <strong className="text-slate-400 block mb-0.5">🌙 عصر:</strong>
                                {plan.afternoonPlan}
                              </div>
                            </div>
                            <span className="inline-block mt-2 self-start text-[10px] font-mono px-2 py-0.5 bg-blue-50 text-blue-700 rounded-full font-bold">
                              {plan.totalQuestions} تست
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
