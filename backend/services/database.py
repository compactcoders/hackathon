import os
from motor.motor_asyncio import AsyncIOMotorClient
from typing import Optional, List, Dict, Any
from datetime import datetime

class DatabaseService:
    def __init__(self):
        self.mongo_url = os.getenv("MONGODB_URL", "mongodb://localhost:27017")
        self.db_name = os.getenv("MONGODB_DB_NAME", "panda")
        self.client = None
        self.db = None
        self._initialize()
    
    def _initialize(self):
        """Initialize MongoDB connection"""
        self.client = AsyncIOMotorClient(self.mongo_url)
        self.db = self.client[self.db_name]
    
    async def create_user(self, user_data: Dict[str, Any]) -> Dict[str, Any]:
        """Create a new user"""
        await self.db.users.insert_one(user_data)
        return user_data
    
    async def get_user(self, uid: str) -> Optional[Dict[str, Any]]:
        """Get user by UID"""
        user = await self.db.users.find_one({"uid": uid})
        if user:
            user.pop('_id', None)
        return user
    
    async def create_session(self, session_data: Dict[str, Any]) -> Dict[str, Any]:
        """Create a new session"""
        await self.db.sessions.insert_one(session_data)
        return session_data
    
    async def get_session(self, session_id: str) -> Optional[Dict[str, Any]]:
        """Get session by ID"""
        session = await self.db.sessions.find_one({"id": session_id})
        if session:
            session.pop('_id', None)
        return session
    
    async def get_session_by_join_code(self, join_code: str) -> Optional[Dict[str, Any]]:
        """Get session by join code"""
        session = await self.db.sessions.find_one({"joinCode": join_code})
        if session:
            session.pop('_id', None)
        return session
    
    async def get_user_sessions(self, user_id: str) -> List[Dict[str, Any]]:
        """Get all sessions for a user"""
        cursor = self.db.sessions.find({
            "$or": [
                {"speakerId": user_id},
                {"participants": user_id}
            ]
        }).sort("createdAt", -1)
        
        sessions = []
        async for session in cursor:
            session.pop('_id', None)
            sessions.append(session)
        return sessions
    
    async def add_session_participant(self, session_id: str, user_id: str):
        """Add participant to session"""
        await self.db.sessions.update_one(
            {"id": session_id},
            {"$addToSet": {"participants": user_id}}
        )
    
    async def is_session_participant(self, session_id: str, user_id: str) -> bool:
        """Check if user is session participant"""
        session = await self.db.sessions.find_one({
            "id": session_id,
            "participants": user_id
        })
        return session is not None
    
    async def add_transcript_chunk(self, session_id: str, chunk: Dict[str, Any]):
        """Add transcript chunk to session"""
        await self.db.sessions.update_one(
            {"id": session_id},
            {"$push": {"transcript": chunk}}
        )
    
    async def add_session_resource(self, session_id: str, resource: Dict[str, Any]):
        """Add resource to session"""
        await self.db.sessions.update_one(
            {"id": session_id},
            {"$push": {"resources": resource}}
        )
    
    async def set_active_resource(self, session_id: str, resource_id: str):
        """Set active resource for session"""
        # First, set all resources to inactive
        await self.db.sessions.update_one(
            {"id": session_id},
            {"$set": {"resources.$[].isActive": False}}
        )
        
        # Then set the specified resource to active
        await self.db.sessions.update_one(
            {"id": session_id, "resources.id": resource_id},
            {"$set": {"resources.$.isActive": True}}
        )
    
    async def get_active_resource(self, session_id: str) -> Optional[Dict[str, Any]]:
        """Get active resource for session"""
        session = await self.db.sessions.find_one({"id": session_id})
        if session and "resources" in session:
            for resource in session["resources"]:
                if resource.get("isActive", False):
                    return resource
        return None
    
    async def set_session_tasks(self, session_id: str, tasks: List[Dict[str, Any]]):
        """Set tasks for session"""
        await self.db.sessions.update_one(
            {"id": session_id},
            {"$set": {"tasks": tasks}}
        )
    
    async def close(self):
        """Close database connection"""
        if self.client:
            self.client.close()