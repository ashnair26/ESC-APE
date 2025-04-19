'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';

// Define user interface
export interface User {
  id: string;
  email: string;
  name?: string;
  role: string;
}

// Define auth context interface
interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<boolean>;
}

// Create the auth context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Auth provider props
interface AuthProviderProps {
  children: ReactNode;
}

// Auth provider component
export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const router = useRouter();

  // Check if user is authenticated on mount - only once
  useEffect(() => {
    let isMounted = true;

    const initAuth = async () => {
      if (!isMounted) return;

      try {
        const response = await fetch('/api/admin/auth/user', {
          credentials: 'include', // Important: include cookies
        });

        const data = await response.json();

        if (data.success && data.user && isMounted) {
          setUser(data.user);
        } else if (isMounted) {
          setUser(null);
        }
      } catch (error) {
        console.error('Error during initial auth check:', error);
        if (isMounted) {
          setUser(null);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    initAuth();

    // Cleanup function to prevent state updates if component unmounts
    return () => {
      isMounted = false;
    };
  }, []); // Empty dependency array ensures this runs only once on mount

  // Auto-logout timer reference
  const logoutTimerRef = React.useRef<NodeJS.Timeout | null>(null);

  // Function to clear existing timer
  const clearLogoutTimer = () => {
    if (logoutTimerRef.current) {
      clearTimeout(logoutTimerRef.current);
      logoutTimerRef.current = null;
    }
  };

  // Function to set a new logout timer
  const setLogoutTimer = (durationMs: number) => {
    clearLogoutTimer(); // Clear any existing timer first
    console.log(`[AuthContext] Setting auto-logout timer for ${durationMs / 1000 / 60} minutes.`);
    logoutTimerRef.current = setTimeout(() => {
      console.log('[AuthContext] Auto-logout timer expired. Logging out.');
      logout(); // Call the logout function
    }, durationMs);
  };

  // Effect to manage the auto-logout timer based on user state
  useEffect(() => {
    if (user) {
      // User is logged in, set the timer (2 hours = 2 * 60 * 60 * 1000 ms)
      // We could potentially get the exact expiry from the token if needed,
      // but a fixed duration after login/refresh is simpler.
      setLogoutTimer(2 * 60 * 60 * 1000);
    } else {
      // User is logged out, clear any existing timer
      clearLogoutTimer();
    }

    // Cleanup timer on component unmount or when user state changes
    return () => clearLogoutTimer();
  }, [user]); // Re-run when user state changes


  // Login function
  const login = async (email: string, password: string) => {
    try {
      // Use the real login endpoint
      const response = await fetch('/api/admin/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
        credentials: 'include', // Important: include cookies
      });

      const data = await response.json();

      if (data.success && data.user) {
        // Update the user state
        setUser(data.user);
        // Reset the auth check timer to force a fresh check
        lastAuthCheckRef.current = 0;
        return { success: true };
      } else {
        return { success: false, error: data.error || 'Login failed' };
      }
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error: 'An error occurred during login' };
    }
  };

  // Logout function
  const logout = async () => {
    try {
      await fetch('/api/admin/auth/logout', {
        method: 'POST',
        credentials: 'include', // Important: include cookies
      });
      setUser(null); // Clear user state
      clearLogoutTimer(); // Ensure timer is cleared on manual logout
      router.push('/admin/login'); // Redirect
    } catch (error) {
      console.error('Logout error:', error);
      // Still attempt to clear state and timer even if API call fails
      setUser(null);
      clearLogoutTimer();
    }
  };

  // Track last auth check time to prevent too many calls
  const lastAuthCheckRef = React.useRef<number>(0);
  const AUTH_CHECK_INTERVAL = 5000; // 5 seconds minimum between checks

  // Check if user is authenticated
  const checkAuth = async () => {
    // If we already have a user, return true immediately
    if (user) {
      return true;
    }

    // Throttle auth checks
    const now = Date.now();
    if (now - lastAuthCheckRef.current < AUTH_CHECK_INTERVAL) {
      // Return current auth state without making an API call
      return !!user;
    }

    // Update last check time
    lastAuthCheckRef.current = now;

    try {
      const response = await fetch('/api/admin/auth/user', {
        credentials: 'include', // Important: include cookies
        cache: 'no-store', // Prevent caching
      });

      const data = await response.json();

      if (data.success && data.user) {
        setUser(data.user);
        return true;
      } else {
        setUser(null);
        return false;
      }
    } catch (error) {
      console.error('Auth check error:', error);
      setUser(null);
      return false;
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, checkAuth }}>
      {children}
    </AuthContext.Provider>
  );
}

// Custom hook to use auth context
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
