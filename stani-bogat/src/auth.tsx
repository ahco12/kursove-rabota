import React, { createContext, useContext, useEffect, useState } from "react";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  type User as FirebaseUser,
} from "firebase/auth";
import { auth } from "./firebase";
import { createUserIfNotExists, getUserStats } from "./services/users";

interface AuthContextValue {
  user: FirebaseUser | null;
  loading: boolean;
  register(email: string, password: string, displayName?: string): Promise<FirebaseUser>;
  login(email: string, password: string): Promise<FirebaseUser>;
  logout(): Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      setUser(u);
      setLoading(false);
      if (u) {
        await createUserIfNotExists(u.uid, { email: u.email ?? undefined, displayName: u.displayName ?? undefined });
      }
    });

    return () => unsub();
  }, []);

  const register = async (email: string, password: string) => {
    const cred = await createUserWithEmailAndPassword(auth, email, password);
    const u = cred.user;
    // ensure user doc
    await createUserIfNotExists(u.uid, { email: u.email ?? undefined, displayName: u.displayName ?? undefined });
    return u;
  };

  const login = async (email: string, password: string) => {
    const cred = await signInWithEmailAndPassword(auth, email, password);
    return cred.user;
  };

  const logout = async () => {
    await signOut(auth);
  };

  return (
    <AuthContext.Provider value={{ user, loading, register, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

export async function fetchUserStats(uid: string) {
  return getUserStats(uid);
}
