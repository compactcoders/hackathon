import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { Layout } from './components/Layout';
import { LandingPage } from './pages/LandingPage';
import { AuthPage } from './pages/AuthPage';
import { SpeakerDashboard } from './pages/SpeakerDashboard';
import { ListenerDashboard } from './pages/ListenerDashboard';
import { JoinSessionPage } from './pages/JoinSessionPage';
import { ToastProvider, ToastViewport } from './components/ui/toast';

const queryClient = new QueryClient();

const ProtectedRoute: React.FC<{ children: React.ReactNode; role?: 'speaker' | 'listener' }> = ({ 
  children, 
  role 
}) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  if (role && user.role !== role) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  
  if (!user) return <Navigate to="/auth" replace />;
  
  return user.role === 'speaker' ? <SpeakerDashboard /> : <ListenerDashboard />;
};

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <ToastProvider>
          <Router>
            <div className="App">
              <Routes>
                <Route path="/" element={<LandingPage />} />
                <Route path="/auth" element={<AuthPage />} />
                <Route path="/join/:joinCode" element={<JoinSessionPage />} />
                <Route 
                  path="/dashboard" 
                  element={
                    <ProtectedRoute>
                      <Layout>
                        <Dashboard />
                      </Layout>
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/speaker" 
                  element={
                    <ProtectedRoute role="speaker">
                      <Layout>
                        <SpeakerDashboard />
                      </Layout>
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/listener" 
                  element={
                    <ProtectedRoute role="listener">
                      <Layout>
                        <ListenerDashboard />
                      </Layout>
                    </ProtectedRoute>
                  } 
                />
              </Routes>
              <ToastViewport />
            </div>
          </Router>
        </ToastProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;