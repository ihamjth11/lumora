import { db } from "./firebaseConfig";
import {
  doc, setDoc, getDoc, updateDoc,
  collection, query, where, getDocs, limit
} from "firebase/firestore";

// ---------- CHECK USERNAME AVAILABILITY ----------
export const checkUsernameAvailable = async (username) => {
  try {
    const q = query(
      collection(db, "users"),
      where("username", "==", username.toLowerCase()),
      limit(1)
    );
    const snap = await getDocs(q);
    return { success: true, available: snap.empty };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// ---------- CREATE USER PROFILE ----------
export const createUserProfile = async (uid, data) => {
  try {
    await setDoc(doc(db, "users", uid), {
      ...data,
      username: data.username.toLowerCase(),
      createdAt: new Date().toISOString(),
    });
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// ---------- GET USER PROFILE ----------
export const getUserProfile = async (uid) => {
  try {
    const snap = await getDoc(doc(db, "users", uid));
    if (snap.exists()) {
      return { success: true, data: snap.data() };
    }
    return { success: false, error: "No profile found" };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// ---------- UPDATE USER PROFILE ----------
export const updateUserProfile = async (uid, data) => {
  try {
    await updateDoc(doc(db, "users", uid), data);
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
};