import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Users, TrendingUp, Calendar, Trash2, Search, Shield, 
  HelpCircle, Plus, ChevronRight, BarChart3, Database, HardDrive, Info
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

// Initial 9 dossiers matching the user's specific table
const initialDossiers = [
  { id: 'L-101', name: 'امیرحسین رضایی', goal: 'وکالت', score: 7200, status: 'ثبتنام قطعی' },
  { id: 'L-102', name: 'فاطمه معتمدآریا', goal: 'سردفتری', score: 5800, status: 'آماده ثبتنام' },
  { id: 'L-103', name: 'علی دایی', goal: 'قضاوت', score: 4900, status: 'در حال پیگیری' },
  { id: 'L-104', name: 'سارا عباسی', goal: 'وکالت', score: 6500, status: 'ثبتنام قطعی' },
  { id: 'L-105', name: 'محمدحسین مهدویان', goal: 'قضاوت', score: 8100, status: 'ثبتنام قطعی' },
  { id: 'L-106', name: 'زهرا حسینی', goal: 'سردفتری', score: 4200, status: 'انصراف موقت' },
  { id: 'L-107', name: 'رامین رحیمی', goal: 'وکالت', score: 7600, status: 'آماده ثبتنام' },
  { id: 'L-108', name: 'مهناز افشار', goal: 'سردفتری', score: 5100, status: 'در حال پیگیری' },
  { id: 'L-109', name: 'کوروش نوری', goal: 'قضاوت', score: 6900, status: 'ثبتنام قطعی' },
];

const departmentLogs: Record<string, string> = {
  'داوطلبان': 'سیستم CRM فعال است. ثبت لیدها و ارتباطات تلفنی چتر دانش بدون وقفه در جریان می‌باشد.',
  'کنترل کلاسها': 'مشاهده لیست وبینارهای فعال. ۴ دوره به صورت همزمان بدون افت فریم برگزار می‌گردد.',
  'انبار کتب و جزوات': 'وضعیت بحرانی در موجودی انبار انقلاب. به دلیل سرعت بالای ثبت نام، تنها ۱ پکیج کاتالوگ جامع در دست است و فراخوان چاپ فوری داده شده است.',
  'فروش و درگاهها': 'مجموع درآمدها به ۲۴.۱ میلیون تومان رسیده است و ۸۸٪ از تارگت این فصلی به طور کامل محقق شد.',
  'پیک و توزیع شهری': 'توزیع ۳۲ پکیج آزمون کتب مدنی با پیک موتوری حومه تهران با نرخ رضایت ۱۰۰٪.',
  'ممیزی سوالات': 'تطبیق سوالات آزمون آزمایشی وکالت با آخرین اصلاحات قوانین خاص سال ۱۴۰۵ به پایان رسید.',
  'مدیریت حسابها': 'تسویه حساب مشاوران ارشد دپارتمان از جمله آقای دکتر کریمی و خانم علوی انجام پذیرفت.'
};

const inventoryItems = [
  { id: 'KB-01', title: 'دوره طلایی متون فقه', author: 'دکتر کریمی', stock: 124, price: '۴۵۰,۰۰۰', status: 'موجود' },
  { id: 'KB-02', title: 'حقوق مدنی ۱ تا ۸ (پیشرفته)', author: 'استاد کاتوزیان', stock: 12, price: '۸۸۰,۰۰۰', status: 'بحرانی' },
  { id: 'KB-03', title: 'آیین دادرسی کیفری (دوجلدی)', author: 'دکتر خالقی', stock: 85, price: '۵۹۰,۰۰۰', status: 'موجود' },
  { id: 'KB-04', title: 'جزوه طلایی کایزن وکالت (۱۴۰۶)', author: 'دپارتمان چتر دانش', stock: 1, price: '۲۲۰,۰۰۰', status: 'بحرانی' },
  { id: 'KB-05', title: 'حقوق تجارت (بسته نموداری)', author: 'دکتر معتمدی', stock: 210, price: '۴۱۰,۰۰۰', status: 'موجود' },
];

