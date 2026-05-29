import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { mockSellerPerformance } from '../data/mockData';
import { useTheme } from '../context/ThemeContext';

const SellerPerformanceChart: React.FC = () => {
  const { colorClass, hexColor } = useTheme();
  
  // Generating shades of the primary hex color
  const getShades = (hex: string) => [
    hex,
    hex + 'CC', // 80% opacity
    hex + '99', // 60% opacity
    hex + '66', // 40% opacity
    hex + '4D', // 30% opacity
  ];

  const colors = getShades(hexColor);

  return (
    <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold text-gray-900">گزارش هوشمند عملکرد فروشندگان</h3>
          <p className="text-sm text-gray-500 mt-1">مقایسه حجم فروش بر اساس تومان</p>
        </div>
        <div className={`text-xs font-mono bg-opacity-10 px-3 py-1.5 rounded-lg border border-opacity-20 ${colorClass.replace('text-', 'bg-')} ${colorClass} ${colorClass.replace('text-', 'border-')}`}>
          داده‌های ۳۰ روز اخیر
        </div>
      </div>
      
      <div className="h-80 w-full font-sans text-xs">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={mockSellerPerformance} margin={{ top: 20, right: 30, left: 40, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
            <XAxis 
              dataKey="name" 
              axisLine={false} 
              tickLine={false} 
              tick={{ fill: '#6b7280', fontSize: 12 }} 
            />
            <YAxis 
              axisLine={false} 
              tickLine={false} 
              tick={{ fill: '#9ca3af' }}
              tickFormatter={(value) => `${(value / 1000000).toFixed(0)}M`}
            />
            <Tooltip 
              cursor={{ fill: '#f9fafb' }}
              contentStyle={{ 
                borderRadius: '16px', 
                border: 'none', 
                boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)',
                direction: 'rtl',
                textAlign: 'right'
              }}
              formatter={(value: number) => [`${value.toLocaleString()} تومان`, 'حجم فروش']}
              labelStyle={{ fontWeight: 'bold', marginBottom: '8px', color: '#111827' }}
            />
            <Bar dataKey="sales" radius={[8, 8, 0, 0]} barSize={40}>
              {mockSellerPerformance.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default SellerPerformanceChart;
