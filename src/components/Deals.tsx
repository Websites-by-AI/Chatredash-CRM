import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { DollarSign, Calendar, ArrowRight, Filter, X } from 'lucide-react';
import { mockDeals } from '../data/mockData';
import { useTheme } from '../context/ThemeContext';
import DealsFunnel from './DealsFunnel';

const Deals: React.FC = () => {
  const { colorClass, bgClass, ringClass } = useTheme();
  const [selectedMonth, setSelectedMonth] = useState<string>('all');
  const [selectedYear, setSelectedYear] = useState<string>('2026');

  const getSoftBgClass = () => {
    switch (bgClass) {
      case 'bg-blue-600': return 'bg-blue-50';
      case 'bg-emerald-600': return 'bg-emerald-50';
      case 'bg-purple-600': return 'bg-purple-50';
      case 'bg-amber-600': return 'bg-amber-50';
      default: return 'bg-indigo-50';
    }
  };

  const filteredDeals = useMemo(() => {
    return mockDeals.filter(deal => {
      const dealDate = new Date(deal.expectedClose);
      const monthMatch = selectedMonth === 'all' || (dealDate.getMonth() + 1).toString() === selectedMonth;
      const yearMatch = selectedYear === 'all' || dealDate.getFullYear().toString() === selectedYear;
      return monthMatch && yearMatch;
    });
  }, [selectedMonth, selectedYear]);

  const totalValue = useMemo(() => {
    return filteredDeals.reduce((sum, deal) => sum + deal.value, 0);
  }, [filteredDeals]);

  const months = [
    { value: 'all', label: 'همه ماه‌ها' },
    { value: '1', label: 'ژانویه/فروردین' },
    { value: '2', label: 'فوریه/اردیبهشت' },
    { value: '3', label: 'مارس/خرداد' },
    { value: '4', label: 'آوریل/تیر' },
    { value: '5', label: 'مه/مرداد' },
    { value: '6', label: 'ژوئن/شهریور' },
    { value: '7', label: 'جولای/مهر' },
    { value: '8', label: 'اوت/آبان' },
    { value: '9', label: 'سپتامبر/آذر' },
    { value: '10', label: 'اکتبر/دی' },
    { value: '11', label: 'نوامبر/بهمن' },
    { value: '12', label: 'دسامبر/اسفند' },
  ];

  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="space-y-6"
      dir="rtl"
    >
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">فرصت‌های فروش و معاملات</h2>
          <p className="text-sm text-gray-500 mt-1">مدیریت و پیش‌بینی درآمدهای ماهانه انتخاب شده</p>
        </div>
        <div className={`px-4 py-2 rounded-xl text-sm font-bold shadow-sm border ${getSoftBgClass()} ${colorClass} ${colorClass.replace('text-', 'border-').replace('600', '100')}`}>
          مجموع ارزش فیلتر شده: {totalValue.toLocaleString()} تومان
        </div>
      </div>

      <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-2 text-gray-400">
          <Filter size={18} />
          <span className="text-xs font-bold">فیلتر زمانی:</span>
        </div>
        
        <select 
          value={selectedMonth}
          onChange={(e) => setSelectedMonth(e.target.value)}
          className={`bg-gray-50 border-none rounded-xl text-xs font-bold px-4 py-2 outline-none focus:ring-2 transition-all ${ringClass}`}
        >
          {months.map(m => (
            <option key={m.value} value={m.value}>{m.label}</option>
          ))}
        </select>

        <select 
          value={selectedYear}
          onChange={(e) => setSelectedYear(e.target.value)}
          className={`bg-gray-50 border-none rounded-xl text-xs font-bold px-4 py-2 outline-none focus:ring-2 transition-all ${ringClass}`}
        >
          <option value="all">همه سال‌ها</option>
          <option value="2026">۲۰۲۶</option>
          <option value="2025">۲۰۲۵</option>
        </select>

        {(selectedMonth !== 'all' || selectedYear !== '2026') && (
          <button 
            onClick={() => { setSelectedMonth('all'); setSelectedYear('2026'); }}
            className="flex items-center gap-1 text-[10px] font-bold text-red-500 hover:bg-red-50 px-2 py-1 rounded-lg transition-colors"
          >
            <X size={12} />
            حذف فیلتر
          </button>
        )}
      </div>

      {/* Sales Stage Funnel Chart & Productivity */}
      <DealsFunnel deals={filteredDeals} />

      {/* Detailed list of filtered deals */}
      <div className="pt-4 border-t border-gray-100">
        <h3 className="text-xl font-bold text-gray-900">لیست تفصیلی فرصت‌های فروش</h3>
        <p className="text-xs text-gray-500 mt-1">ویرایش، پیگیری وضعیت، و تاریخ‌های حدودی بسته شدن هر قرارداد</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        <AnimatePresence mode="popLayout">
          {filteredDeals.length > 0 ? (
            filteredDeals.map((deal) => (
              <motion.div 
                layout
                key={deal.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all group"
              >
                <div className="flex justify-between items-start mb-4">
                  <div className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase ${
                    deal.stage === 'Negotiation' ? 'bg-amber-100 text-amber-700' : 'bg-blue-100 text-blue-700'
                  }`}>
                    {deal.stage}
                  </div>
                  <button className="text-gray-300 group-hover:text-gray-500 transition-colors">
                    <ArrowRight size={18} />
                  </button>
                </div>
                
                <h3 className="text-lg font-bold text-gray-900 mb-2 truncate">{deal.title}</h3>
                <p className="text-sm text-gray-500 mb-6">{deal.company}</p>
                
                <div className="space-y-3 pt-4 border-t border-gray-50">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2 text-gray-500">
                      <DollarSign size={14} />
                      <span>ارزش تخمینی</span>
                    </div>
                    <span className={`font-bold ${colorClass}`}>{deal.value.toLocaleString()} تومان</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2 text-gray-500">
                      <Calendar size={14} />
                      <span>تاریخ بستن</span>
                    </div>
                    <span className="text-gray-700 font-medium">{deal.expectedClose}</span>
                  </div>
                </div>
                
                <div className="mt-6 h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                  <div 
                    className={`h-full rounded-full ${deal.stage === 'Negotiation' ? 'bg-amber-400 w-3/4' : 'bg-blue-400 w-1/2'}`}
                  ></div>
                </div>
              </motion.div>
            ))
          ) : (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="col-span-full py-12 flex flex-col items-center justify-center text-gray-400 bg-gray-50 border-2 border-dashed border-gray-100 rounded-3xl"
            >
              <Calendar size={48} className="mb-4 opacity-20" />
              <p className="text-sm font-medium">هیچ معامله‌ای برای این بازه زمانی یافت نشد.</p>
              <button 
                onClick={() => { setSelectedMonth('all'); setSelectedYear('all'); }}
                className={`mt-4 text-xs font-bold underline ${colorClass}`}
              >
                مشاهده همه معاملات
              </button>
            </motion.div>
          )}
        </AnimatePresence>
        
        {/* Placeholder for new deal */}
        <button className={`border-2 border-dashed border-gray-200 rounded-2xl p-6 flex flex-col items-center justify-center text-gray-400 hover:border-opacity-50 transition-all group hover:${colorClass.replace('text-', 'border-')} hover:${colorClass}`}>
          <div className={`w-12 h-12 rounded-full bg-gray-50 flex items-center justify-center mb-3 group-hover:${getSoftBgClass()} transition-colors`}>
            <DollarSign size={24} />
          </div>
          <span className="text-sm font-medium">ایجاد معامله جدید</span>
        </button>
      </div>
    </motion.div>
  );
};

export default Deals;
