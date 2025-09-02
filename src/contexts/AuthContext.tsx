import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  User as FirebaseUser, 
  onAuthStateChanged, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut,
  GoogleAuthProvider,
  signInWithPopup 
} from 'firebase/auth';
import { auth } from '../lib/firebase';
import { User } from '../types';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, name: string, role: 'speaker' | 'listener') => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // For demo purposes, set loading to false immediately
    setLoading(false);
    
    // In production, uncomment the Firebase auth listener:
    // const unsubscribe = onAuthStateChanged(auth, async (firebaseUser: FirebaseUser | null) => {
    //   if (firebaseUser) {
    //     try {
    //       const response = await api.get('/auth/profile');
    //       setUser(response.data);
    //     } catch (error) {
    //       console.error('Error fetching user profile:', error);
    //       setUser(null);
    //     }
    //   } else {
    //     setUser(null);
    //   }
    //   setLoading(false);
    // });
    // return unsubscribe;
  }, []);

  const signIn = async (email: string, password: string) => {
    // Mock sign in for demo
    const mockUser: User = {
      uid: 'demo-user-id',
      email,
      displayName: 'Demo User',
      role: 'speaker',
      createdAt: new Date().toISOString()
    };
    setUser(mockUser);
  };

  const signUp = async (email: string, password: string, name: string, role: 'speaker' | 'listener') => {
    // Mock sign up for demo
    const mockUser: User = {
      uid: 'demo-user-id',
      email,
      displayName: name,
      role,
      createdAt: new Date().toISOString()
    };
    setUser(mockUser);
  };

  const signInWithGoogle = async () => {
    // Mock Google sign in for demo
    const mockUser: User = {
      uid: 'demo-google-user',
      email: 'demo@gmail.com',
      displayName: 'Demo Google User',
      role: 'speaker',
      createdAt: new Date().toISOString()
    };
    setUser(mockUser);
  };

  const logout = async () => {
    setUser(null);
  };

  const value = {
    user,
    loading,
    signIn,
    signUp,
    signInWithGoogle,
    logout
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};