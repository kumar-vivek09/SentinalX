from dotenv import load_dotenv
from pathlib import Path

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')
from fastapi import FastAPI, APIRouter, HTTPException, Request, Depends, WebSocket, WebSocketDisconnect, status , Response
from fastapi.responses import JSONResponse
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import re
import logging
from pydantic import BaseModel, Field, ConfigDict, EmailStr
from typing import List, Optional
from datetime import datetime, timezone, timedelta
import bcrypt
import jwt
from bson import ObjectId
import asyncio
import random
import requests
from ai_service import analyze_threat
from ai_service import analyze_threat

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

app = FastAPI()
api_router = APIRouter(prefix="/api")

JWT_SECRET = os.environ.get("JWT_SECRET")
JWT_ALGORITHM = "HS256"
OLLAMA_HOST = os.environ.get("OLLAMA_HOST", "http://localhost:11434")
OLLAMA_MODEL = os.environ.get("OLLAMA_MODEL", "llama3.1")


class ConnectionManager:
    def __init__(self):
        self.active_connections: List[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)

    def disconnect(self, websocket: WebSocket):
        self.active_connections.remove(websocket)

    async def broadcast(self, message: dict):
        for connection in self.active_connections:
            try:
                await connection.send_json(message)
            except:
                pass

manager = ConnectionManager()

def hash_password(password: str) -> str:
    salt = bcrypt.gensalt()
    hashed = bcrypt.hashpw(password.encode("utf-8"), salt)
    return hashed.decode("utf-8")

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return bcrypt.checkpw(plain_password.encode("utf-8"), hashed_password.encode("utf-8"))

def create_access_token(user_id: str, email: str) -> str:
    payload = {"sub": user_id, "email": email, "exp": datetime.now(timezone.utc) + timedelta(minutes=60), "type": "access"}
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)

def create_refresh_token(user_id: str) -> str:
    payload = {"sub": user_id, "exp": datetime.now(timezone.utc) + timedelta(days=7), "type": "refresh"}
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)

async def get_current_user(request: Request) -> dict:
    token = request.cookies.get("access_token")
    if not token:
        auth_header = request.headers.get("Authorization", "")
        if auth_header.startswith("Bearer "):
            token = auth_header[7:]
    if not token:
        raise HTTPException(status_code=401, detail="Not authenticated")
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        if payload.get("type") != "access":
            raise HTTPException(status_code=401, detail="Invalid token type")
        user = await db.users.find_one({"_id": ObjectId(payload["sub"])})
        if not user:
            raise HTTPException(status_code=401, detail="User not found")
        user["_id"] = str(user["_id"])
        user.pop("password_hash", None)
        return user
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")

class LoginRequest(BaseModel):
    email: EmailStr
    password: str

class RegisterRequest(BaseModel):
    email: EmailStr
    password: str
    name: str

class ChatRequest(BaseModel):
    message: str
    
origins = os.environ.get("CORS_ORIGINS", "http://localhost:3000").split(",")
app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=origins,
    allow_methods=["*"],
    allow_headers=["*"],
)  

api_router = APIRouter(prefix="/api")
@api_router.post("/auth/register")
async def register(req: RegisterRequest, response: Response):
    email = req.email.lower()
    existing = await db.users.find_one({"email": email})
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    hashed = hash_password(req.password)
    user_doc = {
        "email": email,
        "name": req.name,
        "password_hash": hashed,
        "role": "user",
        "created_at": datetime.now(timezone.utc)
    }
    result = await db.users.insert_one(user_doc)
    user_id = str(result.inserted_id)
    
    access_token = create_access_token(user_id, email)
    refresh_token = create_refresh_token(user_id)
    response.set_cookie(key="access_token", value=access_token, httponly=True, secure=True, samesite="none", max_age=3600, path="/")
    response.set_cookie(key="refresh_token", value=refresh_token, httponly=True, secure=True, samesite="none", max_age=604800, path="/")
    return {"email": email, "name": req.name, "role": "user"}

