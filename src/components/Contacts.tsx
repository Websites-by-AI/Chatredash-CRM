import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, Plus, Filter, MoreVertical, Mail, Phone, Download, FileText, FileSpreadsheet } from 'lucide-react';
import { mockContacts } from '../data/mockData';
import { useTheme } from '../context/ThemeContext';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const Contacts: React.FC = () => {
  const { colorClass, bgClass, ringClass } = useTheme();
  const [showExportMenu, setShowExportMenu] = useState(false);

  const exportCSV = () => {
    const headers = ['نام', 'ایمیل', 'شرکت', 'وضعیت', 'آخرین تماس'];
    const rows = mockContacts.map(c => [c.name, c.email, c.company, c.status, c.lastContact]);
    
    // Add BOM for UTF-8 compatibility in Excel
    const csvContent = "\uFEFF" + [headers, ...rows].map(e => e.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "contacts-list.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setShowExportMenu(false);
  };

  const exportPDF = () => {
    const doc = new jsPDF();
    
    doc.setFontSize(20);
    // Since Persian fonts are not embedded by default in jsPDF, 
    // we use English headers for the structure but notify the user
    // In a production app, we would load and embed a font like Vazirmatn.ttf
    doc.text('CRM Contacts Export', 105, 20, { align: 'center' });
    
    const tableData = mockContacts.map(c => [
      c.name,
      c.email,
      c.company,
      c.status,
      c.lastContact
    ]);

    autoTable(doc, {
      head: [['Name', 'Email', 'Company', 'Status', 'Last Contact']],
      body: tableData,
      startY: 30,
      headStyles: { fillColor: [79, 70, 229] }, // Brand indigo color
    });

    doc.save('contacts-list.pdf');
    setShowExportMenu(false);
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
      dir="rtl"
    >
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h2 className="text-2xl font-bold text-gray-900">مخاطبین و مشتریان</h2>
        <div className="flex items-center gap-3">
          <div className="relative">
            <button 
              onClick={() => setShowExportMenu(!showExportMenu)}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-xl shadow-sm hover:bg-gray-50 transition-colors"
            >
              <Download size={18} />
              <span>خروجی گرفتن</span>
            </button>

            <AnimatePresence>
              {showExportMenu && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setShowExportMenu(false)} />
                  <motion.div 
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className="absolute left-0 mt-2 w-40 bg-white rounded-xl shadow-xl border border-gray-100 p-1 z-20"
                  >
                    <button 
                      onClick={exportCSV}
                      className="w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
                    >
                      <FileSpreadsheet size={16} className="text-emerald-500" />
                      <span>خروجی CSV</span>
                    </button>
                    <button 
                      onClick={exportPDF}
                      className="w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
                    >
                      <FileText size={16} className="text-red-500" />
                      <span>خروجی PDF</span>
                    </button>
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>

          <button className={`flex items-center gap-2 px-4 py-2 text-white rounded-xl shadow-sm transition-colors ${bgClass} hover:opacity-90`}>
            <Plus size={18} />
            <span>افزودن مخاطب جدید</span>
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-gray-50 flex items-center gap-4">
          <div className="flex-1 relative">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="text" 
              placeholder="جستجو در بین نام، ایمیل یا شرکت..." 
              className={`w-full pr-10 pl-4 py-2 bg-gray-50 border-none rounded-xl text-sm focus:ring-2 transition-all outline-none ${ringClass}`}
            />
          </div>
          <button className="p-2 text-gray-400 hover:bg-gray-50 rounded-lg transition-colors">
            <Filter size={20} />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-right border-collapse">
            <thead className="bg-gray-50 bg-opacity-50 text-gray-500 text-xs font-medium uppercase">
              <tr>
                <th className="px-6 py-4">مخاطب</th>
                <th className="px-6 py-4">نام شرکت</th>
                <th className="px-6 py-4">وضعیت</th>
                <th className="px-6 py-4">آخرین تماس</th>
                <th className="px-6 py-4 text-left">عملیات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {mockContacts.map((contact) => (
                <tr key={contact.id} className="hover:bg-gray-50 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm bg-opacity-10 ${bgClass} ${colorClass}`}>
                        {contact.name.charAt(0)}
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-gray-900">{contact.name}</div>
                        <div className="text-xs text-gray-500">{contact.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">{contact.company}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${
                      contact.status === 'Active' ? 'bg-emerald-50 text-emerald-600' :
                      contact.status === 'Lead' ? 'bg-blue-50 text-blue-600' :
                      contact.status === 'In Progress' ? 'bg-amber-50 text-amber-600' :
                      'bg-gray-50 text-gray-500'
                    }`}>
                      {contact.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">{contact.lastContact}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button className={`p-2 text-gray-400 hover:bg-opacity-10 rounded-lg hover:${colorClass} hover:${bgClass.replace('bg-', 'bg-')}`}>
                        <Mail size={16} />
                      </button>
                      <button className={`p-2 text-gray-400 hover:bg-opacity-10 rounded-lg hover:${colorClass} hover:${bgClass.replace('bg-', 'bg-')}`}>
                        <Phone size={16} />
                      </button>
                      <button className="p-2 text-gray-400 hover:bg-gray-100 rounded-lg">
                        <MoreVertical size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </motion.div>
  );
};

export default Contacts;
