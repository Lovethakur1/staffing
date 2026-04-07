import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import * as SecureStore from 'expo-secure-store';
import api from '../config/api';
import { User } from '../types';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadStoredAuth();
  }, []);

  async function loadStoredAuth() {
    try {
      const storedToken = await SecureStore.getItemAsync('authToken');
      if (storedToken) {
        setToken(storedToken);
        const res = await api.get('/auth/me');
        setUser(res.data);
      }
    } catch {
      await SecureStore.deleteItemAsync('authToken');
    } finally {
      setIsLoading(false);
    }
  }

  async function login(email: string, password: string) {
    const res = await api.post('/auth/login', { email, password });
    const { user: userData, token: authToken } = res.data;

    // Allow STAFF and MANAGER roles to login to the app
    if (userData.role !== 'STAFF' && userData.role !== 'MANAGER') {
      throw new Error('This app is for staff and managers only.');
    }

    await SecureStore.setItemAsync('authToken', authToken);
    setToken(authToken);
    setUser(userData);
  }

  async function logout() {
    await SecureStore.deleteItemAsync('authToken');
    setToken(null);
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, token, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
