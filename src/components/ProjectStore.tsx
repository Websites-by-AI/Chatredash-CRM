import React from 'react';
import { motion } from 'motion/react';
import { 
  GitMerge, Server, Cpu, Layers, Disc, Network, ArrowRightLeft,
  ChevronRight, Calendar, Key, ShieldCheck, CheckCircle2, Milestone
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

const ProjectStore: React.FC = () => {
  const { colorClass, bgClass, ringClass } = useTheme();

  const services = [
    {
      id: 'srv-1',
      title: 'هسته مرکزی CRM لید',
      desc: 'سیستم ثبت اولیه لیدهای آزمونی، اختصاص مشاور و هماهنگی تماس با داوطلب.',
      status: 'در حال بهره‌برداری ⚡',
      tech: 'Express Node.js / Firestore Serverless',
      endpoint: '/api/crm/insights'
    },
    {
      id: 'srv-2',
      title: 'موتور تحلیل هوش مصنوعی مانوا',
      desc: 'پردازش رفتار تستی داوطلبان با مدل‌های زبانی بزرگ برای پیش‌بینی تراز قبولی وکالت.',
      status: 'یکپارچه شده ✔',
      tech: 'Google Gemini 1.5 & Flash Core',
      endpoint: '/api/crm/insights'
    },
    {
      id: 'srv-3',
      title: 'سرویس اعلان و وب‌هاک پیامک',
      desc: 'ارسال خودکار طومارهای درسی کایزن و متن پیگیری به گوشی والدین داوطلب.',
      status: 'فعال ⚙',
      tech: 'Sms Proxy Serverless Engine',
      endpoint: 'سرویس‌دهنده ملی پیامک'
    }
  ];

  const blueprintDatabase = {
    "collections": {
      "leads": {
        "id": "String (key)",
        "name": "String",
        "phone": "String (unique)",
        "course": "String (وكالت | سردفتري | قضاوت)",
        "intensity": "String (HOT | WARM | COLD)",
        "status": "String (ثبتنام قطعی | در حال مذاکره)",
        "summary": "String (ملاحظات مشاور)",
        "createdAt": "Timestamp"
      },
      "operatorLogs": {
        "id": "String (key)",
        "leadId": "String (relation)",
        "author": "String",
        "logDate": "String",
        "textContent": "String"
      }
    }
  };

  const milestones = [
    { date: 'اردیبهشت ۱۴۰۶', title: '۱. راه‌اندازی کارتابل مشاوران عالی', desc: 'تکمیل کاتالوگ ثبت‌نام تلفنی و پیگیری کایزن دکتر کریمی.', done: true },
    { date: 'خرداد ۱۴۰۶', title: '۲. مهاجرت کامل به Firestore ابری', desc: 'اتصال دیتابیس بدون سرور با Rulesهای فوق‌امن جهت ممانعت از درز اطلاعات داوطلبان.', done: true },
    { date: 'تیر ۱۴۰۶', title: '۳. سیستم پایش پیامکی آنلاین والدین (مانوآ چتر دانش)', desc: 'ماژول بررسی دقیق پیشرفت تستی و تراز تستی با دکمه ارسال پیامک.', done: false },
    { date: 'مرداد ۱۴۰۶', title: '۴. آزمون‌های آزمایشی شبیه‌ساز تصدی قضاوت', desc: 'تحلیل دقیق نتایج تشریحی با یادگیری عمیق دپارتمان فناوری چتر دانش.', done: false },
  ];

  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8 text-right"
      dir="rtl"
    >
      {/* Header element */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 pb-5">
        <div>
          <h2 className="text-2xl sm:text-3xl font-black text-gray-950 flex items-center gap-2">
            <Layers className={colorClass} size={28} />
            📐 سند معماری و نقشه راه SaaS
          </h2>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">
            نقشه راه کلان دپارتمان هوش مصنوعی و معماری پایگاه داده چتر دانش به عنوان اولین سامانه توزیع‌شده آموزشی کشور
          </p>
        </div>
        <div className="flex items-center gap-2 bg-slate-100 px-4 py-2 rounded-xl text-slate-700 text-xs font-bold">
          <span>وضعیت ممیزی معماری: تأیید شده</span>
          <CheckCircle2 size={15} className="text-emerald-600" />
        </div>
      </div>

      {/* Grid: Microservice topology (8 columns) AND Database catalog (4 columns) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Topology (8 columns) */}
        <div className="lg:col-span-8 space-y-6">
          <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm space-y-6">
            <div>
              <h3 className="font-extrabold text-gray-950 text-sm">میکروسرویس‌های توزیع‌شده چتر دانش</h3>
              <p className="text-[10px] text-gray-400 mt-0.5">توپولوژی کانتینرها در سامانه ابری Cloud Run</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {services.map((srv, idx) => (
                <div key={idx} className="bg-gray-50/50 p-4 rounded-2xl border border-gray-100 flex flex-col justify-between space-y-4">
                  <div className="space-y-1.5">
                    <span className="text-[9px] bg-indigo-50 border border-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full font-black">
                      Service {idx + 1}
                    </span>
                    <h4 className="text-xs font-black text-gray-900 pt-1">{srv.title}</h4>
                    <p className="text-[10px] text-gray-500 leading-relaxed font-semibold">{srv.desc}</p>
                  </div>

                  <div className="text-[9.5px] border-t border-gray-150/60 pt-2.5 space-y-1 text-gray-600">
                    <div>تکنولوژی: <span className="font-bold text-gray-800">{srv.tech}</span></div>
                    <div>آدرس اندپوینت: <span className="font-mono font-bold text-indigo-600">{srv.endpoint}</span></div>
                    <div className="pt-1"><span className="text-emerald-650 font-black">● {srv.status}</span></div>
                  </div>
                </div>
              ))}
            </div>

            {/* Simulated Server Flow Visual Chart */}
            <div className="p-5 border border-indigo-100/60 bg-indigo-50/10 rounded-2.5xl flex flex-col sm:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-2xl bg-white border border-indigo-200 text-indigo-600 shrink-0">
                  <Server size={20} />
                </div>
                <div>
                  <h4 className="text-xs font-black text-indigo-950">Vite Proxy Layer</h4>
                  <p className="text-[10px] text-gray-500 font-semibold leading-relaxed">تونل امن روتینگ درخواست‌ها به مانیتور ادمین</p>
                </div>
              </div>

              <div className="flex items-center text-gray-300">
                <ArrowRightLeft size={16} className="text-indigo-500 animate-pulse hidden sm:block" />
              </div>

              <div className="flex items-center gap-3">
                <div className="p-3 rounded-2xl bg-white border border-indigo-200 text-indigo-600 shrink-0">
                  <Cpu size={20} />
                </div>
                <div>
                  <h4 className="text-xs font-black text-indigo-950">Gemini 3.5 Core Engine</h4>
                  <p className="text-[10px] text-gray-500 font-semibold leading-relaxed">تحلیل هوش مصنوعی دوزبانه فارسی و انگلیسی</p>
                </div>
              </div>

              <div className="flex items-center text-gray-300">
                <ArrowRightLeft size={16} className="text-indigo-500 animate-pulse hidden sm:block" />
              </div>

              <div className="flex items-center gap-3">
                <div className="p-3 rounded-2xl bg-white border border-indigo-200 text-indigo-600 shrink-0">
                  <Disc size={20} />
                </div>
                <div>
                  <h4 className="text-xs font-black text-indigo-950">Firestore Serverless Database</h4>
                  <p className="text-[10px] text-gray-500 font-semibold leading-relaxed">بستر پایدار و فوق‌سریع لیدهای وکالت</p>
                </div>
              </div>
            </div>
          </div>

          {/* Interactive Roadmap RoadmapMilestones */}
          <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm space-y-6">
            <div>
              <h3 className="font-extrabold text-gray-950 text-sm">برنامه توسعه کایزن و نقشه راه کلان</h3>
              <p className="text-[10px] text-gray-400 mt-0.5">نقشه تحول دیجیتال آموزش عالی وکالت موسسه چتر دانش</p>
            </div>

            <div className="relative border-r-2 border-indigo-100 pr-5 mr-3.5 space-y-6">
              {milestones.map((ms, idx) => (
                <div key={idx} className="relative group text-right">
                  {/* Dot */}
                  <div className={`absolute -right-[26px] top-1 w-3 h-3 rounded-full border-2 bg-white transition-all ${
                    ms.done ? 'border-emerald-600 ring-4 ring-emerald-50' : 'border-indigo-650 ring-4 ring-indigo-50'
                  }`} />

                  <div className="space-y-1">
                    <span className="text-[9.5px] font-bold text-gray-400 block font-mono">{ms.date}</span>
                    <h4 className="text-xs font-black text-gray-900 flex items-center gap-2">
                      {ms.title}
                      {ms.done && <span className="text-[9px] bg-emerald-50 text-emerald-600 px-1.5 py-0.5 rounded">انجام شد</span>}
                    </h4>
                    <p className="text-[10.5px] text-gray-500 leading-relaxed font-semibold pr-1">
                      {ms.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Database Blueprint (4 columns) */}
        <div className="lg:col-span-4">
          <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm space-y-6">
            <div className="flex items-center gap-2 mb-4">
              <Network size={18} className="text-indigo-600" />
              <div>
                <h3 className="font-black text-gray-950 text-sm">کاتالوگ پایگاه‌داده Firestore</h3>
                <p className="text-[9px] text-gray-400">کالکشن‌ها و مدل داده‌های بدون سرور چتر دانش</p>
              </div>
            </div>

            <div className="bg-slate-950 rounded-2xl p-4 text-left shadow-inner relative overflow-hidden">
              <div className="absolute top-2 right-2 text-[7px] text-slate-500 font-mono">FIRESTORE BLUEPRINT</div>
              <pre className="text-[10.5px] font-mono text-emerald-400 overflow-x-auto select-all leading-relaxed whitespace-pre-wrap">
                {JSON.stringify(blueprintDatabase, null, 2)}
              </pre>
            </div>

            <div className="bg-amber-50 border border-amber-100 p-4 rounded-2.5xl space-y-2">
              <h4 className="text-xs font-black text-amber-955 flex items-center gap-1">
                <Key size={13} />
                تضمین حریم خصوصی والدین و داوطلبان
              </h4>
              <p className="text-[10px] text-amber-700 leading-relaxed font-bold">
                قوانین Firestore Rules چتر دانش به گونه‌ای کالیبره شده است که تنها شماره تلفن همکار ثبت‌شده دپارتمان اجازه ممیزی و رویت نهایی پرونده مشاوره را بر عهده خواهد داشت.
              </p>
            </div>
          </div>
        </div>

      </div>

    </motion.div>
  );
};

export default ProjectStore;
