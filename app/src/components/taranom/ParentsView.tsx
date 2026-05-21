import { useState } from "react";
import { MessageSquare, Bell, Sliders, TrendingUp, AlertTriangle, ShieldAlert, Check } from "lucide-react";
import { Student, ParentingAlert } from "../../lib/taranom-types";

interface ParentsViewProps {
  student: Student;
}

export default function ParentsView({ student }: ParentsViewProps) {
  const [alerts, setAlerts] = useState<ParentingAlert[]>([
    { id: "1", type: "success", message: `فرزند شما در مبحث حرکت‌شناسی فیزیک رشد عالی ۳۲٪ داشته است. تلاش او ستودنی است!`, date: "۲۹ اردیبهشت" },
    { id: "2", type: "warning", message: `افت تراز جزئی در درس حسابان (افت ۵٪) شناسایی شد. برنامه بهسازی اصلاحی صادر گردید.`, date: "۱۵ اردیبهشت" },
    { id: "3", type: "info", message: `ساعت مطالعه دیروز فرزند شما: ۶.۵ ساعت تخصصی (۱۲ تست بیشتر از میانگین هفته)`, date: "۱۴ اردیبهشت" }
  ]);

  const [notifSms, setNotifSms] = useState(true);
  const [notifDrop, setNotifDrop] = useState(true);
  const [notifProgress, setNotifProgress] = useState(true);
  const [notifCounselor, setNotifCounselor] = useState(false);

  const handleToggleSmsAlert = (config: string) => {
    if (config === "notifSms") setNotifSms(!notifSms);
    if (config === "notifDrop") setNotifDrop(!notifDrop);
    if (config === "notifProgress") setNotifProgress(!notifProgress);
    if (config === "notifCounselor") setNotifCounselor(!notifCounselor);
  };

  return (
    <div className="space-y-6" id="parents-view-container">
      {/* Visual Welcome Board */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-3xl border border-slate-100 shadow-sm bg-gradient-to-tr from-indigo-50/10 to-transparent">
        <div>
          <span className="text-[10px] font-black uppercase text-amber-600 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-100/60 inline-block mb-1.5">گزارش اختصاصی اولیاء</span>
          <h2 className="text-xl font-black text-slate-900">پنل نظارت و همیاری والدین ترنم مهر</h2>
          <p className="text-slate-500 text-xs mt-1">
             والدین گرامی؛ شما می‌توانید در این صفحه وضعیت درسی، روند مطالعه روزانه و اعلان‌های هوشمند فرزندتان <strong>{student.name}</strong> را پیگیری و پیکربندی نمایید.
          </p>
        </div>
        <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl flex items-center gap-3">
          <Bell className="text-slate-400" size={24} />
          <div>
            <span className="text-[10px] text-slate-400 font-bold block">شماره اولیای ثبت شده</span>
            <span className="text-xs font-mono font-bold text-slate-800">0912****628</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Child Statistics and alerts summary */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-4" id="parent-messages-timeline">
            <span className="font-bold text-slate-800 text-sm block flex items-center gap-1.5 border-b border-slate-50 pb-2">
              <MessageSquare className="text-blue-900" size={18} />
              <span>اعلان‌ها و پیام‌های سیستم هوشمند تحصیلی</span>
            </span>

            <div className="space-y-3">
              {alerts.map((alert) => (
                <div 
                  key={alert.id} 
                  className={`p-4 rounded-2xl border flex gap-4 items-start ${
                    alert.type === "success" 
                      ? "bg-emerald-50/40 border-emerald-100/80 text-emerald-950" 
                      : alert.type === "warning" 
                        ? "bg-red-50/40 border-red-100/80 text-red-950" 
                        : "bg-blue-50/40 border-blue-100/80 text-blue-950"
                  }`}
                >
                  <div className={`p-1.5 rounded-lg flex-shrink-0 mt-0.5 ${
                    alert.type === "success" 
                      ? "bg-emerald-600 text-white" 
                      : alert.type === "warning" 
                        ? "bg-red-600 text-white" 
                        : "bg-blue-900 text-white"
                  }`}>
                    {alert.type === "success" && <TrendingUp size={14} />}
                    {alert.type === "warning" && <AlertTriangle size={14} />}
                    {alert.type === "info" && <Bell size={14} />}
                  </div>
                  <div className="flex-1 space-y-1">
                    <p className="text-xs/relaxed font-semibold">{alert.message}</p>
                    <span className="text-[10px] text-slate-400 block font-mono font-medium">{alert.date}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Alert Configurations Box */}
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-5" id="parent-notification-switches">
          <span className="font-bold text-slate-800 text-sm block flex items-center gap-1.5 border-b border-slate-50 pb-2">
            <Sliders className="text-blue-900" size={18} />
            <span>تنظیمات هوشمند ارسال پیامک و هشدارها</span>
          </span>

          <p className="text-xs text-slate-400 leading-relaxed">
            کانال‌های ارسال نوتیفیکیشن و پیامک‌های اضطراری را به میل خودتان شخصی‌سازی یا مدیریت کنید:
          </p>

          <div className="space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-50">
              <div>
                <strong className="text-xs font-black text-slate-800 block">ارسال پیامک هفتگی ارزیابی</strong>
                <span className="text-[10px] text-slate-400 block mt-0.5">دریافت خلاصه تراز و وضعیت فرزند جمعه شب‌ها</span>
              </div>
              <button 
                onClick={() => handleToggleSmsAlert("notifSms")}
                className={`w-11 h-6 rounded-full p-1 transition flex items-center leading-none border cursor-pointer ${
                  notifSms ? "bg-blue-950 border-blue-950 flex-row-reverse" : "bg-slate-100 border-slate-200"
                }`}
              >
                <span className="w-4 h-4 bg-white rounded-full shadow-sm block"></span>
              </button>
            </div>

            <div className="flex items-center justify-between pb-3 border-b border-slate-50">
              <div>
                <strong className="text-xs font-black text-slate-800 block">هشدار افت شدید تحصیلی</strong>
                <span className="text-[10px] text-slate-400 block mt-0.5">پیام فوری در صورت افت تراز کانون بیش از ۵٪</span>
              </div>
              <button 
                onClick={() => handleToggleSmsAlert("notifDrop")}
                className={`w-11 h-6 rounded-full p-1 transition flex items-center leading-none border cursor-pointer ${
                  notifDrop ? "bg-blue-950 border-blue-950 flex-row-reverse" : "bg-slate-100 border-slate-200"
                }`}
              >
                <span className="w-4 h-4 bg-white rounded-full shadow-sm block"></span>
              </button>
            </div>

            <div className="flex items-center justify-between pb-3 border-b border-slate-50">
              <div>
                <strong className="text-xs font-black text-slate-800 block">اعلان افتخارات و استریک‌های درسی</strong>
                <span className="text-[10px] text-slate-400 block mt-0.5">اعلان تشویقی در صورت تکمیل کارهای امروز و حفظ استریک</span>
              </div>
              <button 
                onClick={() => handleToggleSmsAlert("notifProgress")}
                className={`w-11 h-6 rounded-full p-1 transition flex items-center leading-none border cursor-pointer ${
                  notifProgress ? "bg-blue-950 border-blue-950 flex-row-reverse" : "bg-slate-100 border-slate-200"
                }`}
              >
                <span className="w-4 h-4 bg-white rounded-full shadow-sm block"></span>
              </button>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <strong className="text-xs font-black text-slate-800 block">ارسال رونوشت پیام‌های مشاور AI</strong>
                <span className="text-[10px] text-slate-400 block mt-0.5">دریافت رونوشت توصیه‌های درسی آقای رادان</span>
              </div>
              <button 
                onClick={() => handleToggleSmsAlert("notifCounselor")}
                className={`w-11 h-6 rounded-full p-1 transition flex items-center leading-none border cursor-pointer ${
                  notifCounselor ? "bg-blue-950 border-blue-950 flex-row-reverse" : "bg-slate-100 border-slate-200"
                }`}
              >
                <span className="w-4 h-4 bg-white rounded-full shadow-sm block"></span>
              </button>
            </div>
          </div>

          <div className="p-4 bg-amber-50 rounded-2xl border border-amber-100 flex items-start gap-2.5">
            <ShieldAlert className="text-amber-600 flex-shrink-0 mt-0.5" size={16} />
            <div className="text-[10px] text-amber-900 leading-relaxed">
               تغییرات شما فوراً ذخیره و در سرور ترنم مهر اعمال گردید. با تشکر از تعهد شما اولیای گرامی.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
