import os
import uuid
import aiofiles
from fastapi import UploadFile
from typing import Tuple
import shutil
from pathlib import Path

class FileService:
    def __init__(self):
        self.upload_dir = Path("uploads")
        self.upload_dir.mkdir(exist_ok=True)
        
        # Create subdirectories
        (self.upload_dir / "images").mkdir(exist_ok=True)
        (self.upload_dir / "documents").mkdir(exist_ok=True)
    
    def get_file_type(self, filename: str) -> str:
        """Determine file type from extension"""
        extension = filename.lower().split('.')[-1] if '.' in filename else ''
        
        if extension in ['jpg', 'jpeg', 'png', 'gif', 'webp']:
            return 'image'
        elif extension in ['pdf']:
            return 'pdf'
        elif extension in ['doc', 'docx', 'txt', 'md']:
            return 'document'
        else:
            return 'document'  # Default
    
    async def save_file(self, file: UploadFile) -> Tuple[str, str]:
        """Save uploaded file and return URL and type"""
        file_type = self.get_file_type(file.filename)
        
        # Generate unique filename
        file_extension = file.filename.split('.')[-1] if '.' in file.filename else ''
        unique_filename = f"{uuid.uuid4()}.{file_extension}"
        
        # Determine subdirectory
        if file_type == 'image':
            subdir = 'images'
        else:
            subdir = 'documents'
        
        file_path = self.upload_dir / subdir / unique_filename
        
        # Save file
        async with aiofiles.open(file_path, 'wb') as f:
            content = await file.read()
            await f.write(content)
        
        # Return URL (in production, this would be a full URL)
        file_url = f"/uploads/{subdir}/{unique_filename}"
        
        return file_url, file_type
    
    def delete_file(self, file_url: str):
        """Delete file by URL"""
        try:
            # Extract relative path from URL
            relative_path = file_url.lstrip('/')
            file_path = Path(relative_path)
            
            if file_path.exists():
                file_path.unlink()
        except Exception as e:
            print(f"Error deleting file {file_url}: {e}")
    
    def get_file_info(self, file_url: str) -> dict:
        """Get file information"""
        try:
            relative_path = file_url.lstrip('/')
            file_path = Path(relative_path)
            
            if file_path.exists():
                stat = file_path.stat()
                return {
                    "size": stat.st_size,
                    "created": stat.st_ctime,
                    "modified": stat.st_mtime
                }
        except Exception as e:
            print(f"Error getting file info {file_url}: {e}")
        
        return {}