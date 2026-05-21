import { useState, useRef, useEffect } from "react";
import { Send, User, Sparkles, AlertCircle, HelpCircle, CheckSquare } from "lucide-react";
import { motion } from "motion/react";
import { ChatMessage, Student } from "../../lib/taranom-types";

interface CounselorViewProps {
  student: Student;
}

export default function CounselorView({ student }: CounselorViewProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "1",
      role: "model",
      content: `سلام ${student.name} جان! من آقای رادان، مشاور هوشمندت توی موسسه ترنم مهر هستم. سوابق درس خوندنت، نمودارهای تراز کانون و همچنین الگوهای کنکورت رو کامل مطالعه کردم. امروز چطور می‌تونم به مسیر رتبه‌برتر شدنت کمک کنم؟ هر سوالی درباره حرکت‌شناسی، کاهش اضطراب کانون یا زمان مطالعه داری بپرس.`,
      timestamp: new Date().toLocaleTimeString("fa-IR", { hour: "2-digit", minute: "2-digit" })
    }
  ]);
  const [inputMessage, setInputMessage] = useState("");
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const quickQuestions = [
    "تست‌های حرکت شناسی رو زیاد غلط می‌زنم، چیکار کنم؟",
    "خیلی درس می‌خونم اما تراز آزمون و درصد دلهره‌آورم رشد نمی‌کنه.",
    "بیست دقیقه آخر آزمون تمرکزم غیب میشه؛ چیکار کنم؟",
    "تکنیک کنترل استرس برای مبحث حسابان و هندسه کانون چیه؟"
  ];

  // Auto scroll down
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, sending]);

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
        throw new Error("API non-200 response");
      }
    } catch (err) {
      console.error("Failed to connect to AI Counselor endpoint", err);
      // Fallback
      setMessages((prev) => [...prev, {
        id: (Date.now() + 1).toString(),
        role: "model",
        content: "قهرمان عزیز کانون، در حال حاضر در ارتباط شبکه مشاور مشکلی پیش آمده است. برای برطرف کردن ضعف فیزیک یا تافت تمرکزی، توصیه می‌کنم خلاصه جزوه ترنم مهر فصل اول را ورق بزنی و سپس ۲۵ تست زمان‌دار بدون فشار تراز حل کنی.",
        timestamp: new Date().toLocaleTimeString("fa-IR", { hour: "2-digit", minute: "2-digit" })
      }]);
    } finally {
      setSending(false);
    }
  };

  const handleQuickQuestionClick = (q: string) => {
    handleSendMessage(q);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-[72vh]" id="counselor-view-container">
      {/* Helper Tips Sidebar (1 column) */}
      <div className="lg:col-span-1 bg-white p-5 rounded-3xl border border-slate-100 shadow-sm flex flex-col justify-between space-y-4" id="counselor-quick-tips">
        <div className="space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-50">
            <span className="p-1 px-1.5 bg-amber-50 text-amber-600 rounded-lg"><HelpCircle size={16} /></span>
            <h3 className="font-bold text-slate-800 text-sm">موضوعات داغ مشاوره</h3>
          </div>
          <p className="text-xs text-slate-500 leading-relaxed">
            از سوالات پیشنهادی زیر برای شروع مشاوره هوشمند درسی بر اساس پرونده تراز خود استفاده کنید:
          </p>
          <div className="space-y-2 flex flex-col">
            {quickQuestions.map((q, idx) => (
              <button
                key={idx}
                onClick={() => handleQuickQuestionClick(q)}
                className="w-full text-right p-3 bg-slate-50 hover:bg-slate-100 border border-slate-100 rounded-xl text-xs font-semibold leading-relaxed text-slate-700 transition cursor-pointer hover:border-slate-200"
              >
                {q}
              </button>
            ))}
          </div>
        </div>

        <div className="p-4 bg-blue-50/50 rounded-2xl border border-blue-100 flex items-start gap-2.5">
          <AlertCircle size={16} className="text-blue-700 flex-shrink-0 mt-0.5" />
          <div className="text-[10px] text-blue-900 leading-relaxed">
            مشاور هوشمند ترنم مهر به پرونده درسی، درصدهای کانون و اهداف تراز شما دسترسی کامل دارد و پاسخ‌هایی اختصاصی صادر می‌کند.
          </div>
        </div>
      </div>

      {/* Live Chat Box (3 columns) */}
      <div className="lg:col-span-3 bg-white rounded-3xl border border-slate-100 shadow-sm flex flex-col overflow-hidden" id="counselor-live-chat-box">
        {/* Chat top header with status */}
        <div className="bg-slate-50 border-b border-slate-100 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-10 h-10 rounded-xl bg-blue-900 text-white flex items-center justify-center font-bold">
                مشاور
              </div>
              <span className="absolute -bottom-0.5 -left-0.5 w-3.5 h-3.5 bg-emerald-500 border-2 border-white rounded-full"></span>
            </div>
            <div>
              <span className="font-bold text-slate-800 text-sm block">آقای رادان (مشاور تحصیلی هوشمند)</span>
              <span className="text-[10px] text-emerald-600 font-semibold block">آماده به پاسخگویی • آنلاین</span>
            </div>
          </div>
          <span className="text-xs font-bold text-blue-900 bg-blue-50 border border-blue-100 px-2.5 py-1 rounded-full">پرونده: {student.name}</span>
        </div>

        {/* Live chat conversation area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-slate-50/25 scroll-smooth" id="chat-messages-scroller">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex items-start gap-3 ${msg.role === "user" ? "flex-row-reverse" : "flex-row"}`}
            >
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold flex-shrink-0 text-xs ${
                msg.role === "user" ? "bg-amber-500 text-white" : "bg-blue-900 text-white"
              }`}>
                {msg.role === "user" ? <User size={14} /> : <Sparkles size={14} className="text-amber-300" />}
              </div>
              <div className="max-w-[75%] space-y-1">
                <div className={`p-4 rounded-2xl shadow-sm text-sm leading-relaxed ${
                  msg.role === "user"
                    ? "bg-amber-500 text-white rounded-tr-none"
                    : "bg-white text-slate-800 border border-slate-100 rounded-tl-none font-sans"
                }`}>
                  {msg.content}
                </div>
                <span className={`block text-[10px] text-slate-400 font-mono ${msg.role === "user" ? "text-left" : "text-right"}`}>
                  {msg.timestamp}
                </span>
              </div>
            </div>
          ))}

          {sending && (
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-blue-900 text-white flex items-center justify-center">
                <Sparkles size={14} className="text-amber-300 animate-spin" />
              </div>
              <div className="bg-white p-3.5 rounded-2xl border border-slate-100 rounded-tl-none shadow-sm flex items-center gap-2">
                <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"></span>
                <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce [animation-delay:0.2s]"></span>
                <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce [animation-delay:0.4s]"></span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Chat input box */}
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
              placeholder="دیدگاه، پرسش درسی یا موضوع آزمونی خود را تایپ نمایید..."
              className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-blue-900 focus:bg-white text-slate-800"
              id="chat-input-field"
            />
            <button
              type="submit"
              disabled={sending || !inputMessage.trim()}
              className="bg-blue-900 hover:bg-blue-950 text-white p-3 rounded-xl transition disabled:opacity-50 cursor-pointer shadow-sm flex-shrink-0"
              id="chat-btn-submit"
            >
              <Send size={18} className="rotate-180" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
