import React, { createContext, useContext, useState, useEffect } from "react";
import { getAuthInstance, signOutUser } from "../services/authService";
import { onAuthStateChanged } from "firebase/auth";

const AuthContext = createContext({
  user: null,
  initializing: true,
  signIn: async () => {},
  signUp: async () => {},
  signOut: async () => {},
});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [initializing, setInitializing] = useState(true);
  const auth = getAuthInstance();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setInitializing(false);
    });
    return unsubscribe;
  }, [auth]);

  const value = {
    user,
    initializing,
    signOut: signOutUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);
export default AuthContext;
