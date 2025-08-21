import React, { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';

interface AuthUser {
  id: number;
  name: string;
  group_code: string;
  gender: 'male' | 'female';
  phone_number?: string;
  email?: string;
  profile_picture_url?: string;
}

interface AuthContextType {
  user: AuthUser | null;
  isAuthenticated: boolean;
  login: (user: AuthUser) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);

  // Check for saved authentication on mount
  useEffect(() => {
    const savedUser = localStorage.getItem('church_app_user');
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (error) {
        console.error('Error parsing saved user:', error);
        localStorage.removeItem('church_app_user');
      }
    }
  }, []);

  const login = (authUser: AuthUser) => {
    setUser(authUser);
    localStorage.setItem('church_app_user', JSON.stringify(authUser));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('church_app_user');
  };

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
