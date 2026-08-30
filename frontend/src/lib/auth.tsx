import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { useNavigate } from "@tanstack/react-router";
import { api, isApiEnabled } from "@/lib/api-client";
import type { AuthResponse, AuthUser, LoginRequest, SignupRequest } from "@/lib/types/api";
import { useLearnerProfile } from "@/lib/learner-profile";

const SESSION_STORAGE_KEY = "lumina-auth-session";
const ACCOUNTS_STORAGE_KEY = "lumina-auth-accounts";

type StoredAccount = AuthUser & {
  passwordHash: string;
};

type AuthContextValue = {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (payload: LoginRequest) => Promise<void>;
  signup: (payload: SignupRequest) => Promise<void>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

function safeJsonParse<T>(value: string | null, fallback: T): T {
  if (!value) return fallback;
  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
}

function loadSession(): AuthUser | null {
  if (typeof window === "undefined") return null;
  return safeJsonParse<AuthUser | null>(window.localStorage.getItem(SESSION_STORAGE_KEY), null);
}

function persistSession(user: AuthUser | null) {
  if (typeof window === "undefined") return;
  if (!user) {
    window.localStorage.removeItem(SESSION_STORAGE_KEY);
    return;
  }
  window.localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(user));
}

function loadAccounts(): StoredAccount[] {
  if (typeof window === "undefined") return [];
  return safeJsonParse<StoredAccount[]>(window.localStorage.getItem(ACCOUNTS_STORAGE_KEY), []);
}

function persistAccounts(accounts: StoredAccount[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(ACCOUNTS_STORAGE_KEY, JSON.stringify(accounts));
}

async function hashPassword(password: string): Promise<string> {
  if (typeof window === "undefined" || !window.crypto?.subtle) return password;
  const encoded = new TextEncoder().encode(password);
  const digest = await window.crypto.subtle.digest("SHA-256", encoded);
  return Array.from(new Uint8Array(digest))
    .map((part) => part.toString(16).padStart(2, "0"))
    .join("");
}

function errorMessageFromResult(status: number, fallback: string): Error {
  const error = new Error(fallback);
  Object.assign(error, { status });
  return error;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const navigate = useNavigate();
  const { updateProfile } = useLearnerProfile();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setUser(loadSession());
    setIsLoading(false);
  }, []);

  const applyAuthenticatedUser = (nextUser: AuthUser) => {
    const sessionUser: AuthUser = {
      id: nextUser.id,
      name: nextUser.name,
      email: nextUser.email,
      createdAt: nextUser.createdAt,
    };
    setUser(sessionUser);
    persistSession(sessionUser);
    updateProfile({ name: sessionUser.name });
  };

  const signup = async (payload: SignupRequest) => {
    if (isApiEnabled) {
      const result = await api.post<AuthResponse>("/auth/signup", payload);
      if (!result.ok) throw errorMessageFromResult(result.error.status, result.error.message);
      applyAuthenticatedUser(result.data.user);
      return;
    }

    const accounts = loadAccounts();
    const normalizedEmail = payload.email.trim().toLowerCase();
    if (accounts.some((account) => account.email === normalizedEmail)) {
      throw new Error("An account with this email already exists.");
    }

    const userRecord: StoredAccount = {
      id: globalThis.crypto?.randomUUID?.() ?? `${Date.now()}`,
      name: payload.name.trim(),
      email: normalizedEmail,
      createdAt: new Date().toISOString(),
      passwordHash: await hashPassword(payload.password),
    };

    persistAccounts([...accounts, userRecord]);
    applyAuthenticatedUser(userRecord);
  };

  const login = async (payload: LoginRequest) => {
    if (isApiEnabled) {
      const result = await api.post<AuthResponse>("/auth/login", payload);
      if (!result.ok) throw errorMessageFromResult(result.error.status, result.error.message);
      applyAuthenticatedUser(result.data.user);
      return;
    }

    const accounts = loadAccounts();
    const normalizedEmail = payload.email.trim().toLowerCase();
    const passwordHash = await hashPassword(payload.password);
    const matched = accounts.find(
      (account) => account.email === normalizedEmail && account.passwordHash === passwordHash,
    );

    if (!matched) {
      throw new Error("Incorrect email or password.");
    }

    applyAuthenticatedUser(matched);
  };

  const logout = () => {
    setUser(null);
    persistSession(null);
    void navigate({ to: "/" });
  };

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isAuthenticated: Boolean(user),
      isLoading,
      login,
      signup,
      logout,
    }),
    [user, isLoading],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }
  return context;
}
