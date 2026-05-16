const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const { authenticate } = require('../middleware/auth');
const Content = require('../models/Content');
const { extractJson } = require('../utils/helpers');

router.use(authenticate);

const SYSTEM_PROMPT = `شما یک استراتژیست محتوا و کارشناس برندسازی شخصی فارسی‌زبان هستید.
وظیفه شما کمک به رتبه‌های برتر آزمون‌ها برای تبدیل تجربه‌شان به محتوای حرفه‌ای است.
خروجی شما همیشه باید یک JSON معتبر و دقیقاً مطابق با schema داده‌شده باشد.
هیچ متنی قبل یا بعد از JSON ننویس. از \`\`\`json نیز استفاده نکن.
محتوا را به فارسی روان، انگیزه‌بخش و عملی بنویس.`;

function buildUserPrompt(payload) {
  return `بر اساس اطلاعات زیر یک بسته محتوای کامل تولید کن:

نام آزمون: ${payload.exam_name}
رتبه/نتیجه: ${payload.rank}
رشته: ${payload.field || '—'}
روش مطالعه: ${payload.study_strategy}
منابع: ${payload.resources}
نقاط قوت: ${payload.strengths || '—'}
دستاوردها: ${payload.achievements || '—'}
مخاطب هدف: ${payload.target_audience || 'داوطلبان آزمون'}
لحن: ${payload.tone || 'صمیمی و حرفه‌ای'}

خروجی را دقیقاً با این ساختار JSON بازگردان:
{
  "title": "عنوان جذاب و SEO-friendly",
  "summary": "خلاصه ۲ تا ۳ خطی از تجربه",
  "blog_post": "متن کامل وبلاگ حداقل ۶ پاراگراف با تیترهای مارک‌داون (## ، ###) و لیست‌ها",
  "video_script": "اسکریپت ویدیو با ساختار [Hook] [Intro] [Main 1-3] [CTA] حداقل ۴۰۰ کلمه",
  "notebook_notes": "نوت‌بوک آموزشی به سبک مارک‌داون با بخش‌بندی روش مطالعه، منابع، تحلیل، نتیجه‌گیری",
  "social_posts": [
     "پست لینکدین حرفه‌ای حدود ۲۰۰ کلمه با ایموجی مناسب",
     "کپشن اینستاگرام جذاب با هشتگ‌های مرتبط"
  ],
  "resume_summary": "خلاصه رزومه ۳ تا ۵ خطی مناسب درج در رزومه یا لینکدین",
  "recommended_prompt": "یک پرامپت آماده و قابل استفاده در ابزارهای دیگر AI برای ادامه کار",
  "recommended_platforms": ["لینکدین", "اینستاگرام", "وبلاگ شخصی"],
  "best_title": "بهترین تیتر پیشنهادی",
  "best_cta": "بهترین Call To Action",
  "keywords": ["کلمه۱", "کلمه۲", "کلمه۳"]
}

تمام فیلدها باید پر و معنادار باشند. فقط JSON برگردان.`;
}

async function callOpenAI(systemMsg, userMsg) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error('OPENAI_API_KEY not configured');

  const OpenAI = require('openai');
  const client = new OpenAI({ apiKey });
  const resp = await client.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      { role: 'system', content: systemMsg },
      { role: 'user', content: userMsg },
    ],
    temperature: 0.7,
    max_tokens: 4000,
  });
  return resp.choices[0].message.content;
}

router.post('/generate', async (req, res) => {
  try {
    const { exam_name, rank, study_strategy, resources, field, strengths, achievements, target_audience, tone } = req.body;
    if (!exam_name || !rank || !study_strategy) {
      return res.status(400).json({ error: 'اطلاعات اصلی الزامی است (آزمون، رتبه، روش مطالعه)' });
    }

    const userPrompt = buildUserPrompt(req.body);
    let data;
    try {
      const raw = await callOpenAI(SYSTEM_PROMPT, userPrompt);
      data = extractJson(raw);
    } catch (err) {
      return res.status(500).json({ error: `خطا در تولید محتوا: ${err.message.slice(0, 200)}` });
    }

    const socialPosts = Array.isArray(data.social_posts) ? data.social_posts.map(String).slice(0, 6) : [];
    const platforms = Array.isArray(data.recommended_platforms) ? data.recommended_platforms.map(String).slice(0, 6) : [];
    const keywords = Array.isArray(data.keywords) ? data.keywords.map(String).slice(0, 12) : [];

    const doc = await Content.create({
      contentId: uuidv4(),
      userId: req.user.userId,
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
    });

    const { _id, __v, ...out } = doc.toObject();
    return res.json(out);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

router.post('/prompt', async (req, res) => {
  try {
    const { exam_name, rank, goal = 'تولید محتوای آموزشی', target_tool = 'ChatGPT' } = req.body;
    const userText = `یک مجموعه پرامپت حرفه‌ای بساز برای استفاده در ${target_tool}.
موضوع: تجربه قبولی در ${exam_name} با رتبه ${rank}
هدف: ${goal}

خروجی JSON دقیقاً با این ساختار:
{
  "short_prompt": "پرامپت کوتاه و سریع",
  "detailed_prompt": "پرامپت کامل و حرفه‌ای با context و نقش‌دهی",
  "video_prompt": "پرامپت مخصوص تولید اسکریپت ویدیو",
  "notebook_prompt": "پرامپت مخصوص ساخت نوت‌بوک آموزشی",
  "slide_prompt": "پرامپت مخصوص ساخت اسلاید"
}
فقط JSON برگردان.`;

    let data;
    try {
      const raw = await callOpenAI(SYSTEM_PROMPT, userText);
      data = extractJson(raw);
    } catch (err) {
      return res.status(500).json({ error: `خطا در تولید پرامپت: ${err.message.slice(0, 200)}` });
    }
    return res.json(data);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

router.get('/list', async (req, res) => {
  try {
    const items = await Content.find({ userId: req.user.userId }).sort({ createdAt: -1 }).lean();
    return res.json(items.map(({ _id, __v, ...i }) => i));
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const item = await Content.findOne({ contentId: req.params.id, userId: req.user.userId }).lean();
    if (!item) return res.status(404).json({ error: 'محتوا پیدا نشد' });
    const { _id, __v, ...out } = item;
    return res.json(out);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const allowed = ['title', 'summary', 'blog_post', 'video_script', 'notebook_notes', 'social_posts', 'resume_summary', 'recommended_prompt', 'recommended_platforms', 'keywords', 'favorite'];
    const update = {};
    for (const k of allowed) {
      if (req.body[k] != null) update[k] = req.body[k];
    }
    if (!Object.keys(update).length) return res.status(400).json({ error: 'تغییری ارسال نشد' });

    const result = await Content.updateOne({ contentId: req.params.id, userId: req.user.userId }, { $set: update });
    if (result.matchedCount === 0) return res.status(404).json({ error: 'محتوا پیدا نشد' });

    const item = await Content.findOne({ contentId: req.params.id }).lean();
    const { _id, __v, ...out } = item;
    return res.json(out);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const result = await Content.deleteOne({ contentId: req.params.id, userId: req.user.userId });
    if (result.deletedCount === 0) return res.status(404).json({ error: 'محتوا پیدا نشد' });
    return res.json({ success: true });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

module.exports = router;
