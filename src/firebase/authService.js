import {
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  RecaptchaVerifier,
  signInWithPhoneNumber,
  EmailAuthProvider,
  linkWithCredential,
  updateProfile
} from "firebase/auth";
import { auth, googleProvider, facebookProvider } from "./firebaseConfig";

// ---------- GOOGLE LOGIN ----------
export const loginWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    return { success: true, user: result.user };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// ---------- FACEBOOK LOGIN ----------
export const loginWithFacebook = async () => {
  try {
    const result = await signInWithPopup(auth, facebookProvider);
    return { success: true, user: result.user };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// ---------- PHONE OTP ----------
export const setupRecaptcha = () => {
  if (!window.recaptchaVerifier) {
    window.recaptchaVerifier = new RecaptchaVerifier(auth, "recaptcha-container", {
      size: "invisible",
    });
  }
};

export const sendOTP = async (phoneNumber) => {
  try {
    setupRecaptcha();
    const appVerifier = window.recaptchaVerifier;
    const confirmationResult = await signInWithPhoneNumber(auth, phoneNumber, appVerifier);
    window.confirmationResult = confirmationResult;
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

export const verifyOTP = async (code) => {
  try {
    const result = await window.confirmationResult.confirm(code);
    return { success: true, user: result.user };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// ---------- LINK EMAIL/PASSWORD TO PHONE-VERIFIED USER ----------
export const linkEmailPassword = async (user, email, password, displayName) => {
  try {
    const credential = EmailAuthProvider.credential(email, password);
    const result = await linkWithCredential(user, credential);
    if (displayName) {
      await updateProfile(result.user, { displayName });
    }
    return { success: true, user: result.user };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// ---------- LOGOUT ----------
export const logoutUser = async () => {
  try {
    await signOut(auth);
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// ---------- AUTH STATE LISTENER ----------
export const watchAuthState = (callback) => {
  return onAuthStateChanged(auth, callback);
};