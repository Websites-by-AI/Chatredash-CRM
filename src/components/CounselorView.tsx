import React, { useState, useRef, useEffect } from "react";
import { 
  Send, User, Sparkles, AlertCircle, HelpCircle, CheckSquare, 
  BookOpen, HeartPulse, Brain, Plus, Trash2, Calendar, 
  Clock, Check, Smile, ClipboardList, PlusCircle, Target
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { ChatMessage, Student } from "../types";

interface CounselingSession {
  id: string;
  type: "academic" | "motivational";
  title: string;
  date: string;
  counselorName: string;
  notes: string;
  actionSteps: { text: string; completed: boolean }[];
  recommendedStudyHours: number;
}

interface CounselorViewProps {
  student: Student;
  onNavigate?: (view: any) => void;
}

export default function CounselorView({ student, onNavigate }: CounselorViewProps) {
  const [activeTab, setActiveTab] = useState<"chat" | "sessions">("chat");

  // --- LIVE CHAT STATE ---
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "1",
      role: "model",
      content: `سلام ${student.name} گرامی! من دکتر رادان، مشاور علمی و برنامه‌ریز ارشد وکالت در موسسه چتر دانش هستم. کارنامه شبیه‌ساز، نقاط قوت و ضعف و پیش‌نویس مطالعه شما را بررسی کردم. امروز چطور می‌توانم در رفع تله‌های حقوق مدنی، روش خلاصه نویسی آیین دادرسی یا مهار اضطراب و خستگی دوران کنکور به شما کمک کنم؟`,
      timestamp: new Date().toLocaleTimeString("fa-IR", { hour: "2-digit", minute: "2-digit" })
    }
  ]);
  const [inputMessage, setInputMessage] = useState("");
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const quickQuestions = [
    "در تله‌های تستی حقوق مدنی و مبحث عقود مشکل دارم، راهکار چیست؟",
    "آهنگ پیش‌روی برنامه‌ وبینارهای دادرسی کیفری چتر دانش خیلی سریع است.",
    "چگونه تراز مانیتورینگ خود را در آزمون‌های شبیه‌ساز بعدی بالاتر ببرم؟",
    "بودجه‌بندی و تکنیک‌های موازنه تراز در مبحث اصول فقه چیست؟"
  ];

  // --- SESSIONS LOG STATE ---
  const [sessions, setSessions] = useState<CounselingSession[]>(() => {
    const stored = localStorage.getItem(`taranom_mehr_sessions_${student.id}`);
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch (e) {
        console.error("Could not parse counseling sessions from localStorage", e);
      }
    }
    return [
      {
        id: "session-1",
        type: "academic",
        title: "تحلیل موشکافانه تله‌های تستی حقوق تجارت و قوانین ثبت",
        date: "۱۴۰۵/۰۲/۱۵",
        counselorName: "دکترین مهدوی",
        notes: "بررسی فرکانس پاسخ‌های منفی نشان می‌دهد به علت تست‌زنی سرعتی بدون تحلیل کتب شرح آزمونی، داوطلب در مبحث اسناد تجاری با افت تراز مواجه شده است. مقرر شد ساعت مطالعه تجارت به ۶ ساعت در هفته با تاکید بر کتب چتر دانش افزایش یابد.",
        actionSteps: [
          { text: "تحلیل و خلاصه نویسی مبحث چک و سفته از روی شرح صریح", completed: true },
          { text: "تست‌زنی جامع از آزمون‌های سال گذشته چتر دانش بدون مانیتورینگ وقت", completed: false }
        ],
        recommendedStudyHours: 48
      },
      {
        id: "session-2",
        type: "motivational",
        title: "کنترل اضطراب، رفع فرسودگی ذهنی و مدیریت زمان در پومودورو",
        date: "۱۴۰۵/۰۲/۱۸",
        counselorName: "دکتر رادان",
        notes: "ریشه افت راندمان در آزمون‌های شبیه‌ساز آخر هفته، کم‌خوابی مفرط و مطالعه مداوم بدون استراحت پویا گزارش شد. مقرر گردید متد ۲۵ دقیقه مطالعه و ۵ دقیقه تنفس بدون گوشی موبایل به دقت پیاده‌سازی شود.",
        actionSteps: [
          { text: "تنظیم ساعت خواب شبانه و ممانعت از مطالعه بعد از نیمه‌شب", completed: false },
          { text: "استفاده از سیستم ردیابی کایزن درسی جهت ثبت مستمر ساعت مطالعه هفتگی", completed: true }
        ],
        recommendedStudyHours: 42
      }
    ];
  });

  // --- NEW SESSION FORM STATE ---
  const [newType, setNewType] = useState<"academic" | "motivational">("academic");
  const [newTitle, setNewTitle] = useState("");
  const [newCName, setNewCName] = useState("دکتر رادان");
  const [newDate, setNewDate] = useState("۱۴۰۵/۰۳/۰۱");
  const [newNotes, setNewNotes] = useState("");
  const [newHours, setNewHours] = useState(44);
  const [newActionInput, setNewActionInput] = useState("");
  const [newActionStepsList, setNewActionStepsList] = useState<string[]>([]);
  const [isAiGenerating, setIsAiGenerating] = useState(false);

  useEffect(() => {
    if (activeTab === "chat") {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, sending, activeTab]);

  const saveSessionsToLocal = (updated: CounselingSession[]) => {
    setSessions(updated);
    localStorage.setItem(`taranom_mehr_sessions_${student.id}`, JSON.stringify(updated));
  };

  const handleSendMessage = async (textToSend: string) => {
    if (!textToSend.trim() || sending) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: "user",
      content: textToSend,
      timestamp: new Date().toLocaleTimeString("fa-IR", { hour: "2-digit", minute: "2-digit" })
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputMessage("");
    setSending(true);

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
      const chatHistory = messages.map(m => ({ role: m.role, content: m.content }));
      const res = await fetchWithRetry("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: textToSend, history: chatHistory })
      });

      if (res.ok) {
        const data = await res.json();
        const modelMsg: ChatMessage = {
          id: (Date.now() + 1).toString(),
          role: "model",
          content: data.reply || "پاسخ خالی است.",
          timestamp: new Date().toLocaleTimeString("fa-IR", { hour: "2-digit", minute: "2-digit" })
        };
        setMessages((prev) => [...prev, modelMsg]);
      } else {
        throw new Error("API non-200");
      }
    } catch (err) {
      console.error("Gemini AI API failed, loading local simulated logic", err);
      let replyText = `موضوع مطالعاتی شما یعنی '${textToSend}' توسط مشاور ارشد چتر دانش بررسی شد. توصیه می‌کنیم در مباحث حقوق مدنی تله‌های مربوط به شروط ضمن عقد را ابتدا از مقالات آموزشی استخراج کرده و سپس به تست‌زنی بپردازید.`;
      if (textToSend.includes("تله") || textToSend.includes("قانون")) {
        replyText = "تحلیل اشتباهات تستی نشان می‌دهد ریشه مشکلات داوطلب عدم هم‌خوانی متن صریح ماده با فروض مسئله است. لطفاً روزانه ۲۰ دقیقه به خواندن متون قوانین خاص اختصاص داده و قوانین ملغی را مجزا کنید.";
      } else if (textToSend.includes("تراز") || textToSend.includes("آزمون")) {
        replyText = "افزایش تراز علمی شبیه‌سازها در چتر دانش به این وابسته است که پاسخ‌های غلط خود را در دفترچه عارضه‌یابی یادداشت کنید و آخر هر هفته مباحث با نمره زیر ۳۰٪ را مجدداً مرور نمایید.";
      }
      
      setMessages((prev) => [...prev, {
        id: (Date.now() + 1).toString(),
        role: "model",
        content: `داوطلب گرامی؛ ${replyText} این مباحث مشاوره‌ای به صورت محلی در حافظه موقت مانیتورینگ شما ثبت شد.`,
        timestamp: new Date().toLocaleTimeString("fa-IR", { hour: "2-digit", minute: "2-digit" })
      }]);
    } finally {
      setSending(false);
    }
  };

  const handleQuickQuestionClick = (q: string) => {
    handleSendMessage(q);
  };

  const handleAddActionStep = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newActionInput.trim()) return;
    setNewActionStepsList((prev) => [...prev, newActionInput.trim()]);
    newActionInput && setNewActionInput("");
  };

  const handleRemoveActionStepFromForm = (idx: number) => {
    setNewActionStepsList((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleTriggerAiDraftGenerator = () => {
    setIsAiGenerating(true);
    setTimeout(() => {
      if (newType === "academic") {
        setNewTitle("برنامه مطالعه فشرده و رفع تله‌های عقود حقوق مدنی");
        setNewNotes("توصیه مشاور علمی چتر دانش: مقرر گردید داوطلب ابتدا به بخش جزوات طلایی چتر دانش مراجعه کرده و کتب شرح آزمونی عقود معین را به مدت ۴ ساعت پیاپی پومودورو مرور کند، سپس ۲۵ تست شبیه‌ساز را تحلیل نماید.");
        setNewActionStepsList([
          "مرور متن صریح مواد عقود لازم و جایز",
          "یادداشت تله‌های رایج آزمون سالیان گذشته کانون",
          "ثبت تراز و درصد پاسخ‌های صحیح در پنل کایزن"
        ]);
        setNewHours(48);
      } else {
        setNewTitle("کاهش اضطراب و استرس مفرط ممیزی قبل از آزمون جامع");
        setNewNotes("توصیه روانشناختی چتر دانش: موازنه ساعات مطالعه با زمان‌های ریکاوری ذهن. مقرر شد داوطلب فواصل هر پومودوروی درسی را با تمارین تفکر مثبت و تمرکز ذهن سپری کند و ساعات پایانی شب را به استراحت اختصاص دهد.");
        setNewActionStepsList([
          "پیاده‌روی صبگاهی قبل از شروع فاز مطالعه",
          "ایجاد بستر بدون صدا و حذف محرک‌های بیرونی تمرکز",
          "استفاده از دکمه عارضه‌یابی سریع در مواجهه با گلوگاه‌ها"
        ]);
        setNewHours(42);
      }
      setIsAiGenerating(false);
    }, 850);
  };

  const handleCreateSessionSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newNotes.trim()) return;

    const created: CounselingSession = {
      id: Date.now().toString(),
      type: newType,
      title: newTitle.trim(),
      date: newDate.trim() || "۱۴۰۵/۰۳/۰۱",
      counselorName: newCName.trim() || "دکتر رادان",
      notes: newNotes.trim(),
      actionSteps: newActionStepsList.map(text => ({ text, completed: false })),
      recommendedStudyHours: newHours
    };

    const updated = [created, ...sessions];
    saveSessionsToLocal(updated);

    setNewTitle("");
    setNewNotes("");
    setNewActionStepsList([]);
    setNewHours(44);
  };

  const handleDeleteSession = (id: string) => {
    const updated = sessions.filter(s => s.id !== id);
    saveSessionsToLocal(updated);
  };

  const handleToggleStepCompletion = (sessionId: string, stepIndex: number) => {
    const updated = sessions.map(s => {
      if (s.id === sessionId) {
        const steps = [...s.actionSteps];
        steps[stepIndex] = { ...steps[stepIndex], completed: !steps[stepIndex].completed };
        return { ...s, actionSteps: steps };
      }
      return s;
    });
    saveSessionsToLocal(updated);
  };

  return (
    <div className="space-y-6" id="counselor-parent-container">
      
      {/* Prime Header Block */}
      <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4 text-right">
        <div className="space-y-1">
          <div className="flex items-center gap-2 justify-start">
            <span className="px-2 py-0.5 bg-blue-50 text-blue-950 text-[10px] font-black rounded-lg border border-blue-100">
              چتر دانش • پورتال مربیگری کایزن درسی
            </span>
            <span className="text-slate-350 text-xs">•</span>
            <span className="text-[10px] text-slate-500 font-bold">پایش تحصیلی داوطلب کانون: {student.name}</span>
          </div>
          <h1 className="text-xl font-black text-slate-900 tracking-tight">پنل مشاوره ارشد و برنامه‌ریزی هدایت تحصیلی داوطلبان</h1>
          <p className="text-xs text-slate-500 leading-relaxed">
            برنامه‌ریزی، عارضه‌یابی و تبادل نظر با مشاوران علمی چتر دانش جهت دستیابی به ترازهای برتر وکالت و قضاوت.
          </p>
        </div>

        {/* Tab Switching */}
        <div className="flex bg-slate-100 p-1 rounded-2xl border border-slate-200 w-full md:w-auto self-stretch md:self-auto">
          <button
            onClick={() => setActiveTab("chat")}
            className={`flex-1 md:flex-none px-5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 whitespace-nowrap ${
              activeTab === "chat" 
                ? "bg-white text-blue-955 shadow-sm font-black" 
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <Sparkles size={14} className={activeTab === "chat" ? "text-indigo-650" : "text-slate-400"} />
            <span>گفتگوی هوشمند با مشاور ارشد (AI Coach)</span>
          </button>
          
          <button
            onClick={() => setActiveTab("sessions")}
            className={`flex-1 md:flex-none px-5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 whitespace-nowrap ${
              activeTab === "sessions" 
                ? "bg-white text-blue-955 shadow-sm font-black" 
                : "text-slate-650 hover:text-slate-900"
            }`}
          >
            <ClipboardList size={14} className={activeTab === "sessions" ? "text-emerald-600" : "text-slate-400"} />
            <span>برنامه‌ها و مصوبات جلسات مشاوره</span>
          </button>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {activeTab === "chat" ? (
          <motion.div
            key="chat"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.2 }}
            className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-[72vh]"
            id="counselor-view-container"
          >
            {/* Helper Tips Sidebar */}
            <div className="lg:col-span-1 bg-white p-5 rounded-3xl border border-slate-100 shadow-sm flex flex-col justify-between space-y-4 text-right" id="counselor-quick-tips">
              <div className="space-y-4">
                <div className="flex items-center gap-2 pb-2 border-b border-slate-100 justify-start">
                  <span className="p-1 px-1.5 bg-amber-50 text-amber-600 rounded-lg"><HelpCircle size={15} /></span>
                  <h3 className="font-bold text-slate-800 text-sm">موضوعات چالش بر‌انگیز آزمون</h3>
                </div>
                <p className="text-xs text-slate-500 leading-relaxed">
                  از موضوعات آماده زیر جهت ارزیابی عمیق تراز و مهار خطاهای علمی استفاده کنید:
                </p>
                <div className="space-y-2 flex flex-col">
                  {quickQuestions.map((q, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleQuickQuestionClick(q)}
                      className="w-full text-right p-3 bg-slate-50 hover:bg-slate-100 border border-slate-100 rounded-xl text-xs font-bold leading-relaxed text-slate-705 transition cursor-pointer"
                    >
                      {q}
                    </button>
                  ))}
                </div>
              </div>

              <div className="p-4 bg-rose-50/50 rounded-2xl border border-rose-100 flex flex-col gap-2">
                <div className="flex items-start gap-2.5">
                  <Target size={15} className="text-rose-600 flex-shrink-0 mt-0.5" />
                  <div className="text-[10px] text-rose-950 leading-relaxed font-semibold">
                    مباحثی که در آنها دچار اشتباه شده‌اید را بلافاصله در «بانک تله‌های تستی» ثبت کنید.
                  </div>
                </div>
                <button 
                  onClick={() => {
                    if (onNavigate) {
                      onNavigate("traps");
                    } else {
                      alert("🔗 در حال انتقال به بانک تله‌ها...");
                    }
                  }}
                  className="text-[9px] font-black text-rose-700 underline text-right cursor-pointer"
                >
                  مشاهده تله‌های ثبت شده
                </button>
              </div>

              <div className="p-4 bg-blue-50/50 rounded-2xl border border-blue-100 flex items-start gap-2.5">
                <AlertCircle size={15} className="text-blue-900 flex-shrink-0 mt-0.5" />
                <div className="text-[10px] text-blue-950 leading-relaxed font-semibold">
                  مربی هوشمند چتر دانش به تراز کارنامه مانیتورینگ متصل بوده و برنامه‌های درسی کایزن را به روز می‌نماید.
                </div>
              </div>
            </div>

            {/* Chat conversations */}
            <div className="lg:col-span-3 bg-white rounded-3xl border border-slate-100 shadow-sm flex flex-col overflow-hidden text-right" id="counselor-live-chat-box">
              <div className="bg-slate-50 border-b border-slate-100 px-6 py-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <div className="w-9 h-9 rounded-xl bg-blue-950 text-white flex items-center justify-center text-[10px] font-bold">
                      مشاور
                    </div>
                    <span className="absolute -bottom-0.5 -left-0.5 w-3 h-3 bg-emerald-500 border-2 border-white rounded-full"></span>
                  </div>
                  <div>
                    <span className="font-bold text-slate-800 text-sm block">دکتر رادان (مشاور علمی ارشد چتر دانش)</span>
                    <span className="text-[10px] text-emerald-600 font-bold block">برخط ● آماده پاسخ‌گویی به ابهامات حقوقی</span>
                  </div>
                </div>
                <span className="text-[10px] font-bold text-blue-950 bg-blue-50 border border-blue-100 px-2.5 py-1 rounded-full">داوطلب علمی: {student.name}</span>
              </div>

              {/* Conversations Scroller */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-slate-50/25 scroll-smooth" id="chat-messages-scroller">
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex items-start gap-3 ${msg.role === "user" ? "flex-row-reverse" : "flex-row"}`}
                  >
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold flex-shrink-0 text-xs ${
                      msg.role === "user" ? "bg-amber-500 text-white" : "bg-blue-950 text-white"
                    }`}>
                      {msg.role === "user" ? <User size={13} /> : <Sparkles size={13} className="text-amber-300" />}
                    </div>
                    <div className="max-w-[75%] space-y-1">
                      <div className={`p-3.5 rounded-2xl shadow-sm text-xs leading-relaxed ${
                        msg.role === "user"
                          ? "bg-amber-500 text-white rounded-tr-none"
                          : "bg-white text-slate-850 border border-slate-105 rounded-tl-none font-sans"
                      }`}>
                        {msg.content}
                      </div>
                      <span className={`block text-[9.5px] text-slate-450 font-mono ${msg.role === "user" ? "text-left" : "text-right"}`}>
                        {msg.timestamp}
                      </span>
                    </div>
                  </div>
                ))}

                {sending && (
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-blue-950 text-white flex items-center justify-center">
                      <Sparkles size={13} className="text-amber-300 animate-spin" />
                    </div>
                    <div className="bg-white p-3 py-2.5 rounded-2xl border border-slate-100 rounded-tl-none shadow-sm flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce"></span>
                      <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:0.15s]"></span>
                      <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:0.3s]"></span>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Chat Send Form */}
              <div className="p-4 bg-white border-t border-slate-100">
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleSendMessage(inputMessage);
                  }}
                  className="flex gap-2"
                >
                  <input
                    type="text"
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    placeholder="پرسش حقوقی، مبحث مورد نظر یا درصد تراز تستی خود را بنویسید..."
                    className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-950 focus:bg-white text-slate-800 text-right"
                  />
                  <button
                    type="submit"
                    disabled={sending || !inputMessage.trim()}
                    className="bg-blue-950 hover:bg-slate-900 text-white p-3 rounded-xl transition disabled:opacity-50 cursor-pointer shadow-sm flex-shrink-0"
                  >
                    <Send size={15} className="rotate-180" />
                  </button>
                </form>
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="sessions"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.2 }}
            className="grid grid-cols-1 lg:grid-cols-3 gap-6"
            id="counseling-sessions-workspace"
          >
            {/* Input Form Panel (1 Column) */}
            <div className="lg:col-span-1 space-y-5 bg-white p-5 rounded-3xl border border-slate-100 shadow-sm self-start text-right">
              <div className="flex items-center gap-2 border-b border-slate-50 pb-3 justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-blue-50 text-blue-955 rounded-lg">
                    <ClipboardList size={16} />
                  </div>
                  <h3 className="font-black text-slate-800 text-sm">ثبت مصوبه جدید مشاوره</h3>
                </div>
                <button
                  type="button"
                  onClick={handleTriggerAiDraftGenerator}
                  disabled={isAiGenerating}
                  className="px-2.5 py-1 bg-amber-400 hover:bg-amber-500 text-slate-900 font-extrabold text-[9px] rounded-lg border border-amber-300 transition-all cursor-pointer flex items-center gap-1 shadow-sm active:scale-95 disabled:opacity-50"
                >
                  <Sparkles size={11} className={isAiGenerating ? "animate-spin" : ""} />
                  <span>پیش‌نویس با AI</span>
                </button>
              </div>

              <form onSubmit={handleCreateSessionSubmit} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 block pb-1">موضوع مصوبه مشاوره علمی:</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setNewType("academic")}
                      className={`py-2 px-3 rounded-xl border text-center transition cursor-pointer text-xs font-bold flex items-center justify-center gap-1.5 ${
                        newType === "academic" 
                          ? "bg-indigo-50 border-indigo-200 text-indigo-900" 
                          : "bg-slate-50 border-slate-100 text-slate-500 hover:bg-slate-100"
                      }`}
                    >
                      <BookOpen size={13} />
                      <span>۱. برنامه‌ریزی علمی تستی</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setNewType("motivational")}
                      className={`py-2 px-3 rounded-xl border text-center transition cursor-pointer text-xs font-bold flex items-center justify-center gap-1.5 ${
                        newType === "motivational" 
                          ? "bg-rose-50 border-rose-200 text-rose-900" 
                          : "bg-slate-50 border-slate-100 text-slate-500 hover:bg-slate-100"
                      }`}
                    >
                      <Brain size={13} />
                      <span>۲. مشاوره روحیه و اضطراب</span>
                    </button>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 block">عنوان دقیق مصوبه تحصیلی:</label>
                  <input
                    type="text"
                    required
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    placeholder="مثال: رفع عیوب تله‌های آیین دادرسی مدنی"
                    className="w-full bg-slate-50 border border-slate-205 focus:bg-white focus:ring-2 focus:ring-blue-950 rounded-xl px-3 py-2 text-xs font-black text-slate-800 text-right"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1 text-right">
                    <label className="text-[10px] font-bold text-slate-400 block text-right">مشاور مسئول:</label>
                    <input
                      type="text"
                      value={newCName}
                      onChange={(e) => setNewCName(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 text-right"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 block">تاریخ جلسه:</label>
                    <input
                      type="text"
                      value={newDate}
                      onChange={(e) => setNewDate(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-[10px] font-bold text-slate-850 font-mono text-center"
                    />
                  </div>
                </div>

                <div className="space-y-1 text-right font-sans">
                  <label className="text-[10px] font-bold text-slate-400 block text-right">جزئیات و مصوبات اجرایی کایزن درسی:</label>
                  <textarea
                    required
                    value={newNotes}
                    onChange={(e) => setNewNotes(e.target.value)}
                    rows={4}
                    placeholder="نکات تعیین شده علمی، قوانین خاص مورد استناد، شیوه خلاصه نویسی مواد مدنی و..."
                    className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:ring-2 focus:ring-blue-950 rounded-xl px-3 py-2.5 text-xs font-semibold leading-relaxed text-slate-700 text-right font-sans"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-blue-950 hover:bg-slate-900 text-white py-3 rounded-2xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer shadow-sm"
                >
                  <PlusCircle size={14} />
                  <span>ذخیره مصوبه در برنامه درسی داوطلب</span>
                </button>
              </form>
            </div>

            {/* Archive List (2 Columns) */}
            <div className="lg:col-span-2 space-y-5 text-right">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white p-5 rounded-2xl border border-indigo-100 shadow-sm flex items-center justify-between">
                  <div className="space-y-1 text-right">
                    <span className="text-[10px] font-bold text-slate-400 block">برنامه‌ها و مصوبات علمی</span>
                    <strong className="text-xl font-black text-indigo-950 font-mono">
                      {sessions.filter(s => s.type === "academic").length} مورد
                    </strong>
                    <p className="text-[9px] text-slate-400">تحلیل تله‌های تستی قوانین خاص</p>
                  </div>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-rose-100 shadow-sm flex items-center justify-between">
                  <div className="space-y-1 text-right">
                    <span className="text-[10px] font-bold text-slate-400 block">مشاوره‌های روحی و روحیه</span>
                    <strong className="text-xl font-black text-rose-700 font-mono">
                      {sessions.filter(s => s.type === "motivational").length} مورد
                    </strong>
                    <p className="text-[9px] text-slate-400">مدیریت پومودورو، خواب و تغذیه</p>
                  </div>
                </div>
              </div>

              {/* Saved Sessions Feed */}
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-black text-slate-700">تاریخچه ممیزی برنامه‌های درسی داوطلب چتر دانش ({sessions.length})</span>
                  <span className="text-[9px] text-slate-400">سرور کایزن آموزشی چتر دانش</span>
                </div>

                {sessions.map((session) => (
                  <div 
                    key={session.id} 
                    className={`p-5 rounded-3xl bg-white border shadow-sm space-y-4 transition hover:shadow-md relative overflow-hidden ${
                      session.type === "academic" 
                        ? "border-l-4 border-l-indigo-600 border-slate-100" 
                        : "border-l-4 border-l-rose-500 border-slate-100"
                    }`}
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2.5 relative z-10 text-right">
                      <div className="flex items-center gap-2">
                        {session.type === "academic" ? (
                          <span className="px-2.5 py-1 bg-indigo-50 border border-indigo-200 text-indigo-900 rounded-xl text-[9.5px] font-black flex items-center gap-1">
                            <span>کایزن: علمی تستی</span>
                          </span>
                        ) : (
                          <span className="px-2.5 py-1 bg-rose-50 border border-rose-200 text-rose-900 rounded-xl text-[9.5px] font-black flex items-center gap-1">
                            <span>انگیزشی: روحیه پومودورو</span>
                          </span>
                        )}
                        <span className="text-[10px] text-slate-400 font-mono">{session.date}</span>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="text-[10px] bg-slate-100 border text-slate-600 px-2 py-0.5 rounded-lg font-bold">
                          مشاور مسئول: {session.counselorName}
                        </span>
                        
                        <button
                          onClick={() => handleDeleteSession(session.id)}
                          className="text-slate-400 hover:text-red-600 hover:bg-slate-50 p-1.5 rounded-lg transition"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>

                    <div className="space-y-1.5 text-right relative z-10 font-sans">
                      <h4 className="text-xs font-black text-slate-905 leading-normal font-sans">{session.title}</h4>
                      <p className="text-xs text-slate-600 leading-relaxed font-semibold bg-slate-50/50 p-3.5 rounded-2xl border border-slate-100 font-sans">
                        {session.notes}
                      </p>
                    </div>

                    {session.actionSteps.length > 0 && (
                      <div className="bg-slate-50/40 p-3.5 rounded-2xl border border-slate-100 text-right space-y-2">
                        <span className="text-[9px] font-black text-slate-500 block">گام‌های اجرایی ضروری جهت ارتقای تراز در آزمون آزمایشی بعدی:</span>
                        <div className="space-y-1.5">
                          {session.actionSteps.map((step, idx) => (
                            <div 
                              key={idx}
                              onClick={() => handleToggleStepCompletion(session.id, idx)}
                              className={`flex items-start gap-2.5 p-2 rounded-xl border transition-all cursor-pointer select-none ${
                                step.completed 
                                  ? "bg-emerald-50/30 border-emerald-150" 
                                  : "bg-white border-slate-100 hover:border-slate-200"
                              }`}
                            >
                              <div className={`w-4 h-4 rounded border flex items-center justify-center flex-shrink-0 mt-0.5 transition-all ${
                                step.completed 
                                  ? "bg-emerald-600 border-emerald-600 text-white" 
                                  : "border-slate-300 bg-white"
                              }`}>
                                {step.completed && <Check size={10} strokeWidth={4} />}
                              </div>
                              <span className={`text-xs font-bold leading-normal ${
                                step.completed ? "text-slate-400 line-through" : "text-slate-700"
                              }`}>
                                {step.text}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
