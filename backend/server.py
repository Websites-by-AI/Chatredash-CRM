from fastapi import FastAPI, APIRouter, HTTPException, Depends, Header, Query, Body
from fastapi.responses import StreamingResponse
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import io
import zipfile
import logging
import secrets
import string
import random
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional
import uuid
import jwt
from datetime import datetime, timezone, timedelta


ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

JWT_SECRET = os.environ.get('JWT_SECRET', 'change-me-secret-key-rotbar')
JWT_ALG = 'HS256'

app = FastAPI()
api_router = APIRouter(prefix="/api")


# ----------------- Helpers -----------------

def now_iso():
    return datetime.now(timezone.utc).isoformat()


def gen_code(n=5):
    alphabet = string.ascii_uppercase + string.digits
    return ''.join(secrets.choice(alphabet) for _ in range(n))


def gen_pin(n=5):
    return ''.join(secrets.choice(string.digits) for _ in range(n))


def make_token(user_id: str, role: str):
    payload = {
        'sub': user_id,
        'role': role,
        'exp': datetime.now(timezone.utc) + timedelta(days=30),
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALG)


async def get_current_user(authorization: Optional[str] = Header(None)):
    if not authorization or not authorization.startswith('Bearer '):
        raise HTTPException(401, 'Unauthorized')
    token = authorization.split(' ', 1)[1]
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALG])
    except jwt.PyJWTError:
        raise HTTPException(401, 'Invalid token')
    user = await db.users.find_one({'id': payload['sub']}, {'_id': 0})
    if not user:
        raise HTTPException(401, 'User not found')
    return user


async def require_admin(user: dict = Depends(get_current_user)):
    if user.get('role') != 'admin':
        raise HTTPException(403, 'Admin only')
    return user


async def require_referrer(user: dict = Depends(get_current_user)):
    if user.get('role') not in ('referrer', 'admin'):
        raise HTTPException(403, 'Referrer only')
    return user


# ----------------- Models -----------------

class SendOTP(BaseModel):
    phone: str


class VerifyOTP(BaseModel):
    phone: str
    code: str


class ReferrerCreate(BaseModel):
    phone: str
    name: str
    commission_pct: Optional[float] = None


class ReferrerUpdate(BaseModel):
    status: Optional[str] = None
    commission_pct: Optional[float] = None
    name: Optional[str] = None


class RegisterCreate(BaseModel):
    name: str
    phone: str
    field: str
    exam: str
    rank: str
    referrer_code: Optional[str] = None


class PayoutCreate(BaseModel):
    amount: float
    iban: str


class PayoutUpdate(BaseModel):
    status: str  # approved/rejected/paid


class SettingsUpdate(BaseModel):
    base_price: Optional[float] = None
    default_commission_pct: Optional[float] = None
    default_discount_pct: Optional[float] = None


class IbanUpdate(BaseModel):
    iban: str


# ----------------- Bootstrap -----------------

@app.on_event("startup")
async def startup():
    # default settings
    s = await db.settings.find_one({'id': 'global'})
    if not s:
        await db.settings.insert_one({
            'id': 'global',
            'base_price': 1_000_000.0,
            'default_commission_pct': 20.0,
            'default_discount_pct': 10.0,
            'updated_at': now_iso(),
        })
    # seed admin
    admin_phone = '09120000000'
    admin = await db.users.find_one({'phone': admin_phone})
    if not admin:
        await db.users.insert_one({
            'id': str(uuid.uuid4()),
            'phone': admin_phone,
            'name': 'مدیر سیستم',
            'role': 'admin',
            'created_at': now_iso(),
        })
    logger.info('Bootstrap complete')


# ----------------- Auth -----------------

@api_router.post('/auth/send-otp')
async def send_otp(payload: SendOTP):
    phone = payload.phone.strip()
    if not phone or len(phone) < 10:
        raise HTTPException(400, 'شماره موبایل نامعتبر')
    code = ''.join(random.choices(string.digits, k=5))
    await db.otps.update_one(
        {'phone': phone},
        {'$set': {'phone': phone, 'code': code, 'expires_at': (datetime.now(timezone.utc) + timedelta(minutes=10)).isoformat()}},
        upsert=True,
    )
    # In MOCK mode, return the code to ease UX
    return {'sent': True, 'dev_otp': code, 'message': 'کد یک‌بارمصرف ارسال شد (حالت آزمایشی)'}


