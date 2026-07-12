import { createContext, useContext, useEffect, useState } from "react";
import { watchAuthState } from "../firebase/authService";
import { getUserProfile } from "../services/apiService";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  const refreshProfile = async () => {
    const res = await getUserProfile();
    setUserProfile(res.success ? res.data : null);
  };

  useEffect(() => {
    const unsubscribe = watchAuthState(async (user) => {
      setCurrentUser(user);
      if (user) {
        const res = await getUserProfile();
        setUserProfile(res.success ? res.data : null);
      } else {
        setUserProfile(null);
      }
      setAuthLoading(false);
    });
    return unsubscribe;
  }, []);

  return (
    <AuthContext.Provider value={{ currentUser, userProfile, authLoading, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);