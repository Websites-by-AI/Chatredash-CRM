import { useState } from "react";
import {
  GraduationCap, LogOut, LayoutDashboard, FileSpreadsheet,
  Calendar, MessageSquare, LineChart, Users, BellRing, Sparkles, Home
} from "lucide-react";
import { Student } from "../lib/taranom-types";
import LoginView from "../components/taranom/LoginView";
import DashboardView from "../components/taranom/DashboardView";
import ReportCardView from "../components/taranom/ReportCardView";
import StudyPlanView from "../components/taranom/StudyPlanView";
import CounselorView from "../components/taranom/CounselorView";
import ProgressView from "../components/taranom/ProgressView";
import ParentsView from "../components/taranom/ParentsView";
import AdminView from "../components/taranom/AdminView";
import { Link } from "react-router-dom";

export default function TaranomApp() {
  const [student, setStudent] = useState<Student | null>(null);
  const [role, setRole] = useState<"student" | "parent" | "admin" | null>(null);
  const [view, setView] = useState<string>("dashboard");

  const handleLogin = (matchedStudent: Student, selectedRole: "student" | "parent" | "admin") => {
    setStudent(matchedStudent);
    setRole(selectedRole);
    if (selectedRole === "parent") setView("parents");
    else if (selectedRole === "admin") setView("admin");
    else setView("dashboard");
  };

  const handleLogout = () => {
    setStudent(null);
    setRole(null);
    setView("dashboard");
  };

  if (!role || !student) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col justify-between">
        <div className="p-4 bg-white border-b border-slate-100 flex items-center gap-3">
          <Link to="/" className="flex items-center gap-2 text-slate-500 hover:text-slate-800 text-sm font-bold transition">
            <Home size={16} /> بازگشت به رتبه برتر
          </Link>
        </div>
        <main className="flex-grow flex items-center justify-center py-10">
          <LoginView onLogin={handleLogin} />
        </main>
        <footer className="py-6 border-t border-slate-100 bg-white text-center text-xs text-slate-400">
          <div>© ترنم مهر | سامانه شخصی‌سازی آموزش و مشاوره تحصیلی با هوش مصنوعی</div>
        </footer>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50/50 flex flex-col">
      <header className="bg-white border-b border-slate-100 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-tr from-blue-900 to-indigo-950 text-white rounded-xl shadow-md flex items-center justify-center">
                <GraduationCap size={22} className="text-amber-400" />
              </div>
              <div>
                <span className="font-black text-slate-800 text-base block leading-none">ترنم مهر</span>
                <span className="text-[10px] text-blue-900 font-bold block mt-1 flex items-center gap-0.5">
                  <Sparkles size={8} /><span>سامانه هوشمند آموزشی</span>
                </span>
              </div>
            </div>

            <nav className="hidden lg:flex gap-1">
              {role === "student" && (
                <>
                  {[
                    { key: "dashboard", label: "داشبورد من", icon: <LayoutDashboard size={14} /> },
                    { key: "report", label: "کارنامه هوشمند", icon: <FileSpreadsheet size={14} /> },
                    { key: "schedule", label: "برنامه‌ریزی AI", icon: <Calendar size={14} /> },
                    { key: "counselor", label: "مشاور هوشمند", icon: <MessageSquare size={14} /> },
                    { key: "progress", label: "نمودار رشد", icon: <LineChart size={14} /> },
                  ].map(({ key, label, icon }) => (
                    <button key={key} onClick={() => setView(key)}
                      className={`flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-xl transition cursor-pointer ${view === key ? "bg-slate-100 text-blue-900" : "text-slate-500 hover:text-slate-700 hover:bg-slate-50/50"}`}>
                      {icon}<span>{label}</span>
                    </button>
                  ))}
                </>
              )}
              {role === "parent" && (
                <>
                  <button onClick={() => setView("parents")} className={`flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-xl transition cursor-pointer ${view === "parents" ? "bg-slate-100 text-blue-900" : "text-slate-500 hover:text-slate-700"}`}><BellRing size={14} /><span>داشبورد والدین</span></button>
                  <button onClick={() => setView("report")} className={`flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-xl transition cursor-pointer ${view === "report" ? "bg-slate-100 text-blue-900" : "text-slate-500 hover:text-slate-700"}`}><FileSpreadsheet size={14} /><span>کارنامه فرزند</span></button>
                </>
              )}
              {role === "admin" && (
                <button onClick={() => setView("admin")} className={`flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-xl transition cursor-pointer ${view === "admin" ? "bg-slate-100 text-blue-900" : "text-slate-500 hover:text-slate-700"}`}><Users size={14} /><span>پنل مدیریت</span></button>
              )}
            </nav>

            <div className="flex items-center gap-3">
              <Link to="/" className="hidden md:flex items-center gap-1 text-xs text-slate-400 hover:text-slate-700 font-bold transition">
                <Home size={13} /> رتبه برتر
              </Link>
              <div className="text-left hidden md:block">
                <span className="font-bold text-slate-800 text-xs block text-right">{student.name}</span>
                <span className="text-[10px] text-slate-400 font-bold block text-right mt-0.5">
                  {role === "student" && `دانش‌آموز پایه ${student.grade}`}
                  {role === "parent" && "پنل والدین"}
                  {role === "admin" && "مدیر ارشد موسسه"}
                </span>
              </div>
              <button onClick={handleLogout} className="p-2 bg-slate-50 hover:bg-red-50 text-slate-500 hover:text-red-700 transition rounded-xl border border-slate-100 hover:border-red-100 cursor-pointer" title="خروج">
                <LogOut size={18} />
              </button>
            </div>
          </div>

          {/* Mobile nav */}
          <div className="flex lg:hidden overflow-x-auto pb-3 gap-1.5 scrollbar-none">
            {role === "student" && (
              <>
                {[
                  { key: "dashboard", label: "داشبورد" },
                  { key: "report", label: "کارنامه" },
                  { key: "schedule", label: "برنامه AI" },
                  { key: "counselor", label: "مشاور" },
                  { key: "progress", label: "پیشرفت" },
                ].map(({ key, label }) => (
                  <button key={key} onClick={() => setView(key)}
                    className={`px-3.5 py-2 text-[11px] font-bold rounded-lg transition whitespace-nowrap cursor-pointer ${view === key ? "bg-blue-900 text-white" : "text-slate-500 bg-slate-50"}`}>
                    {label}
                  </button>
                ))}
              </>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-grow w-full">
        {role === "student" && (
          <>
            {view === "dashboard" && <DashboardView student={student} onNavigate={(t) => setView(t)} />}
            {view === "report" && <ReportCardView student={student} />}
            {view === "schedule" && <StudyPlanView />}
            {view === "counselor" && <CounselorView student={student} />}
            {view === "progress" && <ProgressView />}
          </>
        )}
        {role === "parent" && (
          <>
            {view === "parents" && <ParentsView student={student} />}
            {view === "report" && <ReportCardView student={student} />}
          </>
        )}
        {role === "admin" && view === "admin" && <AdminView />}
      </main>

      <footer className="bg-white border-t border-slate-100 py-5 text-center text-xs text-slate-400">
        پلتفرم هوشمند آموزشی ترنم مهر | رتبه برتر • کپی‌رایت ۱۴۰۵
      </footer>
    </div>
  );
}
