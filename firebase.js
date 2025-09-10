import { initializeApp } from "firebase/app";
import {
  getAuth,
  GoogleAuthProvider,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
} from "firebase/auth";
import {
  getDatabase,
  update,
  off
} from "firebase/database";

const firebaseConfig = {
  apiKey: "AIzaSyBuUIDQ4j6FBgjFeQnEMLs6Er-4zL4nBrA",
  authDomain: "financeiro-6e99f.firebaseapp.com",
  projectId: "financeiro-6e99f",
  storageBucket: "financeiro-6e99f.firebasestorage.app",
  messagingSenderId: "17734675977",
  appId: "1:17734675977:web:5b37bab8e0a20b6b4492d8"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();
const db = getDatabase(app);

export {
  app,
  auth,
  provider,
  db,
  off,
  update,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendPasswordResetEmail
};
