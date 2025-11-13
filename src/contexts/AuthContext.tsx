import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import * as authApi from '../utils/backend/authApi';

export type UserRole = 'admin' | 'teacher' | 'student' | 'parent';

export interface User {
  id: string;
  email: string;
  role: UserRole;
  name: string;
  avatar?: string;
  phone?: string;
  address?: string;
  classId?: string;
  childIds?: string[];
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  token: string | null;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, name: string, role: UserRole, phone?: string, address?: string) => Promise<void>;
  signOut: () => Promise<void>;
  updateProfile: (data: Partial<User>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Verify token on mount
  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    try {
      const savedToken = localStorage.getItem('auth:token');
      if (savedToken) {
        setToken(savedToken);
        const userData = await authApi.getCurrentUser(savedToken);
        setUser({
          id: userData.id,
          email: userData.email,
          name: userData.name,
          role: userData.role,
          avatar: userData.avatar,
          phone: userData.phone,
          address: userData.address,
        });
      }
    } catch (error) {
      console.error('Error checking user:', error);
      localStorage.removeItem('auth:token');
      localStorage.removeItem('auth:user');
      setToken(null);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const response = await authApi.login({ email, password });
      const { token: newToken, user: userData } = response;
      
      setToken(newToken);
      setUser({
        id: userData.id,
        email: userData.email,
        name: userData.name,
        role: userData.role,
        avatar: userData.avatar,
        phone: userData.phone,
        address: userData.address,
      });
      
      localStorage.setItem('auth:token', newToken);
      localStorage.setItem('auth:user', JSON.stringify(userData));
    } catch (error) {
      console.error('Error signing in:', error);
      throw error;
    }
  };

  const signUp = async (email: string, password: string, name: string, role: UserRole, phone?: string, address?: string) => {
    try {
      const response = await authApi.register({ email, password, name, role, phone, address });
      const { token: newToken, user: userData } = response;
      
      setToken(newToken);
      setUser({
        id: userData.id,
        email: userData.email,
        name: userData.name,
        role: userData.role,
        avatar: userData.avatar,
        phone: userData.phone,
        address: userData.address,
      });
      
      localStorage.setItem('auth:token', newToken);
      localStorage.setItem('auth:user', JSON.stringify(userData));
    } catch (error) {
      console.error('Error signing up:', error);
      throw error;
    }
  };

  const signOut = async () => {
    try {
      localStorage.removeItem('auth:token');
      localStorage.removeItem('auth:user');
      setToken(null);
      setUser(null);
    } catch (error) {
      console.error('Error signing out:', error);
      throw error;
    }
  };

  const updateUserProfile = async (data: Partial<User>) => {
    try {
      if (!token) throw new Error('No token available');
      const updated = await authApi.updateProfile(token, data);
      setUser({
        id: updated.id,
        email: updated.email,
        name: updated.name,
        role: updated.role,
        avatar: updated.avatar,
        phone: updated.phone,
        address: updated.address,
      });
      localStorage.setItem('auth:user', JSON.stringify(updated));
    } catch (error) {
      console.error('Error updating profile:', error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, token, signIn, signUp, signOut, updateProfile: updateUserProfile }}>
      {children}
    </AuthContext.Provider>
  );
};
