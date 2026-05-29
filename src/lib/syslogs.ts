import { SystemLog } from "../types";

export const getSystemLogs = (): SystemLog[] => {
  const saved = localStorage.getItem("chatre_system_logs");
  if (!saved) return [
    { 
      id: "LOG-1001", 
      action: "ورود به سامانه", 
      username: "admin_chatre", 
      timestamp: "۱۴۰۵/۰۲/۲۸ - ۰۸:۳۰", 
      detail: "ورود موفق مدیریت ارشد به پنل DevOps" 
    },
    { 
      id: "LOG-1002", 
      action: "به‌روزرسانی نقشه راه", 
      username: "admin_chatre", 
      timestamp: "۱۴۰۵/۰۲/۲۸ - ۰۹:۱۵", 
      detail: "تغییر اولویت فاز ۳ معماری SaaS" 
    }
  ];
  try {
    return JSON.parse(saved);
  } catch (e) {
    return [];
  }
};

export const addSystemLog = (action: string, username: string, detail: string) => {
  const logs = getSystemLogs();
  const newLog: SystemLog = {
    id: `LOG-${Date.now()}`,
    action,
    username,
    timestamp: new Date().toLocaleString("fa-IR"),
    detail
  };
  localStorage.setItem("chatre_system_logs", JSON.stringify([newLog, ...logs]));
};
