import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Sparkles, User, Phone, BookOpen, UserCheck, Calendar, FileText, 
  Send, RefreshCw, Printer, Search, Filter, Plus, MessageSquare, Check, X, ShieldAlert, Cpu, Users, Database,
  BarChart3, TrendingUp, Zap, Target, CreditCard
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import jsPDF from 'jspdf';

interface HomeLandingProps {
  setActiveTab: (tab: string) => void;
  setActiveDep: (dep: string) => void;
}

// Fixed mock legal leads matching precisely the user list
const initialLeads = [
  {
    id: 'l1',
    name: 'حمید ذوالفقاری',
    phone: '09351112233',
    course: 'سردفتری اسناد رسمی',
    intensity: 'COLD ❄',
    stage: '1', // ثبت اولیه
    counselor: 'خانم علوی',
    date: '۱۴۰۶/۰۲/۱۰',
    summary: 'متقاضی آزمون سردفتری، شاغل در دفترخانه، به دنبال پکیج فشرده قوانین خاص.',
    logs: [
      { sender: 'علوی', date: '۱۴۰۶/۰۲/۱۰', text: 'ثبت اولیه پرونده. تماس کوتاه برقرار شد.' }
    ]
  },
  {
    id: 'l2',
    name: 'علیرضا بخشنده',
    phone: '09159998877',
    course: 'ارشد حقوق خصوصی',
    intensity: 'WARM ⚡',
    stage: '1', // ثبت اولیه
    counselor: 'جناب حسینی',
    date: '۱۴۰۶/۰۲/۱۲',
    summary: 'داوطلب کنکور ارشد سراسری، فارغ‌التحصیل دانشگاه تهران، نیازمند متون حقوقی تخصصی.',
    logs: [
      { sender: 'حسینی', date: '۱۴۰۶/۰۲/۱۲', text: 'معرفی کارنامه قبولی‌های سال گذشته انجام شد.' }
    ]
  },
  {
    id: 'l3',
    name: 'فاطمه کاظمی پور',
    phone: '09123456789',
    course: 'وکالت کانون کلا (اسکودا)',
    intensity: 'HOT 🔥',
    stage: '2', // پیگیری و مذاکره
    counselor: 'دکتر کریمی',
    date: '۱۴۰۶/۰۲/۱۵',
    summary: 'داوطلب با انگیزه بالا، به دنبال قبولی حقوق خصوصی تهرانه. زمان آزاد مطالعه‌ش روزی ۵ ساعته.',
    logs: [
      { sender: 'کریمی', date: '۱۴۰۶/۰۲/۱۶', text: 'اولین تماس برقرار شد. برای شرکت در کارگاه طلایی مدنی چتر نجات مشتاق است.' },
      { sender: 'سیستم', date: '۱۴۰۶/۰۲/۱۸', text: 'پیامک معرفی پکیج چتر دانش با موفقیت ارسال شد.' }
    ]
  },
  {
    id: 'l4',
    name: 'امیررضا صادقی',
    phone: '09187654321',
    course: 'آزمون تصدی منصب قضا (قضاوت)',
    intensity: 'WARM ⚡',
    stage: '3', // تعیین سطح تحصیلی
    counselor: 'دکتر کریمی',
    date: '۱۴۰۶/۰۲/۱۴',
    summary: 'متقاضی قضاوت، تسلط متوسط روی فقه و اصول، نیازمند شبیه‌ساز آزمون تشریحی.',
    logs: [
      { sender: 'کریمی', date: '۱۴۰۶/۰۲/۱۴', text: 'ثبت پرونده و تعیین وقت مصاحبه فقهی اولیه.' }
    ]
  },
  {
    id: 'l5',
    name: 'زهرا مهدوی نیا',
    phone: '09904445566',
    course: 'وکالت کانون کلا (اسکودا)',
    intensity: 'HOT 🔥',
    stage: '4', // ثبت‌نام رول شده نهایی
    counselor: 'خانم علوی',
    date: '۱۴۰۶/۰۲/۱۱',
    summary: 'واریز بیعانه انجام شده، ثبت‌نام نهایی در کلاس‌های متون فقه و جزا تکمیل است.',
    logs: [
      { sender: 'علوی', date: '۱۴۰۶/۰۲/۱۱', text: 'قرارداد فیزیکی حضور در آزمون‌ها امضا شد.' }
    ]
  }
];

// Lead scoring system mock
const leadStats = [
  { label: 'لیدهای داغ (Hot)', count: 42, color: 'text-rose-500', bg: 'bg-rose-50' },
  { label: 'درآمد پیش‌بینی شده (Pipeline)', count: '۲.۴ میلیارد', color: 'text-indigo-500', bg: 'bg-indigo-50' },
  { label: 'نرخ وصول مطالبات', count: '٪۹۱.۸', color: 'text-emerald-500', bg: 'bg-emerald-50' },
  { label: 'میانگین سبد خرید دانشجو', count: '۱۲.۵ میلیون', color: 'text-amber-500', bg: 'bg-amber-50' },
];

