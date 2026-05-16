import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import Header from '../components/Header';
import Footer from '../components/Footer';
import {
  Award, Sparkles, BookOpenCheck, Users, Briefcase, Brain,
  ArrowLeft, GraduationCap, ScrollText, Trophy
} from 'lucide-react';

const exams = ['کنکور سراسری', 'ارشد', 'دکتری', 'وکالت', 'آزمون‌های تخصصی'];
const fields = ['پزشکی', 'حقوق', 'مدیریت', 'روانشناسی', 'مهندسی کامپیوتر', 'مهندسی برق', 'حسابداری', 'علوم سیاسی'];

export default function Landing() {
  return (
    <div className="min-h-screen bg-slate-50">
      <Header />

      {/* HERO */}
      <section className="relative overflow-hidden border-b border-slate-200">
        <div
          className="absolute inset-0 grain"
          style={{
            backgroundImage:
              "linear-gradient(135deg, rgba(15,23,42,0.92) 0%, rgba(15,23,42,0.85) 60%, rgba(15,23,42,0.7) 100%), url('https://images.unsplash.com/photo-1774600787713-bc405e935202?crop=entropy&cs=srgb&fm=jpg&q=85')",
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        />
        <div className="relative max-w-7xl mx-auto px-6 py-20 md:py-28 grid lg:grid-cols-12 gap-10">
          <div className="lg:col-span-7 fade-up">
            <Badge className="bg-amber-500/15 text-amber-300 border-amber-500/30 mb-5" data-testid="hero-badge">
              <Sparkles className="w-3 h-3 ms-1" /> طرح ملی رزومه‌سازی رتبه‌های برتر
            </Badge>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white leading-[1.15]">
              تجربه رتبه‌های برتر،
              <br />
              <span className="text-amber-400">سرمایه نسل بعد.</span>
            </h1>
            <p className="text-slate-300 text-base md:text-lg mt-6 max-w-2xl leading-relaxed">
              اگر در آزمون‌های سراسری، ارشد، دکتری یا وکالت رتبه برتر بوده‌اید، در این طرح ملی با کمک هوش مصنوعی، تجربه‌تان را به یک مسیر آموزشی و رزومه حرفه‌ای تبدیل می‌کنیم تا برای ورود به بازار کار تخصصی، یک قدم جلوتر باشید.
            </p>

            <div className="flex flex-wrap gap-3 mt-8">
              <Link to="/register">
                <Button size="lg" className="bg-amber-500 hover:bg-amber-600 text-slate-900 font-bold rounded-md px-7" data-testid="hero-register-btn">
                  ثبت‌نام رتبه‌های برتر
                  <ArrowLeft className="w-4 h-4 me-2" />
                </Button>
              </Link>
              <a href="#training">
                <Button size="lg" variant="outline" className="bg-white/5 text-white border-white/20 hover:bg-white/10 rounded-md px-7" data-testid="hero-training-btn">
                  آموزش رایگان نیم‌ساعته
                </Button>
              </a>
              <Link to="/studio">
                <Button size="lg" variant="outline" className="bg-amber-500/10 text-amber-300 border-amber-500/40 hover:bg-amber-500/20 rounded-md px-7" data-testid="hero-studio-btn">
                  <Sparkles className="w-4 h-4 ms-2" />
                  استودیو هوش مصنوعی
                </Button>
              </Link>
            </div>

            <div className="mt-12 grid grid-cols-3 gap-6 max-w-xl">
              <div>
                <div className="text-3xl font-black text-white num">۱۰۰۰+</div>
                <div className="text-xs text-slate-400 mt-1">رشته تخصصی</div>
              </div>
              <div>
                <div className="text-3xl font-black text-white num">۱۰۰</div>
                <div className="text-xs text-slate-400 mt-1">رتبه برتر در هر رشته</div>
              </div>
              <div>
                <div className="text-3xl font-black text-amber-400 num">AI</div>
                <div className="text-xs text-slate-400 mt-1">هوش مصنوعی همراه</div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-5 fade-up" style={{ animationDelay: '0.2s' }}>
            <div className="relative rounded-md bg-white/5 backdrop-blur-md border border-white/10 p-6 shadow-2xl">
              <div className="flex items-center justify-between mb-4">
                <div className="text-white/70 text-xs">کارت رزومه نمونه</div>
                <Trophy className="w-4 h-4 text-amber-400" />
              </div>
              <div className="flex items-start gap-4">
                <div className="w-14 h-14 rounded-md bg-amber-500/20 border border-amber-500/30 flex items-center justify-center">
                  <Award className="w-7 h-7 text-amber-400" />
                </div>
                <div>
                  <div className="text-white font-bold text-lg">رتبه ۳ کنکور وکالت</div>
                  <div className="text-slate-400 text-sm mt-0.5">پارمیس م.</div>
                </div>
              </div>
              <div className="mt-6 grid grid-cols-2 gap-4 text-sm">
                <div className="bg-white/5 rounded-md p-3 border border-white/10">
                  <div className="text-slate-400 text-xs">ساعات تدریس</div>
                  <div className="text-white font-bold mt-1 num">۱۲۰</div>
                </div>
                <div className="bg-white/5 rounded-md p-3 border border-white/10">
                  <div className="text-slate-400 text-xs">دانش‌آموزان</div>
                  <div className="text-white font-bold mt-1 num">۲۸۰</div>
                </div>
                <div className="bg-white/5 rounded-md p-3 border border-white/10">
                  <div className="text-slate-400 text-xs">محتواهای منتشرشده</div>
                  <div className="text-white font-bold mt-1 num">۴۲</div>
                </div>
                <div className="bg-white/5 rounded-md p-3 border border-white/10">
                  <div className="text-slate-400 text-xs">امتیاز همکاران</div>
                  <div className="text-amber-400 font-bold mt-1 num">۴.۹/۵</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* MARQUEE OF EXAMS */}
      <section className="bg-white border-b border-slate-200 overflow-hidden py-5">
        <div className="flex gap-12 marquee-track whitespace-nowrap text-slate-400 text-sm">
          {[...exams, ...fields, ...exams, ...fields, ...exams].map((e, i) => (
            <span key={i} className="flex items-center gap-3">
              <span className="w-1 h-1 bg-amber-500 rounded-full" />
              <span>{e}</span>
            </span>
          ))}
        </div>
      </section>

      {/* ABOUT */}
      <section id="about" className="max-w-7xl mx-auto px-6 py-20">
        <div className="grid lg:grid-cols-12 gap-12 items-start">
          <div className="lg:col-span-5">
            <Badge className="bg-slate-900 text-amber-400 border-0 mb-4">درباره طرح</Badge>
            <h2 className="text-3xl md:text-4xl font-black tracking-tight text-slate-900 leading-tight">
              تجربه واقعی، نه دوره‌های کلیشه‌ای.
            </h2>
            <p className="text-slate-600 mt-4 leading-loose">
              هدف این طرح این است که تجربه مطالعاتی رتبه‌های برتر مستندسازی شود، مسیر موفقیت تحلیل گردد و خروجی آن به شکل رزومه حرفه‌ای، محتوای آموزشی و فرصت همکاری به نسل بعدی داوطلبان منتقل شود.
            </p>
          </div>
          <div className="lg:col-span-7 grid sm:grid-cols-2 gap-5">
            {[
              { icon: BookOpenCheck, title: 'مستندسازی تجربه', desc: 'برنامه روزانه، منابع، ترفندهای تست‌زنی و چالش‌های واقعی شما به دارایی قابل عرضه تبدیل می‌شود.' },
              { icon: ScrollText, title: 'رزومه حرفه‌ای', desc: 'یک پروفایل آکادمیک قابل ارائه برای دانشگاه، آموزشگاه و بازار کار تخصصی.' },
              { icon: Users, title: 'همکاری آموزشی', desc: 'فرصت تدریس، مشاوره، تولید محتوا و حضور در پروژه‌های چترِ دانش و شرکای آن.' },
              { icon: Briefcase, title: 'ورود به بازار کار', desc: 'پل ارتباطی با موسسات، نشر، استارتاپ‌های آموزشی و کارفرمایان رشته شما.' },
            ].map((f, i) => (
              <Card key={i} className="p-6 border-slate-200 card-lift" data-testid={`feature-card-${i}`}>
                <div className="w-10 h-10 rounded-md bg-slate-900 flex items-center justify-center mb-4">
                  <f.icon className="w-5 h-5 text-amber-400" strokeWidth={2.2} />
                </div>
                <div className="font-bold text-slate-900 mb-2">{f.title}</div>
                <div className="text-slate-600 text-sm leading-relaxed">{f.desc}</div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* PROCESS */}
      <section id="features" className="bg-slate-900 text-white py-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <Badge className="bg-amber-500/20 text-amber-400 border-0 mb-3">مسیر همکاری</Badge>
            <h2 className="text-3xl md:text-4xl font-black tracking-tight">از تجربه تا فرصت، در چهار قدم.</h2>
          </div>
          <div className="grid md:grid-cols-4 gap-5">
            {[
              { n: '۰۱', t: 'ثبت‌نام و احراز هویت', d: 'با شماره موبایل خود وارد می‌شوید و رتبه و رشته‌تان را ثبت می‌کنید.' },
              { n: '۰۲', t: 'مصاحبه و مستندسازی', d: 'در یک جلسه نیم‌ساعته، تجربه‌ شما با کمک هوش مصنوعی به ساختار قابل ارائه تبدیل می‌شود.' },
              { n: '۰۳', t: 'ساخت رزومه و سایت', d: 'یک سایت تک‌صفحه‌ای حرفه‌ای با ماژول هوش مصنوعی برای شما ساخته می‌شود.' },
              { n: '۰۴', t: 'فرصت‌های همکاری', d: 'مسیر تدریس، تولید محتوا، مشاوره و پروژه‌های آموزشی جلوی پای شما باز می‌شود.' },
            ].map((s, i) => (
              <div key={i} className="border border-white/10 rounded-md p-6 hover:border-amber-500/50 transition" data-testid={`process-card-${i}`}>
                <div className="text-amber-400 font-black text-2xl num">{s.n}</div>
                <div className="font-bold mt-3">{s.t}</div>
                <div className="text-slate-400 text-sm mt-2 leading-relaxed">{s.d}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* AI CONTENT STUDIO */}
      <section id="studio" className="bg-[#F9F9F7] border-t border-b border-[#E5E5E0] py-20">
        <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-6 fade-up">
            <div className="text-xs font-bold tracking-[0.15em] uppercase text-[#A1A1AA] mb-3">AI CONTENT STUDIO · جدید</div>
            <h2 className="text-3xl md:text-5xl font-black tracking-tight text-[#1A1A1A] leading-[1.15]">
              تجربه‌ات را به یک
              <br />
              <span className="text-[#FF4F00]">بسته محتوای کامل</span> تبدیل کن.
            </h2>
            <p className="text-[#52525B] mt-5 leading-loose">
              فقط روش مطالعه، رتبه و منابعت را وارد کن. هوش مصنوعی برای تو وبلاگ، اسکریپت ویدیو، پست لینکدین و اینستاگرام، نوت‌بوک آموزشی، خلاصه رزومه و حتی پرامپت‌های آماده می‌سازد.
            </p>
            <div className="grid grid-cols-2 gap-3 mt-7 max-w-md">
              {['وبلاگ', 'اسکریپت ویدیو', 'پست شبکه اجتماعی', 'نوت‌بوک آموزشی', 'خلاصه رزومه', 'پرامپت آماده'].map((x) => (
                <div key={x} className="flex items-center gap-2 text-sm text-[#1A1A1A]">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#FF4F00]" /> {x}
                </div>
              ))}
            </div>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/studio">
                <Button size="lg" className="bg-[#0047AB] hover:bg-[#003580] text-white rounded-md px-7" data-testid="studio-cta-btn">
                  <Sparkles className="w-4 h-4 ms-2" />
                  شروع تولید محتوا
                </Button>
              </Link>
              <Link to="/studio/library">
                <Button size="lg" variant="outline" className="rounded-md px-7" data-testid="studio-library-cta">
                  کتابخانه نمونه‌ها
                </Button>
              </Link>
            </div>
          </div>
          <div className="lg:col-span-6 fade-up" style={{ animationDelay: '0.2s' }}>
            <div className="relative rounded-md overflow-hidden border border-[#E5E5E0] bg-white">
              <img
                src="https://static.prod-images.emergentagent.com/jobs/448a4898-65d9-422e-84b1-8e2b55a11d09/images/bf50298c951aa9ef5c70cb3b82691acca6862c95070bc9f267a00bad758a815f.png"
                alt="AI Studio"
                className="w-full aspect-[5/4] object-cover"
              />
              <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/70 to-transparent p-6 text-white">
                <div className="text-xs font-bold tracking-[0.15em] uppercase opacity-80">قدرت گرفته از Claude Sonnet 4.5</div>
                <div className="text-xl font-black mt-1">شش فرمت خروجی در کمتر از ۳۰ ثانیه</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FREE TRAINING */}
      <section id="training" className="max-w-7xl mx-auto px-6 py-20">
        <div className="grid lg:grid-cols-12 gap-10 items-center">
          <div className="lg:col-span-5">
            <img
              src="https://images.unsplash.com/photo-1652285374663-d06ce650028a?crop=entropy&cs=srgb&fm=jpg&q=85"
              alt="جلسه آموزش رایگان"
              className="rounded-md object-cover w-full aspect-[4/3]"
            />
          </div>
          <div className="lg:col-span-7">
            <Badge className="bg-amber-500 text-slate-900 border-0 mb-3" data-testid="training-badge">آموزش رایگان نیم‌ساعته</Badge>
            <h2 className="text-3xl md:text-4xl font-black tracking-tight text-slate-900 leading-tight">
              چطور با «نَت ملی» و یک ماژول هوش مصنوعی، یک سایت تک‌صفحه‌ای حرفه‌ای بسازید؟
            </h2>
            <p className="text-slate-600 mt-4 leading-loose">
              در این جلسه نیم‌ساعته رایگان، گام‌به‌گام نشان می‌دهیم چطور بدون نیاز به دانش برنامه‌نویسی، یک سایت رزومه/معرفی شخصی برای خودتان طراحی کنید. بعد از این جلسه، بر اساس علاقه و رشته‌تان، مسیر همکاری متناسب پیشنهاد می‌شود.
            </p>
            <ul className="mt-6 space-y-3 text-sm text-slate-700">
              <li className="flex items-center gap-2"><Brain className="w-4 h-4 text-amber-500" /> ماژول هوش مصنوعی برای تولید محتوا</li>
              <li className="flex items-center gap-2"><GraduationCap className="w-4 h-4 text-amber-500" /> ساخت یک سایت تک‌صفحه‌ای رزومه</li>
              <li className="flex items-center gap-2"><Users className="w-4 h-4 text-amber-500" /> تشخیص بهترین مسیر همکاری برای رشته شما</li>
            </ul>
            <div className="mt-7">
              <Link to="/register">
                <Button size="lg" className="bg-slate-900 hover:bg-slate-800 text-white rounded-md px-7" data-testid="training-cta-btn">
                  ثبت‌نام در جلسه رایگان
                  <ArrowLeft className="w-4 h-4 me-2" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