@api_router.post('/auth/verify-otp')
async def verify_otp(payload: VerifyOTP):
    phone = payload.phone.strip()
    rec = await db.otps.find_one({'phone': phone}, {'_id': 0})
    if not rec or rec.get('code') != payload.code:
        raise HTTPException(400, 'کد وارد شده نامعتبر است')
    # check expiry
    try:
        exp = datetime.fromisoformat(rec['expires_at'])
        if exp < datetime.now(timezone.utc):
            raise HTTPException(400, 'کد منقضی شده')
    except (KeyError, ValueError):
        pass

    # find or create user as registrant by default
    user = await db.users.find_one({'phone': phone}, {'_id': 0})
    if not user:
        user = {
            'id': str(uuid.uuid4()),
            'phone': phone,
            'name': '',
            'role': 'registrant',
            'created_at': now_iso(),
        }
        await db.users.insert_one(user.copy())
    # Cleanup OTP
    await db.otps.delete_one({'phone': phone})

    token = make_token(user['id'], user['role'])
    return {'token': token, 'user': user}


@api_router.get('/auth/me')
async def auth_me(user: dict = Depends(get_current_user)):
    out = {'user': user}
    if user.get('role') == 'referrer':
        ref = await db.referrers.find_one({'user_id': user['id']}, {'_id': 0})
        out['referrer'] = ref
    return out


# ----------------- Public -----------------

@api_router.get('/public/settings')
async def public_settings():
    s = await db.settings.find_one({'id': 'global'}, {'_id': 0})
    return {
        'base_price': s['base_price'],
        'default_discount_pct': s['default_discount_pct'],
    }


@api_router.get('/public/referrer/{code}')
async def public_referrer(code: str):
    code = code.upper().strip()
    ref = await db.referrers.find_one({'referral_code': code, 'status': 'active'}, {'_id': 0})
    if not ref:
        raise HTTPException(404, 'کد معرف معتبر نیست')
    s = await db.settings.find_one({'id': 'global'}, {'_id': 0})
    return {
        'valid': True,
        'name': ref.get('name', ''),
        'referral_code': ref['referral_code'],
        'discount_pct': s['default_discount_pct'],
        'base_price': s['base_price'],
    }


@api_router.post('/public/register')
async def public_register(payload: RegisterCreate):
    s = await db.settings.find_one({'id': 'global'}, {'_id': 0})
    base_price = float(s['base_price'])
    discount_pct = 0.0
    referrer_code = None
    referrer_id = None
    commission_pct = 0.0

    if payload.referrer_code:
        rc = payload.referrer_code.upper().strip()
        ref = await db.referrers.find_one({'referral_code': rc, 'status': 'active'}, {'_id': 0})
        if ref:
            referrer_code = ref['referral_code']
            referrer_id = ref['id']
            commission_pct = float(ref.get('commission_pct') or s['default_commission_pct'])
            discount_pct = float(s['default_discount_pct'])

    discount_amount = round(base_price * discount_pct / 100.0)
    paid_amount = base_price - discount_amount
    commission_amount = round(paid_amount * commission_pct / 100.0) if referrer_id else 0

    reg = {
        'id': str(uuid.uuid4()),
        'name': payload.name,
        'phone': payload.phone,
        'field': payload.field,
        'exam': payload.exam,
        'rank': payload.rank,
        'referrer_code': referrer_code,
        'referrer_id': referrer_id,
        'discount_pct': discount_pct,
        'discount_amount': discount_amount,
        'base_price': base_price,
        'paid_amount': paid_amount,
        'commission_pct': commission_pct,
        'commission_amount': commission_amount,
        'status': 'pending',
        'created_at': now_iso(),
    }
    await db.registrations.insert_one(reg.copy())
    return {k: v for k, v in reg.items() if k != '_id'}


@api_router.post('/public/pay/{reg_id}')
async def public_pay(reg_id: str):
    reg = await db.registrations.find_one({'id': reg_id}, {'_id': 0})
    if not reg:
        raise HTTPException(404, 'ثبت‌نام پیدا نشد')
    if reg['status'] == 'paid':
        return {'success': True, 'already': True, 'registration': reg}

    await db.registrations.update_one(
        {'id': reg_id},
        {'$set': {'status': 'paid', 'paid_at': now_iso()}}
    )
    # Credit referrer
    if reg.get('referrer_id') and reg.get('commission_amount', 0) > 0:
        await db.referrers.update_one(
            {'id': reg['referrer_id']},
            {'$inc': {
                'total_earnings': reg['commission_amount'],
                'available_balance': reg['commission_amount'],
                'total_signups': 1,
            }}
        )
    reg['status'] = 'paid'
    return {'success': True, 'registration': reg}


# ----------------- Admin -----------------

