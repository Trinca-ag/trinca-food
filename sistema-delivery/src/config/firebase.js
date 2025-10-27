// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCUueGnckbbN7-Ycf8bVDzghj5bc8fEj08",
  authDomain: "sistema-delivery-trinca.firebaseapp.com",
  projectId: "sistema-delivery-trinca",
  storageBucket: "sistema-delivery-trinca.firebasestorage.app",
  messagingSenderId: "535705468285",
  appId: "1:535705468285:web:0a621cd707c5e9e517e014"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Inicializar serviços
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

export default app;