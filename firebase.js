// import { initializeApp } from "firebase/app";
// import {
//   getAuth,
//   GoogleAuthProvider,
//   createUserWithEmailAndPassword,
//   signInWithEmailAndPassword,
//   sendPasswordResetEmail,
// } from "firebase/auth";
// import {
//   getDatabase,
//   update,
//   off
// } from "firebase/database";

// const firebaseConfig = {
//   apiKey: "AIzaSyBuUIDQ4j6FBgjFeQnEMLs6Er-4zL4nBrA",
//   authDomain: "financeiro-6e99f.firebaseapp.com",
//   projectId: "financeiro-6e99f",
//   storageBucket: "financeiro-6e99f.firebasestorage.app",
//   messagingSenderId: "17734675977",
//   appId: "1:17734675977:web:5b37bab8e0a20b6b4492d8"
// };

// const app = initializeApp(firebaseConfig);
// const auth = getAuth(app);
// const provider = new GoogleAuthProvider();
// const db = getDatabase(app);

// export {
//   app,
//   auth,
//   provider,
//   db,
//   off,
//   update,
//   createUserWithEmailAndPassword,
//   signInWithEmailAndPassword,
//   sendPasswordResetEmail
// };


// firebase.js
// firebase.js
import { initializeApp } from "firebase/app";
import { 
  getAuth, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut,
  onAuthStateChanged
} from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { 
  getDatabase, 
  ref, 
  update, 
  onValue, 
  off, 
  push, 
  set 
} from "firebase/database";
import { getAnalytics, isSupported } from "firebase/analytics";

// Configurações do Firebase
const firebaseConfig = {
  apiKey: "AIzaSyBdJV1jM2kvFzH_DIMpM5Xvcf26qPwOdxM",
  authDomain: "convite-evento-30anos.firebaseapp.com",
  projectId: "convite-evento-30anos",
  storageBucket: "convite-evento-30anos.appspot.com",
  messagingSenderId: "440872089223",
  appId: "1:440872089223:web:767d26c4ac6dd28e612a22",
  measurementId: "G-NN84T7NQX9",
};

// Inicialização principal
const app = initializeApp(firebaseConfig);

// Serviços principais
const auth = getAuth(app);
const firestore = getFirestore(app);
const dbRealtime = getDatabase(app);

// Analytics (ativa só se suportado)
let analytics = null;
isSupported().then((supported) => {
  if (supported) {
    analytics = getAnalytics(app);
  }
});

// Exportações organizadas
export {
  app,
  auth,
  firestore,
  dbRealtime,
  analytics,
  firebaseConfig,
  // Auth helpers
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  // Realtime DB helpers
  ref,
  update,
  onValue,
  off,
  push,
  set,
};
