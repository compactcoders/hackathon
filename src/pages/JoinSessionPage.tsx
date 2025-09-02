import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Users, Loader } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import api from '../lib/api';

export const JoinSessionPage: React.FC = () => {
  const { joinCode } = useParams<{ joinCode: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [sessionInfo, setSessionInfo] = useState<any>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (joinCode) {
      fetchSessionInfo();
    }
  }, [joinCode]);

  const fetchSessionInfo = async () => {
    try {
      const response = await api.get(`/sessions/info/${joinCode}`);
      setSessionInfo(response.data);
    } catch (error) {
      setError('Session not found or has ended');
    }
  };

  const joinSession = async () => {
    if (!user) {
      navigate(`/auth?role=listener&redirect=/join/${joinCode}`);
      return;
    }

    setLoading(true);
    try {
      await api.post('/sessions/join', { joinCode });
      navigate('/dashboard');
    } catch (error) {
      setError('Failed to join session');
    } finally {
      setLoading(false);
    }
  };

  if (error) {
    return (
      <div className="max-w-md mx-auto mt-20">
        <Card>
          <CardHeader>
            <CardTitle className="text-red-600">Session Not Found</CardTitle>
            <CardDescription>{error}</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => navigate('/')} className="w-full">
              Return to Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto mt-20">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Users className="mr-2 h-5 w-5" />
            Join Session
          </CardTitle>
          {sessionInfo && (
            <CardDescription>
              <div className="space-y-2">
                <p><strong>Session:</strong> {sessionInfo.title}</p>
                <p><strong>Speaker:</strong> {sessionInfo.speakerName}</p>
                <p><strong>Status:</strong> {sessionInfo.status}</p>
              </div>
            </CardDescription>
          )}
        </CardHeader>
        <CardContent>
          {!user ? (
            <div className="text-center space-y-4">
              <p className="text-gray-600">You need to sign in to join this session</p>
              <Button onClick={() => navigate(`/auth?role=listener&redirect=/join/${joinCode}`)}>
                Sign In to Join
              </Button>
            </div>
          ) : (
            <Button onClick={joinSession} disabled={loading} className="w-full">
              {loading ? (
                <>
                  <Loader className="mr-2 h-4 w-4 animate-spin" />
                  Joining...
                </>
              ) : (
                'Join Session'
              )}
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  );
};