@api_router.post('/admin/referrers')
async def admin_create_referrer(payload: ReferrerCreate, _admin: dict = Depends(require_admin)):
    phone = payload.phone.strip()
    s = await db.settings.find_one({'id': 'global'}, {'_id': 0})
    commission_pct = float(payload.commission_pct) if payload.commission_pct is not None else float(s['default_commission_pct'])

    # Find or create user
    user = await db.users.find_one({'phone': phone}, {'_id': 0})
    if not user:
        user = {
            'id': str(uuid.uuid4()),
            'phone': phone,
            'name': payload.name,
            'role': 'referrer',
            'created_at': now_iso(),
        }
        await db.users.insert_one(user.copy())
    else:
        await db.users.update_one(
            {'id': user['id']},
            {'$set': {'role': 'referrer', 'name': payload.name or user.get('name', '')}}
        )
        user['role'] = 'referrer'

    existing = await db.referrers.find_one({'user_id': user['id']}, {'_id': 0})
    if existing:
        raise HTTPException(400, 'این کاربر قبلاً به‌عنوان معرف ثبت شده است')

    # Make sure code is unique
    for _ in range(20):
        code = gen_code(5)
        if not await db.referrers.find_one({'referral_code': code}):
            break

    ref = {
        'id': str(uuid.uuid4()),
        'user_id': user['id'],
        'phone': phone,
        'name': payload.name,
        'referral_code': code,
        'security_pin': gen_pin(5),
        'commission_pct': commission_pct,
        'status': 'active',
        'total_earnings': 0,
        'available_balance': 0,
        'total_signups': 0,
        'iban': '',
        'created_at': now_iso(),
    }
    await db.referrers.insert_one(ref.copy())
    return {k: v for k, v in ref.items() if k != '_id'}


@api_router.get('/admin/referrers')
async def admin_list_referrers(_admin: dict = Depends(require_admin)):
    refs = await db.referrers.find({}, {'_id': 0}).sort('created_at', -1).to_list(1000)
    return refs


@api_router.patch('/admin/referrers/{ref_id}')
async def admin_update_referrer(ref_id: str, payload: ReferrerUpdate, _admin: dict = Depends(require_admin)):
    update = {k: v for k, v in payload.model_dump().items() if v is not None}
    if not update:
        raise HTTPException(400, 'هیچ تغییری ارسال نشد')
    await db.referrers.update_one({'id': ref_id}, {'$set': update})
    ref = await db.referrers.find_one({'id': ref_id}, {'_id': 0})
    return ref


@api_router.get('/admin/registrations')
async def admin_list_registrations(_admin: dict = Depends(require_admin)):
    regs = await db.registrations.find({}, {'_id': 0}).sort('created_at', -1).to_list(2000)
    return regs


@api_router.get('/admin/payouts')
async def admin_list_payouts(_admin: dict = Depends(require_admin)):
    pays = await db.payouts.find({}, {'_id': 0}).sort('created_at', -1).to_list(1000)
    return pays


@api_router.patch('/admin/payouts/{payout_id}')
async def admin_update_payout(payout_id: str, payload: PayoutUpdate, _admin: dict = Depends(require_admin)):
    payout = await db.payouts.find_one({'id': payout_id}, {'_id': 0})
    if not payout:
        raise HTTPException(404, 'درخواست تسویه پیدا نشد')

    new_status = payload.status
    if new_status not in ('approved', 'rejected', 'paid'):
        raise HTTPException(400, 'وضعیت نامعتبر')

    update = {'status': new_status, 'processed_at': now_iso()}
    await db.payouts.update_one({'id': payout_id}, {'$set': update})

    # If rejected, refund balance back
    if new_status == 'rejected' and payout['status'] != 'rejected':
        await db.referrers.update_one(
            {'id': payout['referrer_id']},
            {'$inc': {'available_balance': payout['amount']}}
        )

    payout.update(update)
    return payout


@api_router.get('/admin/stats')
async def admin_stats(_admin: dict = Depends(require_admin)):
    total_referrers = await db.referrers.count_documents({})
    active_referrers = await db.referrers.count_documents({'status': 'active'})
    total_regs = await db.registrations.count_documents({})
    paid_regs = await db.registrations.count_documents({'status': 'paid'})
    pipeline = [{'$match': {'status': 'paid'}}, {'$group': {'_id': None, 'total': {'$sum': '$paid_amount'}, 'commissions': {'$sum': '$commission_amount'}}}]
    agg = await db.registrations.aggregate(pipeline).to_list(1)
    revenue = agg[0]['total'] if agg else 0
    commissions = agg[0]['commissions'] if agg else 0
    pending_payouts = await db.payouts.count_documents({'status': 'pending'})
    return {
        'total_referrers': total_referrers,
        'active_referrers': active_referrers,
        'total_registrations': total_regs,
        'paid_registrations': paid_regs,
        'revenue': revenue,
        'commissions': commissions,
        'pending_payouts': pending_payouts,
    }


