import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyDpqzWxGyCxaEMZLSYq4UCPaHk7Yj42oTg",
  authDomain: "elite-forex-bot.firebaseapp.com",
  projectId: "elite-forex-bot",
  storageBucket: "elite-forex-bot.firebasestorage.app",
  messagingSenderId: "150004092606",
  appId: "1:150004092606:web:fc43510d690de14daf18ef",
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export default app;
