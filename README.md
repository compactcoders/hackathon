# PANDA - Personalized AI for Notes, Discussion & Assistance

A comprehensive web platform designed for classrooms, lectures, and meetings that enables speakers to capture live speech and allows listeners to interact with AI-powered assistants for Q&A and task generation.

## 🌟 Features

### For Speakers
- **Live Session Management**: Start sessions with unique join codes
- **Real-time Transcription**: Speech-to-text with AI processing
- **Resource Upload**: Share images, PDFs, and documents
- **Active Resource Selection**: Mark resources for AR integration
- **Auto Task Generation**: AI-powered task and checklist creation
- **Session History**: Manage past sessions and content

### For Listeners
- **Easy Session Joining**: Join via codes or direct links
- **Live Transcript Feed**: Real-time session content updates
- **AI-Powered Q&A**: Ask questions and get intelligent responses
- **Task Management**: View and track generated action items
- **Resource Viewing**: Access shared materials and AR-ready content

### Technical Features
- **Firebase Authentication**: Secure Google + email/password auth
- **MongoDB Integration**: Robust data persistence
- **Pinecone Vector Store**: Advanced RAG for AI responses
- **OpenAI/Gemini Integration**: Intelligent content processing
- **Mobile-First Design**: Responsive across all devices
- **Real-time Updates**: Live content synchronization

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- Python 3.11+
- MongoDB Atlas account
- Firebase project
- Pinecone account
- OpenAI or Gemini API key

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd panda-platform
   ```

2. **Frontend Setup**
   ```bash
   npm install
   cp .env.example .env
   # Edit .env with your Firebase configuration
   ```

3. **Backend Setup**
   ```bash
   cd backend
   pip install -r requirements.txt
   cp .env.example .env
   # Edit .env with your API keys and database URLs
   ```

### Development

1. **Start the backend**
   ```bash
   cd backend
   python main.py
   ```

2. **Start the frontend**
   ```bash
   npm run dev
   ```

3. **Visit the application**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:8000

### Production Deployment

#### Using Docker Compose
```bash
# Configure environment variables
cp .env.example .env
# Edit .env with production values

# Build and start services
docker-compose up -d
```

#### Manual Deployment
```bash
# Frontend
npm run build
# Deploy dist/ to your web server

# Backend
cd backend
pip install -r requirements.txt
uvicorn main:app --host 0.0.0.0 --port 8000
```

## 🔧 Configuration

### Environment Variables

#### Frontend (.env)
```env
VITE_FIREBASE_API_KEY=your-firebase-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-firebase-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789012
VITE_FIREBASE_APP_ID=1:123456789012:web:abcdef123456
VITE_API_BASE_URL=http://localhost:8000
```

#### Backend (.env)
```env
# Firebase Admin SDK
FIREBASE_PROJECT_ID=your-firebase-project-id
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----"
FIREBASE_CLIENT_EMAIL=your-service-account-email

# Database
MONGODB_URL=mongodb+srv://user:pass@cluster.mongodb.net/
MONGODB_DB_NAME=panda

# Vector Store
PINECONE_API_KEY=your-pinecone-api-key
PINECONE_ENVIRONMENT=your-pinecone-environment

# AI Services (choose one)
OPENAI_API_KEY=your-openai-api-key
GEMINI_API_KEY=your-gemini-api-key
```

### Firebase Setup

1. Create a Firebase project at https://console.firebase.google.com
2. Enable Authentication with Email/Password and Google providers
3. Generate a service account key for the backend
4. Add your domain to authorized domains

### MongoDB Atlas Setup

1. Create a cluster at https://cloud.mongodb.com
2. Create a database user and get the connection string
3. Whitelist your IP addresses or use 0.0.0.0/0 for development

### Pinecone Setup

1. Sign up at https://pinecone.io
2. Create an index named "panda-transcripts" with dimension 1536
3. Get your API key and environment

## 🏗️ Architecture

### Frontend (React + TypeScript)
- **Framework**: React 18 with TypeScript
- **Styling**: Tailwind CSS with shadcn/ui components
- **State Management**: React Query for server state
- **Routing**: React Router v6
- **Authentication**: Firebase Auth SDK

### Backend (Python FastAPI)
- **Framework**: FastAPI with async/await
- **Database**: MongoDB with Motor (async driver)
- **Vector Store**: Pinecone for embeddings
- **AI Integration**: OpenAI GPT-3.5 or Google Gemini
- **Authentication**: Firebase Admin SDK
- **File Upload**: Local storage with future cloud support

### Database Schema

#### Users Collection
```json
{
  "uid": "firebase-user-id",
  "email": "user@example.com",
  "displayName": "User Name",
  "role": "speaker|listener",
  "createdAt": "2025-01-01T00:00:00Z",
  "sessions": ["session-id-1", "session-id-2"]
}
```

#### Sessions Collection
```json
{
  "id": "unique-session-id",
  "title": "Session Title",
  "speakerId": "firebase-user-id",
  "speakerName": "Speaker Name",
  "status": "active|ended",
  "createdAt": "2025-01-01T00:00:00Z",
  "joinCode": "ABC123XYZ",
  "participants": ["user-id-1", "user-id-2"],
  "transcript": [...],
  "resources": [...],
  "tasks": [...]
}
```

## 📱 API Documentation

The API documentation is automatically generated and available at:
- Development: http://localhost:8000/docs
- Interactive API explorer with all endpoints and schemas

### Key Endpoints
- `POST /auth/create-profile` - Create user profile
- `GET /auth/profile` - Get current user
- `POST /sessions/create` - Create new session
- `POST /sessions/join` - Join session with code
- `POST /sessions/{id}/transcript` - Add transcript chunk
- `POST /sessions/{id}/query` - Query session with AI
- `POST /sessions/{id}/tasks` - Generate tasks from transcript

## 🔒 Security

- **Authentication**: Firebase JWT token verification
- **Authorization**: Role-based access control (Speaker/Listener)
- **CORS**: Configured for production domains
- **File Upload**: Type validation and secure storage
- **API Rate Limiting**: Built-in FastAPI protection
- **Environment Variables**: Sensitive data properly configured

## 🧪 Testing

### Frontend Testing
```bash
npm run test
```

### Backend Testing
```bash
cd backend
pytest
```

### Mock Data
The application includes mock data for development:
- Sample transcripts and AI responses
- Generated tasks and action items
- Simulated real-time updates

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Check the API documentation at `/docs`
- Review the configuration examples above

## 🚀 Future Enhancements

- **AR Integration**: Mobile app for augmented reality resource viewing
- **Advanced Analytics**: Session insights and engagement metrics
- **Multi-language Support**: Transcription and AI in multiple languages
- **Integration APIs**: Connect with LMS platforms and productivity tools
- **Advanced AI Features**: Sentiment analysis, automatic summarization
- **Collaborative Features**: Real-time collaborative note-taking

---

**PANDA** - Empowering the future of interactive learning and collaboration! 🐼