'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import authService, { User } from '@/lib/api/services/auth.service';
import { useRouter } from 'next/navigation';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isAdmin: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  setAuthToken: (token: string) => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  // Initialize auth state on mount
  useEffect(() => {
    initializeAuth();
  }, []);

  const initializeAuth = async () => {
    try {
      const storedUser = authService.getUser();
      const token = authService.getToken();

      if (storedUser && token) {
        // Verify token is still valid by fetching current user
        try {
          const response = await authService.getCurrentUser();
          if (response.success && response.data) {
            setUser(response.data);
          } else {
            // Token invalid, clear auth
            authService.logout();
            setUser(null);
          }
        } catch (error) {
          // Token invalid or expired
          authService.logout();
          setUser(null);
        }
      }
    } catch (error) {
      console.error('Auth initialization error:', error);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      const response = await authService.login({ email, password });
      
      if (response.success && response.data) {
        setUser(response.data.user);
        
        // Redirect based on role
        if (response.data.user.role === 'admin') {
          router.push('/admin');
        } else {
          router.push('/dashboard');
        }
      } else {
        throw new Error(response.message || 'Login failed');
      }
    } catch (error: any) {
      // Let the component handle the error
      throw error;
    }
  };

  const logout = async () => {
    try {
      await authService.logout();
      setUser(null);
      router.push('/login');
    } catch (error) {
      console.error('Logout error:', error);
      // Still clear local state even if API call fails
      setUser(null);
      router.push('/login');
    }
  };

  const refreshUser = async () => {
    try {
      const response = await authService.getCurrentUser();
      if (response.success && response.data) {
        setUser(response.data);
      }
    } catch (error) {
      console.error('Refresh user error:', error);
    }
  };

  // Set auth token directly (for WebView deep linking)
  const setAuthToken = async (token: string): Promise<boolean> => {
    try {
      // Store the token
      if (typeof window !== 'undefined') {
        localStorage.setItem('auth_token', token);
      }
      
      // Verify token by fetching user data
      const response = await authService.getCurrentUser();
      if (response.success && response.data) {
        setUser(response.data);
        // Store user data
        if (typeof window !== 'undefined') {
          localStorage.setItem('auth_user', JSON.stringify(response.data));
        }
        return true;
      } else {
        // Token invalid, clear it
        if (typeof window !== 'undefined') {
          localStorage.removeItem('auth_token');
        }
        return false;
      }
    } catch (error) {
      console.error('Set auth token error:', error);
      // Clear invalid token
      if (typeof window !== 'undefined') {
        localStorage.removeItem('auth_token');
      }
      return false;
    }
  };

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    isAdmin: user?.role === 'admin',
    login,
    logout,
    refreshUser,
    setAuthToken,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
