import React, { useState } from "react";
import { Sparkles, Phone, Lock, Hash, ShieldCheck, UserCheck, Layers, BookOpen, Activity } from "lucide-react";
import { motion } from "motion/react";
import { Student } from "../types";

interface LoginViewProps {
  onLogin: (student: Student, role: "student" | "parent" | "admin") => void;
}

export default function LoginView({ onLogin }: LoginViewProps) {
  const [activeTab, setActiveTab] = useState<"student" | "parent" | "admin">("student");
  const [mobileNumber, setMobileNumber] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [kanoonCode, setKanoonCode] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [loading, setLoading] = useState(false);

  // داوطلبان و لاین‌های فعال در ترنم مهر
  const mockStudents: Student[] = [
    { id: "1", name: "مریم حسینی (رشته علوم تجربی - هدف پزشکی تهران)", code: "9812405", field: "tajrobi", grade: "رتبه فرضی ۴۷ کشوری - تراز ۱۰/۴۵۰" },
    { id: "2", name: "علیرضا رضایی (رشته ریاضی فیزیک - هدف مهندسی کامپیوتر شریف)", code: "9786431", field: "riazi", grade: "رتبه فرضی ۲۴ کشوری - تراز ۱۰/۱۲۰" },
    { id: "3", name: "امیرمحمد اکبری (رشته علوم انسانی - هدف حقوق دانشگاه تهران)", code: "9921477", field: "ensani", grade: "رتبه فرضی ۱۲ کشوری - تراز ۹/۹۵۰" }
  ];

  const handleSendOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!mobileNumber.startsWith("09") || mobileNumber.length !== 11) {
      alert("لطفاً شماره موبایل معتبر ۱۱ رقمی وارد نمایید. (شروع با ۰۹)");
      return;
    }
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setOtpSent(true);
    }, 700);
  };

  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (otpCode !== "1234" && otpCode !== "12345") {
      alert("کد تایید نادرست است. (جهت ارزیابی از '1234' استفاده کنید)");
      return;
    }

    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      if (activeTab === "student") {
        const matched = mockStudents.find(s => s.code === kanoonCode) || mockStudents[0];
        onLogin(matched, "student");
      } else if (activeTab === "parent") {
        onLogin(mockStudents[0], "parent");
      } else {
        onLogin(mockStudents[0], "admin");
      }
    }, 900);
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md bg-white rounded-3xl shadow-xl overflow-hidden border border-slate-100"
        id="login-card-container"
      >
        <div className="bg-gradient-to-tr from-blue-950 via-slate-900 to-indigo-950 p-8 text-center text-white relative">
          <div className="absolute top-2 right-2 opacity-10">
            <Layers size={150} />
          </div>
          <div className="mx-auto w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center mb-4 backdrop-blur-md border border-white/20">
            <Sparkles size={36} className="text-amber-400" />
          </div>
          <h1 className="text-2xl font-black tracking-tight mb-2">ترنم مهر</h1>
          <p className="text-blue-200/90 text-xs">سامانه هوشمند مانیتورینگ تراز، کایزن درسی و آمادگی کنکور سراسری</p>
        </div>

        {/* Roles Tabs */}
        <div className="flex border-b border-slate-100 bg-slate-50/50 p-2 gap-1" id="login-role-tabs">
          {(["student", "parent", "admin"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => {
                setActiveTab(tab);
                setOtpSent(false);
                setOtpCode("");
              }}
              className={`flex-1 py-3 text-xs font-bold rounded-xl transition duration-200 cursor-pointer ${
                activeTab === tab
                  ? "bg-white text-blue-950 shadow-sm border border-slate-100"
                  : "text-slate-400 hover:text-slate-600 hover:bg-slate-100/50"
              }`}
              id={`tab-button-${tab}`}
            >
              {tab === "student" && "🎓 داوطلب کنکور ترنم مهر"}
              {tab === "parent" && "👥 سامانه نظارت آنلاین والدین"}
              {tab === "admin" && "📐 سند معماری و نقشه راه SaaS"}
            </button>
          ))}
        </div>

        <div className="p-8">
          {!otpSent ? (
            <form onSubmit={handleSendOtp} className="space-y-5" id="send-otp-form">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-2">شماره تلفن همراه پرسنلی</label>
                <div className="relative">
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-slate-400">
                    <Phone size={18} />
                  </div>
                  <input
                    type="tel"
                    required
                    maxLength={11}
                    placeholder="مثال: 09123456789"
                    value={mobileNumber}
                    onChange={(e) => setMobileNumber(e.target.value.replace(/[^0-9]/g, ""))}
                    className="w-full pl-3 pr-10 py-3 bg-slate-50 border border-slate-200 rounded-xl text-left focus:outline-none focus:ring-2 focus:ring-blue-900 focus:bg-white font-mono tracking-widest text-slate-800 text-sm transition duration-150"
                  />
                </div>
                <p className="text-[10px] text-slate-400 mt-1.5 leading-relaxed">رمز تایید یکبار مصرف امنیتی برای ورود به پرتال سازمانی ارسال خواهد شد.</p>
              </div>

              {activeTab === "student" && (
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-2">کد داوطلب / شناسه کارنامه چتر دانش (اختیاری)</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-slate-400">
                      <Hash size={18} />
                    </div>
                    <input
                      type="text"
                      placeholder="مانند: 9812405 یا 9786431"
                      value={kanoonCode}
                      onChange={(e) => setKanoonCode(e.target.value.replace(/[^0-9]/g, ""))}
                      className="w-full pl-3 pr-10 py-3 bg-slate-50 border border-slate-200 rounded-xl text-left focus:outline-none focus:ring-2 focus:ring-blue-900 focus:bg-white font-mono tracking-widest text-slate-800 text-sm transition duration-150"
                    />
                  </div>
                  <p className="text-[10px] text-slate-400 mt-1.5 leading-relaxed font-mono">مثال: 9812405 (برای اتصال به مریم حسینی - داوطلب تجربی)</p>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-950 text-white py-3.5 rounded-xl font-bold hover:bg-slate-900 transition duration-150 shadow-md flex items-center justify-center gap-2 text-sm cursor-pointer"
                id="btn-send-otp"
              >
                {loading ? (
                  <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                ) : (
                  <>
                    <ShieldCheck size={18} />
                    <span>ارسال پین امنیتی ورود</span>
                  </>
                )}
              </button>
            </form>
          ) : (
            <form onSubmit={handleVerifyOtp} className="space-y-5" id="verify-otp-form">
              <div className="p-4 bg-blue-50 rounded-2xl border border-blue-100 flex items-center gap-3">
                <ShieldCheck className="text-blue-600 flex-shrink-0" size={20} />
                <div className="text-xs text-blue-950 leading-relaxed">
                  کد ورود یکبار مصرف به شماره موبایل پرسنلی <strong className="font-mono">{mobileNumber}</strong> تلگراف شد.
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-2">کد یکبار مصرف امنیتی</label>
                <div className="relative">
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-slate-400">
                    <Lock size={18} />
                  </div>
                  <input
                    type="text"
                    required
                    maxLength={5}
                    placeholder="کد ۴ یا ۵ رقمی"
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value.replace(/[^0-9]/g, ""))}
                    className="w-full pl-3 pr-10 py-3 bg-slate-50 border border-slate-200 rounded-xl text-center focus:outline-none focus:ring-2 focus:ring-blue-900 focus:bg-white font-mono tracking-widest text-slate-800 text-lg transition duration-150"
                  />
                </div>
                <div className="flex justify-between items-center mt-2">
                  <span className="text-xs text-slate-400">رمز شبیه‌ساز تست: 1234</span>
                  <button 
                    type="button" 
                    onClick={() => setOtpSent(false)} 
                    className="text-xs font-bold text-blue-800 hover:text-blue-900 cursor-pointer"
                  >
                    تغییر شماره همراه
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-950 text-white py-3.5 rounded-xl font-bold hover:bg-slate-900 transition duration-150 shadow-md flex items-center justify-center gap-2 text-sm cursor-pointer"
                id="btn-verify-login"
              >
                {loading ? (
                  <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                ) : (
                  <>
                    <UserCheck size={18} />
                    <span>تأیید پین و ورود به سیستم</span>
                  </>
                )}
              </button>
            </form>
          )}

          {/* Direct Sandbox Buttons for easy evaluation */}
          <div className="mt-8 pt-6 border-t border-slate-100 text-center">
            <p className="text-[11px] text-slate-400 mb-3">دسترسی سریع توسعه‌دهنده جهت بررسی نقش‌های کاربری</p>
            <div className="flex flex-wrap justify-center gap-2">
              <button 
                type="button"
                onClick={() => onLogin(mockStudents[0], "student")}
                className="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-xs rounded-lg transition border border-indigo-100 cursor-pointer"
              >
                 داوطلب ۱ (تجربی / پزشکی)
              </button>
              <button 
                type="button"
                onClick={() => onLogin(mockStudents[1], "student")}
                className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold text-xs rounded-lg transition border border-blue-100 cursor-pointer"
              >
                 داوطلب ۲ (ریاضی / مهندسی)
              </button>
              <button 
                type="button"
                onClick={() => onLogin(mockStudents[0], "parent")}
                className="px-3 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-700 font-bold text-xs rounded-lg transition border border-amber-100 cursor-pointer"
              >
                پورتال نظارتی والدین ترنم مهر
              </button>
              <button 
                type="button"
                onClick={() => onLogin(mockStudents[0], "admin")}
                className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold text-xs rounded-lg transition border border-emerald-100 cursor-pointer"
              >
                پورتال ادمین / معماری SaaS
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
