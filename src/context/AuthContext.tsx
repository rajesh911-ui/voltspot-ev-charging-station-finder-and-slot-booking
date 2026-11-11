import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole } from '../types';
import { storage } from '../services/storage';

interface AuthContextType {
  user: User | null;
  token: string | null;
  role: UserRole | null;
  login: (email: string) => boolean;
  register: (name: string, email: string, phone: string, role: UserRole) => User;
  logout: () => void;
  isAuthenticated: boolean;
}

const AUTH_USER_KEY = 'voltspot_authenticated_user';
const LEGACY_USER_KEY = 'voltspot_current_user';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    try {
      const saved = localStorage.getItem(AUTH_USER_KEY);
      if (!saved) return null;

      const savedUser = JSON.parse(saved) as Partial<User>;
      if (typeof savedUser.id !== 'number' || typeof savedUser.email !== 'string') {
        return null;
      }

      const registeredUser = storage.getUserById(savedUser.id);
      return registeredUser?.email.toLowerCase() === savedUser.email.toLowerCase()
        ? registeredUser
        : null;
    } catch {
      return null;
    }
  });

  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user));
      localStorage.removeItem(LEGACY_USER_KEY);
      const simulatedJwt = `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIke3VzZXIuaWR9IiwiZW1haWwiOiIke3VzZXIuZW1haWx9Iiwicm9sZSI6IiR7dXNlci5yb2xlfSIsImlhdCI6MTY3MjUwMDAwMH0`;
      localStorage.setItem('voltspot_jwt_token', simulatedJwt);
      setToken(simulatedJwt);
    } else {
      localStorage.removeItem(AUTH_USER_KEY);
      localStorage.removeItem(LEGACY_USER_KEY);
      localStorage.removeItem('voltspot_jwt_token');
      setToken(null);
    }
  }, [user]);

  const login = (email: string): boolean => {
    const existing = storage.getUserByEmail(email);
    if (existing) {
      setUser(existing);
      return true;
    }
    return false;
  };

  const register = (name: string, email: string, phone: string, role: UserRole): User => {
    const newUser = storage.createUser({
      name,
      email,
      phone,
      role,
    });
    setUser(newUser);
    return newUser;
  };

  const logout = () => {
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        role: user?.role ?? null,
        login,
        register,
        logout,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
