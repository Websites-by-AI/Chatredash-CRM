import { useState } from "react";
import { 
  Plus, LogOut, LayoutDashboard, FileSpreadsheet, 
  Calendar, MessageSquare, LineChart, Users, BellRing, Sparkles, Layers, Shield, Target,
  Palette
} from "lucide-react";
import { Student } from "./types";
import LoginView from "./components/LoginView";
import DashboardView from "./components/DashboardView";
import ManovaDashboard from "./components/ManovaDashboard";
import ReportCardView from "./components/ReportCardView";
import StudyPlanView from "./components/StudyPlanView";
import CounselorView from "./components/CounselorView";
import ProgressView from "./components/ProgressView";
import ParentsView from "./components/ParentsView";
import AdminView from "./components/AdminView";
import TestTrapsView from "./components/TestTrapsView";

export default function App() {
  const [student, setStudent] = useState<Student | null>(null);
  const [role, setRole] = useState<"student" | "parent" | "admin" | null>(null);
  const [view, setView] = useState<string>("dashboard");
  const [theme, setTheme] = useState<string>(() => {
    return localStorage.getItem("chatre_app_theme") || "classic";
  });
  const [showThemeMenu, setShowThemeMenu] = useState(false);

  const handleThemeChange = (newTheme: string) => {
    setTheme(newTheme);
    localStorage.setItem("chatre_app_theme", newTheme);
  };

  const getThemeCSS = (activeTheme: string) => {
    switch (activeTheme) {
      case "emerald":
        return `
          :root {
            --color-blue-900: #064e3b !important;
            --color-blue-950: #022c22 !important;
            --color-indigo-900: #0f765e !important;
            --color-indigo-950: #115e50 !important;
            --color-blue-50: #f0fdf4 !important;
            --color-blue-100: #dcfce7 !important;
            --color-amber-400: #10b981 !important;
            --color-indigo-50: #f0fdf4 !important;
            --color-indigo-100: #dcfce7 !important;
          }
        `;
      case "ruby":
        return `
          :root {
            --color-blue-900: #881337 !important;
            --color-blue-950: #4c0519 !important;
            --color-indigo-900: #be123c !important;
            --color-indigo-950: #9f1239 !important;
            --color-blue-50: #fff1f2 !important;
            --color-blue-100: #ffe4e6 !important;
            --color-amber-400: #f43f5e !important;
            --color-indigo-50: #fff1f2 !important;
            --color-indigo-100: #ffe4e6 !important;
          }
        `;
      case "amber":
        return `
          :root {
            --color-blue-900: #78350f !important;
            --color-blue-950: #451a03 !important;
            --color-indigo-900: #b45309 !important;
            --color-indigo-950: #92400e !important;
            --color-blue-50: #fffbeb !important;
            --color-blue-100: #fef3c7 !important;
            --color-amber-400: #d97706 !important;
            --color-indigo-50: #fffbeb !important;
            --color-indigo-100: #fef3c7 !important;
          }
        `;
      case "obsidian":
        return `
          :root {
            --color-blue-900: #334155 !important;
            --color-blue-950: #0f172a !important;
            --color-indigo-900: #475569 !important;
            --color-indigo-950: #1e293b !important;
            --color-blue-50: #f8fafc !important;
            --color-blue-100: #f1f5f9 !important;
            --color-amber-400: #64748b !important;
            --color-indigo-50: #f8fafc !important;
            --color-indigo-100: #f1f5f9 !important;
          }
        `;
      default:
        return "";
    }
  };

  const handleLogin = (matchedStudent: Student, selectedRole: "student" | "parent" | "admin") => {
    setStudent(matchedStudent);
    setRole(selectedRole);
    if (selectedRole === "parent") {
      setView("parents");
    } else if (selectedRole === "admin") {
      setView("admin");
    } else {
      setView("dashboard");
    }
  };

  const handleLogout = () => {
    setStudent(null);
    setRole(null);
    setView("dashboard");
  };

  if (!role || !student) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col justify-between" id="app-auth-wrapper">
        <style dangerouslySetInnerHTML={{ __html: getThemeCSS(theme) }} />
        <main className="flex-grow flex items-center justify-center py-10">
          <LoginView onLogin={handleLogin} />
        </main>
        <footer className="py-6 border-t border-slate-100 bg-white text-center text-xs text-slate-400">
          <div>© چتر دانش | سامانه هوشمند آموزشی و برنامه‌ریزی آزمون‌های حقوقی با هوش مصنوعی مرکزی</div>
        </footer>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50/50 flex flex-col justify-between" id="app-dashboard-wrapper">
      <style dangerouslySetInnerHTML={{ __html: getThemeCSS(theme) }} />
      {/* SaaS Status Bar */}
      <div className="bg-slate-900 text-white py-1 px-4 text-[9px] font-black flex justify-between items-center select-none">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span>سامانه ابری و میکروسرویسی چتر دانش فعال است</span>
          </span>
          <span className="hidden sm:inline text-slate-500">|</span>
          <span className="hidden sm:inline bg-indigo-500/20 text-indigo-300 px-1.5 py-0.5 rounded border border-indigo-500/10">پروتکل امنیتی ادمین متصل است</span>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-slate-400">LOGS: 0 ERRORS</span>
          <span className="font-mono text-amber-300">CLOUD_INGRESS_STABLE_3000</span>
        </div>
      </div>

      {/* Prime Navigation Header */}
      <header className="bg-white border-b border-slate-100 sticky top-0 z-50 shadow-sm" id="app-master-header">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            {/* Left side: Logo & Branding */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-tr from-blue-900 via-slate-900 to-indigo-950 text-white rounded-xl shadow-md flex items-center justify-center">
                <Layers size={22} className="text-amber-400" />
              </div>
              <div className="text-right">
                <span className="font-black text-slate-850 text-base block leading-none text-blue-950">چتر دانش</span>
                <span className="text-[10px] text-emerald-600 font-black block mt-1 flex items-center gap-0.5 justify-end">
                  <Sparkles size={8} />
                  <span>سامانه هوشمند آموزشی و آزمون وکالت</span>
                </span>
              </div>
            </div>

            {/* Middle: Active Navigation tabs */}
            <nav className="hidden lg:flex gap-1" id="desktop-navbar">
              {role === "student" && (
                <>
                  <button
                    onClick={() => setView("dashboard")}
                    className={`flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-xl transition cursor-pointer ${
                      view === "dashboard" ? "bg-slate-100 text-blue-900" : "text-slate-500 hover:text-slate-700 hover:bg-slate-50/50"
                    }`}
                  >
                    <LayoutDashboard size={14} />
                    <span>🎓 پرتال داوطلب کنکور چتر دانش</span>
                  </button>
                  <button
                    onClick={() => setView("manova")}
                    className={`flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-xl transition cursor-pointer ${
                      view === "manova" ? "bg-slate-100 text-blue-900" : "text-slate-500 hover:text-slate-700 hover:bg-slate-50/50"
                    }`}
                    id="btn-nav-manova-desktop-student"
                  >
                    <Sparkles size={14} className="text-amber-500 fill-amber-100" />
                    <span className="text-blue-950 font-black">📊 ماتریس و داشبورد مانوا چتر دانش</span>
                  </button>
                  <button
                    onClick={() => setView("report")}
                    className={`flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-xl transition cursor-pointer ${
                      view === "report" ? "bg-slate-100 text-blue-900" : "text-slate-500 hover:text-slate-700 hover:bg-slate-50/50"
                    }`}
                  >
                    <FileSpreadsheet size={14} />
                    <span>📝 کارنامه و آزمون‌های آزمایشی</span>
                  </button>
                  <button
                    onClick={() => setView("schedule")}
                    className={`flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-xl transition cursor-pointer ${
                      view === "schedule" ? "bg-slate-100 text-blue-900" : "text-slate-500 hover:text-slate-700 hover:bg-slate-50/50"
                    }`}
                  >
                    <Calendar size={14} />
                    <span>📅 برنامه‌ریزی درس و تقویم داوطلب</span>
                  </button>
                  <button
                    onClick={() => setView("counselor")}
                    className={`flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-xl transition cursor-pointer ${
                      view === "counselor" ? "bg-slate-100 text-blue-900" : "text-slate-500 hover:text-slate-700 hover:bg-slate-50/50"
                    }`}
                  >
                    <MessageSquare size={14} />
                    <span>🤖 مشاور هوشمند وکالت (AI)</span>
                  </button>
                  <button
                    onClick={() => setView("progress")}
                    className={`flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-xl transition cursor-pointer ${
                      view === "progress" ? "bg-slate-100 text-blue-900" : "text-slate-500 hover:text-slate-700 hover:bg-slate-50/50"
                    }`}
                  >
                    <LineChart size={14} />
                    <span>📈 بهبود تراز</span>
                  </button>
                  <button
                    onClick={() => setView("traps")}
                    className={`flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-xl transition cursor-pointer ${
                      view === "traps" ? "bg-slate-100 text-blue-900" : "text-slate-500 hover:text-slate-700 hover:bg-slate-50/50"
                    }`}
                  >
                    <Target size={14} className="text-rose-600" />
                    <span>🎯 بانک تله‌های تستی</span>
                  </button>
                </>
              )}

              {role === "parent" && (
                <>
                  <button
                    onClick={() => setView("parents")}
                    className={`flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-xl transition cursor-pointer ${
                      view === "parents" ? "bg-slate-100 text-blue-900" : "text-slate-500 hover:text-slate-700 hover:bg-slate-50/50"
                    }`}
                  >
                    <BellRing size={14} />
                    <span>👥 سامانه نظارت آنلاین والدین</span>
                  </button>
                  <button
                    onClick={() => setView("manova")}
                    className={`flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-xl transition cursor-pointer ${
                      view === "manova" ? "bg-slate-100 text-blue-900" : "text-slate-500 hover:text-slate-700 hover:bg-slate-50/50"
                    }`}
                    id="btn-nav-manova-desktop-parent"
                  >
                    <Sparkles size={14} className="text-amber-500 fill-amber-100" />
                    <span className="text-blue-950 font-black">📊 ماتریس و داشبورد مانوا چتر دانش</span>
                  </button>
                  <button
                    onClick={() => setView("report")}
                    className={`flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-xl transition cursor-pointer ${
                      view === "report" ? "bg-slate-100 text-blue-900" : "text-slate-500 hover:text-slate-700 hover:bg-slate-50/50"
                    }`}
                  >
                    <FileSpreadsheet size={14} />
                    <span>📊 ارزیابی و تحلیل پیشرفت داوطلب</span>
                  </button>
                </>
              )}

              {role === "admin" && (
                <>
                  <button
                    onClick={() => setView("admin")}
                    className={`flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-xl transition cursor-pointer ${
                      view === "admin" ? "bg-slate-100 text-blue-900" : "text-slate-500 hover:text-slate-700 hover:bg-slate-50/50"
                    }`}
                  >
                    <Users size={14} />
                    <span>📐 سند معماری و نقشه راه SaaS (ادمین)</span>
                  </button>
                </>
              )}
            </nav>

            {/* Right side: User Profile & Theme switcher & Logout */}
            <div className="flex items-center gap-4 relative">
              <div className="text-left hidden md:block">
                <span className="font-bold text-slate-800 text-xs block text-right">{student.name}</span>
                <span className="text-[10px] text-slate-400 font-bold block text-right mt-0.5">
                  {role === "student" && "داوطلب آزمون‌های حقوقی کانون"}
                  {role === "parent" && "سیستم نظارتی و پایش والدین"}
                  {role === "admin" && "مدیر کل و معمار ارشد چتر دانش"}
                </span>
              </div>

              {/* Theme Customizer Selector */}
              <div className="relative" id="customizer-theme-switcher flex">
                <button
                  onClick={() => setShowThemeMenu(!showThemeMenu)}
                  className="p-2 bg-slate-50 hover:bg-slate-100 text-slate-500 hover:text-blue-900 transition rounded-xl border border-slate-100 cursor-pointer flex items-center justify-center gap-1.5"
                  title="تغییر تم رنگی سامانه"
                  id="btn-nav-theme"
                >
                  <Palette size={18} className="text-amber-500" />
                  <span className="hidden sm:inline text-xs font-bold text-slate-600">پوسته</span>
                </button>

                {showThemeMenu && (
                  <div className="absolute left-0 mt-2.5 w-64 bg-white rounded-2xl border border-slate-150 shadow-xl z-50 p-4 space-y-2 animate-fade-in text-right">
                    <div className="text-[10px] text-slate-400 font-black border-b border-slate-100 pb-1.5 mb-1.5 flex justify-between items-center">
                      <span>انتخاب پالت رنگ عمومی</span>
                      <Palette size={12} className="text-slate-400" />
                    </div>
                    <div className="space-y-1">
                      {[
                        { id: "classic", name: "سورمه‌ای اصیل (چتر دانش)", color: "bg-blue-900" },
                        { id: "emerald", name: "زمرد کانون (سبز قضایی)", color: "bg-emerald-800" },
                        { id: "ruby", name: "درخشش یاقوت (زرشکی دفتری)", color: "bg-rose-900" },
                        { id: "amber", name: "کهربایی گرم (قدیمی ملّی)", color: "bg-amber-850" },
                        { id: "obsidian", name: "فولاد دودی (کربنی خنثی)", color: "bg-slate-705" }
                      ].map((t) => (
                        <button
                          key={t.id}
                          onClick={() => {
                            handleThemeChange(t.id);
                            setShowThemeMenu(false);
                          }}
                          className={`w-full text-right p-2.5 rounded-xl text-xs font-semibold flex items-center justify-between transition cursor-pointer ${
                            theme === t.id ? "bg-slate-50 border border-slate-200" : "hover:bg-slate-50 border border-transparent"
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <span className={`w-3.5 h-3.5 rounded-full ${t.color} border border-white shadow-xs`} />
                            <span>{t.name}</span>
                          </div>
                          {theme === t.id && (
                            <span className="text-[9px] text-blue-900 font-black bg-blue-50 px-2 py-0.5 rounded-md">فعال</span>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <button
                onClick={handleLogout}
                className="p-2 bg-slate-50 hover:bg-red-50 text-slate-500 hover:text-red-700 transition rounded-xl border border-slate-100 hover:border-red-100 cursor-pointer"
                title="🔑 خروج به لاگین"
                id="btn-nav-logout"
              >
                <LogOut size={18} />
              </button>
            </div>
          </div>

          {/* Mobile Tab Navigation bar */}
          <div className="flex lg:hidden overflow-x-auto pb-3 gap-1.5 scrollbar-none" id="mobile-navbar">
            {role === "student" && (
              <>
                <button
                  onClick={() => setView("dashboard")}
                  className={`px-3.5 py-2 text-[11px] font-bold rounded-lg transition whitespace-nowrap cursor-pointer ${
                    view === "dashboard" ? "bg-blue-900 text-white" : "text-slate-500 bg-slate-50"
                  }`}
                >
                  پرتال داوطلب وکالت
                </button>
                <button
                  onClick={() => setView("manova")}
                  className={`px-3.5 py-2 text-[11px] font-bold rounded-lg transition whitespace-nowrap cursor-pointer ${
                    view === "manova" ? "bg-blue-900 text-white" : "text-slate-500 bg-slate-50"
                  }`}
                  id="btn-nav-manova-mobile-student"
                >
                  داشبورد مانوا
                </button>
                <button
                  onClick={() => setView("report")}
                  className={`px-3.5 py-2 text-[11px] font-bold rounded-lg transition whitespace-nowrap cursor-pointer ${
                    view === "report" ? "bg-blue-900 text-white" : "text-slate-500 bg-slate-50"
                  }`}
                >
                  کارنامه ترازها
                </button>
                <button
                  onClick={() => setView("schedule")}
                  className={`px-3.5 py-2 text-[11px] font-bold rounded-lg transition whitespace-nowrap cursor-pointer ${
                    view === "schedule" ? "bg-blue-900 text-white" : "text-slate-500 bg-slate-50"
                  }`}
                >
                  برنامه‌ریزی و تقویم درسی
                </button>
                <button
                  onClick={() => setView("counselor")}
                  className={`px-3.5 py-2 text-[11px] font-bold rounded-lg transition whitespace-nowrap cursor-pointer ${
                    view === "counselor" ? "bg-blue-900 text-white" : "text-slate-500 bg-slate-50"
                  }`}
                >
                  مشاور هوشمند وکالت
                </button>
                <button
                  onClick={() => setView("progress")}
                  className={`px-3.5 py-2 text-[11px] font-bold rounded-lg transition whitespace-nowrap cursor-pointer ${
                    view === "progress" ? "bg-blue-900 text-white" : "text-slate-500 bg-slate-50"
                  }`}
                >
                  بهبود تراز
                </button>
                <button
                  onClick={() => setView("traps")}
                  className={`px-3.5 py-2 text-[11px] font-bold rounded-lg transition whitespace-nowrap cursor-pointer ${
                    view === "traps" ? "bg-blue-900 text-white" : "text-slate-500 bg-slate-50"
                  }`}
                >
                  بانک تله‌های تستی
                </button>
              </>
            )}

            {role === "parent" && (
              <>
                <button
                  onClick={() => setView("parents")}
                  className={`px-3.5 py-2 text-[11px] font-bold rounded-lg transition whitespace-nowrap cursor-pointer ${
                    view === "parents" ? "bg-blue-900 text-white" : "text-slate-500 bg-slate-50"
                  }`}
                >
                  نظارت آنلاین والدین
                </button>
                <button
                  onClick={() => setView("manova")}
                  className={`px-3.5 py-2 text-[11px] font-bold rounded-lg transition whitespace-nowrap cursor-pointer ${
                    view === "manova" ? "bg-blue-900 text-white" : "text-slate-500 bg-slate-50"
                  }`}
                  id="btn-nav-manova-mobile-parent"
                >
                  داشبورد مانوا چتر دانش
                </button>
                <button
                  onClick={() => setView("report")}
                  className={`px-3.5 py-2 text-[11px] font-bold rounded-lg transition whitespace-nowrap cursor-pointer ${
                    view === "report" ? "bg-blue-900 text-white" : "text-slate-500 bg-slate-50"
                  }`}
                >
                  کارنامه‌ها و گزارش‌ها
                </button>
              </>
            )}

            {role === "admin" && (
              <>
                <button
                  onClick={() => setView("admin")}
                  className={`px-3.5 py-2 text-[11px] font-bold rounded-lg transition whitespace-nowrap cursor-pointer ${
                    view === "admin" ? "bg-blue-900 text-white" : "text-slate-500 bg-slate-50"
                  }`}
                >
                  مدیریت ارشد چتر دانش (SaaS)
                </button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Main View Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-grow w-full" id="main-content-layout">
        {role === "student" && (
          <>
            {view === "dashboard" && <DashboardView student={student} onNavigate={(target) => setView(target)} />}
            {view === "manova" && <ManovaDashboard student={student} />}
            {view === "report" && <ReportCardView student={student} onNavigate={(target) => setView(target)} />}
            {view === "schedule" && <StudyPlanView />}
            {view === "counselor" && <CounselorView student={student} onNavigate={(target) => setView(target)} />}
            {view === "progress" && <ProgressView />}
            {view === "traps" && <TestTrapsView student={student} />}
          </>
        )}

        {role === "parent" && (
          <>
            {view === "parents" && <ParentsView student={student} />}
            {view === "manova" && <ManovaDashboard student={student} />}
            {view === "report" && <ReportCardView student={student} />}
          </>
        )}

        {role === "admin" && (
          <>
            {view === "admin" && <AdminView student={student} />}
          </>
        )}
      </main>

      {/* Persistent Footer */}
      <footer className="bg-white border-t border-slate-100 py-6 text-center text-xs text-slate-400 mt-10">
        <div>پلتفرم هوشمند آموزشی و برنامه‌ریزی درسی چتر دانش بر اساس مدل ارزیابی آزمون‌های حقوقی وکالت • کپی‌رایت ۱۴۰۵</div>
      </footer>
    </div>
  );
}
