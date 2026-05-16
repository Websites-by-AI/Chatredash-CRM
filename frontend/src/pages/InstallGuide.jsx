import React, { useState } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../components/ui/tabs';
import { Copy, Check, Server, Terminal, Database, Rocket, FileCode2, Container, ShieldCheck } from 'lucide-react';
import { toast } from 'sonner';

const Code = ({ children, lang = 'bash', id }) => {
  const [copied, setCopied] = useState(false);
  const text = typeof children === 'string' ? children : '';
  const copy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success('کپی شد');
    setTimeout(() => setCopied(false), 1500);
  };
  return (
    <div className="relative group" data-testid={`code-block-${id || ''}`}>
      <pre className="bg-[#1A1A1A] text-emerald-300 text-xs md:text-sm leading-relaxed rounded-md p-4 overflow-x-auto font-mono border border-[#27272A]" dir="ltr">
        <code>{text}</code>
      </pre>
      <button
        onClick={copy}
        className="absolute top-2 left-2 p-1.5 rounded bg-[#27272A] text-zinc-300 hover:text-white opacity-0 group-hover:opacity-100 transition"
        data-testid={`copy-code-${id || ''}`}
      >
        {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
      </button>
      <Badge variant="secondary" className="absolute top-2 right-2 text-[10px] bg-[#27272A] text-zinc-400 border-0">{lang}</Badge>
    </div>
  );
};

const Step = ({ n, title, icon: Icon, children }) => (
  <Card className="p-6 border-[#E5E5E0] bg-white" data-testid={`install-step-${n}`}>
    <div className="flex items-center gap-3 mb-4">
      <div className="w-10 h-10 rounded-md bg-[#0047AB] text-white flex items-center justify-center font-black num">{n}</div>
      <div className="flex items-center gap-2">
        {Icon && <Icon className="w-5 h-5 text-[#FF4F00]" />}
        <h3 className="font-black text-lg text-[#1A1A1A]">{title}</h3>
      </div>
    </div>
    <div className="space-y-4 text-sm text-[#52525B] leading-relaxed">{children}</div>
  </Card>
);

