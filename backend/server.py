from dotenv import load_dotenv
from pathlib import Path
import os

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

from fastapi import FastAPI, APIRouter, HTTPException, Request, Depends
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

# ================= CORS =================
origins = [
    "http://localhost:3000",
    "https://capitalcare-ai-finance-tracker-7xvuafkv9.vercel.app",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_origin_regex=r"https://.*\.vercel\.app",
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
        raise HTTPException(403, f"{feature} locked in {plan} plan")

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

# ✅ UPDATED: ONLY HEADER TOKEN (NO COOKIE)
async def current_user(request: Request):
    auth = request.headers.get("Authorization")

    if not auth or "Bearer " not in auth:
        raise HTTPException(401, "Not authenticated")

    token = auth.split(" ")[1]

    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        user = await db.users.find_one({"_id": ObjectId(payload["sub"])})

        if not user:
            raise HTTPException(401, "User not found")

        user["_id"] = str(user["_id"])
        return user

    except:
        raise HTTPException(401, "Invalid token")

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
async def register(data: Register):
    existing = await db.users.find_one({"email": data.email.lower()})
    if existing:
        raise HTTPException(400, "Email already registered")

    user = {
        "name": data.name,
        "email": data.email.lower(),
        "password": hash_pw(data.password),
        "plan": "free",
        "created_at": datetime.now(timezone.utc)
    }

    res = await db.users.insert_one(user)
    token = make_token(str(res.inserted_id), data.email)

    return {
        "message": "Registered",
        "token": token
    }

@api.post("/login")
async def login(data: Login):
    user = await db.users.find_one({"email": data.email.lower()})

    if not user or not verify_pw(data.password, user["password"]):
        raise HTTPException(401, "Invalid credentials")

    token = make_token(str(user["_id"]), user["email"])

    return {
        "message": "Logged in",
        "token": token
    }

@api.get("/me")
async def me(user=Depends(current_user)):
    user.pop("password", None)
    return user

# ================= TRANSACTIONS =================

@api.post("/transactions")
async def add_transaction(data: Transaction, user=Depends(current_user)):
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
        "balance": income - expenses
    }

# ================= ROOT =================

@app.get("/")
def root():
    return {"status": "Server running 🚀"}

app.include_router(api)
