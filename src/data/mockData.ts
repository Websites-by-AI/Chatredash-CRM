import { Contact, Deal, Activity } from '../types';

export const mockContacts: Contact[] = [
  {
    id: '1',
    name: 'علی احمدی',
    email: 'ali.ahmadi@example.com',
    phone: '09121234567',
    company: 'شرکت فناوری نوین',
    status: 'Active',
    lastContact: '2026-05-25',
  },
  {
    id: '2',
    name: 'سارا رضایی',
    email: 'sara.r@demo.ir',
    phone: '09129876543',
    company: 'هلدینگ پارس',
    status: 'Lead',
    lastContact: '2026-05-27',
  },
  {
    id: '3',
    name: 'محمد حسینی',
    email: 'm.hosseini@startup.com',
    phone: '09355554433',
    company: 'توسعه وب مهر',
    status: 'In Progress',
    lastContact: '2026-05-20',
  },
  {
    id: '4',
    name: 'مریم اکبری',
    email: 'm.akbari@group.io',
    phone: '09112223344',
    company: 'گروه صنعتی البرز',
    status: 'Inactive',
    lastContact: '2026-04-15',
  }
];

export const mockDeals: Deal[] = [
  {
    id: 'd1',
    title: 'سیستم یکپارچه فروش',
    contactId: '1',
    company: 'شرکت فناوری نوین',
    value: 120000000,
    stage: 'Negotiation',
    expectedClose: '2026-06-15',
  },
  {
    id: 'd2',
    title: 'پروژه پشتیبانی شبکه',
    contactId: '3',
    company: 'توسعه وب مهر',
    value: 45000000,
    stage: 'Proposal',
    expectedClose: '2026-06-30',
  },
  {
    id: 'd3',
    title: 'توسعه زیرساخت ابری',
    contactId: '2',
    company: 'هلدینگ پارس',
    value: 230000000,
    stage: 'Discovery',
    expectedClose: '2026-07-10',
  },
  {
    id: 'd4',
    title: 'قرارداد پشتیبانی امنیتی',
    contactId: '4',
    company: 'گروه صنعتی البرز',
    value: 80000000,
    stage: 'Closed Won',
    expectedClose: '2026-05-20',
  },
  {
    id: 'd5',
    title: 'طراحی اپلیکیشن موبایل',
    contactId: '1',
    company: 'شرکت فناوری نوین',
    value: 95000000,
    stage: 'Proposal',
    expectedClose: '2026-06-18',
  },
  {
    id: 'd6',
    title: 'بهینه‌سازی پایگاه داده صبا',
    contactId: '3',
    company: 'توسعه وب مهر',
    value: 35000000,
    stage: 'Discovery',
    expectedClose: '2026-06-25',
  },
  {
    id: 'd7',
    title: 'سیستم هوشمند نظارت تصویری',
    contactId: '2',
    company: 'هلدینگ پارس',
    value: 180000000,
    stage: 'Closed Won',
    expectedClose: '2026-05-15',
  },
  {
    id: 'd8',
    title: 'پیاده‌سازی ERP سازمانی',
    contactId: '4',
    company: 'گروه صنعتی البرز',
    value: 350000000,
    stage: 'Negotiation',
    expectedClose: '2026-08-01',
  },
  {
    id: 'd9',
    title: 'مشاوره فرآیندهای چابک',
    contactId: '3',
    company: 'توسعه وب مهر',
    value: 20000000,
    stage: 'Closed Lost',
    expectedClose: '2026-05-02',
  }
];

export const mockActivities: Activity[] = [
  {
    id: 'a1',
    type: 'Call',
    title: 'تماس با علی احمدی برای پیگیری قرارداد',
    timestamp: '2026-05-28T09:00:00',
    contactId: '1',
    done: false,
  },
  {
    id: 'a2',
    type: 'Email',
    title: 'ارسال پیش‌فاکتور برای سارا رضایی',
    timestamp: '2026-05-28T11:30:00',
    contactId: '2',
    done: true,
  },
  {
    id: 'a3',
    type: 'Meeting',
    title: 'جلسه بررسی فنی با تیم هلدینگ پارس',
    timestamp: '2026-05-29T14:00:00',
    contactId: '2',
    done: false,
  },
  {
    id: 'a4',
    type: 'Task',
    title: 'ارسال مستندات نهایی به شرکت فناوری نوین',
    timestamp: '2026-05-30T10:00:00',
    contactId: '1',
    done: false,
  }
];

