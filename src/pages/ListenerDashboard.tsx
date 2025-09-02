import React, { useState, useEffect } from 'react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Users, MessageSquare, FileText, CheckSquare, Send, Image } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { Session, ChatMessage, Task, Resource } from '../types';
import api from '../lib/api';

export const ListenerDashboard: React.FC = () => {
  const { user } = useAuth();
  const [joinCode, setJoinCode] = useState('');
  const [currentSession, setCurrentSession] = useState<Session | null>(null);
  const [transcript, setTranscript] = useState('');
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [tasks, setTasks] = useState<Task[]>([]);
  const [activeResource, setActiveResource] = useState<Resource | null>(null);
  const [loading, setLoading] = useState(false);

  const joinSession = async () => {
    if (!joinCode.trim()) return;
    
    setLoading(true);
    try {
      const response = await api.post('/sessions/join', { joinCode: joinCode.trim() });
      const session = response.data;
      setCurrentSession(session);
      loadSessionData(session.id);
    } catch (error) {
      console.error('Error joining session:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadSessionData = async (sessionId: string) => {
    try {
      // Load transcript
      const transcriptResponse = await api.get(`/sessions/${sessionId}/transcript`);
      setTranscript(transcriptResponse.data.text || '');

      // Load tasks
      const tasksResponse = await api.get(`/sessions/${sessionId}/tasks`);
      setTasks(tasksResponse.data);

      // Load active resource
      const resourceResponse = await api.get(`/sessions/${sessionId}/resources/active`);
      setActiveResource(resourceResponse.data);
    } catch (error) {
      console.error('Error loading session data:', error);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !currentSession) return;

    const message = newMessage.trim();
    setNewMessage('');
    setLoading(true);

    try {
      const response = await api.post(`/sessions/${currentSession.id}/query`, {
        message
      });
      
      const chatMessage: ChatMessage = {
        id: Date.now().toString(),
        message,
        response: response.data.answer,
        timestamp: new Date().toISOString(),
        userId: user?.uid || ''
      };
      
      setChatMessages([...chatMessages, chatMessage]);
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  // Mock live transcript updates
  useEffect(() => {
    if (currentSession && transcript) {
      const interval = setInterval(() => {
        const updates = [
          " Additionally, we should consider the ethical implications of AI systems.",
          " Machine learning models require careful validation and testing.",
          " The importance of data quality cannot be overstated in this field."
        ];
        const randomUpdate = updates[Math.floor(Math.random() * updates.length)];
        setTranscript(prev => prev + randomUpdate);
      }, 10000);

      return () => clearInterval(interval);
    }
  }, [currentSession, transcript]);

  if (!currentSession) {
    return (
      <div className="max-w-md mx-auto mt-20">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Users className="mr-2 h-5 w-5" />
              Join Session
            </CardTitle>
            <CardDescription>
              Enter the session code provided by your speaker
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Input
                placeholder="Enter session code"
                value={joinCode}
                onChange={(e) => setJoinCode(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && joinSession()}
              />
              <Button onClick={joinSession} disabled={loading} className="w-full">
                {loading ? 'Joining...' : 'Join Session'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Session: {currentSession.title}</h1>
          <p className="text-gray-600">Speaker: {currentSession.speakerName}</p>
        </div>
        <div className="flex items-center space-x-2">
          <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse"></div>
          <span className="text-sm text-green-600 font-medium">Live</span>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Tabs defaultValue="transcript" className="w-full">
            <TabsList>
              <TabsTrigger value="transcript">Live Transcript</TabsTrigger>
              <TabsTrigger value="resources">Resources</TabsTrigger>
              <TabsTrigger value="tasks">Tasks</TabsTrigger>
            </TabsList>
            
            <TabsContent value="transcript" className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <FileText className="mr-2 h-5 w-5" />
                    Live Transcript
                    <div className="ml-2 h-2 w-2 bg-green-500 rounded-full animate-pulse"></div>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="min-h-[400px] max-h-[500px] overflow-y-auto bg-gray-50 p-4 rounded-lg">
                    <p className="text-gray-800 leading-relaxed whitespace-pre-wrap">{transcript}</p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="resources" className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle>Session Resources</CardTitle>
                </CardHeader>
                <CardContent>
                  {activeResource ? (
                    <div className="text-center">
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 mb-4">
                        <Image className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                        <h3 className="font-medium text-gray-900">{activeResource.originalName}</h3>
                        <p className="text-sm text-gray-500 mt-2">
                          Active resource - Available for AR viewing
                        </p>
                      </div>
                      <p className="text-xs text-gray-500">
                        This resource can be viewed in AR using the PANDA AR app
                      </p>
                    </div>
                  ) : (
                    <p className="text-gray-500 text-center py-8">
                      No active resources in this session
                    </p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="tasks" className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle>Session Tasks</CardTitle>
                </CardHeader>
                <CardContent>
                  {tasks.length > 0 ? (
                    <div className="space-y-3">
                      {tasks.map((task) => (
                        <div key={task.id} className="flex items-start space-x-3 p-3 border rounded-lg">
                          <input
                            type="checkbox"
                            checked={task.completed}
                            className="mt-1 h-4 w-4 text-blue-600 rounded"
                            readOnly
                          />
                          <div className="flex-1">
                            <h4 className={`font-medium ${task.completed ? 'line-through text-gray-500' : ''}`}>
                              {task.title}
                            </h4>
                            <p className="text-sm text-gray-600 mt-1">{task.description}</p>
                            <span className={`inline-block mt-2 px-2 py-1 rounded-full text-xs ${
                              task.priority === 'high' ? 'bg-red-100 text-red-800' :
                              task.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-green-100 text-green-800'
                            }`}>
                              {task.priority} priority
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500">No tasks available yet.</p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        <div>
          <Card className="h-[600px] flex flex-col">
            <CardHeader>
              <CardTitle className="flex items-center">
                <MessageSquare className="mr-2 h-5 w-5" />
                AI Assistant
              </CardTitle>
              <CardDescription>
                Ask questions about the session content
              </CardDescription>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col">
              <div className="flex-1 overflow-y-auto space-y-4 mb-4">
                {chatMessages.length > 0 ? (
                  chatMessages.map((msg) => (
                    <div key={msg.id} className="space-y-3">
                      <div className="bg-blue-100 rounded-lg p-3 ml-8">
                        <p className="text-sm">{msg.message}</p>
                      </div>
                      <div className="bg-gray-100 rounded-lg p-3 mr-8">
                        <p className="text-sm">{msg.response}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <MessageSquare className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">Ask your first question about the session</p>
                  </div>
                )}
              </div>
              
              <div className="flex space-x-2">
                <Input
                  placeholder="Ask a question about the session..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  disabled={loading}
                />
                <Button onClick={sendMessage} disabled={loading || !newMessage.trim()}>
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};