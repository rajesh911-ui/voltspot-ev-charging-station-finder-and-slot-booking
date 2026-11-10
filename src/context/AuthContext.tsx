import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole } from '../types';
import { storage } from '../services/storage';

interface AuthContextType {
  user: User | null;
  token: string | null;
  role: UserRole;
  login: (email: string) => boolean;
  register: (name: string, email: string, phone: string, role: UserRole) => User;
  logout: () => void;
  switchRole: (role: UserRole) => void;
  quickSwitchUser: (userId: number) => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    try {
      const saved = localStorage.getItem('voltspot_current_user');
      if (saved) return JSON.parse(saved);
      // Default to the seed driver for immediate ready-to-test experience
      return storage.getUserById(1) || null;
    } catch {
      return storage.getUserById(1) || null;
    }
  });

  const [token, setToken] = useState<string | null>(() => {
    return localStorage.getItem('voltspot_jwt_token') || 'mock-jwt-token-voltspot-user-1';
  });

  useEffect(() => {
    if (user) {
      localStorage.setItem('voltspot_current_user', JSON.stringify(user));
      const simulatedJwt = `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIke3VzZXIuaWR9IiwiZW1haWwiOiIke3VzZXIuZW1haWx9Iiwicm9sZSI6IiR7dXNlci5yb2xlfSIsImlhdCI6MTY3MjUwMDAwMH0`;
      localStorage.setItem('voltspot_jwt_token', simulatedJwt);
      setToken(simulatedJwt);
    } else {
      localStorage.removeItem('voltspot_current_user');
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

  const switchRole = (newRole: UserRole) => {
    const users = storage.getUsers();
    const targetUser = users.find((u) => u.role === newRole) || users[0];
    if (targetUser) {
      setUser(targetUser);
    }
  };

  const quickSwitchUser = (userId: number) => {
    const target = storage.getUserById(userId);
    if (target) {
      setUser(target);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        role: user ? user.role : 'DRIVER',
        login,
        register,
        logout,
        switchRole,
        quickSwitchUser,
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