export const mockSellerPerformance = [
  { name: 'رضا علوی', sales: 450000000, deals: 12 },
  { name: 'مریم سهرابی', sales: 380000000, deals: 15 },
  { name: 'حامد بهرامی', sales: 620000000, deals: 18 },
  { name: 'سعید مرادی', sales: 290000000, deals: 9 },
  { name: 'الهام صادقی', sales: 510000000, deals: 14 },
];

import { TutorialVideo, ProjectTemplate, ConnectedApp } from '../types';

export const mockTutorials: TutorialVideo[] = [
  {
    id: 't1',
    title: 'آموزش جامع اچ‌تی‌ام‌ال (HTML) و سی‌اس‌اس (CSS) پروژه محور',
    provider: 'Aparat',
    duration: '۴ ساعت و ۳۰ دقیقه',
    level: 'مقدماتی',
    url: 'https://www.aparat.com/v/example1',
    tags: ['HTML', 'CSS', 'طراحی وب'],
    thumbnailColor: 'from-amber-500 to-orange-600',
    rating: 4.8
  },
  {
    id: 't2',
    title: 'توسعه وب فوق سریع با Tailwind CSS و ری‌اکت (React)',
    provider: 'YouTube',
    duration: '۲ ساعت و ۱۵ دقیقه',
    level: 'متوسط',
    url: 'https://www.youtube.com/watch?v=example2',
    tags: ['React', 'Tailwind', 'Vite'],
    thumbnailColor: 'from-sky-500 to-indigo-600',
    rating: 4.9
  },
  {
    id: 't3',
    title: 'آموزش فرادرس ساخت وبسایت‌های پویا با ای‌پی‌آی (APIs)',
    provider: 'Faradars',
    duration: '۸ ساعت',
    level: 'پیشرفته',
    url: 'https://faradars.org/courses/example3',
    tags: ['JavaScript', 'APIs', 'Backend'],
    thumbnailColor: 'from-purple-500 to-pink-600',
    rating: 4.7
  },
  {
    id: 't4',
    title: 'پیاده‌سازی هاست رایگان و دامنه با کلودفلر ورکسپیس (Cloudflare Workers)',
    provider: 'YouTube',
    duration: '۱ ساعت و ۴۵ دقیقه',
    level: 'متوسط',
    url: 'https://www.youtube.com/watch?v=example4',
    tags: ['Cloudflare', 'Serverless', 'Deployment'],
    thumbnailColor: 'from-orange-400 to-amber-600',
    rating: 4.6
  },
  {
    id: 't5',
    title: 'مبانی کار با هوش مصنوعی گوگل AI Studio در توسعه وبسایت',
    provider: 'Aparat',
    duration: '۳ ساعت',
    level: 'مقدماتی',
    url: 'https://www.aparat.com/v/example5',
    tags: ['AI', 'Gemini', 'Code Generation'],
    thumbnailColor: 'from-blue-500 to-teal-600',
    rating: 4.9
  }
];

