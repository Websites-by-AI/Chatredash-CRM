import React, { createContext, useContext, useState, useEffect } from 'react';

type ThemeColor = 'indigo' | 'blue' | 'emerald' | 'purple' | 'amber';

interface ThemeContextType {
  themeColor: ThemeColor;
  setThemeColor: (color: ThemeColor) => void;
  colorClass: string;
  bgClass: string;
  borderClass: string;
  ringClass: string;
  hexColor: string;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [themeColor, setThemeColor] = useState<ThemeColor>(() => {
    const saved = localStorage.getItem('crm-theme');
    return (saved as ThemeColor) || 'indigo';
  });

  useEffect(() => {
    localStorage.setItem('crm-theme', themeColor);
  }, [themeColor]);

  const colorMap = {
    indigo: { color: 'text-indigo-600', bg: 'bg-indigo-600', softBg: 'bg-indigo-50', border: 'border-indigo-100', ring: 'ring-indigo-100', hex: '#4f46e5' },
    blue: { color: 'text-blue-600', bg: 'bg-blue-600', softBg: 'bg-blue-50', border: 'border-blue-100', ring: 'ring-blue-100', hex: '#2563eb' },
    emerald: { color: 'text-emerald-600', bg: 'bg-emerald-600', softBg: 'bg-emerald-50', border: 'border-emerald-100', ring: 'ring-emerald-100', hex: '#059669' },
    purple: { color: 'text-purple-600', bg: 'bg-purple-600', softBg: 'bg-purple-50', border: 'border-purple-100', ring: 'ring-purple-100', hex: '#9333ea' },
    amber: { color: 'text-amber-600', bg: 'bg-amber-600', softBg: 'bg-amber-50', border: 'border-amber-100', ring: 'ring-amber-100', hex: '#d97706' }
  };

  const current = colorMap[themeColor];

  return (
    <ThemeContext.Provider value={{ 
      themeColor, 
      setThemeColor, 
      colorClass: current.color,
      bgClass: current.bg,
      borderClass: current.border,
      ringClass: current.ring,
      hexColor: current.hex
    }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('useTheme must be used within ThemeProvider');
  return context;
};
