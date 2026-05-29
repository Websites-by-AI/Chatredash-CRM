import { TestTrap } from "../types";

export const getTestTraps = (): TestTrap[] => {
  const saved = localStorage.getItem("chatre_test_traps");
  if (!saved) return [
    {
      id: "TRAP-1",
      questionTitle: "محاسبه سرعت متوسط در حرکت با شتاب غیرثابت",
      subject: "فیزیک تخصصی",
      category: "اشتباه_محاسباتی",
      trapType: "تله فرمول میانگین حسابی",
      correctAnswer: "تقسیم جابجایی کل بر زمان کل (نه میانگین متجانس سرعت‌ها)",
      userMistake: "سرعت اولیه و ثانویه را جمع کرده و تقسیم بر دو کردم در حالی که شتاب ثابت نبود.",
      legalNote: "فرمول (v1 + v2)/2 فقط و فقط زمانی صادق است که شتاب حرکت ثابت باشد. در شتاب‌های متغیر باید انتگرال‌گیری یا سطح زیر نمودار محاسبه شود.",
      importance: "high",
      createdAt: "۱۴۰۵/۰۲/۲۸"
    },
    {
      id: "TRAP-2",
      questionTitle: "ماهیت ساختاری غشای سلولی اندامک‌ها",
      subject: "زیست‌شناسی",
      category: "مفهومی",
      trapType: "تله غشای دو لایه لپیدی",
      correctAnswer: "ریبوزوم فاقد غشا است اما راکیزه (میتوکندری) غشای دو لایه دارد",
      userMistake: "ریبوزوم را تک غشایی تلقی کردم.",
      legalNote: "توجه شود که ریبوزوم و سانتریول از ساختارهای بدون غشا در سلول‌های یوکاریوتی هستند و نباید در محاسبات تعداد لایه‌های فسفولیپیدی وارد شوند.",
      importance: "medium",
      createdAt: "۱۴۰۵/۰۲/۲۸"
    }
  ];
  try {
    return JSON.parse(saved);
  } catch (e) {
    return [];
  }
};

export const saveTestTrap = (trap: Omit<TestTrap, "id" | "createdAt">) => {
  const traps = getTestTraps();
  const newTrap: TestTrap = {
    ...trap,
    id: `TRAP-${Date.now()}`,
    createdAt: new Date().toLocaleDateString("fa-IR")
  };
  localStorage.setItem("chatre_test_traps", JSON.stringify([newTrap, ...traps]));
  return newTrap;
};

export const deleteTestTrap = (id: string) => {
  const traps = getTestTraps();
  const filtered = traps.filter(t => t.id !== id);
  localStorage.setItem("chatre_test_traps", JSON.stringify(filtered));
};