export const mockTemplates: ProjectTemplate[] = [
  {
    id: 'pt_codex',
    title: 'سامانه یکپارچه مانیتورینگ Codex API و هوش مصنوعی',
    seller: 'مرتضی کاظمی',
    price: 390000,
    githubUrl: 'https://github.com/morteza-k/codex-assistant',
    deploymentUrl: 'https://codex-assistant.kianhub.workers.dev',
    techStack: ['React', 'Tailwind CSS', 'Codex API', 'Cloudflare'],
    description: 'کیت پیشرفته متصل به مدل گیت‌هاب و Codex برای تولید لحظه‌ای مستندات وب، تبدیل کدهای کلاسی به تلویند و رندر بیدرنگ.',
    rating: 4.9,
    salesCount: 18,
    imageColor: 'from-amber-600 to-orange-500'
  },
  {
    id: 'pt_github_view',
    title: 'سیستم هوشمند پیش‌نمایش مخازن گیت‌هاب و شبیه‌ساز هاست',
    seller: 'امید فرهمند',
    price: 450000,
    githubUrl: 'https://github.com/farhamand/git-webview-agent',
    deploymentUrl: 'https://git-view.kianhub.workers.dev',
    techStack: ['React', 'Octokit API', 'Tailwind', 'CDN Preview'],
    description: 'پروژه‌ای منعطف برای خواندن مستقیم فایل‌های HTML/JS از مخازن گیت‌هاب، بازآرایی کلاس‌های CSS و ساخت آدرس تست موقت.',
    rating: 5.0,
    salesCount: 29,
    imageColor: 'from-indigo-600 to-violet-500'
  },
  {
    id: 'pt1',
    title: 'قالب شرکتی مدرن هگزان (Hexan Template)',
    seller: 'رضا سهرابی',
    price: 490000,
    githubUrl: 'https://github.com/reza-dev/hexan-landing',
    deploymentUrl: 'https://hexan-landing.kianhub.workers.dev',
    techStack: ['React', 'Tailwind CSS', 'Framer Motion'],
    description: 'یک لندینگ پیج شرکتی بسیار سبک مجهز به حالت تاریک و ترانزیشن‌های روان و سئوی صد درصد بهینه سازی شده.',
    rating: 4.9,
    salesCount: 32,
    imageColor: 'from-blue-600 to-cyan-500'
  },
  {
    id: 'pt2',
    title: 'فروشگاه الکترونیکی آریا شاپ (Aria e-Commerce)',
    seller: 'حدیث ناظمی',
    price: 1250000,
    githubUrl: 'https://github.com/hadis-code/aria-shop',
    deploymentUrl: 'https://aria-shop.kianhub.workers.dev',
    techStack: ['React', 'Sass', 'Redux Toolkit', 'Express'],
    description: 'سورس کامل وبسایت فروشگاهی حرفه‌ای با قابلیت سبد خرید پویا، جستجوی پیشرفته، اتصال به درگاه و پنل ادمین مجزا.',
    rating: 4.7,
    salesCount: 14,
    imageColor: 'from-emerald-500 to-teal-600'
  },
  {
    id: 'pt3',
    title: 'پورتفولیو شخصی مینیمال و سه‌بعدی (Minimal Portfolio)',
    seller: 'امیرحسین عباسی',
    price: 280000,
    githubUrl: 'https://github.com/amir-ab/minimalist-portfolio',
    deploymentUrl: 'https://amir-portfolio.kianhub.workers.dev',
    techStack: ['React', 'Three.js', 'Tailwind', 'Vite'],
    description: 'قالب حرفه‌ای رزومه و پورتفولیو شخصی با طراحی یونیک، افکت سه‌بعدی فایبر و بارگذاری سریع.',
    rating: 4.8,
    salesCount: 45,
    imageColor: 'from-purple-600 to-indigo-500'
  },
  {
    id: 'pt4',
    title: 'سامانه ابری مدیریت وظایف تسکونال (Taskonal SaaS Panel)',
    seller: 'الهام سعیدی',
    price: 1950000,
    githubUrl: 'https://github.com/elham-sa/taskonal-saas',
    deploymentUrl: 'https://taskonal-panel.kianhub.workers.dev',
    techStack: ['React State', 'Tailwind CSS', 'Chart.js', 'Lucide Icons'],
    description: 'داشبورد مدیریتی فوق پیشرفته برای کارپول و سس فمیلی با قابلیت مدیریت وظایف تیمی و چارت پیشرفت پروژه.',
    rating: 5.0,
    salesCount: 8,
    imageColor: 'from-amber-500 to-rose-500'
  }
];

export const mockConnectedApps: ConnectedApp[] = [
  {
    id: 'ca_codex',
    projectName: 'شبیه‌ساز مانیتور کد Codex',
    githubUrl: 'https://github.com/developer/kian-codex-api',
    subdomain: 'codex-assistant.kianhub.workers.dev',
    cloudflareStatus: 'مستقر شده',
    lastDeploy: '۱ ساعت پیش'
  },
  {
    id: 'ca1',
    projectName: 'وبسایت شخصی من (My Portfolio)',
    githubUrl: 'https://github.com/user/my-portfolio',
    subdomain: 'my-portfolio.kianhub.workers.dev',
    cloudflareStatus: 'مستقر شده',
    lastDeploy: '۲ ساعت پیش'
  },
  {
    id: 'ca2',
    projectName: 'بلاگ مینیمال صبا',
    githubUrl: 'https://github.com/user/saba-blog',
    subdomain: 'saba-blog.kianhub.workers.dev',
    cloudflareStatus: 'در حال ساخت',
    lastDeploy: 'دیروز'
  }
];

