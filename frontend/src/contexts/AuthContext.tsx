import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types';
import { api } from '../services/api';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (full_name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  deleteAccount: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('agri_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    // Check if token exists on mount
    const token = localStorage.getItem('agri_access_token');
    const savedUser = localStorage.getItem('agri_user');
    if (token && savedUser) {
      setUser(JSON.parse(savedUser));
    } else {
      setUser(null);
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    const res = await api.login({ email, password });
    localStorage.setItem('agri_access_token', res.access_token);
    localStorage.setItem('agri_refresh_token', res.refresh_token);
    localStorage.setItem('agri_user', JSON.stringify(res.user));
    setUser(res.user);
  };

  const signup = async (full_name: string, email: string, password: string) => {
    const res = await api.signup({ full_name, email, password });
    localStorage.setItem('agri_access_token', res.access_token);
    localStorage.setItem('agri_refresh_token', res.refresh_token);
    localStorage.setItem('agri_user', JSON.stringify(res.user));
    setUser(res.user);
  };

  const logout = () => {
    api.clearAuth();
    setUser(null);
  };

  const deleteAccount = async () => {
    await api.deleteAccount();
    logout();
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        signup,
        logout,
        deleteAccount,
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
