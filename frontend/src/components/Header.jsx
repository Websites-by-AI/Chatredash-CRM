import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from './ui/button';
import { GraduationCap, LogOut, LayoutDashboard } from 'lucide-react';
import { getUser, setToken, setUser } from '../lib/api';

export const Header = () => {
  const navigate = useNavigate();
  const user = getUser();

  const logout = () => {
    setToken(null);
    setUser(null);
    navigate('/');
  };

  return (
    <header className="sticky top-0 z-40 backdrop-blur-xl bg-white/70 border-b border-slate-200" data-testid="site-header">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-3" data-testid="header-logo">
          <div className="w-10 h-10 rounded-md bg-slate-900 flex items-center justify-center">
            <GraduationCap className="w-5 h-5 text-amber-500" strokeWidth={2.2} />
          </div>
          <div className="leading-tight">
            <div className="font-black text-slate-900 tracking-tight">رتبه‌برتر</div>
            <div className="text-[11px] text-slate-500">طرح ملی رزومه‌سازی</div>
          </div>
        </Link>

        <nav className="hidden md:flex items-center gap-8 text-sm">
          <a href="/#about" className="text-slate-600 hover:text-slate-900 transition" data-testid="nav-about">درباره طرح</a>
          <a href="/#features" className="text-slate-600 hover:text-slate-900 transition" data-testid="nav-features">مسیر همکاری</a>
          <a href="/#training" className="text-slate-600 hover:text-slate-900 transition" data-testid="nav-training">آموزش رایگان</a>
          <Link to="/studio" className="text-slate-600 hover:text-slate-900 transition flex items-center gap-1.5" data-testid="nav-studio">
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#FF4F00]" />
            استودیو هوش مصنوعی
          </Link>
          <a href="/#contact" className="text-slate-600 hover:text-slate-900 transition" data-testid="nav-contact">تماس</a>
          <Link to="/install" className="text-slate-600 hover:text-slate-900 transition" data-testid="nav-install">راهنمای نصب</Link>
        </nav>

        <div className="flex items-center gap-2">
          {user ? (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate(user.role === 'admin' ? '/admin' : '/dashboard')}
                data-testid="nav-dashboard-btn"
              >
                <LayoutDashboard className="w-4 h-4 ms-1" />
                {user.role === 'admin' ? 'پنل مدیر' : 'پنل من'}
              </Button>
              <Button variant="ghost" size="sm" onClick={logout} data-testid="nav-logout-btn">
                <LogOut className="w-4 h-4" />
              </Button>
            </>
          ) : (
            <Button
              onClick={() => navigate('/login')}
              className="bg-amber-500 hover:bg-amber-600 text-slate-900 font-bold"
              data-testid="nav-login-btn"
            >
              ورود معرف‌ها
            </Button>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
