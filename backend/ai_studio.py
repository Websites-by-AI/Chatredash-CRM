"""AI Content Studio - content generation routes & LLM service."""
from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from datetime import datetime, timezone
import os
import json
import uuid
import re
import logging

from emergentintegrations.llm.chat import LlmChat, UserMessage

logger = logging.getLogger(__name__)

studio_router = APIRouter(prefix="/api/studio")


# ---------- Models ----------
class StudioInput(BaseModel):
    exam_name: str
    rank: str
    field: Optional[str] = ""
    study_strategy: str
    resources: str
    strengths: Optional[str] = ""
    achievements: Optional[str] = ""
    target_audience: Optional[str] = "داوطلبان آزمون"
    content_type: Optional[str] = "all"  # all/article/video/notebook/social/resume
    tone: Optional[str] = "صمیمی و حرفه‌ای"
    language: Optional[str] = "fa"


class ContentUpdate(BaseModel):
    title: Optional[str] = None
    summary: Optional[str] = None
    blog_post: Optional[str] = None
    video_script: Optional[str] = None
    notebook_notes: Optional[str] = None
    social_posts: Optional[List[str]] = None
    resume_summary: Optional[str] = None
    recommended_prompt: Optional[str] = None
    recommended_platforms: Optional[List[str]] = None
    keywords: Optional[List[str]] = None
    favorite: Optional[bool] = None


class PromptRequest(BaseModel):
    exam_name: str
    rank: str
    goal: str = "تولید محتوای آموزشی"
    target_tool: Optional[str] = "ChatGPT"


# ---------- Helpers ----------
def now_iso():
    return datetime.now(timezone.utc).isoformat()


SYSTEM_PROMPT = """شما یک استراتژیست محتوا و کارشناس برندسازی شخصی فارسی‌زبان هستید.
وظیفه شما کمک به رتبه‌های برتر آزمون‌ها برای تبدیل تجربه‌شان به محتوای حرفه‌ای است.
خروجی شما همیشه باید یک JSON معتبر و دقیقاً مطابق با schema داده‌شده باشد.
هیچ متنی قبل یا بعد از JSON ننویس. از ```json نیز استفاده نکن.
محتوا را به فارسی روان، انگیزه‌بخش و عملی بنویس."""


def build_user_prompt(payload: StudioInput) -> str:
    return f"""بر اساس اطلاعات زیر یک بسته محتوای کامل تولید کن:

نام آزمون: {payload.exam_name}
رتبه/نتیجه: {payload.rank}
رشته: {payload.field or "—"}
روش مطالعه: {payload.study_strategy}
منابع: {payload.resources}
نقاط قوت: {payload.strengths or "—"}
دستاوردها: {payload.achievements or "—"}
مخاطب هدف: {payload.target_audience}
لحن: {payload.tone}

خروجی را دقیقاً با این ساختار JSON بازگردان:
{{
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
}}

تمام فیلدها باید پر و معنادار باشند. فقط JSON برگردان."""


def extract_json(text: str) -> Dict[str, Any]:
    """Robustly extract JSON object from LLM response."""
    text = text.strip()
    # remove triple backticks
    text = re.sub(r"^```(?:json)?\s*", "", text)
    text = re.sub(r"\s*```$", "", text)
    # try direct parse
    try:
        return json.loads(text)
    except json.JSONDecodeError:
        pass
    # find first { and last }
    start = text.find("{")
    end = text.rfind("}")
    if start != -1 and end != -1 and end > start:
        snippet = text[start:end + 1]
        try:
            return json.loads(snippet)
        except json.JSONDecodeError as e:
            logger.warning(f"JSON parse fallback failed: {e}")
    raise ValueError("Could not parse JSON from LLM response")


async def call_llm(system: str, user_text: str, session_id: str) -> str:
    api_key = os.environ.get("EMERGENT_LLM_KEY")
    if not api_key:
        raise HTTPException(500, "EMERGENT_LLM_KEY not configured")
    chat = LlmChat(
        api_key=api_key,
        session_id=session_id,
        system_message=system,
    ).with_model("openai", "gpt-5.1")
    msg = UserMessage(text=user_text)
    resp = await chat.send_message(msg)
    return str(resp)