export default function InstallGuide() {
  return (
    <div className="min-h-screen bg-[#F9F9F7]" data-testid="install-guide-page">
      <Header />
      <div className="max-w-5xl mx-auto px-6 py-12">
        <div className="mb-8">
          <div className="text-xs font-bold tracking-[0.15em] uppercase text-[#A1A1AA] mb-2">DEPLOYMENT GUIDE</div>
          <h1 className="text-4xl sm:text-5xl font-black tracking-tight text-[#1A1A1A]">
            راهنمای نصب <span className="text-[#FF4F00]">رتبه‌برتر</span> روی سرور شخصی
          </h1>
          <p className="text-[#52525B] mt-4 leading-relaxed max-w-2xl">
            این راهنما کامل و مرحله‌به‌مرحله توضیح می‌دهد چطور پروژه رتبه‌برتر را روی سرور خودت (Linux/Ubuntu) راه‌اندازی کنی. هر دستور قابل کپی است.
          </p>
        </div>

        <Tabs defaultValue="manual">
          <TabsList className="mb-6 bg-white border border-[#E5E5E0]">
            <TabsTrigger value="manual" data-testid="tab-manual" className="data-[state=active]:bg-[#0047AB] data-[state=active]:text-white">
              <Server className="w-4 h-4 ms-2" /> نصب دستی Linux
            </TabsTrigger>
            <TabsTrigger value="docker" data-testid="tab-docker" className="data-[state=active]:bg-[#0047AB] data-[state=active]:text-white">
              <Container className="w-4 h-4 ms-2" /> Docker
            </TabsTrigger>
            <TabsTrigger value="env" data-testid="tab-env" className="data-[state=active]:bg-[#0047AB] data-[state=active]:text-white">
              <FileCode2 className="w-4 h-4 ms-2" /> متغیرهای محیطی
            </TabsTrigger>
          </TabsList>

          <TabsContent value="manual" className="space-y-5">
            <Step n="۱" title="پیش‌نیازهای سیستم" icon={Terminal}>
              <p>سیستم‌عامل: Ubuntu 22.04 یا بالاتر. نصب پکیج‌های پایه:</p>
              <Code id="prereq" lang="bash">{`sudo apt update && sudo apt install -y curl git build-essential
# Node.js 20.x
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs
sudo npm install -g yarn
# Python 3.11
sudo apt install -y python3.11 python3.11-venv python3-pip`}</Code>
            </Step>

            <Step n="۲" title="نصب MongoDB" icon={Database}>
              <p>دیتابیس اصلی پروژه روی MongoDB اجرا می‌شود:</p>
              <Code id="mongo" lang="bash">{`wget -qO - https://www.mongodb.org/static/pgp/server-7.0.asc | sudo apt-key add -
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu jammy/mongodb-org/7.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-7.0.list
sudo apt update && sudo apt install -y mongodb-org
sudo systemctl enable mongod
sudo systemctl start mongod`}</Code>
            </Step>

            <Step n="۳" title="دریافت سورس و نصب وابستگی‌ها" icon={FileCode2}>
              <p>سورس پروژه را از پنل ادمین (دکمه «دانلود ZIP») بگیر یا کلون کن:</p>
              <Code id="clone" lang="bash">{`mkdir -p /opt/rotbar && cd /opt/rotbar
# آپلود فایل zip و استخراج
unzip rotbar-bartar-source.zip
# نصب dependencies بک‌اند
cd backend
python3.11 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
pip install emergentintegrations==0.1.0 --extra-index-url https://d33sy5i8bnduwe.cloudfront.net/simple/
# نصب dependencies فرانت‌اند
cd ../frontend && yarn install`}</Code>
            </Step>

            <Step n="۴" title="تنظیم متغیرهای محیطی" icon={ShieldCheck}>
              <p>فایل <span className="num">backend/.env</span> با محتوای زیر بساز:</p>
              <Code id="env-backend" lang="env">{`MONGO_URL="mongodb://localhost:27017"
DB_NAME="rotbar_prod"
CORS_ORIGINS="https://yourdomain.com"
JWT_SECRET="یک کلید قوی و یونیک بساز"
EMERGENT_LLM_KEY="کلید Emergent LLM شما"`}</Code>
              <p className="mt-3">و فایل <span className="num">frontend/.env</span>:</p>
              <Code id="env-frontend" lang="env">{`REACT_APP_BACKEND_URL=https://api.yourdomain.com
WDS_SOCKET_PORT=443`}</Code>
              <p className="mt-3 text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-md p-3 leading-relaxed">
                💡 <strong>نکته:</strong> ماژول AI Studio به طور خودکار از چند provider استفاده می‌کند با fallback خودکار. حداقل یکی از <span className="num">EMERGENT_LLM_KEY</span> یا <span className="num">GAPGPT_API_KEY</span> الزامی است.
              </p>
            </Step>

            <Step n="۵" title="اجرای بک‌اند و فرانت‌اند با Supervisor" icon={Rocket}>
              <p>نصب supervisor و ساخت دو فایل کانفیگ:</p>
              <Code id="supervisor" lang="bash">{`sudo apt install -y supervisor
# /etc/supervisor/conf.d/rotbar-backend.conf
sudo tee /etc/supervisor/conf.d/rotbar-backend.conf > /dev/null <<EOF
[program:rotbar-backend]
command=/opt/rotbar/backend/venv/bin/uvicorn server:app --host 0.0.0.0 --port 8001
directory=/opt/rotbar/backend
autostart=true
autorestart=true
stderr_logfile=/var/log/rotbar-backend.err.log
stdout_logfile=/var/log/rotbar-backend.out.log
EOF

# اجرای production build فرانت‌اند و سرو از nginx
cd /opt/rotbar/frontend && yarn build

sudo supervisorctl reread && sudo supervisorctl update`}</Code>
            </Step>

            <Step n="۶" title="کانفیگ Nginx و SSL" icon={ShieldCheck}>
              <p>یک reverse proxy ساده با ایمنی SSL:</p>
              <Code id="nginx" lang="nginx">{`server {
    server_name yourdomain.com;
    root /opt/rotbar/frontend/build;
    index index.html;

    location /api/ {
        proxy_pass http://127.0.0.1:8001;
        proxy_set_header Host $host;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    location / {
        try_files $uri /index.html;
    }
}`}</Code>
              <p className="mt-3">سپس SSL را با Let's Encrypt فعال کن:</p>
              <Code id="certbot" lang="bash">{`sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d yourdomain.com`}</Code>
            </Step>

            <Step n="۷" title="تست نهایی و دسترسی ادمین" icon={Rocket}>
              <p>اولین ورود با شماره ادمین پیش‌فرض: <span className="num font-black text-[#FF4F00]">09120000000</span> (کد یک‌بارمصرف در پاسخ API برمی‌گردد). در پنل ادمین، تب «تست سیستم» را اجرا کن تا همه‌چیز سالم بودنش تأیید شود.</p>
            </Step>
          </TabsContent>

          <TabsContent value="docker" className="space-y-5">
            <Step n="۱" title="ساخت docker-compose.yml" icon={Container}>
              <p>یک فایل با محتوای زیر در ریشه پروژه بساز:</p>
              <Code id="compose" lang="yaml">{`version: "3.9"
services:
  mongo:
    image: mongo:7
    volumes: ["mongo_data:/data/db"]
    restart: unless-stopped

  backend:
    build: ./backend
    environment:
      - MONGO_URL=mongodb://mongo:27017
      - DB_NAME=rotbar_prod
      - CORS_ORIGINS=*
      - JWT_SECRET=change-me
      - EMERGENT_LLM_KEY=\${EMERGENT_LLM_KEY}
    ports: ["8001:8001"]
    depends_on: [mongo]
    restart: unless-stopped

  frontend:
    build: ./frontend
    ports: ["3000:3000"]
    environment:
      - REACT_APP_BACKEND_URL=http://localhost:8001
    restart: unless-stopped

volumes:
  mongo_data:`}</Code>
            </Step>

            <Step n="۲" title="Dockerfile بک‌اند" icon={Container}>
              <Code id="dockerfile-backend" lang="dockerfile">{`FROM python:3.11-slim
WORKDIR /app
COPY requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt && \\
    pip install emergentintegrations==0.1.0 --extra-index-url https://d33sy5i8bnduwe.cloudfront.net/simple/
COPY . ./
CMD ["uvicorn", "server:app", "--host", "0.0.0.0", "--port", "8001"]`}</Code>
            </Step>

            <Step n="۳" title="اجرا" icon={Rocket}>
              <Code id="compose-up" lang="bash">{`docker compose up -d --build
docker compose logs -f backend`}</Code>
            </Step>
          </TabsContent>

          <TabsContent value="env" className="space-y-5">
            <Card className="p-6 border-[#E5E5E0] bg-white">
              <h3 className="font-black text-xl text-[#1A1A1A] mb-4">جدول کامل متغیرهای محیطی</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-[#F4F4F0] text-[#52525B] text-xs uppercase">
                    <tr>
                      <th className="text-right p-3">متغیر</th>
                      <th className="text-right p-3">سرویس</th>
                      <th className="text-right p-3">توضیح</th>
                      <th className="text-right p-3">مقدار نمونه</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E5E5E0]">
                    {[
                      ['MONGO_URL', 'backend', 'آدرس MongoDB', 'mongodb://localhost:27017'],
                      ['DB_NAME', 'backend', 'نام دیتابیس', 'rotbar_prod'],
                      ['CORS_ORIGINS', 'backend', 'دامنه‌های مجاز جداشده با کاما', 'https://yourdomain.com'],
                      ['JWT_SECRET', 'backend', 'کلید امضای توکن (openssl rand -hex 32)', 'random-64-char-string'],
                      ['EMERGENT_LLM_KEY', 'backend', 'کلید Universal LLM برای ماژول AI Studio', 'sk-emergent-...'],
                      ['GAPGPT_API_KEY', 'backend', 'کلید gapgpt.app (اختیاری، fallback)', 'sk-...'],
                      ['GAPGPT_BASE_URL', 'backend', 'آدرس API GapGPT (اختیاری)', 'https://api.gapgpt.app/v1'],
                      ['REACT_APP_BACKEND_URL', 'frontend', 'آدرس کامل API', 'https://api.yourdomain.com'],
                    ].map((r, i) => (
                      <tr key={i}>
                        <td className="p-3 font-bold text-[#0047AB] num">{r[0]}</td>
                        <td className="p-3"><Badge variant="secondary" className="bg-[#F4F4F0] border border-[#E5E5E0]">{r[1]}</Badge></td>
                        <td className="p-3">{r[2]}</td>
                        <td className="p-3 num text-xs text-[#52525B]" dir="ltr">{r[3]}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>

            <Card className="p-6 border-amber-200 bg-amber-50">
              <h3 className="font-black text-lg text-[#1A1A1A] mb-2 flex items-center gap-2"><ShieldCheck className="w-5 h-5 text-amber-700" /> نکات امنیتی مهم</h3>
              <ul className="space-y-2 text-sm text-[#52525B] leading-relaxed">
                <li>• هرگز فایل <span className="num font-bold">.env</span> را در Git قرار نده.</li>
                <li>• <span className="num font-bold">JWT_SECRET</span> را با <span className="num">openssl rand -hex 32</span> بساز.</li>
                <li>• CORS را به دامنه واقعی محدود کن، نه <span className="num">*</span> در production.</li>
                <li>• MongoDB را روی پورت عمومی expose نکن.</li>
              </ul>
            </Card>
          </TabsContent>
        </Tabs>

        <Card className="mt-8 p-6 border-[#E5E5E0] bg-[#1A1A1A] text-white">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <div className="text-xs font-bold tracking-[0.15em] uppercase text-amber-400 mb-1">نیاز به کمک داری؟</div>
              <h3 className="text-2xl font-black">می‌توانی سورس کامل را از پنل ادمین دانلود کنی</h3>
              <p className="text-sm text-zinc-400 mt-2">با لاگین به‌عنوان مدیر در پنل ادمین، در تب «تنظیمات» دکمه «دانلود ZIP سورس‌کد» را بزن.</p>
            </div>
            <Button variant="outline" className="bg-amber-500 hover:bg-amber-600 text-slate-900 border-0 font-bold" onClick={() => window.location.href = '/admin'} data-testid="goto-admin-btn">
              ورود به پنل ادمین
            </Button>
          </div>
        </Card>
      </div>
      <Footer />
    </div>
  );
}