@api_router.post("/auth/login")
async def login(req: LoginRequest, response: Response):
    email = req.email.lower()
    user = await db.users.find_one({"email": email})
    if not user or not verify_password(req.password, user["password_hash"]):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    
    user_id = str(user["_id"])
    access_token = create_access_token(user_id, email)
    refresh_token = create_refresh_token(user_id)
    
    # response = JSONResponse(content={"email": email, "name": user.get("name"), "role": user.get("role")})
    response.set_cookie(key="access_token", value=access_token, httponly=True, secure=True, samesite="none", max_age=3600, path="/")
    response.set_cookie(key="refresh_token", value=refresh_token, httponly=True, secure=True, samesite="none", max_age=604800, path="/")
    return {"email": email, "name": user.get("name"), "role": user.get("role"), "token": access_token}

@api_router.get("/auth/me")
async def get_me(user: dict = Depends(get_current_user)):
    return user

@api_router.post("/auth/logout")
async def logout(response: Response):
    # response = JSONResponse(content={"message": "Logged out"})
    response.delete_cookie("access_token")
    response.delete_cookie("refresh_token")
    return {"message": "Logged out"}

@api_router.get("/logs")
async def get_logs(user: dict = Depends(get_current_user)):
    logs = await db.logs.find({}, {"_id": 0}).sort("timestamp", -1).limit(100).to_list(100)
    return {"logs": logs}

@api_router.get("/alerts")
async def get_alerts(user: dict = Depends(get_current_user)):
    alerts = await db.alerts.find({}, {"_id": 0}).sort("timestamp", -1).limit(50).to_list(50)
    return {"alerts": alerts}

@api_router.get("/users")
async def get_users_list(user: dict = Depends(get_current_user)):
    users = await db.users.find({}, {"_id": 0, "password_hash": 0}).to_list(100)
    return {"users": users}

@api_router.get("/stats")
async def get_stats(user: dict = Depends(get_current_user)):
    total_events = await db.logs.count_documents({})
    critical_alerts = await db.alerts.count_documents({"severity": "critical"})
    active_threats = await db.alerts.count_documents({"status": "active"})
    suspicious_users = await db.users.count_documents({"risk_score": {"$gt": 70}})
    
    avg_risk = await db.users.aggregate([
        {"$group": {"_id": None, "avgRisk": {"$avg": "$risk_score"}}}
    ]).to_list(1)
    risk_score = int(avg_risk[0]["avgRisk"]) if avg_risk and avg_risk[0].get("avgRisk") else 58
    
    return {
        "total_events": total_events,
        "critical_alerts": critical_alerts,
        "active_threats": active_threats,
        "suspicious_users": suspicious_users,
        "risk_score": risk_score
    }

@api_router.post("/ai/chat")
async def ai_chat(req: ChatRequest, user: dict = Depends(get_current_user)):
    try:
        message = req.message.strip()[:500]

        if not message:
            raise HTTPException(status_code=400, detail="Message cannot be empty")

        response_text = await asyncio.to_thread(analyze_threat, message)

        return {"response": response_text}

    except Exception as e:
        logger.error(f"AI error: {str(e)}")
        return {
            "response": "AI service temporarily unavailable. Please try again."
        }
    
@api_router.get("/integrations/status")
async def integration_status(user: dict = Depends(get_current_user)):
    google_status = bool(os.environ.get("GOOGLE_CLIENT_ID") and os.environ.get("GOOGLE_CLIENT_ID") != "your_google_client_id_here")
    slack_status = bool(os.environ.get("SLACK_BOT_TOKEN") and os.environ.get("SLACK_BOT_TOKEN") != "your_slack_bot_token_here")
    
    return {
        "integrations": [
            {"name": "Google", "status": "connected" if google_status else "disabled", "icon": "google"},
            {"name": "Slack", "status": "connected" if slack_status else "disabled", "icon": "slack"},
            {"name": "Zoho", "status": "disabled", "icon": "zoho"}
        ]
    }

