import React, { useState, useMemo } from "react";
import { 
  Sparkles, Zap, Smile, BookOpen, Clock, Check, 
  Layers, Users, RefreshCw, FileSpreadsheet, Package, ShoppingCart, 
  Truck, ClipboardCheck, DollarSign, BarChart3, TrendingUp, AlertTriangle, 
  Plus, Search, Filter, Trash, Play, Pause, Download, Sliders, ChevronRight,
  Navigation, CheckCircle, HelpCircle
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { 
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, 
  BarChart, Bar, Cell, PieChart, Pie, Legend 
} from "recharts";
import { addSystemLog } from "../lib/syslogs";
import { Student } from "../types";

// TypeScript interfaces for types of the rebranded Chatre Danesh matrix
interface LawLead {
  id: string;
  name: string;
  field: "وکالت" | "سردفتری" | "قضاوت";
  recentScore: number; // Simulated mock traz
  satisfaction: number; // 1 to 5
  status: "آماده ثبت‌نام" | "در حال پیگیری" | "انصراف موقت" | "ثبت‌نام قطعی";
  acquisitionChannel: string;
}

interface LawCourseLine {
  id: string;
  name: string;
  instructor: string;
  enrolledProgress: number; // percentage
  status: "در حال برگزاری" | "تکمیل شده" | "موقت متوقف";
  attendanceRate: number; // percentage
  stopTime: number; // minutes delayed
}

interface LawBookStock {
  id: string;
  name: string;
  currentStock: number;
  reorderPoint: number;
  maxStock: number;
  unit: string;
  shelfLocation: string;
}

interface BookOrder {
  id: string;
  client: string;
  date: string;
  bookName: string;
  amount: number; // Million Tomans
  status: "پرداخت شده" | "معوق" | "لغو شده";
  channel: string;
}

interface AuditReport {
  id: string;
  batchId: string;
  lessonName: string;
  testedCount: number;
  passedCount: number;
  failedReason: "عدم تطابق با قانون مصوب" | "تداخل مباحث" | "غلط املایی دفترچه" | "سطح دشواری نامناسب" | "سالم";
  operator: string;
}

interface CrmAccount {
  id: string;
  username: string;
  role: "مدیر ارشد" | "کارشناس آموزش" | "اپراتور فروش" | "پشتیبان فنی";
  lastActive: string;
  status: "فعال" | "مسدود";
}

export default function ManovaDashboard({ student }: { student: Student }) {
  const [activeTab, setActiveTab] = useState<number>(0); 

  const formatNum = (num: number) => num.toLocaleString("fa-IR");
  
  const toPersianNum = (num: number | string) => {
    const persianDigits = ["۰", "۱", "۲", "۳", "۴", "۵", "۶", "۷", "۸", "۹"];
    return num.toString().replace(/\d/g, (x) => persianDigits[parseInt(x)]);
  };

  // 1. CRM STATE & VARIABLES
  const [crmSearch, setCrmSearch] = useState("");
  const [inventorySearch, setInventorySearch] = useState("");
  const [ordersFilter, setOrdersFilter] = useState<string>("همه");
  const [selectedRouteId, setSelectedRouteId] = useState<string>("R-1");
  const [leads, setLeads] = useState<LawLead[]>([
    { id: "L-101", name: "امیرحسین رضایی", field: "وکالت", recentScore: 7200, satisfaction: 5, status: "ثبت‌نام قطعی", acquisitionChannel: "معرفی دوستان" },
    { id: "L-102", name: "فاطمه معتمدآریا", field: "سردفتری", recentScore: 5800, satisfaction: 4, status: "آماده ثبت‌نام", acquisitionChannel: "وب‌سایت موسسه" },
    { id: "L-103", name: "علی دایی", field: "قضاوت", recentScore: 4900, satisfaction: 2, status: "در حال پیگیری", acquisitionChannel: "اینستاگرام" },
    { id: "L-104", name: " سارا عباسی", field: "وکالت", recentScore: 6500, satisfaction: 4, status: "ثبت‌نام قطعی", acquisitionChannel: "تماس تلفنی" },
    { id: "L-105", name: "محمدحسین مهدویان", field: "قضاوت", recentScore: 8100, satisfaction: 5, status: "ثبت‌نام قطعی", acquisitionChannel: "همایش‌های چتر دانش" },
    { id: "L-106", name: "زهرا حسینی", field: "سردفتری", recentScore: 4200, satisfaction: 3, status: "انصراف موقت", acquisitionChannel: "وب‌سایت موسسه" },
    { id: "L-107", name: "رامین رحیمی", field: "وکالت", recentScore: 7600, satisfaction: 5, status: "آماده ثبت‌نام", acquisitionChannel: "تبلیغات محیطی" },
    { id: "L-108", name: "مهناز افشار", field: "سردفتری", recentScore: 5100, satisfaction: 4, status: "در حال پیگیری", acquisitionChannel: "اینستاگرام" },
    { id: "L-109", name: "کوروش نوری", field: "قضاوت", recentScore: 6900, satisfaction: 4, status: "ثبت‌نام قطعی", acquisitionChannel: "معرفی اساتید" }
  ]);
  const [newCName, setNewCName] = useState("");
  const [newCField, setNewCField] = useState<LawLead["field"]>("وکالت");
  const [newCChannel, setNewCChannel] = useState("وب‌سایت موسسه");

  const [salesTimeframe, setSalesTimeframe] = useState<"daily" | "weekly" | "monthly" | "yearly">("daily");
  const [profitProductFilter, setProfitProductFilter] = useState<string>("همه دوره‌ها");

  // Webinar/Course planning states
  const [newCourseName, setNewCourseName] = useState<string>("حقوق مدنی پپیشرفته - دکتر رادان");
  const [newCourseCapacity, setNewCourseCapacity] = useState<number>(250);
  const [newCourseTargetLine, setNewCourseTargetLine] = useState<string>("L-1");

  // Book storage register input states
  const [bookActionType, setBookActionType] = useState<"in" | "out">("in");
  const [bookItemSelect, setBookItemSelect] = useState<string>("I-201");
  const [bookQtyInput, setBookQtyInput] = useState<number>(20);

  // Logistics & dispatch states
  const [messengerName, setMessengerName] = useState<string>("");
  const [deliveryVehicle, setDeliveryVehicle] = useState<string>("پیک موتور شهری");
  const [assignedRouteId, setAssignedRouteId] = useState<string>("R-1");
  const [assignedOrderId, setAssignedOrderId] = useState<string>("O-503");
  const [studentSigned, setStudentSigned] = useState<boolean>(false);
  const [feedbackText, setFeedbackText] = useState<string>("");
  const [showDispatchToast, setShowDispatchToast] = useState<boolean>(false);
  const [showSignatureToast, setShowSignatureToast] = useState<boolean>(false);

  const addLead = () => {
    if (!newCName) return;
    const newLead: LawLead = {
      id: `L-${leads.length + 101}`,
      name: newCName,
      field: newCField,
      recentScore: 5000 + Math.floor(Math.random() * 3000),
      satisfaction: 4,
      status: "در حال پیگیری",
      acquisitionChannel: newCChannel
    };
    setLeads([newLead, ...leads]);
    setNewCName("");
  };

  const removeLead = (id: string) => {
    setLeads(leads.filter(l => l.id !== id));
  };

  const filteredLeads = useMemo(() => {
    return leads.filter(l => l.name.includes(crmSearch) || l.field.includes(crmSearch));
  }, [leads, crmSearch]);

  const crmGrowthData = [
    { name: "فروردین", count: 110, clvSum: 420 },
    { name: "اردیبهشت", count: 125, clvSum: 480 },
    { name: "خرداد", count: 140, clvSum: 590 },
    { name: "تیر", count: 165, clvSum: 680 },
    { name: "مرداد", count: 198, clvSum: 810 },
    { name: "شهریور", count: 240, clvSum: 950 },
  ];

  const crmSegmentData = [
    { name: "وکالت", value: leads.filter(l => l.field === "وکالت").length, color: "#1e3a8a" },
    { name: "سردفتری", value: leads.filter(l => l.field === "سردفتری").length, color: "#f59e0b" },
    { name: "قضاوت", value: leads.filter(l => l.field === "قضاوت").length, color: "#10b981" },
  ];

  // 2. COURSES / WEBINAR PLANNER STATE & VARIABLES
  const [courses, setCourses] = useState<LawCourseLine[]>([
    { id: "L-1", name: "قواین خاص و حقوق مدنی تطبیقی", instructor: "دکتر مهدوی", enrolledProgress: 88, defects: 0, status: "در حال برگزاری", speed: 45, stopTime: 0, risk: "پایین" } as any,
    { id: "L-2", name: "آیین دادرسی کیفری و کارگاه تست‌زنی", instructor: "استاد ناصری", enrolledProgress: 94, defects: 2, status: "در حال برگزاری", speed: 60, stopTime: 10, risk: "پایین" } as any,
    { id: "L-3", name: "حقوق تجارت و لایحه اصلاحی ثبتی", instructor: "دکتر رادان", enrolledProgress: 45, defects: 15, status: "موقت متوقف", speed: 0, stopTime: 90, risk: "بحرانی" } as any,
    { id: "L-4", name: "شبیه‌ساز تستی اصول فقه پایه", instructor: "استاد فیاض", enrolledProgress: 100, defects: 1, status: "تکمیل شده", speed: 50, stopTime: 0, risk: "پایین" } as any,
  ]);

  const startCourse = (id: string) => {
    setCourses(courses.map(c => c.id === id ? { ...c, status: "در حال برگزاری", stopTime: 0 } : c));
  };

  const pauseCourse = (id: string) => {
    setCourses(courses.map(c => c.id === id ? { ...c, status: "موقت متوقف", stopTime: 25 } : c));
  };

  const currentCapacityRate = useMemo(() => {
    const totalProgress = courses.reduce((sum, c) => sum + c.enrolledProgress, 0);
    return Math.round(totalProgress / courses.length);
  }, [courses]);

  const handleAddNewCourseSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newId = `L-${courses.length + 1}`;
    const entry: LawCourseLine = {
      id: newId,
      name: newCourseName,
      instructor: "مشاور علمی ارشد",
      enrolledProgress: 0,
      status: "در حال برگزاری",
      attendanceRate: 92,
      stopTime: 0
    };
    setCourses([...courses, entry]);
    alert(`💡 دوره هوشمند جدید '${newCourseName}' در چتر دانش ثبت گردید و وبینار اتوماتیک آن راه‌اندازی شد.`);
  };

  // 3. BOOKS & STUDY PAMPHLETS INVENTORY STATE & VARIABLES
  const [books, setBooks] = useState<LawBookStock[]>([
    { id: "I-201", name: "کتاب طلایی شرح صریح حقوق مدنی چتر دانش", currentStock: 450, reorderPoint: 100, maxStock: 800, unit: "جلد", shelfLocation: "قفسه الف-۳" },
    { id: "I-202", name: "مجموعه تست دوقلو آیین دادرسی مدنی مکتوب", currentStock: 85, reorderPoint: 120, maxStock: 600, unit: "جلد", shelfLocation: "قفسه ب-۷" },
    { id: "I-203", name: "شرح قانون مجازات اسلامی و جزای عمومی", currentStock: 340, reorderPoint: 80, maxStock: 500, unit: "جلد", shelfLocation: "قفسه ج-۱" },
    { id: "I-204", name: "درسنامه اصول و متون فقه دانشگاهی", currentStock: 12, reorderPoint: 50, maxStock: 300, unit: "جلد", shelfLocation: "قفسه د-۴" },
    { id: "I-205", name: "مجموعه قوانین ثبتی و خاص وکالت چتر دانش", currentStock: 600, reorderPoint: 150, maxStock: 1000, unit: "جلد", shelfLocation: "قفسه ه-۲" },
  ]);

  const filteredBooks = useMemo(() => {
    return books.filter(b => b.name.includes(inventorySearch) || b.shelfLocation.includes(inventorySearch));
  }, [books, inventorySearch]);

  const handleInventoryAdjust = (e: React.FormEvent) => {
    e.preventDefault();
    setBooks(books.map(b => {
      if (b.id === bookItemSelect) {
        const adjust = bookActionType === "in" ? bookQtyInput : -bookQtyInput;
        const finalStock = Math.max(0, Math.min(b.maxStock, b.currentStock + adjust));
        return { ...b, currentStock: finalStock };
      }
      return b;
    }));
    alert("📦 موجودی انبار کتب مرکزی چتر دانش موازنه و بازرسی گردید.");
  };

  // 4. BOOK ORDER TRANSACTIONS STATE & VARIABLES
  const [orders, setOrders] = useState<BookOrder[]>([
    { id: "O-501", client: "امیرحسین رضایی", date: "۱۴۰۵/۰۲/۲۰", bookName: "کتاب طلایی شرح صریح حقوق مدنی چتر دانش", amount: 1.2, status: "پرداخت شده", channel: "درگاه آنلاین بانک ملی" },
    { id: "O-502", client: "دارالکتاب دانشگاه البرز", date: "۱۴۰۵/۰۲/۲۲", bookName: "مجموعه قوانین ثبتی و خاص وکالت چتر دانش", amount: 14.5, status: "پرداخت شده", channel: "حواله پایا" },
    { id: "O-503", client: "فاطمه معتمدآریا", date: "۱۴۰۵/۰۲/۲۳", bookName: "مجموعه تست دوقلو آیین دادرسی مدنی مکتوب", amount: 0.9, status: "معوق", channel: "درگاه آنلاین بانک ملی" },
    { id: "O-504", client: "کتابفروشی صراط قم", date: "۱۴۰۵/۰۲/۲۴", bookName: "درسنامه اصول و متون فقه دانشگاهی", amount: 8.4, status: "پرداخت شده", channel: "کارت به کارت" },
    { id: "O-505", client: "سهیل بهرامی", date: "۱۴۰۵/۰۲/۲۵", bookName: "شرح قانون مجازات اسلامی و جزای عمومی", amount: 1.5, status: "لغو شده", channel: "درگاه آنلاین ملت" },
  ]);

  const filteredOrders = useMemo(() => {
    if (ordersFilter === "همه") return orders;
    return orders.filter(o => o.status === ordersFilter);
  }, [orders, ordersFilter]);

  const totalSalesRevenue = useMemo(() => {
    return orders.filter(o => o.status === "پرداخت شده").reduce((sum, o) => sum + o.amount, 0);
  }, [orders]);

  // 5. DISPATCH & URBAN LOGISTICS COURIERS
  const [couriers, setCouriers] = useState<any[]>([
    { id: "CO-1", name: "پیمان صادقی", vehicle: "پیک موتور شهری", status: "در حال توزیع", currentZone: "منطقه ۶ تهران", assignedOrdersCount: 3 },
    { id: "CO-2", name: "جواد نصرتی", vehicle: "وانت سبک باربری", status: "آماده در انبار", currentZone: "میدان انقلاب", assignedOrdersCount: 0 },
  ]);

  const [deliveryRoutes, setDeliveryRoutes] = useState<any[]>([
    { id: "R-1", text: "تهران - شعبه مرکزی به انتشارات چتر دانش پاسداران", progress: 65, totalKM: 12, estMinutes: 25, status: "در مسیر" },
    { id: "R-2", text: "ارسال کتب - انبار میدان انقلاب به ترمینال مسافربری غرب", progress: 90, totalKM: 8, estMinutes: 15, status: "نزدیک مقصد" },
    { id: "R-3", text: "تهران - انبار مرکزی به دفتر پست منطقه ۱۱ شهری", progress: 100, totalKM: 5, estMinutes: 12, status: "تکمیل شده" },
  ]);

  const dispatchCourierWorkflow = (e: React.FormEvent) => {
    e.preventDefault();
    if (!messengerName.trim()) return;

    const newCId = `CO-${couriers.length + 1}`;
    setCouriers([...couriers, {
      id: newCId,
      name: messengerName,
      vehicle: deliveryVehicle,
      status: "در حال توزیع",
      currentZone: "شروع از مبدا انقلاب",
      assignedOrdersCount: 1
    }]);

    setDeliveryRoutes([...deliveryRoutes, {
      id: `R-${deliveryRoutes.length + 1}`,
      text: `ارسال فوری کتب سفارش رقم ${assignedOrderId} به داوطلب در محدوده تهران`,
      progress: 5,
      totalKM: 14,
      estMinutes: 40,
      status: "در مسیر"
    }]);

    setShowDispatchToast(true);
    setTimeout(() => {
      setShowDispatchToast(false);
    }, 4000);

    setMessengerName("");
  };

  const submitStudentSignatureAndFeedback = (e: React.FormEvent) => {
    e.preventDefault();
    if (!feedbackText.trim() || !studentSigned) return;

    setDeliveryRoutes(deliveryRoutes.map(r => r.id === assignedRouteId ? { ...r, progress: 100, status: "تکمیل شده" } : r));
    setShowSignatureToast(true);
    setTimeout(() => {
      setShowSignatureToast(false);
    }, 4500);

    setFeedbackText("");
    setStudentSigned(false);
  };

  // 6. DETAILED EDUCATIONAL AUDIT REPORTS
  const [audits, setAudits] = useState<AuditReport[]>([
    { id: "Q-901", batchId: "B-405", lessonName: "حقوق مدنی شبیه‌ساز ۱", testedCount: 150, passedCount: 147, failedReason: "سالم", operator: "مهندس علوی" },
    { id: "Q-902", batchId: "B-406", lessonName: "آیین دادرسی مدنی ۲", testedCount: 200, passedCount: 184, failedReason: "تداخل مباحث", operator: "دکتر مهدوی" },
    { id: "Q-903", batchId: "B-407", lessonName: "اصول فقه شبیه‌ساز ۳", testedCount: 120, passedCount: 95, failedReason: "سطح دشواری نامناسب", operator: "استاد فیاض" },
    { id: "Q-904", batchId: "B-408", lessonName: "قوانین خاص وکالت ۴", testedCount: 250, passedCount: 248, failedReason: "سالم", operator: "دکترین رادان" },
  ]);

  // 7. CRM ACCOUNTS & PREDICTIVE ANALYTICS
  const [crmAccounts, setCrmAccounts] = useState<CrmAccount[]>([
    { id: "ACC-01", username: "admin_chatre", role: "مدیر ارشد", lastActive: "۱۰ دقیقه پیش", status: "فعال" },
    { id: "ACC-02", username: "m_mahdavi", role: "کارشناس آموزش", lastActive: "هم‌اکنون", status: "فعال" },
    { id: "ACC-03", username: "sale_expert1", role: "اپراتور فروش", lastActive: "۱ ساعت پیش", status: "فعال" },
  ]);

  const [newAccUser, setNewAccUser] = useState("");
  const [newAccRole, setNewAccRole] = useState<CrmAccount["role"]>("اپراتور فروش");

  const addCrmAccount = () => {
    if (!newAccUser) return;
    const newAcc: CrmAccount = {
      id: `ACC-0${crmAccounts.length + 1}`,
      username: newAccUser,
      role: newAccRole,
      lastActive: "تازه وارد",
      status: "فعال"
    };
    setCrmAccounts([...crmAccounts, newAcc]);
    addSystemLog("ایجاد حساب CRM", student.name, `حساب کاربری جدید با نام ${newAccUser} و نقش ${newAccRole} در سامانه مانوا با موفقیت ایجاد گردید.`);
    setNewAccUser("");
    alert(`🔐 حساب کاربری جدید برای '${newAccUser}' در سامانه مانوا ایجاد گردید.`);
  };

  const predictiveTrazData = [
    { period: "شروع", score: 4200, predicted: null },
    { period: "هفته ۲", score: 4500, predicted: null },
    { period: "هفته ۴", score: 5100, predicted: null },
    { period: "هفته ۶", score: 5800, predicted: null },
    { period: "هفته ۸ (فعلی)", score: 6200, predicted: 6200 },
    { period: "هفته ۱۰ (پیش‌بینی)", score: null, predicted: 6900 },
    { period: "هفته ۱۲ (پیش‌بینی)", score: null, predicted: 7600 },
    { period: "آزمون کانون", score: null, predicted: 8400 },
  ];

  const handleAuditSubmit = () => {
    alert("📝 صورت‌جلسه ارزیابی و ممیزی سوالات آزمون‌ها با موفقیت در مخزن استانداردسازی آموزشی چتر دانش ذخیره گردید.");
  };

  return (
    <div className="space-y-6" id="manova-master-dashboard-container">
      
      {/* Top Rebranded Header Grid */}
      <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4 text-right">
        <div className="space-y-1">
          <div className="flex items-center gap-2 justify-start">
            <span className="px-2.5 py-0.5 bg-blue-900 text-white text-[9px] font-black rounded-lg">
              پایش عملیاتی چتر دانش
            </span>
            <span className="text-slate-300 text-xs">•</span>
            <span className="text-[10px] text-slate-500 font-bold">ماتریس و داشبورد مدیریتی مانوا</span>
          </div>
          <h1 className="text-xl font-black text-slate-900 tracking-tight">پنل مانیتورینگ جامع و ماتریس چندبعدی هوشمند مانوا چتر دانش</h1>
          <p className="text-xs text-slate-500 leading-relaxed">
            سیستم کنترل یکپارچه آموزشی و مالی: پایش مستمر روند ثبت نام داوطلبان، کایزن درسی، توزیع کتب و ترازهای علمی.
          </p>
        </div>
      </div>

      {/* KPI stats section */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4" id="kpi-financial-panels">
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between">
          <div className="space-y-1 text-right">
            <span className="text-[10px] text-slate-400 block font-bold">مجموع درآمدهای وصولی ناخالص</span>
            <strong className="text-xl font-black font-mono text-blue-900">{formatNum(totalSalesRevenue)} میلیون تومان</strong>
            <p className="text-[9px] text-emerald-600 font-bold">✓ ۸۸٪ تارگت فصلی محقق شد</p>
          </div>
          <div className="p-3 bg-blue-50 text-blue-900 rounded-xl"><DollarSign size={20} /></div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between">
          <div className="space-y-1 text-right">
            <span className="text-[10px] text-slate-400 block font-bold">کل داوطلبان فعال سیستم</span>
            <strong className="text-xl font-black font-mono text-slate-800">{formatNum(leads.length + 840)} نفر</strong>
            <p className="text-[9px] text-slate-400 font-bold">تلاقی ۳ لاین اصلی آموزشی</p>
          </div>
          <div className="p-3 bg-amber-50 text-amber-600 rounded-xl"><Users size={20} /></div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between">
          <div className="space-y-1 text-right">
            <span className="text-[10px] text-slate-400 block font-bold">میانگین پیشرفت وبینارهای درسی</span>
            <strong className="text-xl font-black font-mono text-slate-800">{toPersianNum(currentCapacityRate)}٪</strong>
            <p className="text-[9px] text-indigo-700 font-bold">۴ دوره آنلاین موازی</p>
          </div>
          <div className="p-3 bg-indigo-50 text-indigo-700 rounded-xl"><Play size={20} /></div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between">
          <div className="space-y-1 text-right">
            <span className="text-[10px] text-slate-400 block font-bold font-sans">کتب در انبار مرکزی انقلاب</span>
            <strong className="text-xl font-black font-mono text-emerald-700">{formatNum(books.reduce((acc, x) => acc + x.currentStock, 0))} جلد</strong>
            <p className="text-[9px] text-red-500 font-black">موجودی بحرانی: ۱ کاتالوگ</p>
          </div>
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl"><Package size={20} /></div>
        </div>
      </div>

      {/* Module Selector tabs */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden text-right" id="manova-tabbed-navigator">
        <div className="flex border-b border-slate-100 overflow-x-auto p-2 bg-slate-50/50 gap-1.5 scrollbar-thin">
          {[
            { label: "CRM داوطلبان", icon: Users },
            { label: "کنترل کلاس‌ها", icon: Zap },
            { label: "انبار کتب و جزوات", icon: Package },
            { label: "فروش و درگاه‌ها", icon: DollarSign },
            { label: "پیک و توزیع شهری", icon: Truck },
            { label: "ممیزی سوالات", icon: ClipboardCheck },
            { label: "مدیریت حساب‌ها", icon: Sliders },
          ].map((tab, idx) => {
            const Icon = tab.icon;
            return (
              <button
                key={idx}
                onClick={() => setActiveTab(idx)}
                className={`flex items-center gap-2 py-3 px-5 rounded-xl text-xs font-black whitespace-nowrap transition cursor-pointer ${
                  activeTab === idx 
                    ? "bg-white text-blue-900 shadow-sm border border-slate-100/50" 
                    : "text-slate-500 hover:text-slate-800 hover:bg-slate-100/40"
                }`}
              >
                <Icon size={14} />
                <span>{tab.label}</span>
              </button>
            )
          })}
        </div>

        <div className="p-6">
          <AnimatePresence mode="wait">
            
            {/* TAB 0 - CRM */}
            {activeTab === 0 && (
              <motion.div
                key="tab-0"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                className="grid grid-cols-1 lg:grid-cols-3 gap-6 text-right"
              >
                {/* Left side student form & segmentation */}
                <div className="space-y-4 lg:col-span-1">
                  <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100 space-y-4">
                    <h3 className="text-xs font-black text-slate-800">ثبت‌نام داوطلب و پرونده تلفنی جدید</h3>
                    <div className="space-y-2.5">
                      <div>
                        <label className="text-[10px] text-slate-450 block pb-1">نام و نام خانوادگی داوطلب:</label>
                        <input 
                          type="text" 
                          value={newCName}
                          onChange={(e) => setNewCName(e.target.value)}
                          placeholder="مثال: سهراب سپهری"
                          className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 text-right focus:outline-none focus:ring-1 focus:ring-blue-900"
                        />
                      </div>
                      
                      <div>
                        <label className="text-[10px] text-slate-450 block pb-1">لاین تحصیلی هدف:</label>
                        <select
                          value={newCField}
                          onChange={(e: any) => setNewCField(e.target.value)}
                          className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-black text-slate-700 text-right focus:outline-none"
                        >
                          <option value="وکالت">وکالت (آمادگی کانون)</option>
                          <option value="سردفتری">سردفتری اسناد رسمی</option>
                          <option value="قضاوت">قضاوت قوه قضاییه</option>
                        </select>
                      </div>

                      <div>
                        <label className="text-[10px] text-slate-450 block pb-1">کانال جذب داوطلب:</label>
                        <input 
                          type="text" 
                          value={newCChannel}
                          onChange={(e) => setNewCChannel(e.target.value)}
                          className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 text-right focus:outline-none"
                        />
                      </div>

                      <button 
                        onClick={addLead}
                        className="w-full bg-blue-950 hover:bg-slate-900 text-white font-bold text-xs py-2.5 rounded-xl transition cursor-pointer shadow-sm flex items-center justify-center gap-1.5"
                      >
                        <Plus size={14} />
                        <span>ثبت پرونده و اتصال به مشاوره</span>
                      </button>
                    </div>
                  </div>

                  {/* Chart segment */}
                  <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100 space-y-4">
                    <h3 className="text-xs font-black text-slate-800">سهم ثبت‌نامی ۳ لاین اصلی</h3>
                    <div className="h-[140px] flex items-center justify-center">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={crmSegmentData}
                            cx="50%"
                            cy="50%"
                            innerRadius={45}
                            outerRadius={60}
                            paddingAngle={5}
                            dataKey="value"
                          >
                            {crmSegmentData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip formatter={(value) => `${value} پرونده`} />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                    
                    <div className="flex justify-between items-center text-[10px] font-bold text-slate-500">
                      {crmSegmentData.map((x, i) => (
                        <div key={i} className="flex items-center gap-1">
                          <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: x.color }}></span>
                          <span>{x.name} ({x.value})</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* PREDICTIVE SCORE GROWTH CHART (Added based on user request) */}
                  <div className="bg-gradient-to-br from-indigo-900 to-slate-900 p-5 rounded-3xl text-white space-y-4 shadow-xl">
                    <div className="flex justify-between items-start">
                       <h3 className="text-xs font-black">پیش‌بینی تراز و احتمال قبولی نهایی</h3>
                       <TrendingUp size={16} className="text-indigo-300" />
                    </div>
                    <div className="h-[180px] -mx-2">
                       <ResponsiveContainer width="100%" height="100%">
                         <AreaChart data={predictiveTrazData}>
                           <defs>
                             <linearGradient id="colorTraz" x1="0" y1="0" x2="0" y2="1">
                               <stop offset="5%" stopColor="#818cf8" stopOpacity={0.8}/>
                               <stop offset="95%" stopColor="#818cf8" stopOpacity={0}/>
                             </linearGradient>
                           </defs>
                           <XAxis dataKey="period" stroke="#94a3b8" fontSize={8} tickLine={false} axisLine={false} />
                           <YAxis hide domain={[3000, 9000]} />
                           <Tooltip 
                             contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '12px', fontSize: '10px', color: '#fff' }}
                             itemStyle={{ color: '#818cf8' }}
                           />
                           <Area 
                             type="monotone" 
                             dataKey="score" 
                             stroke="#818cf8" 
                             strokeWidth={3}
                             fillOpacity={1} 
                             fill="url(#colorTraz)" 
                             connectNulls
                           />
                           <Area 
                             type="monotone" 
                             dataKey="predicted" 
                             stroke="#fde047" 
                             strokeWidth={3}
                             strokeDasharray="5 5"
                             fill="transparent"
                             connectNulls
                           />
                         </AreaChart>
                       </ResponsiveContainer>
                    </div>
                    <div className="space-y-2">
                       <div className="flex justify-between items-center text-[10px]">
                          <span className="text-slate-400 font-bold">احتمال قبولی در کانون وکلا:</span>
                          <span className="text-emerald-400 font-black">۸۴٪ (بسیار بالا)</span>
                       </div>
                       <div className="w-full bg-white/10 h-1 rounded-full overflow-hidden">
                          <div className="bg-emerald-500 h-full w-[84%] shadow-[0_0_8px_rgba(16,185,129,0.6)]" />
                       </div>
                       <p className="text-[9px] text-slate-400 leading-relaxed font-medium">
                         تحلیل رفتار داوطلب نشان‌دهنده شیب صعودی پایدار است. با حفظ روند فعلی در دروس قوانین خاص، تراز هدف ۸هزار در دسترس خواهد بود.
                       </p>
                    </div>
                  </div>
                </div>

                {/* Right side leads database */}
                <div className="space-y-4 lg:col-span-2">
                  <div className="flex justify-between items-center bg-slate-50 p-4 rounded-xl border border-slate-100">
                    <div className="relative w-72">
                      <input 
                        type="text"
                        value={crmSearch}
                        onChange={(e) => setCrmSearch(e.target.value)}
                        placeholder="جستجوی داوطلب یا لاین تحصیلی..."
                        className="w-full bg-white border border-slate-200 rounded-xl pr-9 pl-3 py-2 text-xs font-semibold text-slate-800 text-right focus:outline-none focus:ring-1 focus:ring-blue-900"
                      />
                      <Search size={14} className="absolute right-3 top-3 text-slate-400" />
                    </div>
                    <span className="text-[10px] font-bold text-slate-405">تعداد پرونده‌های تلفنی: {leads.length} پرونده</span>
                  </div>

                  <div className="overflow-x-auto rounded-2xl border border-slate-105 shadow-sm bg-white">
                    <table className="w-full text-right border-collapse text-xs">
                      <thead>
                        <tr className="bg-slate-50 text-slate-500 font-bold border-b border-slate-100">
                          <th className="py-3 px-4">شناسه پرونده</th>
                          <th className="py-3 px-4">نام داوطلب علمی</th>
                          <th className="py-3 px-4">لاین مورد نظر</th>
                          <th className="py-3 px-4">آخرین تراز تستی</th>
                          <th className="py-3 px-4">وضعیت داوطلب</th>
                          <th className="py-3 px-4">حذف</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 font-sans">
                        {filteredLeads.map((cust) => (
                          <tr key={cust.id} className="hover:bg-slate-50/50 transition whitespace-nowrap font-sans">
                            <td className="py-3.5 px-4 font-mono font-bold text-slate-400">{cust.id}</td>
                            <td className="py-3.5 px-4 font-extrabold text-slate-900">{cust.name}</td>
                            <td className="py-3.5 px-4">
                              <span className="px-2 py-0.5 bg-blue-50 text-blue-955 rounded-md font-black">{cust.field}</span>
                            </td>
                            <td className="py-3.5 px-4 font-mono font-bold">{cust.recentScore}</td>
                            <td className="py-3.5 px-4">
                              <span className={`px-2 py-0.5 text-[9.5px] font-black rounded-full border ${
                                cust.status === "ثبت‌نام قطعی" 
                                  ? "bg-emerald-50 text-emerald-800 border-emerald-100" 
                                  : "bg-amber-50 text-amber-800 border-amber-100"
                              }`}>
                                {cust.status}
                              </span>
                            </td>
                            <td className="py-3.5 px-4">
                              <button 
                                onClick={() => removeLead(cust.id)}
                                className="text-slate-400 hover:text-red-600 transition p-1"
                              >
                                <Trash size={13} />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </motion.div>
            )}

            {/* TAB 1 - CLASS & ATTENDANCE CONTROL */}
            {activeTab === 1 && (
              <motion.div
                key="tab-1"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                className="space-y-6 text-right"
              >
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
                  {courses.map((course) => (
                    <div key={course.id} className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm space-y-4 text-right">
                      <div className="flex justify-between items-start">
                        <span className="text-[10.5px] font-extrabold text-indigo-705 bg-indigo-50 border border-indigo-100 px-2 py-0.5 rounded-lg">
                          شعبه مرکزی آنلاین
                        </span>
                        <span className={`w-2.5 h-2.5 rounded-full ${
                          course.status === "در حال برگزاری" ? "bg-emerald-500 animate-pulse" : "bg-red-500"
                        }`}></span>
                      </div>

                      <div className="space-y-1">
                        <h4 className="font-extrabold text-slate-900 text-sm leading-snug">{course.name}</h4>
                        <p className="text-xs text-slate-400 font-bold">دبیر دوره: {course.instructor}</p>
                      </div>

                      <div className="space-y-2">
                        <div className="flex justify-between items-center text-[10px] font-bold text-slate-500">
                          <span>درصد رضایت علمی داوطلبان</span>
                          <span className="font-mono">{course.enrolledProgress}٪</span>
                        </div>
                        <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                          <div className="bg-emerald-600 h-full rounded-full" style={{ width: `${course.enrolledProgress}%` }}></div>
                        </div>
                      </div>

                      <div className="pt-2 border-t border-slate-105 flex items-center justify-between">
                        <button
                          onClick={() => course.status === "در حال برگزاری" ? pauseCourse(course.id) : startCourse(course.id)}
                          className={`text-[10px] font-black px-3 py-1.5 rounded-xl cursor-pointer shadow-sm transition flex items-center gap-1 ${
                            course.status === "در حال برگزاری" 
                              ? "bg-red-50 border border-red-100 text-red-700 hover:bg-red-100" 
                              : "bg-emerald-50 border border-emerald-100 text-emerald-800 hover:bg-emerald-150"
                          }`}
                        >
                          {course.status === "در حال برگزاری" ? <Pause size={11} /> : <Play size={11} />}
                          <span>{course.status === "در حال برگزاری" ? "توقف موقت وبینار" : "راه‌اندازی پخش پخش"}</span>
                        </button>

                        <span className="text-[10px] text-slate-400 font-semibold">تأخیر: {course.stopTime} دقیقه</span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Create course submit form */}
                <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100">
                  <h3 className="text-xs font-black text-slate-800 pb-4">راه‌اندازی فوری وبینار تالیفی جدید</h3>
                  <form onSubmit={handleAddNewCourseSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                    <div className="space-y-1">
                      <label className="text-[10px] text-slate-450 block font-bold">نام دوره آموزشی یا کارگاه حل تست:</label>
                      <input 
                        type="text" 
                        required
                        value={newCourseName}
                        onChange={(e) => setNewCourseName(e.target.value)}
                        className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 text-right"
                      />
                    </div>
                    
                    <div className="space-y-1">
                      <label className="text-[10px] text-slate-450 block font-bold">ظرفیت پیش‌بینی شده پلتفرم:</label>
                      <input 
                        type="number" 
                        required
                        value={newCourseCapacity}
                        onChange={(e) => setNewCourseCapacity(Number(e.target.value))}
                        className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono font-bold text-slate-800 text-center"
                      />
                    </div>

                    <button 
                      type="submit"
                      className="bg-blue-950 hover:bg-slate-900 text-white py-2.5 rounded-xl text-xs font-bold transition shadow-sm w-full cursor-pointer"
                    >
                      تایید تاسیس و شروع وبینار چتر دانش
                    </button>
                  </form>
                </div>
              </motion.div>
            )}

            {/* TAB 2 - LAW BOOKS & LESSON INVENTORY */}
            {activeTab === 2 && (
              <motion.div
                key="tab-2"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                className="grid grid-cols-1 lg:grid-cols-3 gap-6 text-right"
              >
                {/* Adjust book stock form */}
                <div className="lg:col-span-1 bg-slate-50 p-5 rounded-2xl border border-slate-100 self-start space-y-4">
                  <h3 className="text-xs font-black text-slate-800">حواله ورود / خروج یا ترخیص کتاب</h3>
                  <form onSubmit={handleInventoryAdjust} className="space-y-4">
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setBookActionType("in")}
                        className={`py-2 px-3 rounded-xl border font-bold text-center text-xs transition cursor-pointer ${
                          bookActionType === "in" ? "bg-indigo-50 border-indigo-200 text-indigo-900" : "bg-white text-slate-500"
                        }`}
                      >
                        ورود به انبار (چاپ جدید)
                      </button>
                      <button
                        type="button"
                        onClick={() => setBookActionType("out")}
                        className={`py-2 px-3 rounded-xl border font-bold text-center text-xs transition cursor-pointer ${
                          bookActionType === "out" ? "bg-rose-50 border-rose-200 text-rose-900" : "bg-white text-slate-500"
                        }`}
                      >
                        صدور حواله (ارسالی داوطلب)
                      </button>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10.5px] text-slate-450 block font-bold">کتاب یا درسنامه مرجع:</label>
                      <select
                        value={bookItemSelect}
                        onChange={(e) => setBookItemSelect(e.target.value)}
                        className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2.5 text-xs text-slate-705 text-right font-bold focus:outline-none"
                      >
                        {books.map(b => (
                          <option key={b.id} value={b.id}>{b.name}</option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10.5px] text-slate-450 block font-bold">تعداد حواله شده (جلد):</label>
                      <input 
                        type="number"
                        min={1}
                        value={bookQtyInput}
                        onChange={(e) => setBookQtyInput(Number(e.target.value))}
                        className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono font-bold text-center"
                      />
                    </div>

                    <button
                      type="submit"
                      className="w-full bg-blue-950 hover:bg-slate-900 text-white py-2.5 rounded-xl font-bold text-xs transition shadow-sm cursor-pointer"
                    >
                      اعمال پایش و ثبت دفتر کل انبار
                    </button>
                  </form>
                </div>

                {/* Book stock database table */}
                <div className="lg:col-span-2 space-y-4">
                  <div className="flex justify-between items-center bg-slate-50 p-4 rounded-xl border border-slate-100">
                    <div className="relative w-80">
                      <input 
                        type="text"
                        value={inventorySearch}
                        onChange={(e) => setInventorySearch(e.target.value)}
                        placeholder="جستجوی درسنامه‌ها، کتب یا قفسه انبار..."
                        className="w-full bg-white border border-slate-202 rounded-xl pr-9 pl-3 py-2 text-xs text-slate-800 text-right focus:outline-none"
                      />
                      <Search size={14} className="absolute right-3 top-3 text-slate-400" />
                    </div>
                  </div>

                  <div className="overflow-x-auto rounded-2xl border border-slate-100 bg-white shadow-sm">
                    <table className="w-full text-right border-collapse text-xs">
                      <thead>
                        <tr className="bg-slate-50 text-slate-500 font-bold border-b border-slate-100">
                          <th className="py-3 px-4">کد موجودی</th>
                          <th className="py-3 px-4">نام مکتوب یا جزوه وکالت</th>
                          <th className="py-3 px-4">موجودی فعلی</th>
                          <th className="py-3 px-4">موقعیت انبار انقلاب</th>
                          <th className="py-3 px-4">آلارم شارژ انبار</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 font-sans">
                        {filteredBooks.map((b) => {
                          const isWarning = b.currentStock < b.reorderPoint;
                          return (
                            <tr key={b.id} className="hover:bg-slate-55 transition whitespace-nowrap">
                              <td className="py-3.5 px-4 font-mono text-slate-400 font-bold">{b.id}</td>
                              <td className="py-3.5 px-4 font-black text-slate-800">{b.name}</td>
                              <td className="py-3.5 px-4 font-mono font-bold text-slate-900">{formatNum(b.currentStock)} {b.unit}</td>
                              <td className="py-3.5 px-4 text-indigo-750 font-bold">{b.shelfLocation}</td>
                              <td className="py-3.5 px-4">
                                <span className={`px-2 py-0.5 text-[9.5px] font-black rounded-full border ${
                                  isWarning ? "bg-red-50 text-red-705 border-red-100 animate-pulse" : "bg-emerald-50 text-emerald-805 border-emerald-100"
                                }`}>
                                  {isWarning ? "نیازمند چاپ فوری" : "موجود کافی"}
                                </span>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              </motion.div>
            )}

            {/* TAB 3 - BOOK ORDERS AND TRANSACTIONS */}
            {activeTab === 3 && (
              <motion.div
                key="tab-3"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                className="space-y-4 text-right"
              >
                <div className="flex justify-between items-center bg-slate-50 p-4 rounded-xl border border-slate-100 flex-wrap gap-2">
                  <div className="flex gap-2">
                    {["همه", "پرداخت شده", "معوق", "لغو شده"].map((st) => (
                      <button
                        key={st}
                        onClick={() => setOrdersFilter(st)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer transition ${
                          ordersFilter === st ? "bg-blue-950 text-white" : "bg-white text-slate-500 border border-slate-100"
                        }`}
                      >
                        {st}
                      </button>
                    ))}
                  </div>

                  <span className="text-xs text-slate-400 font-bold">مجموع در آمدهای ثبت شده: {orders.length} رسید حواله</span>
                </div>

                <div className="overflow-x-auto rounded-2xl border border-slate-100 bg-white">
                  <table className="w-full text-right border-collapse text-xs">
                    <thead>
                      <tr className="bg-slate-50 text-slate-500 font-bold border-b border-slate-100">
                        <th className="py-3 px-4 text-right">شماره سند حواله</th>
                        <th className="py-3 px-4 text-right">نام داوطلب / خریدار کتاب</th>
                        <th className="py-3 px-4 text-right">تاریخ فاکتور</th>
                        <th className="py-3 px-4 text-right">کتاب درخواستی</th>
                        <th className="py-3 px-4 text-right">مبلغ پرداختی</th>
                        <th className="py-3 px-4 text-right">وضعیت تراکنش</th>
                        <th className="py-3 px-4 text-right">درگاه اتصال واسط</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-sans">
                      {filteredOrders.map((ord) => (
                        <tr key={ord.id} className="hover:bg-slate-50 transition whitespace-nowrap">
                          <td className="py-3.5 px-4 font-mono text-slate-400 font-bold text-right">{ord.id}</td>
                          <td className="py-3.5 px-4 font-extrabold text-slate-800 text-right">{ord.client}</td>
                          <td className="py-3.5 px-4 text-right font-mono text-[10.5px]">{ord.date}</td>
                          <td className="py-3.5 px-4 text-right font-semibold text-slate-705 truncate max-w-[200px]">{ord.bookName}</td>
                          <td className="py-3.5 px-4 font-mono font-black text-slate-900 text-right">{ord.amount} میلیون</td>
                          <td className="py-3.5 px-4 text-right">
                            <span className={`px-2 py-0.5 text-[9.5px] font-black rounded-full border ${
                              ord.status === "پرداخت شده" 
                                ? "bg-emerald-50 text-emerald-800 border-emerald-100" 
                                : ord.status === "معوق" 
                                ? "bg-amber-50 text-amber-800 border-amber-100" 
                                : "bg-red-50 text-red-800 border-red-100 animate-pulse"
                            }`}>
                              {ord.status}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-[10.5px] text-slate-400 text-right font-sans">{ord.channel}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </motion.div>
            )}

            {/* TAB 4 - URBAN LOGISTICS & DISPATCH COURIERS */}
            {activeTab === 4 && (
              <motion.div
                key="tab-4"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                className="grid grid-cols-1 lg:grid-cols-3 gap-6 text-right"
              >
                {/* Dispatch form (Left column) */}
                <div className="lg:col-span-1 space-y-4">
                  <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100 space-y-4">
                    <h3 className="text-xs font-black text-slate-800 flex items-center gap-1.5">
                      <Truck size={14} />
                      <span>اعزام پیک تحویل کتاب و جزوات</span>
                    </h3>

                    <form onSubmit={dispatchCourierWorkflow} className="space-y-3.5">
                      <div className="space-y-1">
                        <label className="text-[10.5px] text-slate-450 block font-bold">نام پیک مسئول:</label>
                        <input 
                          type="text"
                          required
                          value={messengerName}
                          onChange={(e) => setMessengerName(e.target.value)}
                          placeholder="مثال: عباس محمدی"
                          className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 text-right focus:outline-none"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div className="space-y-1">
                          <label className="text-[10.5px] text-slate-450 block font-bold">وسیله نقلیه:</label>
                          <select
                            value={deliveryVehicle}
                            onChange={(e) => setDeliveryVehicle(e.target.value)}
                            className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-extrabold text-slate-700 focus:outline-none text-right"
                          >
                            <option value="پیک موتور شهری">پیک موتور شهری</option>
                            <option value="وانت سبک شهری">وانت سبک شهری</option>
                            <option value="پست پیشتاز">پست پیشتاز کشوری</option>
                          </select>
                        </div>
                        
                        <div className="space-y-1">
                          <label className="text-[10.5px] text-slate-450 block font-bold">شماره سفارش:</label>
                          <select
                            value={assignedOrderId}
                            onChange={(e) => setAssignedOrderId(e.target.value)}
                            className="w-full bg-white border border-slate-200 rounded-xl px-2 py-2 text-[10.5px] font-mono text-center focus:outline-none"
                          >
                            <option value="O-503">O-503 (معوق)</option>
                            <option value="O-505">O-505 (لغو شده)</option>
                          </select>
                        </div>
                      </div>

                      <button
                        type="submit"
                        className="w-full bg-blue-950 hover:bg-slate-900 text-white font-bold text-xs py-2.5 rounded-xl transition cursor-pointer shadow-sm"
                      >
                        صدور بارنامه و اعزام پیک
                      </button>
                    </form>
                  </div>

                  {/* Toast alerts */}
                  {showDispatchToast && (
                    <div className="p-3.5 bg-indigo-50 text-indigo-900 rounded-xl border border-indigo-100 text-xs leading-relaxed animate-pulse">
                      ✓ بارنامه دیجیتال با موفقیت در چتر دانش صادر گردید! مسیر پیک بلافاصله بر روی ردیاب ماهواره‌ای به کار گرفته شد.
                    </div>
                  )}

                  {/* Customer feedback simulation */}
                  <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100 space-y-4">
                    <h3 className="text-xs font-black text-slate-800">تأییدیه الکترونیک تحویل داوطلب</h3>
                    <form onSubmit={submitStudentSignatureAndFeedback} className="space-y-3.5">
                      <div className="space-y-1">
                        <label className="text-[10.5px] text-slate-450 block font-bold">کد مسیر تحویلی مکرر:</label>
                        <select
                          value={assignedRouteId}
                          onChange={(e) => setAssignedRouteId(e.target.value)}
                          className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono font-bold text-center"
                        >
                          <option value="R-1">تحویل به امیرحسین رضایی (R-1)</option>
                          <option value="R-2">وانبد انقلاب به غرب (R-2)</option>
                        </select>
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10.5px] text-slate-450 block font-bold">بازخورد چفت کیفی داوطلب:</label>
                        <input 
                          type="text"
                          required
                          value={feedbackText}
                          onChange={(e) => setFeedbackText(e.target.value)}
                          placeholder="مثال: بسته بندی عالی و کتاب طلایی رسید"
                          className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 text-right font-bold focus:outline-none"
                        />
                      </div>

                      <div className="flex items-center gap-2">
                        <input 
                          type="checkbox" 
                          id="chk-sign" 
                          checked={studentSigned}
                          onChange={(e) => setStudentSigned(e.target.checked)}
                          className="w-4 h-4 cursor-pointer"
                        />
                        <label htmlFor="chk-sign" className="text-[10px] text-slate-650 cursor-pointer font-bold">امضای دیجیتال داوطلب اخذ گردید</label>
                      </div>

                      <button
                        type="submit"
                        disabled={!studentSigned || !feedbackText.trim()}
                        className="w-full bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs py-2.5 rounded-xl transition shadow-sm disabled:opacity-50 cursor-pointer"
                      >
                        ثبت نهایی امضاء و تحویل قطعی
                      </button>
                    </form>
                  </div>

                  {showSignatureToast && (
                    <div className="p-3.5 bg-emerald-50 text-emerald-900 rounded-xl border border-emerald-100 text-xs animate-bounce">
                      ✓ امضای الکترونیک دانشجو ثبت شد و مسیر R-1 چتر دانش در وضعیت 'تکمیل شده' طبقه‌بندی گردید.
                    </div>
                  )}
                </div>

                {/* Dispatch Monitor routes */}
                <div className="lg:col-span-2 space-y-4">
                  <h3 className="text-xs font-black text-slate-800">مانیتورینگ برخط ناوگان و پیک حومه تهران چتر دانش</h3>
                  <div className="space-y-3.5">
                    {deliveryRoutes.map((route, idx) => (
                      <div key={route.id} className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm space-y-3 text-right">
                        <div className="flex justify-between items-center flex-wrap gap-2 text-right">
                          <span className="font-mono text-xs font-black text-indigo-950">{route.id}</span>
                          <span className="text-[11.5px] font-black text-slate-800 leading-normal">{route.text}</span>
                          <span className={`px-2 py-0.5 text-[9px] font-black border rounded-lg ${
                            route.status === "تکمیل شده" ? "bg-emerald-50 text-emerald-800 border-emerald-100" : "bg-blue-50 text-blue-900 border-indigo-100 animate-pulse"
                          }`}>
                            {route.status}
                          </span>
                        </div>

                        <div className="space-y-1">
                          <div className="flex justify-between text-[10px] text-slate-400 font-bold">
                            <span>درصد پیشرفت فیزیکی توزیع مأمور</span>
                            <span>{toPersianNum(route.progress)}٪</span>
                          </div>
                          <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                            <motion.div 
                              initial={{ width: 0 }}
                              animate={{ width: `${route.progress}%` }}
                              className="bg-indigo-650 h-full rounded-full"
                            />
                          </div>
                        </div>

                        <div className="flex justify-between items-center text-[10px] text-slate-400 pt-1">
                          <span>طول مسیر پیش‌فرض: {route.totalKM} کیلومتر</span>
                          <span>تخمینی: {route.estMinutes} دقیقه دیگر جهت تحویل</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {/* TAB 5 - QC QUALITY CONTROL AUDIT */}
            {activeTab === 5 && (
              <motion.div
                key="tab-5"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                className="space-y-6 text-right"
              >
                <div className="bg-indigo-50/50 p-5 rounded-2xl border border-indigo-100/40 text-right flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div className="space-y-0.5">
                    <h3 className="text-xs font-black text-indigo-950">کنترل ممیزی و استاندارد سوالات آزمون‌های آزمایشی</h3>
                    <p className="text-[11px] text-indigo-700">پایش سوالات طرح شده اساتید چتر دانش از فیلتر عدم تداخل مباحث علمی کانون وکلا</p>
                  </div>
                  <button 
                    onClick={handleAuditSubmit}
                    className="bg-indigo-705 hover:bg-slate-900 text-white font-bold text-xs py-2 px-4 rounded-xl shadow-md transition cursor-pointer font-sans"
                  >
                    ثبت صورت‌جلسه عیوب امشب
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {audits.map((aud) => (
                    <div key={aud.id} className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm space-y-4 text-right">
                      <div className="flex justify-between items-center border-b pb-2 border-slate-100 flex-wrap gap-2 text-right">
                        <div>
                          <span className="font-mono text-xs font-extrabold text-slate-400 block">{aud.id}</span>
                          <h4 className="font-black text-slate-800 text-xs">{aud.lessonName}</h4>
                        </div>
                        <span className={`px-2.5 py-1 text-[9px] font-black border rounded-full ${
                          aud.failedReason === "سالم" ? "bg-emerald-50 text-emerald-800 border-emerald-100" : "bg-red-50 text-red-705 border-red-150 animate-pulse"
                        }`}>
                          عیب عارضه: {aud.failedReason}
                        </span>
                      </div>

                      <div className="grid grid-cols-3 gap-2 text-center text-[11px] bg-slate-50 p-3 rounded-xl font-bold">
                        <div>
                          <span className="text-slate-400 block text-[9.5px]">پرسش ممیزی شده</span>
                          <strong className="text-slate-850 font-mono text-xs">{aud.testedCount} سوال</strong>
                        </div>
                        <div>
                          <span className="text-emerald-600 block text-[9.5px]">تایید شده استاندارد</span>
                          <strong className="text-emerald-800 font-mono text-xs">{aud.passedCount} سوال</strong>
                        </div>
                        <div>
                          <span className="text-red-500 block text-[9.5px]">مرجوعی اصلاح</span>
                          <strong className="text-red-700 font-mono text-xs">{aud.testedCount - aud.passedCount} سوال</strong>
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1">
                        <span>بازرس مسئول: {aud.operator}</span>
                        <span>موسسه علمی چتر دانش</span>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* TAB 6 - CRM ACCOUNT MANAGEMENT (Implemented Missing Tab) */}
            {activeTab === 6 && (
              <motion.div
                key="tab-6"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                className="grid grid-cols-1 lg:grid-cols-3 gap-6 text-right"
              >
                {/* Add new account form */}
                <div className="lg:col-span-1 bg-slate-50 p-5 rounded-2xl border border-slate-100 self-start space-y-4">
                  <h3 className="text-xs font-black text-slate-800 flex items-center gap-2">
                    <Plus size={14} className="text-indigo-600" />
                    <span>ایجاد حساب کاربری CRM جدید</span>
                  </h3>
                  <div className="space-y-3.5">
                    <div className="space-y-1">
                      <label className="text-[10px] text-slate-450 block font-bold">نام کاربری سامانه:</label>
                      <input 
                        type="text"
                        value={newAccUser}
                        onChange={(e) => setNewAccUser(e.target.value)}
                        placeholder="مثال: support_danial"
                        className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono font-bold text-slate-800"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] text-slate-450 block font-bold">نقش سازمانی و سطح دسترسی:</label>
                      <select
                        value={newAccRole}
                        onChange={(e: any) => setNewAccRole(e.target.value)}
                        className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-black text-slate-700 focus:outline-none text-right"
                      >
                        <option value="کارشناس آموزش">کارشناس آموزش</option>
                        <option value="اپراتور فروش">اپراتور فروش</option>
                        <option value="پشتیبان فنی">پشتیبان فنی</option>
                        <option value="مدیر ارشد">مدیر ارشد سامانه</option>
                      </select>
                    </div>
                    <button
                      onClick={addCrmAccount}
                      className="w-full bg-blue-950 hover:bg-slate-900 text-white font-bold text-xs py-2.5 rounded-xl transition shadow-sm cursor-pointer"
                    >
                      تایید و ایجاد دسترسی امن
                    </button>
                  </div>

                  <div className="p-4 bg-amber-50 rounded-xl border border-amber-100 text-[9px] text-amber-800 leading-normal font-bold">
                    ⚠️ توجه: حساب‌های کاربری جدید بلافاصله با سطح امنیتی Admin-v2 مانیتور شده و هرگونه لاگین از آی‌پی‌های مشکوک مسدود می‌گردد.
                  </div>
                </div>

                {/* Account list database */}
                <div className="lg:col-span-2 space-y-4">
                   <h3 className="text-xs font-black text-slate-800">لیست کاربران فعال و اپراتورهای CRM مانوا</h3>
                   <div className="overflow-x-auto rounded-2xl border border-slate-100 bg-white shadow-sm font-sans">
                     <table className="w-full text-right border-collapse text-xs">
                       <thead>
                         <tr className="bg-slate-50 text-slate-500 font-bold border-b border-slate-100">
                           <th className="py-3 px-4">شناسه اکانت</th>
                           <th className="py-3 px-4">نام کاربری</th>
                           <th className="py-3 px-4">نقش سیستمی</th>
                           <th className="py-3 px-4">آخرین فعالیت</th>
                           <th className="py-3 px-4">وضعیت</th>
                         </tr>
                       </thead>
                       <tbody className="divide-y divide-slate-100">
                         {crmAccounts.map((acc) => (
                           <tr key={acc.id} className="hover:bg-slate-50/50 transition whitespace-nowrap">
                             <td className="py-3.5 px-4 font-mono text-slate-400 font-bold">{acc.id}</td>
                             <td className="py-3.5 px-4 font-black text-slate-800 font-mono text-right">{acc.username}</td>
                             <td className="py-3.5 px-4">
                               <span className="px-2 py-0.5 bg-blue-50 text-blue-900 rounded-md font-black">{acc.role}</span>
                             </td>
                             <td className="py-3.5 px-4 text-slate-500 font-bold">{acc.lastActive}</td>
                             <td className="py-3.5 px-4">
                               <div className="flex items-center gap-1.5 justify-start">
                                 <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                 <span className="text-emerald-700 font-black">فعال</span>
                               </div>
                             </td>
                           </tr>
                         ))}
                       </tbody>
                     </table>
                   </div>
                </div>
              </motion.div>
            )}

          </AnimatePresence>
        </div>
      </div>

    </div>
  );
}
