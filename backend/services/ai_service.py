import os
import openai
import google.generativeai as genai
from typing import List, Dict, Any, Optional
import json

class AIService:
    def __init__(self):
        self.openai_key = os.getenv("OPENAI_API_KEY")
        self.gemini_key = os.getenv("GEMINI_API_KEY")
        self.use_openai = True  # Default to OpenAI
        
        if self.openai_key:
            openai.api_key = self.openai_key
        elif self.gemini_key:
            genai.configure(api_key=self.gemini_key)
            self.model = genai.GenerativeModel('gemini-pro')
            self.use_openai = False
        else:
            print("No AI API keys configured - using mock responses")
    
    async def generate_answer(self, question: str, context: List[str]) -> str:
        """Generate answer based on question and context"""
        if not self.openai_key and not self.gemini_key:
            # Mock response for development
            return f"Based on the session content, here's what I understand about your question: '{question}'. This is a mock response for development purposes."
        
        # Prepare context
        context_text = "\n\n".join(context) if context else "No specific context available."
        
        prompt = f"""
        You are an AI assistant helping students and participants understand session content.
        Based on the following context from the live session, please answer the user's question accurately and helpfully.
        
        Context from session:
        {context_text}
        
        Question: {question}
        
        Please provide a clear, concise answer based on the session content. If the question cannot be answered from the provided context, politely indicate that and suggest asking the speaker directly.
        """
        
        try:
            if self.use_openai and self.openai_key:
                response = openai.ChatCompletion.create(
                    model="gpt-3.5-turbo",
                    messages=[
                        {"role": "system", "content": "You are a helpful AI assistant for educational sessions."},
                        {"role": "user", "content": prompt}
                    ],
                    max_tokens=300,
                    temperature=0.7
                )
                return response.choices[0].message.content.strip()
            
            elif not self.use_openai and self.gemini_key:
                response = self.model.generate_content(prompt)
                return response.text.strip()
                
        except Exception as e:
            print(f"Error generating answer: {e}")
            return "I apologize, but I'm having trouble processing your question right now. Please try asking the speaker directly."
        
        return "I don't have enough information to answer that question. Please ask the speaker for clarification."
    
    async def generate_tasks(self, transcript: str) -> List[Dict[str, Any]]:
        """Generate tasks and action items from transcript"""
        if not self.openai_key and not self.gemini_key:
            # Mock response for development
            return [
                {
                    "title": "Review AI fundamentals",
                    "description": "Study the basic concepts of artificial intelligence covered in today's session",
                    "priority": "medium"
                },
                {
                    "title": "Practice neural network exercises",
                    "description": "Complete the recommended exercises on neural network implementation",
                    "priority": "high"
                },
                {
                    "title": "Research machine learning applications",
                    "description": "Find real-world examples of machine learning applications in your field of interest",
                    "priority": "low"
                }
            ]
        
        prompt = f"""
        Based on the following session transcript, generate a list of actionable tasks and checklist items for participants.
        
        Transcript:
        {transcript}
        
        Please create 3-5 specific, actionable tasks that participants should complete based on the session content.
        For each task, provide:
        - title: A clear, concise title
        - description: A detailed description of what needs to be done
        - priority: low, medium, or high
        
        Return the response as a JSON array of objects with these fields.
        """
        
        try:
            if self.use_openai and self.openai_key:
                response = openai.ChatCompletion.create(
                    model="gpt-3.5-turbo",
                    messages=[
                        {"role": "system", "content": "You are an expert at creating educational tasks and action items. Always respond with valid JSON."},
                        {"role": "user", "content": prompt}
                    ],
                    max_tokens=500,
                    temperature=0.7
                )
                
                # Parse JSON response
                tasks_json = response.choices[0].message.content.strip()
                return json.loads(tasks_json)
            
            elif not self.use_openai and self.gemini_key:
                response = self.model.generate_content(prompt)
                tasks_json = response.text.strip()
                
                # Clean up response if it contains markdown
                if "```json" in tasks_json:
                    tasks_json = tasks_json.split("```json")[1].split("```")[0].strip()
                
                return json.loads(tasks_json)
                
        except Exception as e:
            print(f"Error generating tasks: {e}")
            # Return fallback tasks
            return [
                {
                    "title": "Review session notes",
                    "description": "Go through the key points discussed in this session",
                    "priority": "medium"
                },
                {
                    "title": "Complete follow-up reading",
                    "description": "Read additional materials related to today's topics",
                    "priority": "low"
                }
            ]
        
        return []
    
    async def summarize_transcript(self, transcript: str) -> str:
        """Generate a summary of the transcript"""
        if not self.openai_key and not self.gemini_key:
            return "This is a mock summary of the session transcript for development purposes."
        
        prompt = f"""
        Please provide a concise summary of the following session transcript, highlighting the key points and main topics discussed.
        
        Transcript:
        {transcript}
        
        Summary should be 2-3 paragraphs maximum.
        """
        
        try:
            if self.use_openai and self.openai_key:
                response = openai.ChatCompletion.create(
                    model="gpt-3.5-turbo",
                    messages=[
                        {"role": "system", "content": "You are an expert at summarizing educational content."},
                        {"role": "user", "content": prompt}
                    ],
                    max_tokens=300,
                    temperature=0.5
                )
                return response.choices[0].message.content.strip()
            
            elif not self.use_openai and self.gemini_key:
                response = self.model.generate_content(prompt)
                return response.text.strip()
                
        except Exception as e:
            print(f"Error generating summary: {e}")
            return "Unable to generate summary at this time."
        
        return "No summary available."