@api_router.get('/admin/settings')
async def admin_get_settings(_admin: dict = Depends(require_admin)):
    s = await db.settings.find_one({'id': 'global'}, {'_id': 0})
    return s


@api_router.put('/admin/settings')
async def admin_update_settings(payload: SettingsUpdate, _admin: dict = Depends(require_admin)):
    update = {k: v for k, v in payload.model_dump().items() if v is not None}
    update['updated_at'] = now_iso()
    await db.settings.update_one({'id': 'global'}, {'$set': update}, upsert=True)
    s = await db.settings.find_one({'id': 'global'}, {'_id': 0})
    return s


# ----------------- Referrer -----------------

@api_router.get('/referrer/me')
async def referrer_me(user: dict = Depends(require_referrer)):
    ref = await db.referrers.find_one({'user_id': user['id']}, {'_id': 0})
    if not ref:
        raise HTTPException(404, 'حساب معرف یافت نشد')
    return ref


@api_router.get('/referrer/registrations')
async def referrer_registrations(user: dict = Depends(require_referrer)):
    ref = await db.referrers.find_one({'user_id': user['id']}, {'_id': 0})
    if not ref:
        return []
    regs = await db.registrations.find({'referrer_id': ref['id']}, {'_id': 0}).sort('created_at', -1).to_list(500)
    # Mask phone numbers (privacy)
    for r in regs:
        ph = r.get('phone', '')
        if len(ph) >= 7:
            r['phone'] = ph[:4] + '***' + ph[-3:]
    return regs


@api_router.post('/referrer/payout')
async def referrer_request_payout(payload: PayoutCreate, user: dict = Depends(require_referrer)):
    ref = await db.referrers.find_one({'user_id': user['id']}, {'_id': 0})
    if not ref:
        raise HTTPException(404, 'حساب معرف یافت نشد')
    if payload.amount <= 0:
        raise HTTPException(400, 'مبلغ نامعتبر')
    if payload.amount > ref.get('available_balance', 0):
        raise HTTPException(400, 'موجودی کافی نیست')
    if not payload.iban or len(payload.iban) < 10:
        raise HTTPException(400, 'شماره شبا نامعتبر')

    payout = {
        'id': str(uuid.uuid4()),
        'referrer_id': ref['id'],
        'referrer_name': ref['name'],
        'amount': payload.amount,
        'iban': payload.iban,
        'status': 'pending',
        'created_at': now_iso(),
    }
    await db.payouts.insert_one(payout.copy())
    await db.referrers.update_one(
        {'id': ref['id']},
        {'$inc': {'available_balance': -payload.amount}, '$set': {'iban': payload.iban}}
    )
    return {k: v for k, v in payout.items() if k != '_id'}


@api_router.get('/referrer/payouts')
async def referrer_payouts(user: dict = Depends(require_referrer)):
    ref = await db.referrers.find_one({'user_id': user['id']}, {'_id': 0})
    if not ref:
        return []
    pays = await db.payouts.find({'referrer_id': ref['id']}, {'_id': 0}).sort('created_at', -1).to_list(500)
    return pays


@api_router.put('/referrer/iban')
async def referrer_update_iban(payload: IbanUpdate, user: dict = Depends(require_referrer)):
    ref = await db.referrers.find_one({'user_id': user['id']}, {'_id': 0})
    if not ref:
        raise HTTPException(404, 'حساب معرف یافت نشد')
    await db.referrers.update_one({'id': ref['id']}, {'$set': {'iban': payload.iban}})
    return {'success': True, 'iban': payload.iban}


@api_router.get('/')
async def root():
    return {'message': 'Rotbar Bartar API'}


# ----------------- TEMPORARY: Source download (admin only) -----------------
# NOTE: This is a TEMP test endpoint. Remove before going to production.
SOURCE_ROOT = Path('/app')
EXCLUDE_DIRS = {'node_modules', '__pycache__', '.git', 'dist', 'build', '.next', '.cache', 'venv', '.venv', 'test_reports', 'tests'}
EXCLUDE_FILES = {'.env', '.env.local', '.env.production', '.DS_Store', 'yarn.lock', 'package-lock.json'}


