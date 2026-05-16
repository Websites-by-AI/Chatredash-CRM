"""System self-tests: run smoke tests against critical endpoints & store results."""
from fastapi import APIRouter, Depends, HTTPException
from datetime import datetime, timezone
import uuid
import os
import time
import logging

logger = logging.getLogger(__name__)

tests_router = APIRouter(prefix="/api/admin/system-tests")


def now_iso():
    return datetime.now(timezone.utc).isoformat()


async def _run_all_tests(db, current_user):
    """Run smoke tests directly via db / module function calls (no HTTP)."""
    results = []

    async def record(name, group, fn):
        t0 = time.perf_counter()
        try:
            detail = await fn()
            results.append({
                "name": name, "group": group, "status": "pass",
                "duration_ms": round((time.perf_counter() - t0) * 1000, 2),
                "detail": detail or "OK",
            })
        except AssertionError as e:
            results.append({
                "name": name, "group": group, "status": "fail",
                "duration_ms": round((time.perf_counter() - t0) * 1000, 2),
                "detail": str(e),
            })
        except Exception as e:
            results.append({
                "name": name, "group": group, "status": "error",
                "duration_ms": round((time.perf_counter() - t0) * 1000, 2),
                "detail": f"{type(e).__name__}: {e}",
            })

    # --- DB connectivity ---
    async def t_db():
        names = await db.list_collection_names()
        assert isinstance(names, list), "list_collection_names must return list"
        return f"{len(names)} collections"

    await record("MongoDB connectivity", "Database", t_db)

    # --- Settings ---
    async def t_settings():
        s = await db.settings.find_one({"id": "global"}, {"_id": 0})
        assert s, "settings not bootstrapped"
        assert "base_price" in s, "base_price missing"
        return f"base_price={s['base_price']}"

    await record("Global settings exist", "Bootstrap", t_settings)

    # --- Admin user ---
    async def t_admin():
        a = await db.users.find_one({"role": "admin"}, {"_id": 0})
        assert a, "admin user not seeded"
        return f"admin phone={a.get('phone')}"

    await record("Admin user seeded", "Bootstrap", t_admin)

    # --- JWT_SECRET ---
    async def t_jwt():
        assert os.environ.get("JWT_SECRET"), "JWT_SECRET env missing"
        return "configured"

    await record("JWT_SECRET configured", "Environment", t_jwt)

    # --- Emergent LLM Key ---
    async def t_llm_key():
        assert os.environ.get("EMERGENT_LLM_KEY"), "EMERGENT_LLM_KEY env missing"
        return "configured"

    await record("EMERGENT_LLM_KEY configured", "Environment", t_llm_key)

    # --- AI content module reachable (import + parser) ---
    async def t_studio_module():
        from ai_studio import extract_json, SYSTEM_PROMPT
        out = extract_json('{"a": 1, "b": "ok"}')
        assert out["a"] == 1, "JSON parser broken"
        assert len(SYSTEM_PROMPT) > 10, "system prompt empty"
        return "extractor + prompt OK"

    await record("AI Studio module health", "AI Module", t_studio_module)

    # --- AI content - LLM live call (small) ---
    async def t_llm_call():
        from ai_studio import call_llm
        sid = f"selftest-{uuid.uuid4().hex[:8]}"
        out = await call_llm(
            "You are a JSON tester. Respond only valid JSON.",
            'Return JSON {"ok": true} only.',
            sid,
        )
        assert "ok" in str(out).lower(), f"LLM unexpected response: {str(out)[:120]}"
        return f"response length={len(str(out))}"

    await record("AI LLM live call", "AI Module", t_llm_call)

    # --- Studio collection accessible ---
    async def t_studio_collection():
        await db.studio_contents.count_documents({})
        return "queryable"

    await record("Studio contents collection", "AI Module", t_studio_collection)

    # --- Referrers / registrations / payouts collections ---
    for col in ("referrers", "registrations", "payouts", "users"):
        async def maker(c=col):
            async def f():
                await db[c].count_documents({})
                return "queryable"
            return f
        await record(f"Collection: {col}", "Database", await maker())

    # --- Public referrer code generator pattern ---
    async def t_codegen():
        from server import gen_code, gen_pin
        c = gen_code(5)
        p = gen_pin(5)
        assert len(c) == 5 and len(p) == 5, "code gen length"
        return f"code={c} pin={p}"

    await record("Code & PIN generators", "Utilities", t_codegen)

    # Summarize
    total = len(results)
    passed = sum(1 for r in results if r["status"] == "pass")
    failed = sum(1 for r in results if r["status"] != "pass")

    run = {
        "id": str(uuid.uuid4()),
        "run_by": current_user.get("id"),
        "run_by_name": current_user.get("name") or current_user.get("phone"),
        "created_at": now_iso(),
        "total": total,
        "passed": passed,
        "failed": failed,
        "duration_ms": round(sum(r["duration_ms"] for r in results), 2),
        "results": results,
    }
    return run


def register_routes(require_admin_dep, db):
    @tests_router.post("/run")
    async def run_tests(admin: dict = Depends(require_admin_dep)):
        run = await _run_all_tests(db, admin)
        await db.test_runs.insert_one(run.copy())
        run.pop("_id", None)
        return run

    @tests_router.get("/history")
    async def history(admin: dict = Depends(require_admin_dep)):
        items = await db.test_runs.find({}, {"_id": 0}).sort("created_at", -1).to_list(50)
        return items

    @tests_router.get("/{run_id}")
    async def get_run(run_id: str, admin: dict = Depends(require_admin_dep)):
        item = await db.test_runs.find_one({"id": run_id}, {"_id": 0})
        if not item:
            raise HTTPException(404, "اجرای تست یافت نشد")
        return item

    @tests_router.delete("/{run_id}")
    async def delete_run(run_id: str, admin: dict = Depends(require_admin_dep)):
        r = await db.test_runs.delete_one({"id": run_id})
        if r.deleted_count == 0:
            raise HTTPException(404, "یافت نشد")
        return {"success": True}

    return tests_router
