import { initializeApp } from 'firebase/app';
import { getAuth, connectAuthEmulator } from 'firebase/auth';

// Demo Firebase configuration for development
const firebaseConfig = {
  apiKey: "demo-api-key",
  authDomain: "demo-project.firebaseapp.com",
  projectId: "demo-project",
  storageBucket: "demo-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:demo"
};

// Initialize Firebase with demo config
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// For development, we'll use a mock auth state
// In production, replace with real Firebase config
console.log('Firebase initialized with demo configuration');

export { auth };
export default app;