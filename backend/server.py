from dotenv import load_dotenv
from pathlib import Path
import os

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

from fastapi import FastAPI, APIRouter, HTTPException, Request, Response, Depends
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
from pydantic import BaseModel, EmailStr
from datetime import datetime, timezone, timedelta
from bson import ObjectId
import bcrypt
import jwt

# ================= ENV =================

mongo_url = os.environ.get('MONGO_URL')
db_name = os.environ.get('DB_NAME', 'finance_app')

if not mongo_url:
    raise Exception("❌ MONGO_URL not set")

client = AsyncIOMotorClient(mongo_url)
db = client[db_name]

JWT_SECRET = os.environ.get('JWT_SECRET', 'default-secret')
JWT_ALGORITHM = "HS256"

app = FastAPI()
api = APIRouter(prefix="/api")

# ================= CORS (FIXED) =================
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "https://capitalcare-ai-finance-tracker.vercel.app",
        "https://capitalcare-ai-finance-tracker-dbi7kbixa.vercel.app"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ================= PLAN SYSTEM =================

PLAN_FEATURES = {
    "free": ["transactions", "dashboard"],
    "pro": ["transactions", "dashboard", "export", "daily_limit", "weekly_digest"],
    "elite": ["transactions", "dashboard", "export", "daily_limit", "weekly_digest", "ai_chat"]
}

def check_feature(user, feature):
    plan = user.get("plan", "free")
    if feature not in PLAN_FEATURES.get(plan, []):
        raise HTTPException(
            status_code=403,
            detail=f"{feature} locked in {plan} plan"
        )

# ================= AUTH =================

def hash_pw(pw):
    return bcrypt.hashpw(pw.encode(), bcrypt.gensalt()).decode()

def verify_pw(pw, h):
    return bcrypt.checkpw(pw.encode(), h.encode())

def make_token(uid, email):
    return jwt.encode(
        {
            "sub": uid,
            "email": email,
            "exp": datetime.now(timezone.utc) + timedelta(days=7)
        },
        JWT_SECRET,
        algorithm=JWT_ALGORITHM
    )

# ✅ SUPPORT BOTH COOKIE + HEADER
async def current_user(request: Request):
    token = request.cookies.get("access_token")

    if not token:
        auth = request.headers.get("Authorization")
        if auth and "Bearer " in auth:
            token = auth.split(" ")[1]

    if not token:
        raise HTTPException(status_code=401, detail="Not authenticated")

    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        user = await db.users.find_one({"_id": ObjectId(payload["sub"])})

        if not user:
            raise HTTPException(status_code=401, detail="User not found")

        user["_id"] = str(user["_id"])
        return user

    except Exception:
        raise HTTPException(status_code=401, detail="Invalid token")

# ================= MODELS =================

class Register(BaseModel):
    name: str
    email: EmailStr
    password: str

class Login(BaseModel):
    email: EmailStr
    password: str

class Transaction(BaseModel):
    title: str
    amount: float
    type: str
    category: str

# ================= AUTH ROUTES =================

@api.post("/register")
async def register(data: Register, response: Response):
    user = {
        "name": data.name,
        "email": data.email.lower(),
        "password": hash_pw(data.password),
        "plan": "free",  # ✅ DEFAULT PLAN
        "created_at": datetime.now(timezone.utc)
    }

    res = await db.users.insert_one(user)
    token = make_token(str(res.inserted_id), data.email)

    response.set_cookie(
        key="access_token",
        value=token,
        httponly=True,
        secure=True,
        samesite="None"
    )

    return {"message": "Registered", "plan": "free"}

@api.post("/login")
async def login(data: Login, response: Response):
    user = await db.users.find_one({"email": data.email.lower()})

    if not user or not verify_pw(data.password, user["password"]):
        raise HTTPException(status_code=401, detail="Invalid credentials")

    token = make_token(str(user["_id"]), user["email"])

    response.set_cookie(
        key="access_token",
        value=token,
        httponly=True,
        secure=True,
        samesite="None"
    )

    return {
        "message": "Logged in",
        "plan": user.get("plan", "free")
    }

@api.get("/me")
async def me(user=Depends(current_user)):
    user.pop("password", None)
    return user

# ================= TRANSACTIONS =================

@api.post("/transactions")
async def add_transaction(data: Transaction, user=Depends(current_user)):
    check_feature(user, "transactions")

    tx = {
        "user_id": user["_id"],
        "title": data.title,
        "amount": data.amount,
        "type": data.type,
        "category": data.category,
        "created_at": datetime.now(timezone.utc),
    }

    await db.transactions.insert_one(tx)
    return {"message": "Transaction added"}

@api.get("/transactions")
async def get_transactions(user=Depends(current_user)):
    res = []
    async for t in db.transactions.find({"user_id": user["_id"]}):
        t["_id"] = str(t["_id"])
        res.append(t)
    return res

# ================= DASHBOARD =================

@api.get("/dashboard")
async def dashboard(user=Depends(current_user)):
    income = 0
    expenses = 0

    async for t in db.transactions.find({"user_id": user["_id"]}):
        if t["type"] == "income":
            income += t["amount"]
        else:
            expenses += t["amount"]

    return {
        "income": income,
        "expenses": expenses,
        "balance": income - expenses,
        "plan": user.get("plan", "free")
    }

# ================= EXTRA FEATURES =================

@api.get("/daily-limit")
async def daily_limit(user=Depends(current_user)):
    check_feature(user, "daily_limit")
    return {
        "limit": 500,
        "remaining": 300,
        "spent_today": 200,
        "percentage": 40
    }

@api.get("/weekly-digest")
async def weekly_digest(user=Depends(current_user)):
    check_feature(user, "weekly_digest")
    return {
        "total_spent": 1200,
        "total_saved": 300,
        "top_categories": [{"name": "Food"}],
        "vs_last_week": -5
    }

@api.post("/ai/chat")
async def ai_chat(user=Depends(current_user)):
    check_feature(user, "ai_chat")
    return {"response": "AI working 🚀"}

# ================= UPGRADE =================

@api.post("/upgrade")
async def upgrade(plan: str, user=Depends(current_user)):
    if plan not in ["free", "pro", "elite"]:
        raise HTTPException(400, "Invalid plan")

    await db.users.update_one(
        {"_id": ObjectId(user["_id"])},
        {"$set": {"plan": plan}}
    )

    return {"message": f"Upgraded to {plan}"}

# ================= ROOT =================

@app.get("/")
def root():
    return {"status": "Server running 🚀"}

# ================= INCLUDE =================

app.include_router(api)
