import React, { useMemo } from 'react';
import { motion } from 'motion/react';
import { Target, FileText, BadgePercent, ArrowDown, Award, TrendingUp, DollarSign } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { Deal } from '../types';

interface DealsFunnelProps {
  deals: Deal[];
}

const DealsFunnel: React.FC<DealsFunnelProps> = ({ deals }) => {
  const { themeColor, hexColor, bgClass, colorClass } = useTheme();

  // Metrics calculation
  const funnelData = useMemo(() => {
    const stages = [
      { key: 'Discovery', label: 'طرح و اکتشاف نیاز', icon: Target },
      { key: 'Proposal', label: 'ارائه پیشنهاد پروپوزال', icon: FileText },
      { key: 'Negotiation', label: 'مذاکره و توافق نهایی', icon: BadgePercent },
      { key: 'Closed Won', label: 'موفقیت و عقد قرارداد', icon: Award },
    ];

    const counts = { Discovery: 0, Proposal: 0, Negotiation: 0, 'Closed Won': 0, 'Closed Lost': 0 };
    const values = { Discovery: 0, Proposal: 0, Negotiation: 0, 'Closed Won': 0, 'Closed Lost': 0 };

    deals.forEach(deal => {
      if (deal.stage in counts) {
        counts[deal.stage as keyof typeof counts] += 1;
        values[deal.stage as keyof typeof values] += deal.value;
      }
    });

    // Subtotal or conversion calculations
    // In a logical sales funnel, we analyze the current state of products
    // We can show the total count or cumulative count
    let cumulativeCount = 0;
    const items = stages.map((stage, index) => {
      const activeCount = counts[stage.key as keyof typeof counts] || 0;
      const activeValue = values[stage.key as keyof typeof values] || 0;
      
      return {
        ...stage,
        count: activeCount,
        value: activeValue,
      };
    });

    // Find the max count or value to calibrate width scaling
    const maxVal = Math.max(...items.map(item => item.value), 1);
    const maxCount = Math.max(...items.map(item => item.count), 1);

    return items.map((item, idx) => {
      // Conversion rate to the next stage
      const nextItem = items[idx + 1];
      const nextConversion = nextItem && item.count > 0 
        ? Math.round((nextItem.count / item.count) * 100) 
        : null;

      // Rate from original discovery
      const topCount = items[0].count;
      const overallConversion = topCount > 0 
        ? Math.round((item.count / topCount) * 100) 
        : 0;

      // Render percentage width of widest bar (use count or value for scaling)
      const widthPercent = maxCount > 0 ? (item.count / maxCount) * 100 : 25;
      
      return {
        ...item,
        widthPercent: Math.max(widthPercent, 35), // Ensure a minimum visible width
        nextConversion,
        overallConversion
      };
    });
  }, [deals]);

  // Overall calculations for productivity cards
  const summaryMetrics = useMemo(() => {
    const totalDeals = deals.length;
    const wonDeals = deals.filter(d => d.stage === 'Closed Won');
    const lostDeals = deals.filter(d => d.stage === 'Closed Lost');
    
    const winRate = totalDeals > 0 
      ? Math.round((wonDeals.length / (totalDeals - lostDeals.length || 1)) * 100) 
      : 0;

    const pipelineValue = deals
      .filter(d => d.stage !== 'Closed Won' && d.stage !== 'Closed Lost')
      .reduce((sum, d) => sum + d.value, 0);

    const averageDealValue = totalDeals > 0
      ? Math.round(deals.reduce((sum, d) => sum + d.value, 0) / totalDeals)
      : 0;

    return {
      winRate,
      pipelineValue,
      averageDealValue,
      totalDeals,
      wonCount: wonDeals.length
    };
  }, [deals]);

  const getSoftBgClass = () => {
    switch (bgClass) {
      case 'bg-blue-600': return 'bg-blue-50';
      case 'bg-emerald-600': return 'bg-emerald-50';
      case 'bg-purple-600': return 'bg-purple-50';
      case 'bg-amber-600': return 'bg-amber-50';
      default: return 'bg-indigo-50';
    }
  };

  const getOppositeHex = () => {
    switch (themeColor) {
      case 'blue': return '#0284c7';
      case 'emerald': return '#059669';
      case 'purple': return '#7c3aed';
      case 'amber': return '#d97706';
      default: return '#6366f1';
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8" dir="rtl">
      {/* Visual Funnel Panel */}
      <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-between">
        <div>
          <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <TrendingUp size={20} className={colorClass} />
            قیف تعاملی فروش و تبدیل فرصت‌ها
          </h3>
          <p className="text-xs text-gray-400 mt-1">
            تجسم پویای تعداد کل فرصت‌ها در هر فاز قیف و راندمان ریزش سرنخ‌ها
          </p>
        </div>

        {/* Funnel visual body */}
        <div className="space-y-4 my-8 relative">
          {funnelData.map((stage, idx) => {
            const Icon = stage.icon;
            return (
              <div key={stage.key} className="flex flex-col items-center">
                <div className="w-full flex items-center justify-between gap-4">
                  {/* Stage Details */}
                  <div className="w-1/3 text-right">
                    <span className="flex items-center gap-2 text-sm font-bold text-gray-800">
                      <span className={`p-1.5 rounded-lg ${getSoftBgClass()} ${colorClass}`}>
                        <Icon size={14} />
                      </span>
                      {stage.label}
                    </span>
                  </div>

                  {/* Funnel Level Bar */}
                  <div className="flex-1 flex justify-center">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${stage.widthPercent}%` }}
                      transition={{ duration: 0.6, delay: idx * 0.1 }}
                      className="relative h-14 rounded-2xl shadow-sm hover:shadow-md transition-shadow cursor-default overflow-hidden flex items-center justify-between px-6 text-white text-xs font-semibold"
                      style={{
                        background: `linear-gradient(135deg, ${hexColor} ${100 - idx * 15}%, ${getOppositeHex()} 100%)`,
                        opacity: 1 - idx * 0.12, // subtle cascade transparency
                      }}
                    >
                      {/* Interactive sleek inner overlay */}
                      <span className="font-mono text-sm tracking-wider">
                        {stage.count} معامله
                      </span>
                      <span className="font-sans font-bold">
                        {stage.value.toLocaleString()} تومان
                      </span>
                    </motion.div>
                  </div>

                  {/* Conversion metric on the left */}
                  <div className="w-1/4 text-left">
                    <div className="flex flex-col items-end">
                      <span className="text-sm font-extrabold text-gray-900 font-mono">
                        {stage.overallConversion}%
                      </span>
                      <span className="text-[10px] text-gray-400">سهم از کل</span>
                    </div>
                  </div>
                </div>

                {/* Conversion Connector Arrow */}
                {idx < funnelData.length - 1 && stage.nextConversion !== null && (
                  <div className="flex items-center gap-1.5 my-2 text-xs font-bold text-gray-400 bg-gray-50 border border-gray-100 px-3 py-1.5 rounded-full shadow-inner">
                    <ArrowDown size={12} className={colorClass} />
                    <span>نرخ گذار به مرحله بعد: </span>
                    <span className={`font-mono ${colorClass}`}>{stage.nextConversion}%</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div className="pt-4 border-t border-gray-50 flex items-center justify-between text-[11px] text-gray-400">
          <span>هر بار تغییر فیلتر زمان، نمودار قیف بالا را تغییر می‌دهد.</span>
          <span>دروازه بهینه‌سازی فروش</span>
        </div>
      </div>

      {/* Sales Team Productivity & Insights Panel */}
      <div className="flex flex-col gap-6">
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex-1 flex flex-col justify-between">
          <div>
            <h3 className="text-base font-bold text-gray-900">بهره‌وری و شاخص‌های فروش</h3>
            <p className="text-xs text-gray-400 mt-1">تضمین کیفیت عملکرد و جریان مالی pipeline</p>
          </div>

          <div className="space-y-6 my-6">
            {/* Metric 1: Win Rate */}
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl">
              <div className="flex items-center gap-3">
                <div className={`p-2.5 rounded-xl bg-emerald-100 text-emerald-600`}>
                  <Award size={20} />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-gray-500">نرخ نهایی موفقیت</h4>
                  <p className="text-[10px] text-gray-400 mt-0.5">معاملات برنده به کل</p>
                </div>
              </div>
              <div className="text-left">
                <span className="text-2xl font-black text-emerald-600 font-mono">{summaryMetrics.winRate}%</span>
              </div>
            </div>

            {/* Metric 2: Pipeline Value */}
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl">
              <div className="flex items-center gap-3">
                <div className={`p-2.5 rounded-xl ${getSoftBgClass()} ${colorClass}`}>
                  <DollarSign size={20} />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-gray-500">ارزش کل در جریان</h4>
                  <p className="text-[10px] text-gray-400 mt-0.5">مجموع فرصت‌های فعال</p>
                </div>
              </div>
              <div className="text-left">
                <span className={`text-sm font-black font-mono ${colorClass}`}>
                  {summaryMetrics.pipelineValue.toLocaleString()} <span className="text-[10px]">تومان</span>
                </span>
              </div>
            </div>

            {/* Metric 3: Average Deal Size */}
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-amber-100 text-amber-600">
                  <Target size={20} />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-gray-500">میانگین ارزش قرارداد</h4>
                  <p className="text-[10px] text-gray-400 mt-0.5">کیفیت معاملات باز شده</p>
                </div>
              </div>
              <div className="text-left">
                <span className="text-sm font-black text-amber-600 font-mono">
                  {summaryMetrics.averageDealValue.toLocaleString()} <span className="text-[10px]">تومان</span>
                </span>
              </div>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-amber-50 border border-amber-100">
            <h4 className="text-amber-800 text-xs font-bold mb-1 flex items-center gap-1.5">
              💡 تحلیل کارایی تبدیل
            </h4>
            <p className="text-[10px] leading-relaxed text-amber-900 text-opacity-80">
              {summaryMetrics.winRate > 50 
                ? 'نرخ تبدیل فوق‌العاده بالایی دارید! بهره‌وری تیم در اقناع و نهایی‌سازی مشتریان در سطح بی‌نظیری است.' 
                : 'برای دستیابی به هدف مالی سریع‌تر، روی تبدیل فاز پروپوزال به مذاکرات نهایی تمرکز کنید.'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DealsFunnel;
