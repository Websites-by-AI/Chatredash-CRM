import React, { useState } from 'react';
import { motion } from 'motion/react';
import TopNavbar from './TopNavbar';
import CoursesHub from './CoursesHub';
import ProjectStore from './ProjectStore';
import HomeLanding from './HomeLanding';
import EmployeeManager from './EmployeeManager';
import DataMigration from './DataMigration';
import RevenueManager from './RevenueManager';
import { Shield, Key, Sparkles, Zap } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

const Layout: React.FC = () => {
  const { bgClass } = useTheme();
  const [activeTab, setActiveTab] = useState('home');
  const [activeDep, setActiveDep] = useState('داوطلبان');
  const [isLoggedIn, setIsLoggedIn] = useState(true);

  // Simple state for login forms
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('******');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoggedIn(true);
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'home': return <HomeLanding setActiveTab={setActiveTab} setActiveDep={setActiveDep} />;
      case 'courses': return <CoursesHub activeDep={activeDep} setActiveDep={setActiveDep} />;
      case 'team': return <EmployeeManager />;
      case 'revenue': return <RevenueManager />;
      case 'migration': return <DataMigration />;
      case 'marketplace': return <ProjectStore />;
      default: return <HomeLanding setActiveTab={setActiveTab} setActiveDep={setActiveDep} />;
    }
  };

  // If logged out, render a highly-polished Farsi login screen for Chater Danesh 
  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 selection:bg-indigo-500 selection:text-white" dir="rtl">
        
        {/* Abstract lights background */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(99,102,241,0.06),transparent_40%)]" />

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-3xl p-8 sm:p-10 shadow-2xl relative z-10 space-y-8 text-right"
        >
          {/* Brand Logo */}
          <div className="text-center space-y-3">
            <div className={`w-16 h-16 rounded-2.5xl flex items-center justify-center text-white font-black text-3xl mx-auto shadow-lg bg-indigo-600`}>
              چ
            </div>
            <div>
              <h1 className="text-xl font-black text-white">سامانه هوشمند آموزشی چتر دانش</h1>
              <p className="text-[10px] text-gray-400 mt-2">مدیریت و آپلودر چتر دانش • پرتال یکپارچه CRM داوطلبان</p>
            </div>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            <div className="space-y-1.5">
              <label className="text-[11px] font-black text-gray-400 block">نام کاربری اپراتور / مشاور:</label>
              <div className="relative">
                <input 
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="نام کاربری..."
                  className="w-full pr-4 pl-3 py-3 bg-slate-950 text-white border border-slate-800 rounded-xl text-xs font-bold outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-black text-gray-400 block">کلمه عبور امنیتی:</label>
              <div className="relative">
                <input 
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="کلمه عبور پرونده‌ها..."
                  className="w-full pr-4 pl-3 py-3 bg-slate-950 text-white border border-slate-800 rounded-xl text-xs font-bold outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all font-mono text-left"
                />
              </div>
            </div>

            <div className="flex items-center justify-between text-[10.5px] font-bold text-gray-450 pt-1">
              <span className="flex items-center gap-1.5 cursor-pointer hover:text-white transition-colors">
                <Shield size={13} className="text-indigo-400 animate-pulse" />
                <span>اتصال با گواهی SSL امن</span>
              </span>
              <span className="cursor-pointer hover:underline">فراموشی رمز عبور دپارتمان؟</span>
            </div>

            <button
              type="submit"
              className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs rounded-xl shadow-lg shadow-indigo-600/10 transition-all flex items-center justify-center gap-2"
            >
              <Key size={14} className="text-amber-300" />
              <span>ورود به سیستم CRM چتر دانش</span>
            </button>
          </form>

          {/* Secure watermark */}
          <div className="text-center pt-2">
            <p className="text-[9px] text-gray-500 font-semibold leading-relaxed">
              این پلتفرم متعلق به گروه آموزشی نخبگان چتر دانش مجهز به پایش کنترل کایزن درسی است. هرگونه ورود غیرمجاز طبق قوانین جرایم رایانه‌ای پیگرد به همراه خواهد داشت.
            </p>
          </div>

        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 font-sans flex flex-col" dir="rtl">
      {/* Top unified navigation bar */}
      <TopNavbar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        onLogout={() => setIsLoggedIn(false)} 
      />
      
      {/* Main workspace container */}
      <main className="flex-1 p-4 sm:p-6 lg:p-8">
        <div className="max-w-7xl mx-auto">
          {renderContent()}
        </div>
      </main>
    </div>
  );
};

export default Layout;
