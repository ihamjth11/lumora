import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, FacebookAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDjOJqPw66lGbdgTPC5DJxsIUoC_IXfJ88",
  authDomain: "lumora-50ce4.firebaseapp.com",
  projectId: "lumora-50ce4",
  storageBucket: "lumora-50ce4.firebasestorage.app",
  messagingSenderId: "458199879473",
  appId: "1:458199879473:web:e9dc7dba724186541daa10"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();
export const facebookProvider = new FacebookAuthProvider();