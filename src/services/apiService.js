import { auth } from "../firebase/firebaseConfig";

const API_BASE_URL = "https://lumora-x963.onrender.com/api";

// ---------- Get Firebase ID Token ----------
const getAuthToken = async () => {
  const user = auth.currentUser;
  if (!user) return null;
  return await user.getIdToken();
};

// ---------- CHECK USERNAME AVAILABILITY (Public) ----------
export const checkUsernameAvailable = async (username) => {
  try {
    const res = await fetch(`${API_BASE_URL}/users/check-username/${username}`);
    const data = await res.json();
    return { success: true, available: data.available };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// ---------- CREATE USER PROFILE (Protected) ----------
export const createUserProfile = async (profileData) => {
  try {
    const token = await getAuthToken();
    const res = await fetch(`${API_BASE_URL}/users/create`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(profileData),
    });
    const data = await res.json();
    if (!res.ok) return { success: false, error: data.message };
    return { success: true, user: data.user };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// ---------- GET MY PROFILE (Protected) ----------
export const getUserProfile = async () => {
  try {
    const token = await getAuthToken();
    if (!token) return { success: false, error: "Not logged in" };

    const res = await fetch(`${API_BASE_URL}/users/me`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    if (!res.ok) return { success: false, error: data.message };
    return { success: true, data };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// ---------- UPDATE MY PROFILE (Protected) ----------
export const updateUserProfile = async (updates) => {
  try {
    const token = await getAuthToken();
    const res = await fetch(`${API_BASE_URL}/users/me`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(updates),
    });
    const data = await res.json();
    if (!res.ok) return { success: false, error: data.message };
    return { success: true, data };
  } catch (error) {
    return { success: false, error: error.message };
  }
};