// src/components/AuthContext.js
import React, { createContext, useContext, useEffect, useState } from "react";
import {
  onAuthStateChanged,
  signOut,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from "firebase/auth";
import { auth } from "../firebase";
import { syncUserWithBackend } from "../services/api";

const AuthContext = createContext(null);

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem("firebaseToken"));
  const [loading, setLoading] = useState(true);

  // Listen to Firebase auth state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const idToken = await firebaseUser.getIdToken();
        localStorage.setItem("firebaseToken", idToken);
        setToken(idToken);
        setUser(firebaseUser);
      } else {
        localStorage.removeItem("firebaseToken");
        setToken(null);
        setUser(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  // Refresh token every 55 minutes (tokens expire at 60 min)
  useEffect(() => {
    if (!user) return;
    const interval = setInterval(async () => {
      const freshToken = await user.getIdToken(true);
      localStorage.setItem("firebaseToken", freshToken);
      setToken(freshToken);
    }, 55 * 60 * 1000);
    return () => clearInterval(interval);
  }, [user]);

  const signup = async (email, password) => {
    const cred = await createUserWithEmailAndPassword(auth, email, password);
    const idToken = await cred.user.getIdToken();
    localStorage.setItem("firebaseToken", idToken);
    await syncUserWithBackend(idToken, cred.user);
    return cred;
  };

  const login = async (email, password) => {
    const cred = await signInWithEmailAndPassword(auth, email, password);
    const idToken = await cred.user.getIdToken();
    localStorage.setItem("firebaseToken", idToken);
    await syncUserWithBackend(idToken, cred.user);
    return cred;
  };

  const logout = async () => {
    await signOut(auth);
    localStorage.removeItem("firebaseToken");
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, signup, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
