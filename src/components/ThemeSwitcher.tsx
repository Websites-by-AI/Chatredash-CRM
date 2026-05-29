import React, { useState } from 'react';
import { Palette, Check } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { motion, AnimatePresence } from 'motion/react';

const ThemeSwitcher: React.FC = () => {
  const { themeColor, setThemeColor } = useTheme();
  const [isOpen, setIsOpen] = useState(false);

  const colors: { id: any, name: string, class: string }[] = [
    { id: 'indigo', name: 'نیلی', class: 'bg-indigo-600' },
    { id: 'blue', name: 'آبی', class: 'bg-blue-600' },
    { id: 'emerald', name: 'سبز', class: 'bg-emerald-600' },
    { id: 'purple', name: 'بنفش', class: 'bg-purple-600' },
    { id: 'amber', name: 'نارنجی', class: 'bg-amber-600' },
  ];

  return (
    <div className="relative">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="p-2.5 bg-white border border-gray-200 text-gray-500 rounded-xl hover:bg-gray-50 transition-colors shadow-sm flex items-center gap-2"
        title="تغییر تم رنگی"
      >
        <Palette size={20} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            <div 
              className="fixed inset-0 z-10" 
              onClick={() => setIsOpen(false)}
            />
            <motion.div 
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              className="absolute left-0 mt-2 w-48 bg-white rounded-2xl shadow-xl border border-gray-100 p-2 z-20"
            >
              <div className="px-3 py-2 text-xs font-bold text-gray-400 uppercase tracking-wider border-b border-gray-50 mb-1">
                انتخاب رنگ اصلی
              </div>
              {colors.map((color) => (
                <button
                  key={color.id}
                  onClick={() => {
                    setThemeColor(color.id);
                    setIsOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl transition-colors ${
                    themeColor === color.id ? 'bg-gray-50' : 'hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-4 h-4 rounded-full ${color.class}`} />
                    <span className="text-sm font-medium text-gray-700">{color.name}</span>
                  </div>
                  {themeColor === color.id && <Check size={14} className="text-gray-400" />}
                </button>
              ))}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ThemeSwitcher;
