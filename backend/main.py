from fastapi import FastAPI, Depends, HTTPException, status, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
import firebase_admin
from firebase_admin import credentials, auth
import uvicorn
import os
from dotenv import load_dotenv
from datetime import datetime
import uuid
import json

from models import *
from services.database import DatabaseService
from services.vector_store import VectorStoreService  
from services.ai_service import AIService
from services.file_service import FileService

load_dotenv()

app = FastAPI(title="PANDA API", version="1.0.0")

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize Firebase Admin SDK
firebase_config = {
    "type": "service_account",
    "project_id": os.getenv("FIREBASE_PROJECT_ID"),
    "private_key_id": os.getenv("FIREBASE_PRIVATE_KEY_ID"),
    "private_key": os.getenv("FIREBASE_PRIVATE_KEY", "").replace('\\n', '\n'),
    "client_email": os.getenv("FIREBASE_CLIENT_EMAIL"),
    "client_id": os.getenv("FIREBASE_CLIENT_ID"),
    "auth_uri": "https://accounts.google.com/o/oauth2/auth",
    "token_uri": "https://oauth2.googleapis.com/token",
}

try:
    cred = credentials.Certificate(firebase_config)
    firebase_admin.initialize_app(cred)
except Exception as e:
    print(f"Firebase initialization error: {e}")

# Initialize services
db_service = DatabaseService()
vector_service = VectorStoreService()
ai_service = AIService()
file_service = FileService()

security = HTTPBearer()

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    """Verify Firebase token and return user info"""
    try:
        decoded_token = auth.verify_id_token(credentials.credentials)
        user_id = decoded_token['uid']
        user = await db_service.get_user(user_id)
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        return user
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Invalid authentication credentials: {str(e)}"
        )

@app.get("/")
async def root():
    return {"message": "PANDA API - Personalized AI for Notes, Discussion & Assistance"}

# Authentication endpoints
@app.post("/auth/create-profile")
async def create_profile(profile_data: UserCreate):
    """Create user profile after Firebase registration"""
    try:
        user_data = {
            "uid": profile_data.uid,
            "email": profile_data.email,
            "displayName": profile_data.displayName,
            "role": profile_data.role,
            "createdAt": datetime.utcnow().isoformat(),
            "sessions": []
        }
        
        await db_service.create_user(user_data)
        return {"message": "Profile created successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/auth/profile")
async def get_profile(current_user = Depends(get_current_user)):
    """Get current user profile"""
    return current_user

# Session endpoints
@app.post("/sessions/create")
async def create_session(current_user = Depends(get_current_user)):
    """Create a new session (speakers only)"""
    if current_user["role"] != "speaker":
        raise HTTPException(status_code=403, detail="Only speakers can create sessions")
    
    session_data = {
        "id": str(uuid.uuid4()),
        "title": f"Session {datetime.now().strftime('%Y-%m-%d %H:%M')}",
        "speakerId": current_user["uid"],
        "speakerName": current_user["displayName"],
        "status": "active",
        "createdAt": datetime.utcnow().isoformat(),
        "transcript": [],
        "resources": [],
        "tasks": [],
        "joinCode": str(uuid.uuid4())[:8].upper()
    }
    
    session = await db_service.create_session(session_data)
    return session

@app.get("/sessions/list")
async def list_sessions(current_user = Depends(get_current_user)):
    """List user's sessions"""
    sessions = await db_service.get_user_sessions(current_user["uid"])
    return sessions

@app.post("/sessions/join")
async def join_session(join_data: JoinSessionRequest, current_user = Depends(get_current_user)):
    """Join a session using join code"""
    session = await db_service.get_session_by_join_code(join_data.joinCode)
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    
    # Add user to session participants
    await db_service.add_session_participant(session["id"], current_user["uid"])
    return session

@app.get("/sessions/info/{join_code}")
async def get_session_info(join_code: str):
    """Get session info by join code (public endpoint)"""
    session = await db_service.get_session_by_join_code(join_code)
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    
    return {
        "title": session["title"],
        "speakerName": session["speakerName"],
        "status": session["status"]
    }

