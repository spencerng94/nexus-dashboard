
import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyCBWy8Gya6-PqEbVN0E8koHfMruxSQnu7w",
  authDomain: "nexus-planner-ai.firebaseapp.com",
  projectId: "nexus-planner-ai",
  storageBucket: "nexus-planner-ai.firebasestorage.app",
  messagingSenderId: "197531572752",
  appId: "1:197531572752:web:373ccbaeee7d4eb0f80895"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

// Add scopes for Google Calendar access
googleProvider.addScope('https://www.googleapis.com/auth/calendar.events');
googleProvider.addScope('https://www.googleapis.com/auth/userinfo.profile');
googleProvider.addScope('https://www.googleapis.com/auth/userinfo.email');

export const db = getFirestore(app);