const chartData = [
  { name: 'هفته ۲', score: 4500, predictScore: 4500 },
  { name: 'هفته ۴', score: 5200, predictScore: 5200 },
  { name: 'هفته ۶', score: 6100, predictScore: 6100 },
  { name: 'هفته ۸ (فعلی)', score: 7200, predictScore: 7200 },
  { name: 'هفته ۱۰ (پیشبینی)', score: null, predictScore: 7800 },
  { name: 'هفته ۱۲ (پیشبینی)', score: null, predictScore: 8400 },
];

const COLORS = ['#4f46e5', '#d97706', '#059669', '#9333ea'];

interface CoursesHubProps {
  activeDep: string;
  setActiveDep: (dep: string) => void;
}

const CoursesHub: React.FC<CoursesHubProps> = ({ activeDep, setActiveDep }) => {
  const { colorClass, bgClass, ringClass } = useTheme();

  const [dossiers, setDossiers] = useState(initialDossiers);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Registration Form states
  const [regName, setRegName] = useState('');
  const [regGoal, setRegGoal] = useState('وکالت');
  const [regChannel, setRegChannel] = useState('وبسایت موسسه');

  // Add new row dynamic
  const handleRegisterDossier = (e: React.FormEvent) => {
    e.preventDefault();
    if (!regName.trim()) return;

    const newDossier = {
      id: 'L-' + (110 + dossiers.length),
      name: regName,
      goal: regGoal,
      score: Math.floor(Math.random() * (8500 - 4500) + 4500),
      status: 'آماده ثبتنام'
    };

    setDossiers([...dossiers, newDossier]);
    setRegName('');
  };

  // Delete row dynamic
  const handleDeleteDossier = (id: string) => {
    setDossiers(dossiers.filter(d => d.id !== id));
  };

  // Calculations for Line Distribution stats (3 lines target)
  const vekalatCount = dossiers.filter(d => d.goal.includes('وکالت')).length;
  const sardaftariCount = dossiers.filter(d => d.goal.includes('سردفتری')).length;
  const ghezavatCount = dossiers.filter(d => d.goal.includes('قضاوت')).length;

  const pieData = [
    { name: 'وکالت', value: vekalatCount },
    { name: 'سردفتری', value: sardaftariCount },
    { name: 'قضاوت', value: ghezavatCount },
  ];

  // Filters dossiers
  const filteredDossiers = dossiers.filter(d => {
    return d.name.includes(searchQuery) || d.goal.includes(searchQuery);
  });

  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8"
      dir="rtl"
    >
      
      {/* Header element */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 pb-5">
        <div>
          <h2 className="text-2xl sm:text-3xl font-black text-gray-950 flex items-center gap-2">
            <Shield className={colorClass} size={28} />
            سامانه نظارت آنلاین والدین (مانوا)
          </h2>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">
            پوتال همگام‌ساز والدین با همکاری برنامه کایزن و مشاور عالی آزمون وکالت کانون وکلای چتر دانش
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <span className="text-[10px] bg-indigo-50 border border-indigo-100 text-indigo-700 px-3 py-1.5 rounded-full font-black">
            داوطلب تحت پایش: مریم حسینی (آزمون وکالت مرکز)
          </span>
        </div>
      </div>

      {/* Parents supervisory Matrix Stats */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        
        <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm relative overflow-hidden">
          <div className="space-y-1">
            <span className="text-[10px] text-gray-400 font-bold block">مجموع درآمدهای وصولی ناخالص</span>
            <p className="text-xl sm:text-2xl font-black text-gray-900">۲۴.۱ میلیون تومان</p>
            <p className="text-[10px] text-emerald-600 font-bold flex items-center gap-1 mt-1">
              <span>✓ ۸۸٪ تارگت فصلی محقق شد</span>
            </p>
          </div>
          <div className="absolute top-4 left-4 p-2 rounded-xl bg-indigo-50 text-indigo-600">
            <BarChart3 size={18} />
          </div>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm relative overflow-hidden">
          <div className="space-y-1">
            <span className="text-[10px] text-gray-400 font-bold block">کل داوطلبان فعال سیستم</span>
            <p className="text-xl sm:text-2xl font-black text-gray-900">{849 + (dossiers.length - 9)} نفر</p>
            <p className="text-[10px] text-gray-400 font-semibold flex items-center gap-1 mt-1">
              <span>تلاقی ۳ لاین اصلی آموزشی</span>
            </p>
          </div>
          <div className="absolute top-4 left-4 p-2 rounded-xl bg-orange-50 text-orange-600">
            <Users size={18} />
          </div>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm relative overflow-hidden">
          <div className="space-y-1">
            <span className="text-[10px] text-gray-400 font-bold block">میانگین پیشرفت وبینارهای درسی</span>
            <p className="text-xl sm:text-2xl font-black text-gray-900">۸۲٪</p>
            <p className="text-[10px] text-indigo-600 font-bold flex items-center gap-1 mt-1">
              <span>۴ دوره آنلاین موازی</span>
            </p>
          </div>
          <div className="absolute top-4 left-4 p-2 rounded-xl bg-purple-50 text-purple-600">
            <Database size={18} />
          </div>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm relative overflow-hidden">
          <div className="space-y-1">
            <span className="text-[10px] text-gray-400 font-bold block">کتب در انبار مرکزی انقلاب</span>
            <p className="text-xl sm:text-2xl font-black text-gray-900">۱,۴۸۷ جلد</p>
            <p className="text-[10px] text-red-650 font-black flex items-center gap-1 mt-1 animate-pulse">
              <span>موجودی بحرانی: ۱ کاتالوگ</span>
            </p>
          </div>
          <div className="absolute top-4 left-4 p-2 rounded-xl bg-red-50 text-red-600">
            <HardDrive size={18} />
          </div>
        </div>

      </section>

      {/* Multi-dimensional Interactive Department Matrix */}
      <section className="bg-gradient-to-br from-indigo-950 via-slate-900 to-indigo-900 text-white p-6 sm:p-8 rounded-3xl border border-indigo-900 shadow-xl space-y-6">
        <div>
          <span className="px-2.5 py-1 bg-white/10 rounded-full text-[9px] font-bold text-amber-300">ماتریس و داشبورد مدیریتی مانوا</span>
          <h3 className="text-lg font-black text-white mt-2">پنل مانیتورینگ جامع و ماتریس چندبعدی هوشمند مانوا چتر دانش</h3>
          <p className="text-xs text-gray-350 leading-relaxed mt-1">
            سیستم کنترل یکپارچه آموزشی و مالی: پایش مستمر روند ثبت نام داوطلبان، کایزن درسی، توزیع کتب و ترازهای علمی.
          </p>
        </div>

        {/* Matrix Nodes Row */}
        <div className="flex flex-wrap gap-2 pt-2 border-t border-white/10">
          {[
            'داوطلبان', 'کنترل کلاسها', 'انبار کتب و جزوات', 
            'فروش و درگاهها', 'پیک و توزیع شهری', 'ممیزی سوالات', 'مدیریت حسابها'
          ].map((dep) => {
            const isActive = activeDep === dep;
            return (
              <button
                key={dep}
                type="button"
                onClick={() => setActiveDep(dep)}
                className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all border ${
                  isActive 
                    ? 'bg-amber-400 text-slate-950 border-amber-400 font-black'
                    : 'bg-white/10 text-gray-300 border-white/5 hover:bg-white/20'
                }`}
              >
                {dep}
              </button>
            )
          })}
        </div>

        {/* Active Node Report Details */}
        <div className="bg-white/5 rounded-2xl p-5 border border-white/10 animate-fadeIn space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-amber-300">
              <Info size={14} />
              <span className="text-[10.5px] font-black uppercase tracking-wider">{activeDep} • گزارش سیستمی کایزن</span>
            </div>
            {activeDep === 'انبار کتب و جزوات' && (
              <span className="text-[9px] bg-red-600 text-white px-2 py-0.5 rounded-lg animate-pulse font-black">هشدار موجودی فیزیکی</span>
            )}
          </div>
          
          <p className="text-xs sm:text-xs text-gray-100 font-bold leading-relaxed border-b border-white/5 pb-4">
            {departmentLogs[activeDep]}
          </p>

          {/* Conditional Inventory Table for Books Dept */}
          {activeDep === 'انبار کتب و جزوات' && (
            <div className="space-y-4">
              <div className="overflow-hidden rounded-xl border border-white/10 bg-slate-950/50">
                <table className="w-full text-[10px] text-right">
                  <thead className="bg-white/5 text-gray-400 font-black">
                    <tr>
                      <th className="px-4 py-3">کد کالا</th>
                      <th className="px-4 py-3">عنوان کتاب / جزوه</th>
                      <th className="px-4 py-3 font-mono">Stock</th>
                      <th className="px-4 py-3">واحد قیمت (تومان)</th>
                      <th className="px-4 py-3">وضعیت</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {inventoryItems.map((item) => (
                      <tr key={item.id} className="hover:bg-white/5 transition-colors">
                        <td className="px-4 py-2.5 font-mono text-gray-500">{item.id}</td>
                        <td className="px-4 py-2.5 font-black text-gray-200">{item.title}</td>
                        <td className={`px-4 py-2.5 font-mono font-black ${item.stock < 20 ? 'text-rose-400' : 'text-emerald-400'}`}>
                          {item.stock}
                        </td>
                        <td className="px-4 py-2.5 text-gray-300 font-mono">{item.price}</td>
                        <td className="px-4 py-2.5">
                          <span className={`px-1.5 py-0.5 rounded text-[8.5px] font-black ${
                            item.status === 'بحرانی' ? 'bg-rose-500/20 text-rose-300' : 'bg-emerald-500/20 text-emerald-300'
                          }`}>
                            {item.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 bg-white/5 border border-white/10 rounded-xl space-y-3">
                  <h4 className="text-[11px] font-black text-amber-300 flex items-center gap-2">
                    <TrendingUp size={13} />
                    درخواست تمدید چاپ (فوری)
                  </h4>
                  <div className="flex gap-2">
                    <select className="flex-1 bg-slate-900 border border-white/10 rounded-lg px-3 py-2 text-[10px] font-bold text-gray-200 outline-none">
                      <option>انتخاب جزوه بحرانی...</option>
                      <option>جزوه طلایی کایزن وکالت</option>
                      <option>حقوق مدنی ۱ تا ۸</option>
                    </select>
                    <button className="bg-amber-400 text-slate-950 px-4 py-2 rounded-lg text-[10px] font-black hover:bg-amber-300 transition-colors">
                      ارسال به چاپخانه
                    </button>
                  </div>
                </div>
                
                <div className="p-4 bg-white/5 border border-white/10 rounded-xl space-y-3">
                  <h4 className="text-[11px] font-black text-indigo-300 flex items-center gap-2">
                    <Plus size={13} />
                    ثبت ورود بار جدید به انبار
                  </h4>
                  <div className="flex gap-2">
                    <input type="number" placeholder="تعداد واحد..." className="w-24 bg-slate-900 border border-white/10 rounded-lg px-3 py-2 text-[10px] font-bold text-gray-200 outline-none" />
                    <button className="flex-1 bg-indigo-500 text-white px-4 py-2 rounded-lg text-[10px] font-black hover:bg-indigo-400 transition-colors">
                      به‌روزرسانی موجودی
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

      </section>

      {/* Main Grid: Registration & Real-time Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Registration form (4 spans) */}
        <div className="lg:col-span-4 space-y-6">
          
          <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm space-y-4">
            <h3 className="font-black text-gray-950 text-sm">ثبت‌نام داوطلب و پرونده تلفنی جدید</h3>
            
            <form onSubmit={handleRegisterDossier} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] text-gray-400 font-bold block">نام و نام خانوادگی داوطلب:</label>
                <input 
                  type="text"
                  required
                  value={regName}
                  onChange={(e) => setRegName(e.target.value)}
                  placeholder="مثال: سهراب سپهری"
                  className={`w-full pr-4 pl-3 py-2.5 bg-gray-50 border-none rounded-xl text-xs font-bold outline-none focus:ring-2 focus:bg-white transition-all ${ringClass}`}
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] text-gray-400 font-bold block">لاین تحصیلی هدف:</label>
                <select
                  value={regGoal}
                  onChange={(e) => setRegGoal(e.target.value)}
                  className="w-full px-4 py-2.5 bg-gray-50 border-none text-gray-700 rounded-xl text-xs font-bold outline-none"
                >
                  <option value="وکالت">وکالت (آمادگی کانون)</option>
                  <option value="سردفتری">سردفتری (اسناد رسمی)</option>
                  <option value="قضاوت">قضاوت (تصدی منصب)</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] text-gray-400 font-bold block">کانال جذب داوطلب:</label>
                <select
                  value={regChannel}
                  onChange={(e) => setRegChannel(e.target.value)}
                  className="w-full px-4 py-2.5 bg-gray-50 border-none text-gray-700 rounded-xl text-xs font-bold outline-none"
                >
                  <option value="وبسایت موسسه">وبسایت موسسه</option>
                  <option value="پیج اینستاگرام">پیج اینستاگرام</option>
                  <option value="تابلو تبلیغاتی">تابلو تبلیغاتی انقلاب</option>
                  <option value="تماس تلفنی مستقیم">تماس تلفنی مستقیم</option>
                </select>
              </div>

              <button
                type="submit"
                className={`w-full py-3 text-white font-black text-xs rounded-xl shadow-sm ${bgClass} hover:opacity-90 flex items-center justify-center gap-2 transition-all`}
              >
                <Plus size={14} />
                <span>ثبت پرونده و اتصال به مشاوره</span>
              </button>
            </form>
          </div>

          {/* Lines share distribution layout (وكالت، سردفتري، قضاوت) */}
          <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm space-y-4">
            <h3 className="font-black text-gray-950 text-sm">سهم ثبتنامی ۳ لاین اصلی</h3>
            
            <div className="h-44 w-full flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={70}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(v) => [`${v} پرونده`]} />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="grid grid-cols-3 gap-2 text-center text-[10px] font-bold">
              <div className="p-2 bg-indigo-50 border border-indigo-100 rounded-xl text-indigo-700">
                <span className="block opacity-75">وکالت (آمادگی)</span>
                <span className="text-sm font-black mt-1 block">{vekalatCount} پرونده</span>
              </div>
              <div className="p-2 bg-amber-50 border border-amber-100 rounded-xl text-amber-700">
                <span className="block opacity-75">سردفتری</span>
                <span className="text-sm font-black mt-1 block">{sardaftariCount} پرونده</span>
              </div>
              <div className="p-2 bg-emerald-50 border border-emerald-100 rounded-xl text-emerald-700">
                <span className="block opacity-75">قضاوت</span>
                <span className="text-sm font-black mt-1 block">{ghezavatCount} پرونده</span>
              </div>
            </div>
          </div>

        </div>

        {/* Real-time Predictive Chart (8 spans) */}
        <div className="lg:col-span-8 space-y-6">
          
          <div className="bg-white p-5 sm:p-7 rounded-3xl border border-gray-100 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-55 pb-4">
              <div>
                <span className="text-[9px] font-black text-indigo-600 block">پایش عملیاتی چتر دانش</span>
                <h3 className="font-extrabold text-gray-900 text-sm">پیش‌بینی تراز و احتمال قبولی نهایی</h3>
              </div>
              <div className="bg-emerald-50 text-emerald-700 border border-emerald-100 rounded-xl px-4 py-2 text-center text-xs">
                <span className="text-[9.5px] block font-bold">احتمال قبولی در کانون وکلا:</span>
                <span className="text-sm font-black block mt-0.5">۸۴٪ (بسیار بالا)</span>
              </div>
            </div>

            <div className="h-64 w-full text-[10.5px] font-sans">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colScore" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.15}/>
                      <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false} />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#9ca3af' }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: '#9ca3af' }} domain={[3000, 9000]} />
                  <Tooltip />
                  <Area type="monotone" dataKey="predictScore" stroke="#d97706" strokeWidth={1} strokeDasharray="4 4" fill="none" name="تراز هدف پیشبینی" />
                  <Area type="monotone" dataKey="score" stroke="#4f46e5" strokeWidth={3} fillOpacity={1} fill="url(#colScore)" name="آخرین تراز تستی" />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            <div className="p-4 bg-gray-50 rounded-2xl flex items-start gap-3">
              <div className="p-1.5 bg-indigo-600 text-white rounded-lg font-bold">🎯</div>
              <p className="text-xs text-gray-650 leading-relaxed font-semibold">
                تحلیل رفتار داوطلب نشان‌دهنده شیب صعودی پایدار است. با حفظ روند فعلی در دروس قوانین خاص، تراز هدف ۸هزار در دسترس خواهد بود.
              </p>
            </div>
          </div>

        </div>

      </div>

      {/* Directory Phone Dossiers Table */}
      <section className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="font-extrabold text-gray-900 text-base">تعداد پرونده‌های تلفنی: {filteredDossiers.length} پرونده</h3>
            <p className="text-[10px] text-gray-400 mt-1 font-semibold">لیست پرونده‌های جاری داوطلبان متصل به دپارتمان‌های کانون</p>
          </div>

          <div className="relative max-w-xs w-full">
            <Search size={14} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input 
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="جستجوی داوطلب یا لاین تحصیلی..."
              className={`w-full pr-9 pl-3 py-2 bg-gray-50 border border-gray-150 rounded-xl text-xs outline-none focus:ring-2 focus:bg-white transition-all ${ringClass}`}
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-right border-collapse">
            <thead className="bg-gray-55/60 text-gray-550 text-xs font-bold uppercase border-b border-gray-100">
              <tr>
                <th className="px-6 py-4">شناسه پرونده</th>
                <th className="px-6 py-4">نام داوطلب</th>
                <th className="px-6 py-4">لاین مورد نظر</th>
                <th className="px-6 py-4">آخرین تراز تستی</th>
                <th className="px-6 py-4">وضعیت داوطلب</th>
                <th className="px-6 py-4 text-center">حذف</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-xs font-bold">
              {filteredDossiers.map((d) => (
                <tr key={d.id} className="hover:bg-gray-50/55 transition-colors">
                  <td className="px-6 py-4 font-mono font-black text-gray-400">{d.id}</td>
                  <td className="px-6 py-4 text-gray-900">{d.name}</td>
                  <td className="px-6 py-4">
                    <span className="px-2.5 py-1 bg-indigo-50 text-indigo-700 rounded-lg text-[10px]">
                      {d.goal} (آمادگی منصب)
                    </span>
                  </td>
                  <td className="px-6 py-4 font-mono font-black text-gray-700">{d.score}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 rounded-full text-[9px] font-black ${
                      d.status.includes('قطعی') ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' :
                      d.status.includes('آماده') ? 'bg-amber-50 text-amber-600 border border-amber-100' :
                      'bg-red-50 text-red-650 border border-red-100'
                    }`}>
                      {d.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <button
                      type="button"
                      onClick={() => handleDeleteDossier(d.id)}
                      className="p-1 px-2.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors inline-flex items-center gap-1.5"
                    >
                      <Trash2 size={13} />
                      <span className="text-[10px]">حذف</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

    </motion.div>
  );
};

export default CoursesHub;
