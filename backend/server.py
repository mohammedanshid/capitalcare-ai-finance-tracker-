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

# ================= DATABASE =================
mongo_url = os.environ.get('MONGO_URL')

if not mongo_url:
    raise Exception("❌ MONGO_URL not set")

client = AsyncIOMotorClient(mongo_url)
db = client[os.environ.get('DB_NAME', 'test')]

JWT_SECRET = os.environ.get('JWT_SECRET', 'mysecret123')
JWT_ALGORITHM = "HS256"

app = FastAPI()
api = APIRouter(prefix="/api")

# ================= CORS =================
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # later restrict to your frontend domain
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ================= AUTH UTILS =================
def hash_pw(pw):
    return bcrypt.hashpw(pw.encode(), bcrypt.gensalt()).decode()

def verify_pw(pw, h):
    return bcrypt.checkpw(pw.encode(), h.encode())

def make_token(uid, email):
    return jwt.encode(
        {
            "sub": uid,
            "email": email,
            "exp": datetime.now(timezone.utc) + timedelta(days=7),
        },
        JWT_SECRET,
        algorithm=JWT_ALGORITHM,
    )

async def current_user(request: Request):
    auth = request.headers.get("Authorization")

    if not auth:
        raise HTTPException(status_code=401, detail="No token")

    try:
        token = auth.split(" ")[1]
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])

        user = await db.users.find_one({"_id": ObjectId(payload["sub"])})

        if not user:
            raise HTTPException(status_code=401, detail="User not found")

        user["_id"] = str(user["_id"])
        user.pop("password_hash", None)
        return user

    except Exception:
        raise HTTPException(status_code=401, detail="Invalid token")

# ================= MODELS =================
class RegBody(BaseModel):
    name: str
    email: EmailStr
    password: str

class LoginBody(BaseModel):
    email: EmailStr
    password: str

# ================= AUTH ROUTES =================
@api.post("/register")
async def register(body: RegBody):
    email = body.email.lower()

    existing = await db.users.find_one({"email": email})
    if existing:
        raise HTTPException(status_code=400, detail="Email already exists")

    user = {
        "name": body.name,
        "email": email,
        "password_hash": hash_pw(body.password),
        "created_at": datetime.now(timezone.utc),
    }

    res = await db.users.insert_one(user)

    token = make_token(str(res.inserted_id), email)

    return {
        "message": "Registered successfully",
        "token": token,
        "user": {
            "id": str(res.inserted_id),
            "name": body.name,
            "email": email,
        },
    }

@api.post("/login")
async def login(body: LoginBody):
    user = await db.users.find_one({"email": body.email.lower()})

    if not user or not verify_pw(body.password, user["password_hash"]):
        raise HTTPException(status_code=401, detail="Invalid credentials")

    token = make_token(str(user["_id"]), user["email"])

    return {
        "message": "Login successful",
        "token": token,
        "user": {
            "id": str(user["_id"]),
            "name": user["name"],
            "email": user["email"],
        },
    }

@api.get("/me")
async def me(user=Depends(current_user)):
    return user

# ================= AI (SAFE PLACEHOLDER) =================
@api.post("/ai/chat")
async def ai_chat():
    return {"response": "AI temporarily disabled"}

# ================= ROOT =================
@app.get("/")
async def root():
    return {"status": "Server running 🚀"}

# ================= ROUTER =================
app.include_router(api)
