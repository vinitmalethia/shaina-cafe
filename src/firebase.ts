import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyDPYND0woLGmQk8Fun7oIXWbkSyg-fdAN0",
  authDomain: "shaina-cafe-vinit.firebaseapp.com",
  projectId: "shaina-cafe-vinit",
  storageBucket: "shaina-cafe-vinit.firebasestorage.app",
  messagingSenderId: "820923945890",
  appId: "1:820923945890:web:ec92e29bf37e5354add8fb"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
export const storage = getStorage(app);
export const googleProvider = new GoogleAuthProvider();
