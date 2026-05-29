import React from 'react';
import { motion } from 'motion/react';
import { CheckCircle2, Clock, Calendar as CalendarIcon, Phone, Mail, Video, FileText } from 'lucide-react';
import { mockActivities } from '../data/mockData';
import { useTheme } from '../context/ThemeContext';

const Activities: React.FC = () => {
  const { colorClass, bgClass } = useTheme();

  const getSoftBgClass = () => {
    switch (bgClass) {
      case 'bg-blue-600': return 'bg-blue-50';
      case 'bg-emerald-600': return 'bg-emerald-50';
      case 'bg-purple-600': return 'bg-purple-50';
      case 'bg-amber-600': return 'bg-amber-50';
      default: return 'bg-indigo-50';
    }
  };

  const getAccentColorClass = () => {
    switch (themeColor) {
      case 'blue': return 'text-blue-600';
      case 'emerald': return 'text-emerald-600';
      case 'purple': return 'text-purple-600';
      case 'amber': return 'text-amber-600';
      default: return 'text-indigo-600';
    }
  };

  const { themeColor } = useTheme();

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'Call': return <Phone size={16} className="text-blue-500" />;
      case 'Email': return <Mail size={16} className="text-indigo-500" />;
      case 'Meeting': return <Video size={16} className="text-purple-500" />;
      case 'Task': return <FileText size={16} className="text-amber-500" />;
      default: return <Clock size={16} className="text-gray-500" />;
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-8"
      dir="rtl"
    >
      <header className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">فعالیت‌ها و وظایف</h2>
          <p className="text-sm text-gray-500 mt-1">مدیریت تماس‌ها، جلسات و تسک‌های روزانه</p>
        </div>
        <button className={`px-4 py-2 text-white rounded-xl shadow-sm hover:opacity-90 transition-colors text-sm font-medium ${bgClass}`}>
          تسک جدید
        </button>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-gray-50 flex justify-between items-center">
              <h3 className="font-bold text-gray-900">برنامه امروز</h3>
              <span className={`text-xs font-medium px-2 py-1 rounded-md ${getSoftBgClass()} ${colorClass}`}>۴ فعالیت</span>
            </div>
            
            <div className="divide-y divide-gray-50">
              {mockActivities.map((activity) => (
                <div key={activity.id} className="p-6 flex items-start gap-4 hover:bg-gray-50 transition-colors group">
                  <div className={`p-3 rounded-xl bg-gray-50 group-hover:bg-white transition-colors`}>
                    {getTypeIcon(activity.type)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <h4 className={`text-sm font-bold ${activity.done ? 'text-gray-400 line-through' : 'text-gray-900'}`}>
                        {activity.title}
                      </h4>
                      <span className="text-[10px] text-gray-400 font-mono">
                        {new Date(activity.timestamp).toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <div className="flex items-center gap-1">
                        <CalendarIcon size={12} />
                        <span>{new Date(activity.timestamp).toLocaleDateString('fa-IR')}</span>
                      </div>
                      <div className={`flex items-center gap-1 cursor-pointer transition-colors hover:${colorClass}`}>
                        <Clock size={12} />
                        <span>مشاهده جزئیات</span>
                      </div>
                    </div>
                  </div>
                  <button className={`p-2 rounded-lg transition-all ${
                    activity.done 
                      ? 'text-emerald-500 bg-emerald-50' 
                      : 'text-gray-300 hover:text-emerald-500 hover:bg-emerald-50'
                  }`}>
                    <CheckCircle2 size={20} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
            <h3 className="font-bold text-gray-900 mb-6 flex items-center gap-2">
              <CalendarIcon size={18} className={colorClass} />
              تقویم کوچک
            </h3>
            <div className="grid grid-cols-7 gap-2 text-center mb-4">
              {['ش', 'ی', 'د', 'س', 'چ', 'پ', 'ج'].map(day => (
                <span key={day} className="text-[10px] font-bold text-gray-400 uppercase">{day}</span>
              ))}
              {Array.from({ length: 31 }).map((_, i) => (
                <button 
                  key={i} 
                  className={`aspect-square flex items-center justify-center text-xs rounded-lg transition-colors ${
                    i + 1 === 28 ? `${bgClass} text-white shadow-md` : 'hover:bg-gray-50 text-gray-700'
                  }`}
                >
                  {i + 1}
                </button>
              ))}
            </div>
          </div>

          <div className={`p-6 rounded-2xl shadow-lg relative overflow-hidden group ${bgClass}`}>
            <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-white opacity-10 rounded-full group-hover:scale-110 transition-transform"></div>
            <h4 className="text-white font-bold mb-2">یادآوری هوشمند</h4>
            <p className="text-white text-opacity-80 text-xs leading-relaxed mb-4">
              فردا جلسه مهمی با شرکت فناوری نوین دارید. مستندات را بازبینی کرده‌اید؟
            </p>
            <button className={`w-full py-2 bg-white rounded-xl text-xs font-bold hover:bg-gray-50 transition-colors ${colorClass}`}>
              بررسی مستندات
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default Activities;
