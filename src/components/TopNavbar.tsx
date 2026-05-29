import React from 'react';
import { Shield, Sparkles, Layers, Search, Bell, HelpCircle, LogOut } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import ThemeSwitcher from './ThemeSwitcher';

interface TopNavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onLogout: () => void;
}

const TopNavbar: React.FC<TopNavbarProps> = ({ activeTab, setActiveTab, onLogout }) => {
  const { themeColor, colorClass, bgClass, ringClass } = useTheme();

  const menuItems = [
    { id: 'home', label: '🎓 پرتال داوطلب کنکور (CRM)', icon: Sparkles },
    { id: 'courses', label: '👥 سامانه نظارت آنلاین والدین', icon: Shield },
    { id: 'marketplace', label: '📐 سند معماری و نقشه راه SaaS', icon: Layers },
  ];

  const getActiveTabClass = () => {
    switch (themeColor) {
      case 'blue': return 'bg-blue-50 text-blue-600 border-blue-600';
      case 'emerald': return 'bg-emerald-50 text-emerald-600 border-emerald-600';
      case 'purple': return 'bg-purple-50 text-purple-600 border-purple-600';
      case 'amber': return 'bg-amber-50 text-amber-600 border-amber-600';
      default: return 'bg-indigo-50 text-indigo-600 border-indigo-600';
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-100 shadow-sm" dir="rtl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          
          {/* Right Side: Logo & Main Navigation Tabs */}
          <div className="flex items-center gap-6 flex-1 md:flex-initial">
            <div className="flex items-center gap-3">
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-white font-black text-lg ${bgClass} shadow-md`}>
                چ
              </div>
              <span className={`text-lg font-black tracking-tight hidden sm:block ${colorClass}`}>
                چتر دانش <span className="text-gray-400 font-normal">| سامانه هوشمند آموزشی</span>
              </span>
            </div>

            {/* Vertical separator */}
            <div className="h-6 w-[1px] bg-gray-100 hidden md:block"></div>

            {/* Tabs */}
            <nav className="flex items-center gap-1">
              {menuItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`flex items-center gap-2 px-3 sm:px-4 py-2 rounded-xl text-xs sm:text-xs font-bold transition-all duration-200 ${
                      isActive 
                        ? `${getActiveTabClass()} shadow-sm` 
                        : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                  >
                    <Icon size={14} />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Left Side: Search Bar, Stats, Quick Settings */}
          <div className="flex items-center gap-4 flex-1 md:flex-initial justify-end">
            
            {/* Minimal Compact Search */}
            <div className="relative max-w-[200px] sm:max-w-xs w-full hidden md:block">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
              <input 
                type="text" 
                placeholder="جستجو در سامانه..." 
                className={`w-full pr-9 pl-3 py-1.5 bg-gray-55 border border-gray-100 rounded-xl text-xs focus:ring-2 focus:bg-white transition-all outline-none ${ringClass}`}
              />
            </div>

            <div className="h-6 w-[1px] bg-gray-100 hidden md:block"></div>

            {/* Controls */}
            <div className="flex items-center gap-2">
              <ThemeSwitcher />
              
              <button 
                className="p-2 bg-white hover:bg-gray-50 text-gray-400 hover:text-gray-600 rounded-xl transition-colors border border-gray-100 shadow-sm relative"
                title="اعلان‌ها"
              >
                <Bell size={18} />
                <span className="absolute top-1.5 left-1.5 w-1.5 h-1.5 bg-red-500 rounded-full"></span>
              </button>

              <button 
                className="p-2 bg-white hover:bg-gray-50 text-gray-400 hover:text-gray-600 rounded-xl transition-colors border border-gray-100 shadow-sm"
                title="راهنمایی"
              >
                <HelpCircle size={18} />
              </button>
              
              <div className="h-6 w-[1px] bg-gray-100"></div>

              {/* User Avatar with Profile details */}
              <div className="flex items-center gap-2 pl-1">
                <div className={`h-8 w-8 rounded-xl font-bold text-white flex items-center justify-center text-xs shadow-sm ${bgClass}`}>
                  م
                </div>
                <div className="hidden lg:flex flex-col text-right">
                  <span className="text-xs font-bold text-gray-800">مدیر سیستم</span>
                  <span className="text-[9px] text-gray-400 select-none">سطح دسترسی کل</span>
                </div>
              </div>

              {/* Log Out Clicker */}
              <button 
                onClick={onLogout}
                className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                title="خروج از سیستم"
              >
                <LogOut size={18} />
              </button>
            </div>

          </div>

        </div>
      </div>
    </header>
  );
};

export default TopNavbar;