# Transcript endpoints
@app.post("/sessions/{session_id}/transcript")
async def add_transcript(
    session_id: str, 
    transcript_data: TranscriptRequest,
    current_user = Depends(get_current_user)
):
    """Add transcript chunk to session"""
    session = await db_service.get_session(session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    
    # Only speaker can add transcript
    if session["speakerId"] != current_user["uid"]:
        raise HTTPException(status_code=403, detail="Only session speaker can add transcript")
    
    # Create transcript chunk
    chunk = {
        "id": str(uuid.uuid4()),
        "text": transcript_data.text,
        "timestamp": transcript_data.timestamp or datetime.utcnow().isoformat(),
        "speakerId": current_user["uid"]
    }
    
    # Store in database
    await db_service.add_transcript_chunk(session_id, chunk)
    
    # Store in vector database for RAG
    await vector_service.store_transcript_chunk(session_id, chunk)
    
    return {"message": "Transcript added successfully"}

@app.get("/sessions/{session_id}/transcript")
async def get_transcript(session_id: str, current_user = Depends(get_current_user)):
    """Get session transcript"""
    session = await db_service.get_session(session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    
    # Check if user has access to session
    has_access = (
        session["speakerId"] == current_user["uid"] or
        await db_service.is_session_participant(session_id, current_user["uid"])
    )
    
    if not has_access:
        raise HTTPException(status_code=403, detail="Access denied")
    
    transcript_text = " ".join([chunk["text"] for chunk in session.get("transcript", [])])
    return {"text": transcript_text}

# Resource endpoints
@app.post("/sessions/{session_id}/resources/upload")
async def upload_resource(
    session_id: str,
    file: UploadFile = File(...),
    current_user = Depends(get_current_user)
):
    """Upload resource to session"""
    session = await db_service.get_session(session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    
    # Only speaker can upload resources
    if session["speakerId"] != current_user["uid"]:
        raise HTTPException(status_code=403, detail="Only session speaker can upload resources")
    
    # Save file and get URL
    file_url, file_type = await file_service.save_file(file)
    
    resource = {
        "id": str(uuid.uuid4()),
        "filename": file.filename,
        "originalName": file.filename,
        "type": file_type,
        "url": file_url,
        "uploadedAt": datetime.utcnow().isoformat(),
        "isActive": False
    }
    
    await db_service.add_session_resource(session_id, resource)
    return resource

@app.patch("/sessions/{session_id}/resources/{resource_id}/active")
async def set_active_resource(
    session_id: str,
    resource_id: str,
    current_user = Depends(get_current_user)
):
    """Set active resource for session"""
    session = await db_service.get_session(session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    
    # Only speaker can set active resource
    if session["speakerId"] != current_user["uid"]:
        raise HTTPException(status_code=403, detail="Only session speaker can set active resource")
    
    await db_service.set_active_resource(session_id, resource_id)
    return {"message": "Active resource updated"}

@app.get("/sessions/{session_id}/resources/active")
async def get_active_resource(session_id: str, current_user = Depends(get_current_user)):
    """Get active resource for session"""
    session = await db_service.get_session(session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    
    # Check if user has access to session
    has_access = (
        session["speakerId"] == current_user["uid"] or
        await db_service.is_session_participant(session_id, current_user["uid"])
    )
    
    if not has_access:
        raise HTTPException(status_code=403, detail="Access denied")
    
    active_resource = await db_service.get_active_resource(session_id)
    return active_resource

# Task endpoints
@app.post("/sessions/{session_id}/tasks")
async def generate_tasks(
    session_id: str,
    task_request: TaskGenerationRequest,
    current_user = Depends(get_current_user)
):
    """Generate tasks from transcript"""
    session = await db_service.get_session(session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    
    # Only speaker can generate tasks
    if session["speakerId"] != current_user["uid"]:
        raise HTTPException(status_code=403, detail="Only session speaker can generate tasks")
    
    # Generate tasks using AI
    tasks = await ai_service.generate_tasks(task_request.transcript)
    
    # Store tasks
    task_objects = []
    for task_data in tasks:
        task = {
            "id": str(uuid.uuid4()),
            "title": task_data["title"],
            "description": task_data["description"],
            "completed": False,
            "createdAt": datetime.utcnow().isoformat(),
            "priority": task_data.get("priority", "medium")
        }
        task_objects.append(task)
    
    await db_service.set_session_tasks(session_id, task_objects)
    return task_objects

@app.get("/sessions/{session_id}/tasks")
async def get_tasks(session_id: str, current_user = Depends(get_current_user)):
    """Get session tasks"""
    session = await db_service.get_session(session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    
    # Check if user has access to session
    has_access = (
        session["speakerId"] == current_user["uid"] or
        await db_service.is_session_participant(session_id, current_user["uid"])
    )
    
    if not has_access:
        raise HTTPException(status_code=403, detail="Access denied")
    
    return session.get("tasks", [])

# Chat/Query endpoints
@app.post("/sessions/{session_id}/query")
async def query_session(
    session_id: str,
    query_request: QueryRequest,
    current_user = Depends(get_current_user)
):
    """Query session content using AI"""
    session = await db_service.get_session(session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    
    # Check if user has access to session
    has_access = (
        session["speakerId"] == current_user["uid"] or
        await db_service.is_session_participant(session_id, current_user["uid"])
    )
    
    if not has_access:
        raise HTTPException(status_code=403, detail="Access denied")
    
    # Get relevant context from vector store
    context = await vector_service.query_similar_content(session_id, query_request.message)
    
    # Generate answer using AI
    answer = await ai_service.generate_answer(query_request.message, context)
    
    return {"answer": answer}

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)