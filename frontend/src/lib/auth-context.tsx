import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import type { UserRole } from "./types";

const AUTH_USER_STORAGE_KEY = "english-day.auth-user";
const REGISTERED_USERS_STORAGE_KEY = "english-day.registered-users";

function readStoredJson<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") {
    return fallback;
  }

  try {
    const value = window.localStorage.getItem(key);
    return value ? (JSON.parse(value) as T) : fallback;
  } catch {
    return fallback;
  }
}

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  schoolId?: string;
  judgeCategory?: string;
}

interface RegisterUserData {
  name: string;
  email: string;
  password: string;
  role: UserRole;
  schoolId?: string;
  schoolName?: string;
  schoolShortName?: string;
  judgeCategory?: string;
}

interface AuthContextType {
  user: AuthUser | null;
  login: (role: UserRole, email?: string) => void;
  loginWithUser: (user: AuthUser) => void;
  logout: () => void;
  registerUser: (userData: RegisterUserData) => void;
}

const demoUsers: Record<string, AuthUser> = {
  "admin@sparkle.edu": {
    id: "admin-1",
    name: "Admin User",
    email: "admin@sparkle.edu",
    role: "admin",
  },
  "school@sgis.edu": {
    id: "school-1",
    name: "School Rep (SGIS)",
    email: "school@sgis.edu",
    role: "school",
    schoolId: "s1",
  },
  "student@sparkle.edu": {
    id: "student-1",
    name: "Sarah Lee",
    email: "student@sparkle.edu",
    role: "student",
    schoolId: "s1",
  },
  "judge@panel.edu": {
    id: "judge-1",
    name: "Judge Panel A",
    email: "judge@panel.edu",
    role: "judge",
    judgeCategory: "all",
  },
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(() =>
    readStoredJson<AuthUser | null>(AUTH_USER_STORAGE_KEY, null),
  );
  const [registeredUsers, setRegisteredUsers] = useState<
    Record<string, AuthUser>
  >(() =>
    readStoredJson<Record<string, AuthUser>>(REGISTERED_USERS_STORAGE_KEY, {
      ...demoUsers,
    }),
  );

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    if (user) {
      window.localStorage.setItem(AUTH_USER_STORAGE_KEY, JSON.stringify(user));
    } else {
      window.localStorage.removeItem(AUTH_USER_STORAGE_KEY);
    }
  }, [user]);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    window.localStorage.setItem(
      REGISTERED_USERS_STORAGE_KEY,
      JSON.stringify(registeredUsers),
    );
  }, [registeredUsers]);

  const login = (role: UserRole, email?: string) => {
    if (email && registeredUsers[email]) {
      setUser(registeredUsers[email]);
    } else {
      // Fallback to demo users by role for backwards compatibility
      const demoUser = Object.values(registeredUsers).find(
        (u) => u.role === role,
      );
      if (demoUser) setUser(demoUser);
    }
  };

  const registerUser = (userData: RegisterUserData) => {
    const resolvedName =
      userData.role === "school"
        ? userData.schoolName || userData.schoolShortName || userData.name
        : userData.name;

    const newUser: AuthUser = {
      id: `user-${Date.now()}`,
      name: resolvedName,
      email: userData.email,
      role: userData.role,
      schoolId:
        userData.role === "school" ? `school-${Date.now()}` : userData.schoolId,
      judgeCategory: userData.judgeCategory,
    };

    setRegisteredUsers((prev) => ({
      ...prev,
      [userData.email]: newUser,
    }));
  };

  const loginWithUser = (authUser: AuthUser) => {
    setUser(authUser);
  };

  const logout = () => setUser(null);

  return (
    <AuthContext.Provider
      value={{ user, login, loginWithUser, logout, registerUser }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
