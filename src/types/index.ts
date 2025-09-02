export interface User {
  uid: string;
  email: string;
  displayName: string;
  role: 'speaker' | 'listener';
  createdAt: string;
}

export interface Session {
  id: string;
  title: string;
  speakerId: string;
  speakerName: string;
  status: 'active' | 'ended';
  createdAt: string;
  transcript: TranscriptChunk[];
  resources: Resource[];
  activeResourceId?: string;
  tasks: Task[];
  joinCode: string;
}

export interface TranscriptChunk {
  id: string;
  text: string;
  timestamp: string;
  speakerId: string;
}

export interface Resource {
  id: string;
  filename: string;
  originalName: string;
  type: 'image' | 'pdf' | 'document';
  url: string;
  uploadedAt: string;
  isActive: boolean;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  createdAt: string;
  priority: 'low' | 'medium' | 'high';
}

export interface ChatMessage {
  id: string;
  message: string;
  response: string;
  timestamp: string;
  userId: string;
}