// src/context/AuthContext.tsx
import React, { createContext, useState, useContext, useEffect, type ReactNode } from 'react';

// --- Types ---
interface User {
  sub: string;
  email: string;
}

interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  // Now login and register are async functions that take credentials
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, username?: string) => Promise<void>;
  logout: () => void;
}

// --- Context Definition ---
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// --- Custom Hook ---
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// --- Provider Component ---
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);

  // This internal function will handle setting the state from a token
  const handleSetToken = (token: string) => {
    try {
      localStorage.setItem('authToken', token);
      const payload = JSON.parse(atob(token.split('.')[1]));
      setUser(payload);
      setIsAuthenticated(true);
    } catch (error) {
      console.error("Invalid token format.", error);
      logout(); // Clear state if token is bad
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (token) {
      handleSetToken(token);
    }
  }, []);

  const login = async (email: string, password: string) => {
    const response = await fetch('http://localhost:3000/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to login');
    }
    
    handleSetToken(data.access_token);
  };

  const register = async (email: string, password: string, username?: string) => {
    const response = await fetch('http://localhost:3000/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, username }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to register');
    }

    // After successful registration, we immediately log the user in
    await login(email, password);
  };

  const logout = () => {
    localStorage.removeItem('authToken');
    setUser(null);
    setIsAuthenticated(false);
  };

  const value = {
    isAuthenticated,
    user,
    login,
    register,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};