const HomeLanding: React.FC<HomeLandingProps> = ({ setActiveTab, setActiveDep }) => {
  const { colorClass, bgClass, ringClass } = useTheme();
  
  const [leads, setLeads] = useState(initialLeads);
  const [selectedLeadId, setSelectedLeadId] = useState<string>('l3'); // فاطمه کاظمی پور by default
  const [searchTerm, setSearchTerm] = useState('');
  const [intensityFilter, setIntensityFilter] = useState('all');
  
  // Custom dialogs & state
  const [aiDraft, setAiDraft] = useState('');
  const [generatingDraft, setGeneratingDraft] = useState(false);
  const [newNote, setNewNote] = useState('');
  
  // Registration form
  const [showAddForm, setShowAddForm] = useState(false);
  const [formName, setFormName] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formCourse, setFormCourse] = useState('وکالت کانون کلا (اسکودا)');
  const [formIntensity, setFormIntensity] = useState('HOT 🔥');
  const [formSummary, setFormSummary] = useState('');

  const kanbanRef = React.useRef<HTMLDivElement>(null);

  const crmModules = [
    { title: 'داوطلبان', icon: Users, color: 'text-indigo-600', bg: 'bg-indigo-50', action: 'scroll' },
    { title: 'کنترل کلاسها', icon: BookOpen, color: 'text-amber-600', bg: 'bg-amber-50', action: 'tab' },
    { title: 'انبار کتب و جزوات', icon: Database, color: 'text-emerald-600', bg: 'bg-emerald-50', action: 'tab' },
    { title: 'فروش و درگاهها', icon: CreditCard, color: 'text-purple-600', bg: 'bg-purple-50', action: 'revenue' },
    { title: 'پیک و توزیع شهری', icon: Send, color: 'text-blue-600', bg: 'bg-blue-50', action: 'tab' },
    { title: 'مدیریت مشاوران', icon: Users, color: 'text-emerald-600', bg: 'bg-emerald-50', action: 'team' },
    { title: 'مهاجرت داده', icon: Zap, color: 'text-amber-600', bg: 'bg-amber-50', action: 'migration' },
  ];

  const handleModuleClick = (mod: typeof crmModules[0]) => {
    if (mod.action === 'scroll') {
      kanbanRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else if (mod.action === 'revenue') {
      setActiveTab('revenue');
    } else if (mod.action === 'team') {
      setActiveTab('team');
    } else if (mod.action === 'migration') {
      setActiveTab('migration');
    } else {
      setActiveDep(mod.title);
      setActiveTab('courses');
    }
  };

  // Selected lead getter
  const selectedLead = leads.find(l => l.id === selectedLeadId) || leads[0];

  // Filters leads
  const filteredLeads = leads.filter(l => {
    const matchesSearch = 
      l.name.includes(searchTerm) || 
      l.phone.includes(searchTerm) || 
      l.course.includes(searchTerm);
    
    const matchesIntensity = 
      intensityFilter === 'all' || 
      l.intensity.includes(intensityFilter);
    
    return matchesSearch && matchesIntensity;
  });

  // Stages definition
  const stages = [
    { id: '1', title: '۱. ثبت اولیه', badge: 'bg-blue-50 text-blue-700' },
    { id: '2', title: '۲. پیگیری و مذاکره', badge: 'bg-amber-50 text-amber-700' },
    { id: '3', title: '۳. تعیین سطح تحصیلی', badge: 'bg-purple-50 text-purple-700' },
    { id: '4', title: '۴. ثبتنام رول شده نهایی', badge: 'bg-emerald-50 text-emerald-700' },
  ];

  // KPI calculations
  const totalLeadsCount = leads.length;
  const hotLeadsCount = leads.filter(l => l.intensity.includes('HOT')).length;
  const warmLeadsCount = leads.filter(l => l.intensity.includes('WARM')).length;
  const registeredCount = leads.filter(l => l.stage === '4').length;
  const conversionRate = Math.round((registeredCount / totalLeadsCount) * 100);

  // Gemini AI Draft generator
  const generateAiDraft = async () => {
    setGeneratingDraft(true);
    setAiDraft('');
    try {
      const response = await fetch('/api/crm/insights', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          data: {
            task: 'تدوین متن پیگیری',
            instruction: 'شما دستیار مشاور ارشد چتر دانش هستید. یک متن پیامک صمیمانه و در عین حال کاملاً حرفه‌ای و متقاعدکننده برای داوطلب آزمون حقوقی بنویسید که او را به تکمیل ثبت نام و مشاوره ترغیب کند.',
            userPrompt: `نام متقاضی: ${selectedLead.name}، دوره هدف: ${selectedLead.course}، شدت تمایل: ${selectedLead.intensity}، خلاصه: ${selectedLead.summary}. لطفاً کوتاه، موثر، با رعایت لحن برند چتر دانش و دارای اطلاعات تماس بنویسید.`
          }
        })
      });
      const resData = await response.json();
      if (resData.insights) {
        setAiDraft(resData.insights);
      }
    } catch (e) {
      console.error(e);
      setAiDraft('خطا در برقراری ارتباط با دستیار هوش مصنوعی. لطفا مجددا تلاش فرمایید.');
    } finally {
      setGeneratingDraft(false);
    }
  };

  // Operater logger note
  const handleAddNote = () => {
    if (!newNote.trim()) return;
    const updatedLeads = leads.map(l => {
      if (l.id === selectedLead.id) {
        return {
          ...l,
          logs: [
            ...l.logs,
            { sender: 'کریمی (کاربر)', date: '۱۴۰۶/۰۲/۱۹', text: newNote }
          ]
        };
      }
      return l;
    });
    setLeads(updatedLeads);
    setNewNote('');
  };

  // Add new lead form hander
  const handleCreateLead = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim() || !formPhone.trim()) return;
    
    const newLead = {
      id: 'l_' + Date.now(),
      name: formName,
      phone: formPhone,
      course: formCourse,
      intensity: formIntensity,
      stage: '1', // Default to initial stage
      counselor: 'دکتر کریمی',
      date: '۱۴۰۶/۰۲/۱۹',
      summary: formSummary || 'پرونده جدید ثبت شده از ورودی داوطلبان',
      logs: [
        { sender: 'سیستم', date: '۱۴۰۶/۰۲/۱۹', text: 'افتتاح پرونده مشاوره به صورت مستقیم.' }
      ]
    };

    setLeads([...leads, newLead]);
    setSelectedLeadId(newLead.id);
    setShowAddForm(false);
    // Reset form states
    setFormName('');
    setFormPhone('');
    setFormSummary('');
  };

  // Export beautiful PDF dossier
  const exportDossierPDF = () => {
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    doc.setFontSize(22);
    doc.text('CHATR DANESH EDUCATION GROUP', 105, 25, { align: 'center' });
    doc.setFontSize(14);
    doc.text('Legal Candidates CRM & Evaluation Dossier', 105, 33, { align: 'center' });
    
    // Draw boundary border
    doc.setDrawColor(79, 70, 229);
    doc.setLineWidth(1);
    doc.rect(10, 10, 190, 277);
    
    // Horizontal rule
    doc.line(15, 38, 195, 38);

    doc.setFontSize(12);
    doc.text(`Candidate ID: ${selectedLead.id.toUpperCase()}`, 20, 50);
    doc.text(`Full Name: ${selectedLead.name}`, 20, 60);
    doc.text(`Contact Phone: ${selectedLead.phone}`, 20, 70);
    doc.text(`Target Course: ${selectedLead.course}`, 20, 80);
    doc.text(`Enthusiasm Intensity: ${selectedLead.intensity}`, 20, 90);
    doc.text(`Assigned Counselor: ${selectedLead.counselor}`, 20, 100);
    doc.text(`File Opened Date: ${selectedLead.date}`, 20, 110);
    
    doc.line(15, 118, 195, 118);
    
    doc.text('Dossier Summary & Observations:', 20, 128);
    doc.setFontSize(11);
    const splitSummary = doc.splitTextToSize(selectedLead.summary, 160);
    doc.text(splitSummary, 20, 136);

    doc.setFontSize(12);
    doc.text('Operator Logs & Historic Actions:', 20, 160);
    let currentY = 168;
    selectedLead.logs.forEach((log) => {
      const textLine = `- By [${log.sender}] On [${log.date}]: ${log.text}`;
      const splitText = doc.splitTextToSize(textLine, 165);
      doc.text(splitText, 25, currentY);
      currentY += (splitText.length * 6);
    });

    doc.line(15, 240, 195, 240);
    doc.text('This document has been generated dynamically by Chater Danesh CRM Workspace.', 105, 250, { align: 'center' });
    doc.setFontSize(14);
    doc.text('Approved & Signed: Dr. Karimi', 130, 265);
    
    doc.save(`Dossier-${selectedLead.name}.pdf`);
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-10"
      dir="rtl"
    >
      {/* CRM Funnel & Intelligence Header */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        <div className="lg:col-span-8 space-y-6">
          <div className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-50/50 rounded-full blur-3xl -mr-32 -mt-32" />
            
            <div className="relative">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h1 className="text-3xl sm:text-4xl font-black text-gray-900 tracking-tight leading-tight">
                    پنل هوشمند <span className={colorClass}>مدیریت لید کایزن</span>
                  </h1>
                  <p className="text-sm font-bold text-gray-500 mt-2 max-w-xl">
                    بررسی لحظه‌ای چرخه عمر دانشجو: از اولین تعامل تا موفقیت در آزمون وکالت و قضاوت
                  </p>
                </div>
                <button 
                  onClick={() => setShowAddForm(true)}
                  className={`px-6 py-3 rounded-2xl text-xs font-black text-white ${bgClass} hover:opacity-90 transition-all shadow-md flex items-center gap-2`}
                >
                  <Plus size={16} />
                  ثبت پرونده جدید
                </button>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-8">
                {leadStats.map((stat, i) => (
                  <div key={i} className={`p-4 rounded-2xl ${stat.bg} border border-white/50`}>
                    <span className="text-[10px] font-black text-gray-400 block mb-1">{stat.label}</span>
                    <span className={`text-lg font-black ${stat.color}`}>{stat.count}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          {/* Funnel Visualization */}
          <div className="bg-slate-950 p-8 rounded-[2rem] text-white shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-500 to-transparent" />
            </div>
            
            <div className="flex items-center justify-between mb-8 relative z-10">
              <h3 className="text-sm font-black flex items-center gap-2">
                <BarChart3 size={18} className="text-indigo-400" />
                آنالیز قیف ثبت‌نام (Enrolment Funnel)
              </h3>
              <div className="flex items-center gap-4 text-[10px] font-bold text-gray-400">
                <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-indigo-500" /> ورودی جدید</span>
                <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-emerald-500" /> ثبت‌نام قطعی</span>
              </div>
            </div>
            
            <div className="space-y-6 relative z-10">
              {[
                { stage: 'بازدیدکننده وبسایت', count: 12400, percent: 100, color: 'bg-indigo-500' },
                { stage: 'لیدهای راستی‌آزمایی شده', count: 3200, percent: 65, color: 'bg-indigo-400' },
                { stage: 'مشاوره آموزشی موفق', count: 850, percent: 40, color: 'bg-indigo-300' },
                { stage: 'ثبت‌نام نهایی کایزن', count: 210, percent: 12, color: 'bg-emerald-500' },
              ].map((step, idx) => (
                <div key={idx} className="space-y-2">
                  <div className="flex justify-between text-[11px] font-black">
                    <span className="text-gray-300">{step.stage}</span>
                    <span>{step.count.toLocaleString()} نفر</span>
                  </div>
                  <div className="h-2.5 bg-white/5 rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${step.percent}%` }}
                      className={`h-full ${step.color} shadow-[0_0_15px_rgba(99,102,241,0.3)]`}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Real-time Feed */}
        <div className="lg:col-span-4 bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm h-full flex flex-col">
          <h3 className="font-black text-gray-900 text-sm mb-6 flex items-center gap-2">
            <Sparkles size={16} className="text-amber-500" />
            فعالیت‌های اخیر سیستم CRM
          </h3>
          <div className="space-y-5 flex-1">
            {[
              { user: 'علی رمضانی', action: 'پکیج وکالت را خریداری کرد', time: '۲ دقیقه پیش', type: 'SALE' },
              { user: 'سارا سعادت', action: 'درخواست مشاوره رزرو کرد', time: '۱۵ دقیقه پیش', type: 'LEAD' },
              { user: 'سیستم هوشمند', action: '۸۴ لید جدید فراخوانی شد', time: '۱ ساعت پیش', type: 'SYSTEM' },
              { user: 'دکتر کریمی', action: 'جلسه وبینار را آغاز کرد', time: '۳ ساعت پیش', type: 'ACTION' },
            ].map((act, i) => (
              <div key={i} className="flex gap-3 relative pb-5 border-r-2 border-gray-50 pr-4 mr-2 last:border-0 last:pb-0">
                <div className={`absolute top-0 -right-[7px] w-3 h-3 rounded-full border-2 border-white ${
                  act.type === 'SALE' ? 'bg-emerald-500' : act.type === 'LEAD' ? 'bg-amber-500' : 'bg-indigo-500'
                }`} />
                <div>
                  <h4 className="text-[11px] font-black text-gray-900">{act.user}</h4>
                  <p className="text-[10px] text-gray-400 font-bold mt-0.5">{act.action}</p>
                  <span className="text-[8px] text-gray-300 mt-1 block">{act.time}</span>
                </div>
              </div>
            ))}
          </div>
          <button className="w-full mt-6 py-3 bg-gray-50 rounded-xl text-[10px] font-black text-gray-500 hover:bg-gray-100 transition-colors">
            مشاهده گزارش کامل فعالیت‌ها
          </button>
        </div>
      </section>

      {/* CRM Modules Selection */}
      <section className="bg-white p-4 rounded-3xl border border-gray-100 shadow-sm">
        <div className="flex items-center gap-2 mb-4 px-2">
          <div className="w-1 h-3 bg-indigo-500 rounded-full"></div>
          <h3 className="text-[11px] font-black text-gray-400 uppercase tracking-widest">ماژول‌های مرکز فرماندهی (Ops Center)</h3>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
          {crmModules.map((mod, idx) => (
            <button
              key={idx}
              onClick={() => handleModuleClick(mod)}
              className="group flex flex-col items-center justify-center p-4 rounded-2.5xl border border-gray-100 hover:border-indigo-100 hover:bg-indigo-50/30 transition-all space-y-3 active:scale-95 shadow-sm"
            >
              <div className={`p-2.5 rounded-2xl ${mod.bg} ${mod.color} group-hover:scale-110 transition-transform`}>
                <mod.icon size={20} />
              </div>
              <span className="text-[10px] font-black text-gray-700">{mod.title}</span>
            </button>
          ))}
        </div>
      </section>

      {/* KPIs & Pipeline Board */}
      <div ref={kanbanRef} className="space-y-8 scroll-mt-24">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-black text-gray-900">مدیریت خط لوله داوطلبان (Pipeline)</h2>
            <p className="text-[10px] text-gray-400 font-bold mt-1">تخصیص و هدایت هوشمند لیدها به دپارتمان‌های مربوطه</p>
          </div>
        </div>

        {/* 5 KPI Cards Row */}
        <section className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {[
            { title: 'مجموع لیدها', value: `${totalLeadsCount} نفر`, desc: 'کل پرونده‌های ثبت‌شده', color: 'bg-indigo-50 border-indigo-100 text-indigo-700' },
            { title: 'پرونده داغ 🔥', value: `${hotLeadsCount} لید`, desc: 'آماده ثبت‌نام نهایی', color: 'bg-red-50 border-red-100 text-red-700' },
            { title: 'ولرم (پیگیری ملایم)', value: `${warmLeadsCount} لید`, desc: 'نیازمند تماس تکمیلی', color: 'bg-amber-50 border-amber-100 text-amber-600' },
            { title: 'ثبتنام شده نهایی ✔', value: `${registeredCount} داوطلب`, desc: 'کلاس‌های رول شده', color: 'bg-emerald-50 border-emerald-100 text-emerald-700' },
            { title: 'نرخ تبدیل نهایی', value: `${conversionRate}٪`, desc: 'موفقیت جذب لید ملایم', color: 'bg-teal-50 border-teal-100 text-teal-700 font-mono' },
          ].map((kpi, idx) => (
            <div key={idx} className={`p-4 rounded-2.5xl border ${kpi.color} shadow-sm flex flex-col justify-between space-y-1.5`}>
              <span className="text-[10px] font-bold opacity-80">{kpi.title}</span>
              <span className="text-lg sm:text-2xl font-black tracking-tight">{kpi.value}</span>
              <span className="text-[9px] opacity-70 leading-relaxed font-semibold">{kpi.desc}</span>
            </div>
          ))}
        </section>

        {/* Kanban Area */}
        
        {/* Kanban Board Area */}
        <div className="lg:col-span-8 space-y-6">
          
          <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm space-y-4">
            
            {/* Search and Filters */}
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search size={16} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input 
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="جستجوی نام داوطلب، گرایش حقوقی یا موبایل..."
                  className={`w-full pr-10 pl-4 py-2.5 bg-gray-55 border border-gray-100 rounded-xl text-xs font-bold outline-none focus:ring-2 focus:bg-white transition-all ${ringClass}`}
                />
              </div>

              <div className="flex items-center gap-2">
                <Filter size={15} className="text-gray-400" />
                <select
                  value={intensityFilter}
                  onChange={(e) => setIntensityFilter(e.target.value)}
                  className={`bg-gray-50 border-none rounded-xl text-xs font-bold px-4 py-2.5 outline-none focus:ring-2 transition-all ${ringClass}`}
                >
                  <option value="all">همه درجات اشتیاق</option>
                  <option value="HOT">داغ 🔥</option>
                  <option value="WARM">ولرم ⚡</option>
                  <option value="COLD">سرد ❄</option>
                </select>
              </div>
            </div>

            {/* Kanban Columns */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-2">
              {stages.map((stage) => {
                const stageLeads = filteredLeads.filter(l => l.stage === stage.id);
                return (
                  <div key={stage.id} className="bg-gray-50/50 p-3 rounded-2.5xl border border-gray-100/80 flex flex-col space-y-3 min-h-[360px]">
                    
                    {/* Header */}
                    <div className="flex items-center justify-between pb-2 border-b border-gray-150/50">
                      <span className="text-[10px] font-black text-gray-800">{stage.title}</span>
                      <span className="px-2 py-0.5 bg-white text-gray-500 rounded-full text-[9px] font-bold border">
                        {stageLeads.length} لید
                      </span>
                    </div>

                    {/* Columns items */}
                    <div className="flex-1 space-y-3.5 overflow-y-auto">
                      {stageLeads.map((lead) => {
                        const isSelected = lead.id === selectedLeadId;
                        return (
                          <motion.div
                            key={lead.id}
                            onClick={() => setSelectedLeadId(lead.id)}
                            whileHover={{ y: -2 }}
                            className={`p-3.5 rounded-2xl border text-right cursor-pointer transition-all ${
                              isSelected 
                                ? 'bg-white border-indigo-500 shadow-md ring-2 ring-indigo-50'
                                : 'bg-white border-gray-100 hover:border-gray-200'
                            }`}
                          >
                            <span className="text-[9px] text-gray-400 font-bold block mb-1">
                              {lead.course}
                            </span>
                            <h4 className="text-xs font-black text-gray-900 leading-snug">
                              {lead.name}
                            </h4>
                            <p className="text-[9.5px] text-gray-500 font-semibold font-mono mt-1">
                              {lead.phone}
                            </p>
                            
                            <div className="flex items-center justify-between mt-3 pt-2.5 border-t border-gray-55">
                              <span className={`px-2 py-0.5 rounded-full text-[8.5px] font-bold ${
                                lead.intensity.includes('HOT') ? 'bg-red-50 text-red-650' :
                                lead.intensity.includes('WARM') ? 'bg-amber-50 text-amber-650' :
                                'bg-blue-50 text-blue-650'
                              }`}>
                                {lead.intensity}
                              </span>
                              <span className="text-[8px] text-gray-450 font-bold">
                                {lead.date}
                              </span>
                            </div>
                          </motion.div>
                        );
                      })}

                      {stageLeads.length === 0 && (
                        <div className="h-full flex items-center justify-center py-10">
                          <span className="text-[9px] text-gray-400 font-semibold">پرونده‌ای نیست</span>
                        </div>
                      )}
                    </div>

                  </div>
                );
              })}
            </div>

          </div>

          {/* Dossier Persuasion Official Docket */}
          <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm space-y-6">
            <div className="flex items-center justify-between border-b border-gray-50 pb-4">
              <div className="flex items-center gap-2.5">
                <div className={`p-2 rounded-xl bg-indigo-50 ${colorClass}`}>
                  <FileText size={18} />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-gray-900">پرونده تحلیل مشاوره‌ای و متقاعدسازی متقاضی</h3>
                  <p className="text-[10px] text-gray-400">سند رسمی ارزیابی و استراتژی مشاوره داوطلبان چتر دانش</p>
                </div>
              </div>

              <button
                onClick={exportDossierPDF}
                className="px-4 py-2 text-xs font-bold text-gray-700 bg-gray-50 rounded-xl hover:bg-gray-100 border border-gray-150 flex items-center gap-1.5 transition-colors"
              >
                <Printer size={13} />
                <span>صدور و چاپ پرونده مشاوره (PDF)</span>
              </button>
            </div>

            {/* Simulated Official Docket Card */}
            <div className="border border-indigo-200/50 bg-indigo-50/10 p-6 sm:p-8 rounded-2.5xl space-y-6 text-gray-800 relative shadow-inner overflow-hidden">
              <div className="absolute top-2 left-2 text-[7px] font-mono text-indigo-350 select-none">CRM DOSSIER • SECURE DOCUMENT</div>
              
              <div className="text-center space-y-1">
                <span className="text-[10px] font-black text-indigo-600 block tracking-wider">سامانه مشاور عالی دپارتمان هوش مصنوعی موسسه چتر دانش</span>
                <h4 className="text-md sm:text-lg font-black text-slate-800">سند اختصاصی کایزن و متقاعدسازی قبولی داوطلبان</h4>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-6 pt-4 border-t border-indigo-100/50">
                <div className="space-y-1">
                  <span className="text-[10px] text-gray-400 block font-bold">نام متقاضی پرونده:</span>
                  <span className="text-xs font-black text-gray-900 flex items-center gap-1.5">
                    <User size={13} className="text-indigo-500" />
                    {selectedLead.name}
                  </span>
                </div>

                <div className="space-y-1">
                  <span className="text-[10px] text-gray-400 block font-bold">شماره تماس پرونده:</span>
                  <span className="text-xs font-black text-gray-900 flex items-center gap-1.5 font-mono">
                    <Phone size={13} className="text-indigo-500" />
                    {selectedLead.phone}
                  </span>
                </div>

                <div className="space-y-1">
                  <span className="text-[10px] text-gray-400 block font-bold">آزمون و دوره هدف داوطلب:</span>
                  <span className="text-xs font-black text-gray-900 flex items-center gap-1.5">
                    <BookOpen size={13} className="text-indigo-500" />
                    {selectedLead.course}
                  </span>
                </div>

                <div className="space-y-1">
                  <span className="text-[10px] text-gray-400 block font-bold">مشاور مسئول تخصیص داده شده:</span>
                  <span className="text-xs font-black text-gray-900 flex items-center gap-1.5">
                    <UserCheck size={13} className="text-indigo-500" />
                    {selectedLead.counselor}
                  </span>
                </div>

                <div className="space-y-1">
                  <span className="text-[10px] text-gray-400 block font-bold">شدت تمایل/اشتیاق ثبت نام:</span>
                  <span className="text-xs font-black text-indigo-600 flex items-center gap-1">
                    {selectedLead.intensity}
                  </span>
                </div>

                <div className="space-y-1">
                  <span className="text-[10px] text-gray-400 block font-bold">تاریخ افتتاح پرونده:</span>
                  <span className="text-xs font-black text-gray-900 flex items-center gap-1.5">
                    <Calendar size={13} className="text-indigo-500" />
                    {selectedLead.date}
                  </span>
                </div>
              </div>

              <div className="space-y-1.5 pt-4 border-t border-indigo-100/50">
                <span className="text-[10px] text-gray-400 block font-bold">خلاصه دغدغه‌ها و توضیحات مقدماتی پرونده:</span>
                <p className="text-xs sm:text-xs text-gray-700 leading-relaxed font-black">
                  {selectedLead.summary}
                </p>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-indigo-100/50">
                <p className="text-[9px] text-gray-450 font-semibold">این سند با تایید مدیریت کل دپارتمان موسسه فرهیختگان چتر دانش صادر گردیده است.</p>
                <div className="text-left">
                  <span className="text-[8px] text-indigo-500 font-bold block text-left">مهر و امضای مشاور مسئول:</span>
                  <div className="mt-1 flex items-center gap-1 bg-white border border-indigo-150 px-3 py-1 rounded-lg">
                    <span className="text-[10px] font-black text-gray-700 font-serif">CHATR DANESH</span>
                    <span className="w-1.5 h-6 bg-indigo-500 rounded-md"></span>
                    <span className="text-[10px] font-black text-indigo-600">{selectedLead.counselor}</span>
                  </div>
                </div>
              </div>

            </div>
          </div>

        </div>

        {/* Dossier Details Right Panel */}
        <div className="lg:col-span-4">
          <div className="sticky top-20 bg-white p-5 rounded-3xl border border-gray-100 shadow-sm space-y-6">
            
            {/* Persona card */}
            <div className="bg-gray-50/50 p-4 rounded-2.5xl space-y-3 relative overflow-hidden">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-indigo-600 font-bold text-white flex items-center justify-center text-sm shadow-md">
                  {selectedLead.name.charAt(0)}
                </div>
                <div>
                  <h3 className="text-sm font-black text-gray-900">{selectedLead.name}</h3>
                  <span className="text-[10px] font-medium text-gray-400 block font-mono mt-0.5">{selectedLead.phone}</span>
                </div>
              </div>

              <div className="space-y-2 text-xs pt-3 border-t border-gray-150/50">
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">شدت تمایل:</span>
                  <span className="font-extrabold text-red-650">{selectedLead.intensity}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">دوره هدف:</span>
                  <span className="font-black text-gray-800">{selectedLead.course}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">مشاور همکار:</span>
                  <span className="font-bold text-gray-800">{selectedLead.counselor}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">ورود به سیستم:</span>
                  <span className="font-medium text-gray-600 font-mono">{selectedLead.date}</span>
                </div>
              </div>
            </div>

            {/* Operator follow-up Diary Logs */}
            <div className="space-y-4">
              <div>
                <h4 className="text-xs font-black text-gray-900">دفتر خاطرات و لاگ پیگیری‌های اپراتور</h4>
                <p className="text-[9px] text-gray-400">تاریخچه تماس‌ها، مکالمات و یادداشت‌های ثبت شده مشاور</p>
              </div>

              {/* Logger list items */}
              <div className="space-y-3 max-h-[190px] overflow-y-auto pr-1">
                {selectedLead.logs.map((log, idx) => (
                  <div key={idx} className="bg-gray-55 p-3 rounded-xl border border-gray-100/50 space-y-1 text-right">
                    <div className="flex items-center justify-between">
                      <span className="text-[9px] text-indigo-600 font-black">توسط {log.sender}</span>
                      <span className="text-[8px] text-gray-400 font-bold font-mono">{log.date}</span>
                    </div>
                    <p className="text-[10px] text-gray-650 leading-relaxed font-semibold">
                      {log.text}
                    </p>
                  </div>
                ))}
              </div>

              {/* Note adding form */}
              <div className="space-y-2">
                <textarea
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                  rows={2}
                  placeholder="ثبت یادداشت جدید در پرونده..."
                  className={`w-full text-xs font-bold p-3 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:ring-2 focus:bg-white transition-all ${ringClass}`}
                ></textarea>
                <button
                  type="button"
                  onClick={handleAddNote}
                  className={`w-full py-2 ${bgClass} text-white font-bold text-[10px] rounded-xl shadow-sm hover:opacity-90 flex items-center justify-center gap-1.5 transition-opacity`}
                >
                  <Send size={12} />
                  <span>افزودن یادداشت جدید</span>
                </button>
              </div>
            </div>

            {/* AI Assistant SMS follow up drafter */}
            <div className="space-y-3 pt-4 border-t border-gray-100">
              <div>
                <h4 className="text-xs font-black text-gray-900">دستیار هوش مصنوعی: تدوین متن پیگیری</h4>
                <p className="text-[9px] text-gray-400">نگارش هوشمند پیامک پیگیری یا ایمیل متناسب با تمایل آزمونی داوطلب</p>
              </div>

              <button
                type="button"
                onClick={generateAiDraft}
                disabled={generatingDraft}
                className="w-full py-2.5 bg-gradient-to-r from-indigo-950 to-indigo-900 border border-indigo-800/50 hover:from-indigo-900 text-white font-bold text-[10px] rounded-xl flex items-center justify-center gap-2 shadow-sm disabled:opacity-50"
              >
                {generatingDraft ? (
                  <>
                    <RefreshCw size={12} className="animate-spin text-amber-300" />
                    <span>دستیار در حال تحلیل پرونده دپارتمان...</span>
                  </>
                ) : (
                  <>
                    <Cpu size={12} className="text-amber-300 animate-pulse" />
                    <span>تدوین متن پیگیری هوشمند با Gemini</span>
                  </>
                )}
              </button>

              {aiDraft && (
                <div className="p-3.5 bg-indigo-50 border border-indigo-100 rounded-xl space-y-2 animate-fadeIn">
                  <span className="text-[8.5px] font-black text-indigo-700 block">پیش‌نویس تولیدشده:</span>
                  <p className="text-[10px] text-gray-700 leading-relaxed font-bold">
                    {aiDraft}
                  </p>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(aiDraft);
                      alert('کپی شد!');
                    }}
                    className="text-[8.5px] text-indigo-600 font-extrabold hover:underline float-left"
                  >
                    کپی پیش‌نویس
                  </button>
                </div>
              )}
            </div>

          </div>
        </div>

      </div>

      {/* Add Lead Mock dialog Popup overlay */}
      <AnimatePresence>
        {showAddForm && (
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[999] flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white max-w-lg w-full rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl relative text-right"
            >
              <button 
                onClick={() => setShowAddForm(false)}
                className="absolute top-4 left-4 p-1 rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X size={18} />
              </button>

              <div>
                <h3 className="text-lg font-black text-gray-900">ثبتنام داوطلب و پرونده تلفنی جدید</h3>
                <p className="text-xs text-gray-400 mt-1">پیش‌نویس مشخصات اولیه متقاضی برای ارسال به کارتابل دکتر کریمی</p>
              </div>

              <form onSubmit={handleCreateLead} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-gray-400 block">نام و نام خانوادگی داوطلب:</label>
                    <input 
                      type="text"
                      required
                      placeholder="مثال: سهراب سپهری"
                      value={formName}
                      onChange={(e) => setFormName(e.target.value)}
                      className={`w-full pr-4 pl-3 py-2.5 bg-gray-55 border border-gray-150 rounded-xl text-xs font-bold outline-none focus:ring-2 focus:bg-white transition-all ${ringClass}`}
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-gray-400 block">شماره تلفن همراه</label>
                    <input 
                      type="text"
                      required
                      placeholder="مثال: 09123456789"
                      value={formPhone}
                      onChange={(e) => setFormPhone(e.target.value)}
                      className={`w-full pr-4 pl-3 py-2.5 bg-gray-55 border border-gray-150 rounded-xl text-xs font-bold outline-none focus:ring-2 focus:bg-white transition-all text-left ${ringClass}`}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-gray-400 block">دوره آزمونی هدف داوطلب</label>
                    <select
                      value={formCourse}
                      onChange={(e) => setFormCourse(e.target.value)}
                      className="w-full px-4 py-2.5 bg-gray-55 border border-gray-150 rounded-xl text-xs font-bold text-gray-700 outline-none"
                    >
                      <option value="وکالت کانون کلا (اسکودا)">وکالت کانون وکلا (اسکودا)</option>
                      <option value="سردفتری اسناد رسمی">سردفتری اسناد رسمی</option>
                      <option value="آزمون تصدی منصب قضا (قضاوت)">آزمون تصدی منصب قضا (قضاوت)</option>
                      <option value="ارشد حقوق خصوصی">ارشد حقوق خصوصی</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-gray-400 block">شدت اشتیاق ثبت نام اولیه</label>
                    <select
                      value={formIntensity}
                      onChange={(e) => setFormIntensity(e.target.value)}
                      className="w-full px-4 py-2.5 bg-gray-55 border border-gray-150 rounded-xl text-xs font-bold text-gray-700 outline-none"
                    >
                      <option value="HOT 🔥">HOT 🔥 داغ</option>
                      <option value="WARM ⚡">WARM ⚡ ولرم</option>
                      <option value="COLD ❄">COLD ❄ سرد</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-gray-400 block">خلاصه دغدغه‌ها و توضیحات مقدماتی داوطلب</label>
                  <textarea
                    rows={3}
                    placeholder="متقاضی مایل به پرداخت اقساطی است..."
                    value={formSummary}
                    onChange={(e) => setFormSummary(e.target.value)}
                    className="w-full text-xs font-bold p-3 bg-gray-55 border border-gray-150 rounded-xl outline-none focus:bg-white focus:ring-2 transition-all"
                  ></textarea>
                </div>

                <div className="flex gap-2.5 pt-4">
                  <button
                    type="submit"
                    className={`flex-1 py-3 text-white font-bold text-xs rounded-xl shadow-md ${bgClass} hover:opacity-90 transition-all`}
                  >
                    ثبت پرونده و اتصال به مشاوره تخصصی
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowAddForm(false)}
                    className="px-5 py-3 text-gray-500 bg-gray-50 hover:bg-gray-100 border rounded-xl text-xs font-bold"
                  >
                    انصراف
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Footer credits */}
      <footer className="text-center font-semibold text-gray-400 text-[10.5px] pt-8 border-t border-gray-100">
        پلتفرم هوشمند آموزشی و برنامه‌ریزی درسی چتر دانش بر اساس مدل ارزیابی کایزن و آزمون‌های حقوقی وکالت • کپی‌رایت ۱۴۰۵ - ۱۴۰۶
      </footer>

    </motion.div>
  );
};

export default HomeLanding;
