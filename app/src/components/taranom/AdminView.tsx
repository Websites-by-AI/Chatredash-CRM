import React, { useState } from "react";
import { Users, BarChart, UploadCloud, Film, Activity, Search, Filter, ShieldCheck, HeartPulse, Check } from "lucide-react";

export default function AdminView() {
  const [activeTab, setActiveTab] = useState<"students" | "analytics" | "uploads" | "content">("students");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterField, setFilterField] = useState("all");
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<string[]>([
    "کارنامه_جمعی_آزمون_قلمچی_۱۵_آبان.xlsx",
    "بودجه‌بندی_آزمون‌های_دوم_کانون.pdf"
  ]);

  const mockStudents = [
    { id: "1", name: "فاطمه حسینی", code: "9812405", field: "ریاضی فیزیک", traz: 5575, status: "فعال", advisor: "رادان" },
    { id: "2", name: "علیرضا رضایی", code: "9786431", field: "علوم تجربی", traz: 6150, status: "فعال", advisor: "رادان" },
    { id: "3", name: "امیرمحمد امیری", code: "9921477", field: "علوم انسانی", traz: 5120, status: "فعال", advisor: "یوسفی" },
    { id: "4", name: "زهرا مهدوی", code: "9834110", field: "ریاضی فیزیک", traz: 5890, status: "غیرفعال", advisor: "محبتی" },
    { id: "5", name: "نیما عباسی", code: "9965412", field: "علوم تجربی", traz: 5040, status: "فعال", advisor: "رادان" }
  ];

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const file = e.target.files[0];
    if (!file) return;

    setIsUploading(true);
    setTimeout(() => {
      setUploadedFiles((prev) => [file.name, ...prev]);
      setIsUploading(false);
      alert(`✅ فایل '${file.name}' با موفقیت در مخزن ابری ترنم مهر آپلود شد و پردازش خودکار قلم‌چی آن کلید خورد.`);
    }, 1500);
  };

  const filteredStudents = mockStudents.filter((st) => {
    const matchSearch = st.name.includes(searchTerm) || st.code.includes(searchTerm);
    const matchField = filterField === "all" || st.field === filterField;
    return matchSearch && matchField;
  });

  return (
    <div className="space-y-6" id="admin-view-container">
      {/* Top Welcome Title */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-3xl border border-slate-100 shadow-sm bg-gradient-to-tr from-indigo-50/5 via-white to-transparent">
        <div>
          <span className="text-[10px] bg-red-50 text-red-600 px-2.5 py-1 rounded-full border border-red-100 font-bold inline-block mb-1">دسترسی امن ادمین</span>
          <h2 className="text-xl font-black text-slate-900">پنل مدیریت ارشد موسسه آموزشی ترنم مهر</h2>
          <p className="text-slate-500 text-xs mt-1">مدیریت پرونده و تراز دانش‌آموزان به همراه ابزار آپلود کارنامه‌های قلم‌چی و نظارت بر پایداری مدل‌های AI</p>
        </div>
        <div className="bg-emerald-50 text-emerald-700 px-4 py-3 rounded-2xl border border-emerald-100 flex items-center gap-2">
          <ShieldCheck size={20} />
          <span className="text-xs font-bold font-sans">پروتکل امنیتی ادمین متصل است</span>
        </div>
      </div>

      {/* Grid Tabs switching */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden" id="admin-operation-panels">
        <div className="flex border-b border-slate-100 bg-slate-50/50 p-2 gap-1 overflow-x-auto">
          <button
            onClick={() => setActiveTab("students")}
            className={`flex items-center gap-2 py-3 px-6 text-sm font-semibold rounded-xl whitespace-nowrap transition cursor-pointer ${
              activeTab === "students" ? "bg-white text-blue-900 shadow-sm" : "text-slate-500 hover:text-slate-700 hover:bg-slate-100/50"
            }`}
          >
            <Users size={16} />
            <span>👥 مدیریت شناسنامه دانش‌آموزان</span>
          </button>
          <button
            onClick={() => setActiveTab("analytics")}
            className={`flex items-center gap-2 py-3 px-6 text-sm font-semibold rounded-xl whitespace-nowrap transition cursor-pointer ${
              activeTab === "analytics" ? "bg-white text-blue-900 shadow-sm" : "text-slate-500 hover:text-slate-700 hover:bg-slate-100/50"
            }`}
          >
            <BarChart size={16} />
            <span>📊 داشبورد تحلیلی تجمعی موسسه</span>
          </button>
          <button
            onClick={() => setActiveTab("uploads")}
            className={`flex items-center gap-2 py-3 px-6 text-sm font-semibold rounded-xl whitespace-nowrap transition cursor-pointer ${
              activeTab === "uploads" ? "bg-white text-blue-900 shadow-sm" : "text-slate-500 hover:text-slate-700 hover:bg-slate-100/50"
            }`}
          >
            <UploadCloud size={16} />
            <span>📤 آپلود دسته‌جمعی کارنامه‌های کانون</span>
          </button>
          <button
            onClick={() => setActiveTab("content")}
            className={`flex items-center gap-2 py-3 px-6 text-sm font-semibold rounded-xl whitespace-nowrap transition cursor-pointer ${
              activeTab === "content" ? "bg-white text-blue-900 shadow-sm" : "text-slate-500 hover:text-slate-700 hover:bg-slate-100/50"
            }`}
          >
            <Film size={16} />
            <span>📚 مدیریت فایل‌ها و ویدیوهای ترنم</span>
          </button>
        </div>

        <div className="p-6">
          {/* Tab 1: Students lists and search filters */}
          {activeTab === "students" && (
            <div className="space-y-4" id="admin-tab-students">
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <span className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-slate-400">
                    <Search size={16} />
                  </span>
                  <input
                    type="text"
                    placeholder="جستجوی نام یا کد ملی دانش‌آموز..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pr-10 pl-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-900 focus:bg-white text-slate-800"
                  />
                </div>
                <div className="flex gap-2">
                  <span className="p-2.5 bg-slate-100 text-slate-400 rounded-xl flex items-center justify-center pointer-events-none">
                    <Filter size={16} />
                  </span>
                  <select
                    value={filterField}
                    onChange={(e) => setFilterField(e.target.value)}
                    className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-xs font-semibold text-slate-700 focus:outline-none"
                  >
                    <option value="all">کلیه رشته‌ها</option>
                    <option value="ریاضی فیزیک">رشته ریاضی فیزیک</option>
                    <option value="علوم تجربی">رشته علوم تجربی</option>
                    <option value="علوم انسانی">رشته علوم انسانی</option>
                  </select>
                </div>
              </div>

              <div className="overflow-x-auto rounded-xl border border-slate-100 shadow-sm">
                <table className="w-full text-right border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-100 text-slate-600 font-bold">
                      <th className="py-4 px-6">نام و نام خانوادگی</th>
                      <th className="py-4 px-6">کد دانش‌آموزی کانون</th>
                      <th className="py-4 px-6">رشته تحصیلی</th>
                      <th className="py-4 px-6">تراز میانگین</th>
                      <th className="py-4 px-6">مشاور مسئول</th>
                      <th className="py-4 px-6">وضعیت حضور</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700">
                    {filteredStudents.map((st) => (
                      <tr key={st.id} className="hover:bg-slate-50/50 transition">
                        <td className="py-4 px-6 font-bold text-slate-850">{st.name}</td>
                        <td className="py-4 px-6 font-mono font-semibold">{st.code}</td>
                        <td className="py-4 px-6 font-medium">{st.field}</td>
                        <td className="py-4 px-6 font-mono font-bold text-blue-900">{st.traz}</td>
                        <td className="py-4 px-6">آقای {st.advisor}</td>
                        <td className="py-4 px-6">
                          <span className={`px-2 py-0.5 rounded-full font-bold border ${
                            st.status === "فعال" ? "bg-emerald-50 text-emerald-600 border-emerald-100" : "bg-slate-100 text-slate-400 border-slate-200"
                          }`}>
                            {st.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Tab 2: Analytics Dashboard */}
          {activeTab === "analytics" && (
            <div className="space-y-6" id="admin-tab-analytics">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-5 bg-slate-50 rounded-2xl border border-slate-100 space-y-2">
                  <h4 className="text-slate-400 font-bold text-xs uppercase">تراز میانگین کل دانش‌آموزان</h4>
                  <div className="text-2xl font-black text-slate-800 font-mono">۵,۶۳۵</div>
                  <p className="text-[10px] text-emerald-600">▲ ۱.۵٪ رشد مثبت نسبت به آزمون قبل</p>
                </div>

                <div className="p-5 bg-slate-50 rounded-2xl border border-slate-100 space-y-2">
                  <h4 className="text-slate-400 font-bold text-xs uppercase">پراستفاده‌ترین درس در RAG مشاور</h4>
                  <div className="text-2xl font-black text-slate-800 font-sans">حرکت‌شناسی فیزیک</div>
                  <p className="text-[10px] text-red-500">۴۲ درصد کل سوالات پرسیده شده</p>
                </div>

                <div className="p-5 bg-slate-50 rounded-2xl border border-slate-100 space-y-2">
                  <h4 className="text-slate-400 font-bold text-xs uppercase">نرخ خطای پیش‌بینی هوش مصنوعی</h4>
                  <div className="text-2xl font-black text-slate-800 font-mono">۲.۸٪</div>
                  <p className="text-[10px] text-emerald-600">دقت بسیار ممتاز و قابل قبولی فنی</p>
                </div>
              </div>

              {/* RAG statistics and health checks */}
              <div className="flex items-center gap-3 p-4 bg-emerald-50 rounded-2xl border border-emerald-100">
                <HeartPulse className="text-emerald-700 animate-pulse flex-shrink-0" size={20} />
                <div className="text-xs text-emerald-800 leading-relaxed font-semibold">
                  سلامت سیستم ترنم مهر عالی گزارش شده است. فرآیندهای RAG روی مدل `'gemini-3.5-flash'` بدون اختلال به کار خود ادامه می‌دهند.
                </div>
              </div>
            </div>
          )}

          {/* Tab 3: Uploader area */}
          {activeTab === "uploads" && (
            <div className="space-y-6" id="admin-tab-uploads">
              <div className="border-2 border-dashed border-slate-200 hover:border-blue-900 rounded-3xl p-10 transition text-center space-y-4 relative bg-slate-50/50">
                <input
                  type="file"
                  onChange={handleFileUpload}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  accept=".pdf,.xlsx,.xls"
                />
                <div className="w-16 h-16 bg-blue-50 text-blue-950 rounded-2xl flex items-center justify-center mx-auto shadow-sm">
                  <UploadCloud size={32} />
                </div>
                <div>
                  <h4 className="font-bold text-slate-850 text-base">پرونده اکسل یا PDF ترازهای کانون قلم‌چی مابقی دانش‌آموزان را آپلود کنید</h4>
                  <p className="text-slate-400 text-xs mt-1">پسوند‌های مجاز: .pdf, .xlsx, .xls (حداکثر حجم فایل ۱۰ مگابایت)</p>
                </div>
                {isUploading && (
                  <div className="text-xs text-blue-900 flex justify-center items-center gap-2">
                    <span className="w-4 h-4 border-2 border-blue-900 border-t-transparent rounded-full animate-spin"></span>
                    <span>در حال اسکن سلولی و همگام‌سازی اکسل...</span>
                  </div>
                )}
              </div>

              {/* Uploaded files list */}
              <div className="space-y-3">
                <span className="text-xs font-bold text-slate-400 block">فایل‌های پردازش‌شده کانون در ترم جاری</span>
                <div className="space-y-2">
                  {uploadedFiles.map((f, idx) => (
                    <div key={idx} className="p-4 bg-white border border-slate-100 rounded-2xl flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-700">{f}</span>
                      <span className="px-2.5 py-1 bg-emerald-50 text-emerald-700 border border-emerald-100 border-none rounded-xl text-[10px] font-black flex items-center gap-1.5">
                        <Check size={12} />
                        <span>پردازش و تفکیک شد</span>
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Tab 4: Content Manager */}
          {activeTab === "content" && (
            <div className="p-8 text-center bg-slate-50 rounded-3xl border border-slate-100 space-y-3" id="admin-tab-content">
              <Film size={40} className="mx-auto text-slate-400" />
              <h4 className="font-bold text-slate-800 text-sm">مخزن درسنامه‌ها و ویدیوهای ترنم مهر</h4>
              <p className="text-slate-400 text-xs">در این بخش قادر خواهید بود ویدیوهای آموزشی جدید ضبط شده را به کتابخانه RAG هوش مصنوعی ارجاع دهید تا مشاور ترنم به صورت خودکار به دانش‌آموزان لینک دانلود تحویل دهد.</p>
              <button 
                onClick={() => alert("امکان آپلود مستقیم ویدیو در فاز نهایی اضافه می‌شود.")}
                className="bg-blue-900 hover:bg-blue-950 text-white font-bold text-xs py-2.5 px-6 rounded-xl transition cursor-pointer"
              >
                آپلود ویدیوی جدید آموزشی
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
