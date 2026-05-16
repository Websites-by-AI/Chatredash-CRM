import React from 'react';
import { MapPin, Phone, Mail } from 'lucide-react';

export const Footer = () => {
  return (
    <footer id="contact" className="bg-slate-900 text-slate-200 mt-24" data-testid="site-footer">
      <div className="max-w-7xl mx-auto px-6 py-16 grid md:grid-cols-3 gap-10">
        <div>
          <div className="text-2xl font-black text-white mb-3">رتبه‌برتر</div>
          <p className="text-slate-400 text-sm leading-relaxed">
            یک طرح ملی برای تبدیل تجربه رتبه‌های برتر آزمون‌های سراسری به مسیر یادگیری و رزومه حرفه‌ای؛ با همکاری چتر دانش.
          </p>
        </div>
        <div>
          <div className="font-bold text-white mb-4">دفتر مرکزی</div>
          <ul className="space-y-3 text-sm text-slate-300">
            <li className="flex items-start gap-2">
              <MapPin className="w-4 h-4 mt-1 text-amber-400 shrink-0" />
              <span>تهران، خ. جمهوری اسلامی، خ. فخر رازی، بالاتر از لبافی نژاد، نبش کوچه انوری، پلاک ۲۷، چتر دانش</span>
            </li>
            <li className="flex items-center gap-2">
              <Phone className="w-4 h-4 text-amber-400" />
              <span className="num">021-66565066</span>
            </li>
            <li className="flex items-center gap-2">
              <Mail className="w-4 h-4 text-amber-400" />
              <span className="num">info@rotbarbartar.ir</span>
            </li>
          </ul>
        </div>
        <div>
          <div className="font-bold text-white mb-4">دسترسی سریع</div>
          <ul className="space-y-2 text-sm text-slate-300">
            <li><a href="/#about" className="hover:text-amber-400 transition">درباره طرح</a></li>
            <li><a href="/#features" className="hover:text-amber-400 transition">مسیر همکاری</a></li>
            <li><a href="/#training" className="hover:text-amber-400 transition">آموزش رایگان نیم‌ساعته</a></li>
            <li><a href="/register" className="hover:text-amber-400 transition">ثبت‌نام رتبه‌های برتر</a></li>
            <li><a href="/login" className="hover:text-amber-400 transition">ورود معرف‌ها</a></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-slate-800 py-5 text-center text-xs text-slate-500">
        © ۱۴۰۳ رتبه‌برتر — همه حقوق محفوظ است. لینک‌های دعوت ممکن است شامل پاداش معرفی باشند.
      </div>
    </footer>
  );
};

export default Footer;
