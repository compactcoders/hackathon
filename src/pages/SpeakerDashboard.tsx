import React, { useState, useEffect } from 'react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Mic, Upload, Play, Square, Users, FileText, CheckSquare, Copy } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { Session, Resource, Task } from '../types';
import api from '../lib/api';

export const SpeakerDashboard: React.FC = () => {
  const { user } = useAuth();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [currentSession, setCurrentSession] = useState<Session | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [resources, setResources] = useState<Resource[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadSessions();
  }, []);

  const loadSessions = async () => {
    try {
      const response = await api.get('/sessions/list');
      setSessions(response.data);
    } catch (error) {
      console.error('Error loading sessions:', error);
    }
  };

  const createSession = async () => {
    setLoading(true);
    try {
      const response = await api.post('/sessions/create', {
        title: `Session ${new Date().toLocaleDateString()}`
      });
      const newSession = response.data;
      setCurrentSession(newSession);
      setSessions([newSession, ...sessions]);
    } catch (error) {
      console.error('Error creating session:', error);
    } finally {
      setLoading(false);
    }
  };

  const startRecording = async () => {
    if (!currentSession) return;
    
    setIsRecording(true);
    // Mock recording - in real implementation, integrate with speech-to-text API
    const mockTranscript = "Welcome everyone to today's session. Today we'll be covering the fundamentals of artificial intelligence and machine learning. Let's start with the basics of neural networks...";
    
    setTimeout(() => {
      setTranscript(mockTranscript);
      // Send to backend for processing
      api.post(`/sessions/${currentSession.id}/transcript`, {
        text: mockTranscript,
        timestamp: new Date().toISOString()
      });
    }, 2000);
  };

  const stopRecording = () => {
    setIsRecording(false);
  };

  const uploadResource = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !currentSession) return;

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await api.post(`/sessions/${currentSession.id}/resources/upload`, formData);
      const newResource = response.data;
      setResources([...resources, newResource]);
    } catch (error) {
      console.error('Error uploading resource:', error);
    }
  };

  const generateTasks = async () => {
    if (!currentSession || !transcript) return;

    try {
      const response = await api.post(`/sessions/${currentSession.id}/tasks`, {
        transcript
      });
      setTasks(response.data);
    } catch (error) {
      console.error('Error generating tasks:', error);
    }
  };

  const copyJoinLink = () => {
    if (currentSession) {
      navigator.clipboard.writeText(`${window.location.origin}/join/${currentSession.joinCode}`);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Speaker Dashboard</h1>
          <p className="text-gray-600">Welcome back, {user?.displayName}</p>
        </div>
        <Button onClick={createSession} disabled={loading} className="bg-blue-600 hover:bg-blue-700">
          <Play className="mr-2 h-4 w-4" />
          Start New Session
        </Button>
      </div>

      {currentSession && (
        <Card className="border-blue-200 bg-blue-50">
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle className="text-blue-900">Active Session</CardTitle>
                <CardDescription>{currentSession.title}</CardDescription>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-sm text-blue-700">Join Code: {currentSession.joinCode}</span>
                <Button size="sm" variant="outline" onClick={copyJoinLink}>
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-4">
              {!isRecording ? (
                <Button onClick={startRecording} className="bg-red-600 hover:bg-red-700">
                  <Mic className="mr-2 h-4 w-4" />
                  Start Recording
                </Button>
              ) : (
                <Button onClick={stopRecording} variant="outline">
                  <Square className="mr-2 h-4 w-4" />
                  Stop Recording
                </Button>
              )}
              
              <label className="inline-flex">
                <Button variant="outline" className="cursor-pointer">
                  <Upload className="mr-2 h-4 w-4" />
                  Upload Resource
                </Button>
                <input
                  type="file"
                  className="hidden"
                  onChange={uploadResource}
                  accept="image/*,.pdf,.doc,.docx"
                />
              </label>

              <Button onClick={generateTasks} variant="outline">
                <CheckSquare className="mr-2 h-4 w-4" />
                Generate Tasks
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <Tabs defaultValue="transcript" className="w-full">
            <TabsList>
              <TabsTrigger value="transcript">Live Transcript</TabsTrigger>
              <TabsTrigger value="resources">Resources</TabsTrigger>
              <TabsTrigger value="sessions">Session History</TabsTrigger>
            </TabsList>
            
            <TabsContent value="transcript" className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <FileText className="mr-2 h-5 w-5" />
                    Live Transcript
                    {isRecording && <span className="ml-2 h-2 w-2 bg-red-500 rounded-full animate-pulse"></span>}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="min-h-[300px] max-h-[500px] overflow-y-auto bg-gray-50 p-4 rounded-lg">
                    {transcript ? (
                      <p className="text-gray-800 leading-relaxed">{transcript}</p>
                    ) : (
                      <p className="text-gray-500 italic">No transcript available. Start recording to begin.</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="resources" className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle>Uploaded Resources</CardTitle>
                </CardHeader>
                <CardContent>
                  {resources.length > 0 ? (
                    <div className="space-y-3">
                      {resources.map((resource) => (
                        <div key={resource.id} className="flex items-center justify-between p-3 border rounded-lg">
                          <div>
                            <p className="font-medium">{resource.originalName}</p>
                            <p className="text-sm text-gray-500">{resource.type}</p>
                          </div>
                          <Button size="sm" variant="outline">
                            {resource.isActive ? 'Active' : 'Set Active'}
                          </Button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500">No resources uploaded yet.</p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="sessions" className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle>Session History</CardTitle>
                </CardHeader>
                <CardContent>
                  {sessions.length > 0 ? (
                    <div className="space-y-3">
                      {sessions.map((session) => (
                        <div key={session.id} className="p-4 border rounded-lg">
                          <div className="flex justify-between items-center">
                            <div>
                              <h3 className="font-medium">{session.title}</h3>
                              <p className="text-sm text-gray-500">{new Date(session.createdAt).toLocaleDateString()}</p>
                            </div>
                            <span className={`px-2 py-1 rounded-full text-xs ${
                              session.status === 'active' 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-gray-100 text-gray-800'
                            }`}>
                              {session.status}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500">No sessions created yet.</p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        <div>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <CheckSquare className="mr-2 h-5 w-5" />
                Generated Tasks
              </CardTitle>
            </CardHeader>
            <CardContent>
              {tasks.length > 0 ? (
                <div className="space-y-3">
                  {tasks.map((task) => (
                    <div key={task.id} className="p-3 border rounded-lg">
                      <h4 className="font-medium">{task.title}</h4>
                      <p className="text-sm text-gray-600 mt-1">{task.description}</p>
                      <span className={`inline-block mt-2 px-2 py-1 rounded-full text-xs ${
                        task.priority === 'high' ? 'bg-red-100 text-red-800' :
                        task.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-green-100 text-green-800'
                      }`}>
                        {task.priority} priority
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500">No tasks generated yet. Record some content and click "Generate Tasks".</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};