/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useEffect, useState } from 'react';
import api from '../utils/axios';

interface User {
  email: string;
  firstName: string;
  lastName: string;
  picture: string;
}

interface AuthContextType {
  user: User | null;
  setUser: (user: User | null) => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {


    try {
      const token = localStorage.getItem('access_token');
      if (!token) {
        setIsLoading(false);
        return;
      }

      // Verify token and get user data
      const response = await api.get('/auth/me');
   
      setUser(response.data.user as User);
    } catch (error: any) {
        console.error('Auth check failed:', error?.response?.data || error);
        
        // Only remove token if it's an authentication error (401)
        if (error?.response?.status === 401) {
          // localStorage.removeItem('access_token');
          setUser(null);
        }
      } finally {
        setIsLoading(false);
      }
  };

  return (
    <AuthContext.Provider value={{ user, setUser, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};