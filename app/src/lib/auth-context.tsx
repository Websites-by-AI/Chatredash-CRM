import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { api, getToken, setToken, clearToken } from "./api";

interface RbUser {
  id: string;
  phone: string;
  name: string;
  role: "admin" | "referrer" | "registrant";
}

interface AuthContextType {
  user: RbUser | null;
  token: string | null;
  login: (phone: string, code: string) => Promise<void>;
  sendOtp: (phone: string) => Promise<{ dev_otp?: string }>;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<RbUser | null>(null);
  const [token, setTokenState] = useState<string | null>(getToken());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const t = getToken();
    if (t) {
      api
        .get<{ user: RbUser }>("/api/auth/me", t)
        .then((d) => setUser(d.user))
        .catch(() => { clearToken(); setTokenState(null); })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const sendOtp = async (phone: string) => {
    return api.post<{ dev_otp?: string }>("/api/auth/send-otp", { phone });
  };

  const login = async (phone: string, code: string) => {
    const data = await api.post<{ token: string; user: RbUser }>(
      "/api/auth/verify-otp",
      { phone, code }
    );
    setToken(data.token);
    setTokenState(data.token);
    setUser(data.user);
  };

  const logout = () => {
    clearToken();
    setTokenState(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, login, sendOtp, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be inside AuthProvider");
  return ctx;
}
