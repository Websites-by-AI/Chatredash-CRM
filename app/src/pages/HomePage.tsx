import { Link } from "react-router-dom";
import { GraduationCap, Users, BarChart3, Sparkles, BookOpen, ArrowLeft } from "lucide-react";
import { useAuth } from "../lib/auth-context";

export default function HomePage() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-white flex flex-col" dir="rtl">
      {/* Nav */}
      <nav className="bg-white border-b border-slate-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center">
              <GraduationCap size={22} className="text-amber-400" />
            </div>
            <div>
              <span className="font-black text-slate-900 text-lg">رتبه برتر</span>
              <span className="hidden sm:block text-[10px] text-slate-400 font-bold">طرح ملی رتبه‌های برتر</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/edu" className="flex items-center gap-1.5 text-sm font-bold text-blue-700 hover:text-blue-900 transition px-3 py-2 rounded-xl hover:bg-blue-50">
              <BookOpen size={15} /> پلتفرم ترنم مهر
            </Link>
            {user ? (
              <Link to={user.role === "admin" ? "/admin" : "/dashboard"}
                className="bg-slate-900 text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-slate-800 transition">
                پنل من
              </Link>
            ) : (
              <Link to="/login" className="bg-slate-900 text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-slate-800 transition">
                ورود
              </Link>
            )}
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white py-24 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-amber-400/20 text-amber-300 border border-amber-400/30 rounded-full px-4 py-1.5 text-xs font-bold mb-8">
            <Sparkles size={12} /> طرح ملی رزومه‌سازی رتبه‌های برتر
          </div>
          <h1 className="text-4xl sm:text-5xl font-black leading-tight mb-6">
            تجربه رتبه‌های برتر،<br />
            <span className="text-amber-400">سرمایه نسل بعد</span>
          </h1>
          <p className="text-slate-300 text-lg max-w-2xl mx-auto mb-10 leading-relaxed">
            اگر در آزمون‌های کنکور، ارشد، دکتری با رتبه برتر بوده‌اید، با هوش مصنوعی تجربه‌تان را به یک مسیر آموزشی حرفه‌ای تبدیل کنید.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/register"
              className="bg-amber-400 text-slate-900 px-8 py-4 rounded-2xl font-black text-base hover:bg-amber-300 transition shadow-lg flex items-center justify-center gap-2">
              ثبت‌نام رتبه‌های برتر <ArrowLeft size={18} />
            </Link>
            <Link to="/edu"
              className="border border-white/20 text-white px-8 py-4 rounded-2xl font-bold text-base hover:bg-white/10 transition flex items-center justify-center gap-2">
              <BookOpen size={18} /> سامانه ترنم مهر
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-4 bg-slate-50">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-black text-slate-900 text-center mb-12">چرا رتبه برتر؟</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { icon: <GraduationCap size={28} className="text-amber-500" />, title: "ثبت‌نام آسان", desc: "در چند دقیقه ثبت‌نام کنید و مسیر همکاری را شروع کنید. کد معرف منحصربه‌فرد دریافت کنید." },
              { icon: <Users size={28} className="text-blue-600" />, title: "سیستم معرف‌ها", desc: "دانشجویان و رتبه‌های برتر می‌توانند معرف بشن و از هر ثبت‌نام پورسانت بگیرند." },
              { icon: <BarChart3 size={28} className="text-emerald-600" />, title: "پنل هوشمند", desc: "آمار، تسویه حساب و مدیریت کامل از یک داشبورد واحد و حرفه‌ای." },
            ].map((f, i) => (
              <div key={i} className="bg-white rounded-2xl p-8 border border-slate-100 shadow-sm hover:shadow-md transition">
                <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center mb-5">{f.icon}</div>
                <h3 className="font-black text-slate-900 text-lg mb-3">{f.title}</h3>
                <p className="text-slate-500 text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Taranom section */}
      <section className="py-20 px-4 bg-gradient-to-tr from-blue-900 to-indigo-950 text-white">
        <div className="max-w-4xl mx-auto flex flex-col md:flex-row items-center gap-10">
          <div className="flex-1">
            <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 rounded-full px-3 py-1 text-xs font-bold mb-5">
              <Sparkles size={12} className="text-amber-300" /> هوش مصنوعی آموزشی
            </div>
            <h2 className="text-3xl font-black mb-4">سامانه ترنم مهر</h2>
            <p className="text-blue-200 leading-relaxed mb-6">
              تحلیل هوشمند کارنامه، برنامه‌ریزی با AI، مشاور روانشناسی آزمون و ردیابی پیشرفت. برای دانش‌آموزان، والدین و مدیران موسسه.
            </p>
            <Link to="/edu"
              className="inline-flex items-center gap-2 bg-amber-400 text-slate-900 px-6 py-3 rounded-xl font-bold hover:bg-amber-300 transition">
              <BookOpen size={16} /> ورود به سامانه ترنم مهر
            </Link>
          </div>
          <div className="flex-1 grid grid-cols-2 gap-3">
            {[
              "📊 تحلیل کارنامه AI", "🧠 مشاور هوشمند",
              "📅 برنامه‌ریزی درسی", "📈 نمودار پیشرفت",
              "👪 پنل والدین", "🎯 ردیاب هدف‌ها",
            ].map((f, i) => (
              <div key={i} className="bg-white/10 border border-white/10 rounded-xl p-4 text-sm font-bold backdrop-blur-sm">{f}</div>
            ))}
          </div>
        </div>
      </section>

      <footer className="bg-slate-900 text-slate-400 py-10 text-center text-sm">
        <p>رتبه برتر | ترنم مهر | طرح ملی رزومه‌سازی رتبه‌های برتر ۱۴۰۵</p>
      </footer>
    </div>
  );
}