@api_router.get("/settings")
async def get_settings(user: dict = Depends(get_current_user)):
    settings_doc = await db.settings.find_one({"user_id": user["email"]}) or {}
    return {
        "ai_analysis_enabled": settings_doc.get("ai_analysis_enabled", True),
        "alerts_enabled": settings_doc.get("alerts_enabled", True)
    }

@api_router.post("/settings")
async def update_settings(settings: dict, user: dict = Depends(get_current_user)):
    await db.settings.update_one(
        {"user_id": user["email"]},
        {"$set": {**settings, "updated_at": datetime.now(timezone.utc)}},
        upsert=True
    )
    return {"message": "Settings updated"}

@api_router.post("/reset-logs")
async def reset_logs(user: dict = Depends(get_current_user)):
    if user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Admin only")
    await db.logs.delete_many({})
    await db.alerts.delete_many({})
    return {"message": "Logs reset successfully"}

@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await manager.connect(websocket)
    try:
        while True:
            await asyncio.sleep(5)
            threat_data = {
                "type": "threat_update",
                "data": {
                    "timestamp": datetime.now(timezone.utc).isoformat(),
                    "threat_level": random.randint(20, 120)
                }
            }
            await manager.broadcast(threat_data)
    except WebSocketDisconnect:
        manager.disconnect(websocket)

app.include_router(api_router)



async def seed_data():
    admin_email = os.environ.get("ADMIN_EMAIL", "viveklal413@gmail.com").lower()
    admin_password = os.environ.get("ADMIN_PASSWORD", "Admin@123")
    
    existing_admin = await db.users.find_one({"email": admin_email})
    if not existing_admin:
        await db.users.insert_one({
            "email": admin_email,
            "name": "Admin",
            "password_hash": hash_password(admin_password),
            "role": "admin",
            "risk_score": 5,
            "activity_count": 0,
            "created_at": datetime.now(timezone.utc)
        })
        logger.info(f"Admin user created: {admin_email}")
    
    test_user = await db.users.find_one({"email": "user@sentinelx.com"})
    if not test_user:
        await db.users.insert_one({
            "email": "user@sentinelx.com",
            "name": "Test User",
            "password_hash": hash_password("User@123"),
            "role": "user",
            "risk_score": 45,
            "activity_count": 87,
            "created_at": datetime.now(timezone.utc)
        })
    
    if await db.logs.count_documents({}) == 0:
        sample_logs = [
            {"user": "vivek.sharma", "action": "login", "source": "Google", "timestamp": datetime.now(timezone.utc) - timedelta(minutes=5), "risk_level": "LOW"},
            {"user": "sarah.chen", "action": "file_download", "source": "Google", "timestamp": datetime.now(timezone.utc) - timedelta(minutes=10), "risk_level": "MEDIUM"},
            {"user": "john.doe", "action": "bulk_messages", "source": "Slack", "timestamp": datetime.now(timezone.utc) - timedelta(minutes=15), "risk_level": "HIGH"},
            {"user": "admin", "action": "login", "source": "Google", "timestamp": datetime.now(timezone.utc) - timedelta(minutes=20), "risk_level": "LOW"},
        ]
        await db.logs.insert_many(sample_logs)
    
    if await db.alerts.count_documents({}) == 0:
        sample_alerts = [
            {"title": "Multiple failed login attempts detected", "user": "vivek.sharma", "severity": "critical", "status": "active", "timestamp": datetime.now(timezone.utc) - timedelta(minutes=2)},
            {"title": "Mass file download detected (847 files)", "user": "vivek.sharma", "severity": "critical", "status": "active", "timestamp": datetime.now(timezone.utc) - timedelta(minutes=5)},
            {"title": "Suspicious Slack activity: bulk messages", "user": "john.doe", "severity": "warning", "status": "active", "timestamp": datetime.now(timezone.utc) - timedelta(minutes=8)},
        ]
        await db.alerts.insert_many(sample_alerts)
    
    await db.users.create_index("email", unique=True)
    logger.info("Database seeding completed")

@app.on_event("startup")
async def startup_event():
    await seed_data()

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()


