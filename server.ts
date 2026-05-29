import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API routes
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", message: "CRM Server is running" });
  });

  app.post("/api/crm/insights", async (req, res) => {
    try {
      const { data } = req.body;
      const ai = new GoogleGenAI({ 
        apiKey: process.env.GEMINI_API_KEY, 
        httpOptions: { headers: { 'User-Agent': 'aistudio-build' } } 
      });
      
      let prompt = "";
      if (data && (data.task === "طراحی وب زنده لندینگ" || data.task === "طراحی وب با تلویند" || data.instruction)) {
        prompt = `
          ${data.instruction || ""}
          درخواست کاربر (درخواست طراحی): ${data.userPrompt || ""}
          دستورالعمل: یک قطعه کد HTML تمیز و کاملاً استایل‌دهی شده با Tailwind به صورت مستقیم در تگهای div برگردان. هیچ توضیح اضافه مانند \`\`\`html یا توضیحات متنی قبل و بعد ننویس. فقط و فقط کدهای معتبر html تلویند مناسب برای رندر کردن در بدنه یک دیو برگردان.
        `;
      } else {
        prompt = `
          شما یک دستیار هوشمند مدیریت مشتریان (CRM) هستید. 
          با توجه به داده های زیر، ۳ پیشنهاد استراتژیک برای بهبود فروش و ارتباط با مشتریان ارائه دهید.
          داده ها: ${JSON.stringify(data)}
          پاسخ را به صورت لیست کوتاه و حرفه ای به زبان فارسی برگردانید.
        `;
      }

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
      });

      res.json({ insights: response.text });
    } catch (error: any) {
      console.error("Gemini Error:", error);
      res.status(500).json({ error: "Failed to generate insights" });
    }
  });

  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
