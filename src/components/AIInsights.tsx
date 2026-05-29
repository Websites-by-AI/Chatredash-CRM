import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, RefreshCw, Lightbulb, TrendingUp, AlertTriangle } from 'lucide-react';
import Markdown from 'react-markdown';
import { mockContacts, mockDeals, mockSellerPerformance } from '../data/mockData';
import { useTheme } from '../context/ThemeContext';

const AIInsights: React.FC = () => {
  const [insights, setInsights] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const { themeColor } = useTheme();

  const getGradientClass = () => {
    switch (themeColor) {
      case 'blue': return 'from-blue-600 to-cyan-700';
      case 'emerald': return 'from-emerald-600 to-teal-700';
      case 'purple': return 'from-purple-600 to-pink-700';
      case 'amber': return 'from-amber-600 to-yellow-700';
      default: return 'from-indigo-600 to-violet-700';
    }
  };

  const getSoftTextClass = () => {
    switch (themeColor) {
      case 'blue': return 'text-blue-100';
      case 'emerald': return 'text-emerald-100';
      case 'purple': return 'text-purple-100';
      case 'amber': return 'text-amber-100';
      default: return 'text-indigo-100';
    }
  };

  const fetchInsights = async () => {
    setLoading(true);
    setError(false);
    try {
      const response = await fetch('/api/crm/insights', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          data: {
            contactsCount: mockContacts.length,
            deals: mockDeals.map(d => ({ title: d.title, value: d.value, stage: d.stage })),
            performance: mockSellerPerformance
          }
        })
      });
      const data = await response.json();
      if (data.insights) {
        setInsights(data.insights);
      } else {
        setError(true);
      }
    } catch (err) {
      console.error(err);
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInsights();
  }, []);

  return (
    <div className={`bg-gradient-to-br ${getGradientClass()} rounded-3xl p-8 text-white shadow-xl relative overflow-hidden group`}>
      <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:rotate-12 transition-transform duration-500">
        <Sparkles size={120} />
      </div>
      
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-white bg-opacity-20 backdrop-blur-md rounded-xl">
              <Sparkles size={24} className="text-amber-300" />
            </div>
            <div>
              <h3 className="text-xl font-bold">تحلیلگر هوشمند Gemini</h3>
              <p className={`${getSoftTextClass()} text-xs`}>استراتژی‌های پیشنهادی برای رشد کسب‌و‌کار</p>
            </div>
          </div>
          <button 
            onClick={fetchInsights}
            disabled={loading}
            className="p-2 hover:bg-white hover:bg-opacity-10 rounded-full transition-all disabled:opacity-50"
          >
            <RefreshCw size={20} className={`${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>

        <div className="min-h-[140px] flex flex-col justify-center">
          <AnimatePresence mode="wait">
            {loading ? (
              <motion.div 
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center gap-3 py-6"
              >
                <div className="flex gap-1.5">
                  <div className="w-2 h-2 bg-white bg-opacity-60 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                  <div className="w-2 h-2 bg-white bg-opacity-40 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                  <div className="w-2 h-2 bg-white bg-opacity-20 rounded-full animate-bounce"></div>
                </div>
                <p className={`text-xs ${getSoftTextClass()} font-medium tracking-wide`}>در حال پردازش داده‌ها و تولید استراتژی...</p>
              </motion.div>
            ) : error ? (
              <motion.div 
                key="error"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex items-center gap-3 p-4 bg-red-400 bg-opacity-20 rounded-2xl border border-red-400 border-opacity-30"
              >
                <AlertTriangle className="text-red-300" size={24} />
                <p className="text-sm">مشکلی در دریافت تحلیل‌ها پیش آمد. لطفا دوباره تلاش کنید.</p>
              </motion.div>
            ) : (
              <motion.div 
                key="content"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                className="prose prose-invert max-w-none prose-sm"
              >
                <div className="bg-white bg-opacity-5 backdrop-blur-sm rounded-2xl p-6 border border-white border-opacity-10 shadow-inner">
                  <Markdown components={{
                    ul: ({ children }) => <ul className="list-none p-0 m-0 space-y-4">{children}</ul>,
                    li: ({ children }) => (
                      <li className="flex items-start gap-3 m-0">
                        <div className="mt-1 p-1 bg-amber-400 bg-opacity-20 rounded-md">
                          <Lightbulb size={14} className="text-amber-300" />
                        </div>
                        <span className="leading-relaxed text-white text-opacity-90">{children}</span>
                      </li>
                    ),
                    p: ({ children }) => <p className={`mb-4 ${getSoftTextClass()} font-medium`}>{children}</p>
                  }}>
                    {insights || ''}
                  </Markdown>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className={`mt-8 pt-6 border-t border-white border-opacity-10 flex items-center justify-between text-xs ${getSoftTextClass()} text-opacity-80`}>
          <div className="flex items-center gap-2">
            <TrendingUp size={14} />
            <span>بر اساس آخرین فعالیت‌های بازار</span>
          </div>
          <span>تولید شده توسط هوش مصنوعی</span>
        </div>
      </div>
    </div>
  );
};

export default AIInsights;
