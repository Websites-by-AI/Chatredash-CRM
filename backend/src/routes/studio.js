const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const { authenticate } = require('../middleware/auth');
const Content = require('../models/Content');
const Settings = require('../models/Settings');
const { extractJson } = require('../utils/helpers');

const nowISO = () => new Date().toISOString();

router.use(authenticate);

const SYSTEM_PROMPT = `شما یک استراتژیست محتوا و کارشناس برندسازی شخصی فارسی‌زبان هستید.
وظیفه شما کمک به رتبه‌های برتر آزمون‌ها برای تبدیل تجربه‌شان به محتوای حرفه‌ای است.
خروجی شما همیشه باید یک JSON معتبر و دقیقاً مطابق با schema داده‌شده باشد.
هیچ متنی قبل یا بعد از JSON ننویس. از \`\`\`json نیز استفاده نکن.
محتوا را به فارسی روان، انگیزه‌بخش و عملی بنویس.`;

function buildUserPrompt(p) {
  return `بر اساس اطلاعات زیر یک بسته محتوای کامل تولید کن:
نام آزمون: ${p.exam_name}  رتبه/نتیجه: ${p.rank}  رشته: ${p.field || '—'}
روش مطالعه: ${p.study_strategy}  منابع: ${p.resources}
نقاط قوت: ${p.strengths || '—'}  دستاوردها: ${p.achievements || '—'}
مخاطب هدف: ${p.target_audience || 'داوطلبان آزمون'}  لحن: ${p.tone || 'صمیمی و حرفه‌ای'}

خروجی را دقیقاً با این ساختار JSON بازگردان:
{"title":"عنوان جذاب","summary":"خلاصه ۲-۳ خطی","blog_post":"متن کامل وبلاگ با مارک‌داون","video_script":"اسکریپت ویدیو","notebook_notes":"نوت‌بوک آموزشی","social_posts":["پست لینکدین","کپشن اینستاگرام"],"resume_summary":"خلاصه رزومه","recommended_prompt":"پرامپت آماده","recommended_platforms":["لینکدین","اینستاگرام"],"best_title":"بهترین تیتر","best_cta":"بهترین CTA","keywords":["کلمه۱","کلمه۲"]}
فقط JSON برگردان.`;
}

async function getApiKey() {
  const envKey = process.env.OPENAI_API_KEY;
  if (envKey) return envKey;
  try {
    const s = await Settings.findOne({ settings_id: 'global' });
    if (s?.openai_api_key && s.openai_api_key.startsWith('sk-')) return s.openai_api_key;
  } catch {}
  return null;
}

async function callOpenAI(systemMsg, userMsg) {
  const apiKey = await getApiKey();
  if (!apiKey) throw new Error('کلید OpenAI تنظیم نشده است. از پنل ادمین → تنظیمات وارد کنید.');
  const OpenAI = require('openai');
  const client = new OpenAI({ apiKey });
  const resp = await client.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [{ role: 'system', content: systemMsg }, { role: 'user', content: userMsg }],
    temperature: 0.7,
    max_tokens: 4000,
  });
  return resp.choices[0].message.content;
}

router.post('/generate', async (req, res) => {
  try {
    const { exam_name, rank, study_strategy } = req.body;
    if (!exam_name || !rank || !study_strategy) {
      return res.status(400).json({ error: 'اطلاعات اصلی الزامی است (آزمون، رتبه، روش مطالعه)' });
    }
    let data;
    try {
      const raw = await callOpenAI(SYSTEM_PROMPT, buildUserPrompt(req.body));
      data = extractJson(raw);
    } catch (err) {
      return res.status(500).json({ error: `خطا در تولید محتوا: ${err.message.slice(0, 300)}` });
    }

    const socialPosts = Array.isArray(data.social_posts) ? data.social_posts.map(String).slice(0, 6) : [];
    const platforms = Array.isArray(data.recommended_platforms) ? data.recommended_platforms.map(String).slice(0, 6) : [];
    const keywords = Array.isArray(data.keywords) ? data.keywords.map(String).slice(0, 12) : [];

    const doc = {
      id: uuidv4(),
      user_id: req.user.id,
      input: req.body,
      title: String(data.title || `محتوای ${exam_name}`).trim(),
      summary: String(data.summary || '').trim(),
      blog_post: String(data.blog_post || '').trim(),
      video_script: String(data.video_script || '').trim(),
      notebook_notes: String(data.notebook_notes || '').trim(),
      social_posts: socialPosts,
      resume_summary: String(data.resume_summary || '').trim(),
      recommended_prompt: String(data.recommended_prompt || '').trim(),
      recommended_platforms: platforms,
      best_title: String(data.best_title || data.title || '').trim(),
      best_cta: String(data.best_cta || '').trim(),
      keywords,
      favorite: false,
      created_at: nowISO(),
      updated_at: nowISO(),
    };
    await Content.create(doc);
    return res.json(doc);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

router.post('/prompt', async (req, res) => {
  try {
    const { exam_name, rank, goal = 'تولید محتوای آموزشی', target_tool = 'ChatGPT' } = req.body;
    const userText = `یک مجموعه پرامپت حرفه‌ای بساز برای ${target_tool}. موضوع: قبولی در ${exam_name} رتبه ${rank}. هدف: ${goal}.
خروجی JSON:{"short_prompt":"...","detailed_prompt":"...","video_prompt":"...","notebook_prompt":"...","slide_prompt":"..."}
فقط JSON.`;
    let data;
    try {
      const raw = await callOpenAI(SYSTEM_PROMPT, userText);
      data = extractJson(raw);
    } catch (err) {
      return res.status(500).json({ error: `خطا در تولید پرامپت: ${err.message.slice(0, 300)}` });
    }
    return res.json(data);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

router.get('/list', async (req, res) => {
  try {
    const q = await Content.find({ user_id: req.user.id });
    const items = await (q.sort ? q.sort({ created_at: -1 }).lean() : Promise.resolve(q));
    return res.json(Array.isArray(items) ? items : []);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const item = await Content.findOne({ id: req.params.id, user_id: req.user.id });
    if (!item) return res.status(404).json({ error: 'محتوا پیدا نشد' });
    return res.json(item);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const allowed = ['title', 'summary', 'blog_post', 'video_script', 'notebook_notes', 'social_posts', 'resume_summary', 'recommended_prompt', 'recommended_platforms', 'keywords', 'favorite'];
    const update = { updated_at: nowISO() };
    for (const k of allowed) { if (req.body[k] != null) update[k] = req.body[k]; }
    const result = await Content.updateOne({ id: req.params.id, user_id: req.user.id }, { $set: update });
    if (result.matchedCount === 0) return res.status(404).json({ error: 'محتوا پیدا نشد' });
    const item = await Content.findOne({ id: req.params.id });
    return res.json(item);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const result = await Content.deleteOne({ id: req.params.id, user_id: req.user.id });
    if (result.deletedCount === 0) return res.status(404).json({ error: 'محتوا پیدا نشد' });
    return res.json({ success: true });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

module.exports = router;