# ---------- Routes ----------
def register_routes(get_current_user_dep, db):
    """Register routes with shared auth dependency and db reference."""

    @studio_router.post("/generate")
    async def generate_content(payload: StudioInput, user: dict = Depends(get_current_user_dep)):
        if not payload.exam_name or not payload.rank or not payload.study_strategy:
            raise HTTPException(400, "اطلاعات اصلی الزامی است (آزمون، رتبه، روش مطالعه)")

        session_id = f"studio-{user['id']}-{uuid.uuid4().hex[:8]}"
        try:
            raw = await call_llm(SYSTEM_PROMPT, build_user_prompt(payload), session_id)
            data = extract_json(raw)
        except Exception as e:
            logger.exception("LLM generation failed")
            raise HTTPException(500, f"خطا در تولید محتوا: {str(e)[:200]}")

        # Normalize fields
        doc = {
            "id": str(uuid.uuid4()),
            "user_id": user["id"],
            "input": payload.model_dump(),
            "title": str(data.get("title", "")).strip() or f"محتوای {payload.exam_name}",
            "summary": str(data.get("summary", "")).strip(),
            "blog_post": str(data.get("blog_post", "")).strip(),
            "video_script": str(data.get("video_script", "")).strip(),
            "notebook_notes": str(data.get("notebook_notes", "")).strip(),
            "social_posts": data.get("social_posts") or [],
            "resume_summary": str(data.get("resume_summary", "")).strip(),
            "recommended_prompt": str(data.get("recommended_prompt", "")).strip(),
            "recommended_platforms": data.get("recommended_platforms") or [],
            "best_title": str(data.get("best_title", data.get("title", ""))).strip(),
            "best_cta": str(data.get("best_cta", "")).strip(),
            "keywords": data.get("keywords") or [],
            "favorite": False,
            "created_at": now_iso(),
            "updated_at": now_iso(),
        }
        # Ensure social_posts is a list of strings
        doc["social_posts"] = [str(p) for p in doc["social_posts"]][:6]
        doc["recommended_platforms"] = [str(p) for p in doc["recommended_platforms"]][:6]
        doc["keywords"] = [str(k) for k in doc["keywords"]][:12]

        await db.studio_contents.insert_one(doc.copy())
        doc.pop("_id", None)
        return doc

    @studio_router.post("/prompt")
    async def generate_prompt(payload: PromptRequest, user: dict = Depends(get_current_user_dep)):
        session_id = f"prompt-{user['id']}-{uuid.uuid4().hex[:8]}"
        user_text = f"""یک مجموعه پرامپت حرفه‌ای بساز برای استفاده در {payload.target_tool}.
موضوع: تجربه قبولی در {payload.exam_name} با رتبه {payload.rank}
هدف: {payload.goal}

خروجی JSON دقیقاً با این ساختار:
{{
  "short_prompt": "پرامپت کوتاه و سریع",
  "detailed_prompt": "پرامپت کامل و حرفه‌ای با context و نقش‌دهی",
  "video_prompt": "پرامپت مخصوص تولید اسکریپت ویدیو",
  "notebook_prompt": "پرامپت مخصوص ساخت نوت‌بوک آموزشی",
  "slide_prompt": "پرامپت مخصوص ساخت اسلاید"
}}
فقط JSON برگردان."""
        try:
            raw = await call_llm(SYSTEM_PROMPT, user_text, session_id)
            data = extract_json(raw)
        except Exception as e:
            logger.exception("Prompt gen failed")
            raise HTTPException(500, f"خطا در تولید پرامپت: {str(e)[:200]}")
        return data

    @studio_router.get("/list")
    async def list_contents(user: dict = Depends(get_current_user_dep)):
        items = await db.studio_contents.find(
            {"user_id": user["id"]}, {"_id": 0}
        ).sort("created_at", -1).to_list(500)
        return items

    @studio_router.get("/{content_id}")
    async def get_content(content_id: str, user: dict = Depends(get_current_user_dep)):
        item = await db.studio_contents.find_one(
            {"id": content_id, "user_id": user["id"]}, {"_id": 0}
        )
        if not item:
            raise HTTPException(404, "محتوا پیدا نشد")
        return item

    @studio_router.put("/{content_id}")
    async def update_content(content_id: str, payload: ContentUpdate, user: dict = Depends(get_current_user_dep)):
        update = {k: v for k, v in payload.model_dump().items() if v is not None}
        if not update:
            raise HTTPException(400, "تغییری ارسال نشد")
        update["updated_at"] = now_iso()
        result = await db.studio_contents.update_one(
            {"id": content_id, "user_id": user["id"]}, {"$set": update}
        )
        if result.matched_count == 0:
            raise HTTPException(404, "محتوا پیدا نشد")
        item = await db.studio_contents.find_one({"id": content_id}, {"_id": 0})
        return item

    @studio_router.delete("/{content_id}")
    async def delete_content(content_id: str, user: dict = Depends(get_current_user_dep)):
        result = await db.studio_contents.delete_one({"id": content_id, "user_id": user["id"]})
        if result.deleted_count == 0:
            raise HTTPException(404, "محتوا پیدا نشد")
        return {"success": True}

    return studio_router
