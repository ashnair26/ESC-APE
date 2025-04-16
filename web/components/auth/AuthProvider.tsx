'use client';

import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';

interface User {
  id: string;
  username?: string;
  email?: string;
  role?: string;
  scopes?: string[];
}

interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: User | null;
  error: string | null;
  login: (token: string) => Promise<void>;
  logout: () => Promise<void>;
  getToken: () => string | null;
}

export const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  isLoading: true,
  user: null,
  error: null,
  login: async () => {},
  logout: async () => {},
  getToken: () => null,
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [token, setToken] = useState<string | null>(null);

  // Check if the user is already authenticated
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await axios.get('/api/auth/user', {
          withCredentials: true,
        });

        if (response.data.success && response.data.user) {
          setIsAuthenticated(true);
          setUser(response.data.user);
          // The token is stored in an HTTP-only cookie
        } else {
          setIsAuthenticated(false);
          setUser(null);
        }
      } catch (err) {
        setIsAuthenticated(false);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = async (privyToken: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await axios.post(
        '/api/auth/verify',
        { token: privyToken },
        { withCredentials: true }
      );

      if (response.data.success) {
        setIsAuthenticated(true);
        setUser(response.data.user);
        setToken(response.data.token);
      } else {
        throw new Error(response.data.error || 'Authentication failed');
      }
    } catch (err: any) {
      setIsAuthenticated(false);
      setUser(null);
      setToken(null);
      setError(
        err.response?.data?.detail ||
          err.message ||
          'An error occurred during login'
      );
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    setError(null);

    try {
      await axios.post('/api/auth/logout', {}, { withCredentials: true });
      setIsAuthenticated(false);
      setUser(null);
      setToken(null);
    } catch (err: any) {
      setError(
        err.response?.data?.detail ||
          err.message ||
          'An error occurred during logout'
      );
      // Still clear the user state even if the server request fails
      setIsAuthenticated(false);
      setUser(null);
      setToken(null);
    } finally {
      setIsLoading(false);
    }
  };

  const getToken = () => {
    return token;
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        isLoading,
        user,
        error,
        login,
        logout,
        getToken,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
