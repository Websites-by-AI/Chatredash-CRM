export interface Student {
  id: string;
  name: string;
  code: string;
  field: "math" | "experimental" | "humanities";
  grade: string;
}

export interface Exam {
  id: string;
  date: string;
  title: string;
  traz: number;
  rank: number;
  overallPercentage: number;
  lessons: LessonDetail[];
}

export interface LessonDetail {
  lessonName: string;
  percentage: number;
  correct: number;
  wrong: number;
  empty: number;
}

export interface Weakness {
  topic: string;
  subject: string;
  percentage: number;
  recommendation: string;
  questionsCount: number;
  severity: "critical" | "warning" | "mild";
}

export interface PsychologicalAnalysis {
  pattern: string;
  description: string;
  correctToWrongRate: number;
  suggestion: string;
  cardColor: "red" | "orange" | "amber" | "blue";
  stressLevel: number; // 0-100 percentage
  stressAnalysis: {
    avgResponseTimeWrong: number; // in seconds
    avgResponseTimeCorrect: number; // in seconds
    consecutiveErrorsCount: number; // error cluster metric
    stressLabel: "بحرانی" | "متوسط" | "سالم" | "خفیف";
    technicalDetail: string; // qualitative details
  };
}

export interface DailyPlan {
  day: string;
  morningPlan: string;
  afternoonPlan: string;
  totalQuestions: number;
  completed?: boolean;
}

export interface ChatMessage {
  id: string;
  role: "user" | "model";
  content: string;
  timestamp: string;
}

export interface ParentingAlert {
  id: string;
  type: "success" | "warning" | "info";
  message: string;
  date: string;
}
