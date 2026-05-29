import React from 'react';
import { motion } from 'motion/react';
import { GraduationCap, Cloud, DollarSign, Award, ArrowUpRight, Github, ExternalLink, Flame, CheckCircle2 } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import AIInsights from './AIInsights';
import { useTheme } from '../context/ThemeContext';
import { mockTutorials, mockTemplates, mockConnectedApps } from '../data/mockData';

// Chart data for monthly sales of student templates
const chartData = [
  { name: 'فروردین', sales: 290000 },
  { name: 'اردیبهشت', sales: 490000 },
  { name: 'خرداد', sales: 850000 },
  { name: 'تیر', sales: 1250000 },
  { name: 'مرداد', sales: 1950000 },
  { name: 'شهریور', sales: 2470000 },
];

const StatCard = ({ title, value, icon: Icon, color, subtitle }: any) => (
  <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
    <div className="absolute top-0 right-0 w-24 h-24 bg-gray-50 rounded-full blur-2xl group-hover:bg-gray-100/50 transition-colors"></div>
    <div className="flex items-center justify-between relative z-10">
      <div className="space-y-1">
        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">{title}</p>
        <p className="text-xl font-black text-gray-950 font-mono">{value}</p>
        {subtitle && <p className="text-[10px] text-gray-400 font-medium">{subtitle}</p>}
      </div>
      <div className={`p-3.5 rounded-2xl ${color} bg-opacity-10 text-opacity-100 shrink-0`}>
        <Icon size={20} className={color.replace('bg-', 'text-')} />
      </div>
    </div>
  </div>
);

const Dashboard: React.FC = () => {
  const { themeColor, hexColor, bgClass, ringClass } = useTheme();

  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8 pb-12"
      dir="rtl"
    >
      {/* Header element */}
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-gray-950 tracking-tight">پیشخوان کارگاه من (My Panel)</h2>
          <p className="text-sm text-gray-500 mt-1">خوش آمدید! وضعیت کارهای کلاسی، سورس‌های گیت‌هاب و درآمد حاصل از فروش قالب‌ها.</p>
        </div>
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-2 px-3 py-1.5 bg-emerald-50 text-emerald-600 rounded-full text-[11px] font-bold ring-1 ring-emerald-100">
            <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></div>
            کنترل‌پنل گیت‌هاب و هاست کلودفلر متصل است
          </span>
        </div>
      </header>

      {/* Main grids */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left column (2 spans): stats & chart */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Stat cards row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <StatCard 
              title="دوره های گذرانده شده" 
              value={`${mockTutorials.length - 3} از ${mockTutorials.length} دوره`} 
              icon={GraduationCap} 
              color="bg-indigo-600"
              subtitle="شامل آپارات، فرادرس و یوتیوب"
            />
            <StatCard 
              title="پیش‌نمایش‌های کلودفلر فعال" 
              value={`${mockConnectedApps.length} دمو زنده`} 
              icon={Cloud} 
              color="bg-orange-500" 
              subtitle="روی .workers.dev منتشر شده"
            />
            <StatCard 
              title="کل سود فروش شتاب" 
              value="۱,۴۹۰,۰۰۰ تومان" 
              icon={DollarSign} 
              color="bg-emerald-500" 
              subtitle="۴ خرید مستقیم ثبت شده"
            />
            <StatCard 
              title="امتیاز برنامه‌نویسی شما" 
              value="۴.۹ ★" 
              icon={Award} 
              color="bg-amber-500" 
              subtitle="رتبه عالی در بازار کیانهاب"
            />
          </div>

          {/* Area Chart of sales growth */}
          <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-gray-900">روند درآمدزایی شما از فروش سورس پروژه</h3>
                <p className="text-[10px] text-gray-400 mt-0.5">درآمد حاصل از بارگذاری کدهای گیت‌هاب در ۳ ماه گذشته</p>
              </div>
              <span className="text-[10px] bg-slate-100 text-gray-500 px-3 py-1 rounded-xl font-bold font-mono">تومان (IRT)</span>
            </div>
            
            <div className="h-72 w-full font-sans text-xs">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={hexColor} stopOpacity={0.15}/>
                      <stop offset="95%" stopColor={hexColor} stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#9ca3af' }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: '#9ca3af' }} />
                  <Tooltip 
                    contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)', fontFamily: 'inherit' }}
                    labelStyle={{ fontWeight: 'bold', marginBottom: '4px' }}
                    formatter={(val) => [`${val.toLocaleString()} تومان`, 'درآمد']}
                  />
                  <Area type="monotone" dataKey="sales" stroke={hexColor} strokeWidth={4} fillOpacity={1} fill="url(#colorSales)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Right column: Gemini recommendations, recent operations */}
        <div className="space-y-8">
          <AIInsights />
          
          {/* Recent Operations log */}
          <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm space-y-6">
            <div>
              <h3 className="font-bold text-gray-900 text-sm">آخرین وقایع و لاگ مخازن</h3>
              <p className="text-[10px] text-gray-400 mt-0.5">رویدادهای ثبت شده در کارگاه و درگاه زرین‌پال</p>
            </div>

            <div className="space-y-4">
              {[
                { title: 'خرید قالب «شرکتی هگزان» توسط مشتری رضا غفاری', desc: '+۴۹۰,۰۰۰ تومان از درگاه زرین‌پال شتاب', time: 'ساعت پیش', type: 'buy' },
                { title: 'اتصال موفقیت‌آمیز GitHub OAuth به مخزن saba-blog', desc: 'تولید شناسه مخزن وب امن', time: 'امروز صبح', type: 'build' },
                { title: 'دوره‌ی آموزشی «Tailwind CSS فوق سریع» با موفقیت پایان یافت', desc: 'پیشرفت دوره به مرز ۴۰ درصد رسید', time: 'دیروز', type: 'learn' },
                { title: 'استقرار نسخه تستی dmo وب پورتفولیو روی دامنه کلودفلر', desc: 'دسترسی در آدرس my-portfolio.kianhub.workers.dev', time: '۲ روز پیش', type: 'cloudflare' }
              ].map((item, idx) => (
                <div key={idx} className="flex gap-4 items-start pb-4 border-b border-gray-50 last:border-none last:pb-0 font-sans">
                  <div className={`w-1.5 h-10 rounded-full shrink-0 ${
                    item.type === 'buy' ? 'bg-emerald-500' : item.type === 'build' ? 'bg-blue-500' : 'bg-amber-500'
                  }`}></div>
                  <div className="space-y-0.5">
                    <p className="text-xs font-bold text-gray-900 leading-relaxed">{item.title}</p>
                    <p className="text-[10px] text-gray-400 font-medium">{item.desc}</p>
                    <p className="text-[9px] text-gray-300 font-bold">{item.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>
    </motion.div>
  );
};

export default Dashboard;
