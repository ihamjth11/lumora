import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, FacebookAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "உன்னோட apiKey",
  authDomain: "lumora-50ce4.firebaseapp.com",
  projectId: "lumora-50ce4",
  storageBucket: "lumora-50ce4.appspot.com",
  messagingSenderId: "உன்னோட messagingSenderId",
  appId: "உன்னோட appId"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();
export const facebookProvider = new FacebookAuthProvider();