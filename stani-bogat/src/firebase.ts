
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyC8-48PvVKGGExRnEUlAz-or73ft-H0quQ",
  authDomain: "kursova-rabota.firebaseapp.com",
  projectId: "kursova-rabota",
  storageBucket: "kursova-rabota.firebasestorage.app",
  messagingSenderId: "20939552152",
  appId: "1:20939552152:web:23f9319dd2d8f6b1c727ed",
  measurementId: "G-0SRHJX1S4H"
};

// Initialize Firebase
// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);


