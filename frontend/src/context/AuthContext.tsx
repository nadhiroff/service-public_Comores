import { createContext, useContext, useState } from "react";
import type { ReactNode } from "react";
import api from "../api/client";
import type { User } from "../types";

interface AuthContextValue {
  user: User | null;
  login: (email: string, mot_de_passe: string) => Promise<void>;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    const stored = localStorage.getItem("spk_user");
    return stored ? JSON.parse(stored) : null;
  });
  const [loading, setLoading] = useState(false);

  async function login(email: string, mot_de_passe: string) {
    setLoading(true);
    try {
      const { data } = await api.post("/auth/login", { email, mot_de_passe });
      localStorage.setItem("spk_token", data.token);
      localStorage.setItem("spk_user", JSON.stringify(data.user));
      setUser(data.user);
    } finally {
      setLoading(false);
    }
  }

  function logout() {
    localStorage.removeItem("spk_token");
    localStorage.removeItem("spk_user");
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth doit être utilisé à l'intérieur de AuthProvider");
  return ctx;
}
