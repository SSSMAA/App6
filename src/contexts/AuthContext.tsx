import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authAPI } from '../services/supabaseApi';
import { supabase } from '../lib/supabase';
import type { User } from '../lib/supabase';

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  loading: boolean;
  isAuthenticated: boolean;
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
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setToken(session.access_token);
        loadUserProfile();
      } else {
        setLoading(false);
      }
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN' && session) {
          setToken(session.access_token);
          await loadUserProfile();
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
          setToken(null);
        }
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const loadUserProfile = async () => {
    try {
      const profile = await authAPI.getCurrentUser();
      setUser(profile);
    } catch (error) {
      console.error('Error loading user profile:', error);
      setUser(null);
      setToken(null);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      const response = await authAPI.login(email, password);
      const { token: newToken, user: newUser } = response;

      setToken(newToken);
      setUser(newUser);
    } catch (error) {
      throw error;
    }
  };

  const logout = () => {
    authAPI.logout();
    setUser(null);
    setToken(null);
  };

  const value = {
    user,
    token,
    login,
    logout,
    loading,
    isAuthenticated: !!user && !!token,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};