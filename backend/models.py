from pydantic import BaseModel
from typing import List, Optional, Literal
from datetime import datetime

class UserCreate(BaseModel):
    uid: str
    email: str
    displayName: str
    role: Literal["speaker", "listener"]

class User(BaseModel):
    uid: str
    email: str
    displayName: str
    role: Literal["speaker", "listener"]
    createdAt: str
    sessions: List[str] = []

class TranscriptChunk(BaseModel):
    id: str
    text: str
    timestamp: str
    speakerId: str

class Resource(BaseModel):
    id: str
    filename: str
    originalName: str
    type: Literal["image", "pdf", "document"]
    url: str
    uploadedAt: str
    isActive: bool = False

class Task(BaseModel):
    id: str
    title: str
    description: str
    completed: bool = False
    createdAt: str
    priority: Literal["low", "medium", "high"] = "medium"

class Session(BaseModel):
    id: str
    title: str
    speakerId: str
    speakerName: str
    status: Literal["active", "ended"] = "active"
    createdAt: str
    transcript: List[TranscriptChunk] = []
    resources: List[Resource] = []
    tasks: List[Task] = []
    joinCode: str
    participants: List[str] = []

class JoinSessionRequest(BaseModel):
    joinCode: str

class TranscriptRequest(BaseModel):
    text: str
    timestamp: Optional[str] = None

class TaskGenerationRequest(BaseModel):
    transcript: str

class QueryRequest(BaseModel):
    message: str

class ChatMessage(BaseModel):
    id: str
    message: str
    response: str
    timestamp: str
    userId: str