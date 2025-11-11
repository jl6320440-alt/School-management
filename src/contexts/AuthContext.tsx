import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '../utils/supabase/client';
import * as kv from '../utils/supabase/kv_store';

export type UserRole = 'admin' | 'teacher' | 'student' | 'parent';

export interface User {
  id: string;
  email: string;
  role: UserRole;
  name: string;
  avatar?: string;
  classId?: string;
  childIds?: string[];
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, name: string, role: UserRole) => Promise<void>;
  signOut: () => Promise<void>;
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
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        await loadUserProfile(session.user.id);
      }
    } catch (error) {
      console.error('Error checking user:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadUserProfile = async (userId: string) => {
    try {
      const userData = await kv.get(`user:${userId}`);
      if (userData) {
        setUser(userData);
      }
    } catch (error) {
      console.error('Error loading user profile:', error);
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      // For demo purposes, check against demo accounts first
      const demoAccounts: Record<string, { id: string; password: string; userData: User }> = {
        'admin@school.com': {
          id: 'demo-admin',
          password: 'admin123',
          userData: { id: 'demo-admin', email: 'admin@school.com', name: 'Admin User', role: 'admin' },
        },
        'teacher@school.com': {
          id: 'demo-teacher',
          password: 'teacher123',
          userData: { id: 'demo-teacher', email: 'teacher@school.com', name: 'Sarah Williams', role: 'teacher' },
        },
        'student@school.com': {
          id: 'demo-student',
          password: 'student123',
          userData: { id: 'demo-student', email: 'student@school.com', name: 'Alice Johnson', role: 'student', classId: 'class-10a' },
        },
        'parent@school.com': {
          id: 'demo-parent',
          password: 'parent123',
          userData: { id: 'demo-parent', email: 'parent@school.com', name: 'Robert Johnson', role: 'parent', childIds: ['student:1'] },
        },
      };

      const demoAccount = demoAccounts[email];
      if (demoAccount && demoAccount.password === password) {
        // Demo account - just set the user without writing to KV
        // (Demo users are already initialized in the database by the server)
        setUser(demoAccount.userData);
        return;
      }

      // Try regular Supabase auth
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) throw error;
      
      if (data.user) {
        await loadUserProfile(data.user.id);
      }
    } catch (error) {
      console.error('Error signing in:', error);
      throw error;
    }
  };

  const signUp = async (email: string, password: string, name: string, role: UserRole) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });
      
      if (error) throw error;
      
      if (data.user) {
        const newUser: User = {
          id: data.user.id,
          email,
          name,
          role,
        };
        
        await kv.set(`user:${data.user.id}`, newUser);
        setUser(newUser);
      }
    } catch (error) {
      console.error('Error signing up:', error);
      throw error;
    }
  };

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
      setUser(null);
    } catch (error) {
      console.error('Error signing out:', error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};