def _build_source_zip() -> bytes:
    buf = io.BytesIO()
    with zipfile.ZipFile(buf, 'w', zipfile.ZIP_DEFLATED) as zf:
        for folder in ['backend', 'frontend']:
            base = SOURCE_ROOT / folder
            if not base.exists():
                continue
            for path in base.rglob('*'):
                # skip excluded dirs anywhere in path
                if any(part in EXCLUDE_DIRS for part in path.parts):
                    continue
                if path.is_file() and path.name not in EXCLUDE_FILES:
                    try:
                        rel = path.relative_to(SOURCE_ROOT)
                        zf.write(path, arcname=str(rel))
                    except (OSError, ValueError):
                        continue
        # Include root README/PRD if exist
        for fname in ['README.md']:
            p = SOURCE_ROOT / fname
            if p.exists() and p.is_file():
                zf.write(p, arcname=fname)
    buf.seek(0)
    return buf.getvalue()


def _verify_admin_from_token(token: str) -> bool:
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALG])
        return payload.get('role') == 'admin'
    except jwt.PyJWTError:
        return False


@api_router.get('/admin/download-source')
async def admin_download_source(token: str = Query(...)):
    """Return zip of source. Token passed as query (so anchor href works)."""
    if not _verify_admin_from_token(token):
        raise HTTPException(401, 'Unauthorized')
    data = _build_source_zip()
    headers = {'Content-Disposition': 'attachment; filename="rotbar-bartar-source.zip"'}
    return StreamingResponse(io.BytesIO(data), media_type='application/zip', headers=headers)


# --- Source Version Snapshots ---
SNAPSHOT_DIR = Path('/app/source_snapshots')
SNAPSHOT_DIR.mkdir(parents=True, exist_ok=True)


@api_router.post('/admin/source-snapshots')
async def admin_create_snapshot(payload: dict = Body(default={}), current_user: dict = Depends(get_current_user)):
    if current_user.get('role') != 'admin':
        raise HTTPException(403, 'فقط ادمین')
    label = (payload or {}).get('label') or datetime.now(timezone.utc).strftime('%Y-%m-%d %H:%M')
    sid = str(uuid.uuid4())[:8]
    ts = datetime.now(timezone.utc).isoformat()
    data = _build_source_zip()
    fname = f"snap-{datetime.now(timezone.utc).strftime('%Y%m%d-%H%M%S')}-{sid}.zip"
    (SNAPSHOT_DIR / fname).write_bytes(data)
    doc = {'id': sid, 'label': label, 'filename': fname, 'size': len(data), 'created_at': ts,
           'created_by': current_user.get('phone')}
    await db.source_snapshots.insert_one(doc.copy())
    return doc


@api_router.get('/admin/source-snapshots')
async def admin_list_snapshots(current_user: dict = Depends(get_current_user)):
    if current_user.get('role') != 'admin':
        raise HTTPException(403, 'فقط ادمین')
    docs = await db.source_snapshots.find({}, {'_id': 0}).sort('created_at', -1).to_list(200)
    # keep only those with files still on disk
    return [d for d in docs if (SNAPSHOT_DIR / d['filename']).exists()]


@api_router.get('/admin/source-snapshots/{sid}/download')
async def admin_download_snapshot(sid: str, token: str = Query(...)):
    if not _verify_admin_from_token(token):
        raise HTTPException(401, 'Unauthorized')
    doc = await db.source_snapshots.find_one({'id': sid}, {'_id': 0})
    if not doc:
        raise HTTPException(404, 'Snapshot not found')
    path = SNAPSHOT_DIR / doc['filename']
    if not path.exists():
        raise HTTPException(404, 'Snapshot file missing')
    headers = {'Content-Disposition': f'attachment; filename="{doc["filename"]}"'}
    return StreamingResponse(io.BytesIO(path.read_bytes()), media_type='application/zip', headers=headers)


@api_router.delete('/admin/source-snapshots/{sid}')
async def admin_delete_snapshot(sid: str, current_user: dict = Depends(get_current_user)):
    if current_user.get('role') != 'admin':
        raise HTTPException(403, 'فقط ادمین')
    doc = await db.source_snapshots.find_one({'id': sid}, {'_id': 0})
    if doc:
        path = SNAPSHOT_DIR / doc['filename']
        if path.exists():
            path.unlink()
        await db.source_snapshots.delete_one({'id': sid})
    return {'ok': True}


app.include_router(api_router)

# AI Content Studio
from ai_studio import register_routes as _register_studio_routes
app.include_router(_register_studio_routes(get_current_user, db))

# System self-tests (admin only)
from system_tests import register_routes as _register_tests_routes
app.include_router(_register_tests_routes(require_admin, db))

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)


@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
