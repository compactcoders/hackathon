import os
import pinecone
from typing import List, Dict, Any
import openai
from datetime import datetime

class VectorStoreService:
    def __init__(self):
        self.pinecone_key = os.getenv("PINECONE_API_KEY")
        self.pinecone_env = os.getenv("PINECONE_ENVIRONMENT")
        self.openai_key = os.getenv("OPENAI_API_KEY")
        self.index_name = "panda-transcripts"
        
        if self.pinecone_key and self.pinecone_env:
            pinecone.init(api_key=self.pinecone_key, environment=self.pinecone_env)
            
            # Create index if it doesn't exist
            if self.index_name not in pinecone.list_indexes():
                pinecone.create_index(
                    name=self.index_name,
                    dimension=1536,  # OpenAI embedding dimension
                    metric="cosine"
                )
            
            self.index = pinecone.Index(self.index_name)
        else:
            print("Pinecone not configured - using mock vector store")
            self.index = None
        
        if self.openai_key:
            openai.api_key = self.openai_key
    
    async def get_embedding(self, text: str) -> List[float]:
        """Generate embedding for text using OpenAI"""
        if not self.openai_key:
            # Mock embedding for development
            return [0.0] * 1536
        
        try:
            response = openai.Embedding.create(
                input=text,
                model="text-embedding-ada-002"
            )
            return response['data'][0]['embedding']
        except Exception as e:
            print(f"Error generating embedding: {e}")
            return [0.0] * 1536
    
    async def store_transcript_chunk(self, session_id: str, chunk: Dict[str, Any]):
        """Store transcript chunk in vector database"""
        if not self.index:
            return
        
        try:
            # Generate embedding
            embedding = await self.get_embedding(chunk["text"])
            
            # Store in Pinecone
            self.index.upsert([
                {
                    "id": f"{session_id}_{chunk['id']}",
                    "values": embedding,
                    "metadata": {
                        "session_id": session_id,
                        "chunk_id": chunk["id"],
                        "text": chunk["text"],
                        "timestamp": chunk["timestamp"],
                        "speaker_id": chunk["speakerId"]
                    }
                }
            ])
        except Exception as e:
            print(f"Error storing transcript chunk: {e}")
    
    async def query_similar_content(self, session_id: str, query: str, top_k: int = 5) -> List[str]:
        """Query for similar content in session"""
        if not self.index:
            # Mock response for development
            return [
                "Welcome everyone to today's session. Today we'll be covering the fundamentals of artificial intelligence and machine learning.",
                "Let's start with the basics of neural networks and how they process information.",
                "Machine learning models require careful validation and testing to ensure accuracy."
            ]
        
        try:
            # Generate query embedding
            query_embedding = await self.get_embedding(query)
            
            # Query Pinecone
            results = self.index.query(
                vector=query_embedding,
                filter={"session_id": session_id},
                top_k=top_k,
                include_metadata=True
            )
            
            # Extract text from results
            context_chunks = []
            for match in results["matches"]:
                if match["score"] > 0.7:  # Similarity threshold
                    context_chunks.append(match["metadata"]["text"])
            
            return context_chunks
        except Exception as e:
            print(f"Error querying similar content: {e}")
            return []
    
    async def delete_session_data(self, session_id: str):
        """Delete all data for a session"""
        if not self.index:
            return
        
        try:
            # Get all vectors for the session
            results = self.index.query(
                vector=[0.0] * 1536,  # Dummy vector
                filter={"session_id": session_id},
                top_k=10000,  # Get all
                include_values=False
            )
            
            # Delete vectors
            ids_to_delete = [match["id"] for match in results["matches"]]
            if ids_to_delete:
                self.index.delete(ids=ids_to_delete)
        except Exception as e:
            print(f"Error deleting session data: {e}")