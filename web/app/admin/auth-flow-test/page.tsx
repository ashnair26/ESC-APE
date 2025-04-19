'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

export default function AuthFlowTestPage() {
  const router = useRouter();
  const { user, loading, login, logout, checkAuth } = useAuth();
  const [email, setEmail] = useState('admin@escaepe.io');
  const [password, setPassword] = useState('admin123');
  const [error, setError] = useState<string | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isChecking, setIsChecking] = useState(false);
  const [authStatus, setAuthStatus] = useState<string | null>(null);

  // Check auth status on mount
  useEffect(() => {
    const checkAuthStatus = async () => {
      setIsChecking(true);
      try {
        const isAuthenticated = await checkAuth();
        setAuthStatus(isAuthenticated ? 'Authenticated' : 'Not authenticated');
      } catch (err) {
        console.error('Error checking auth:', err);
        setAuthStatus('Error checking auth');
      } finally {
        setIsChecking(false);
      }
    };

    checkAuthStatus();
  }, [checkAuth]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoggingIn(true);

    try {
      const result = await login(email, password);
      if (result.success) {
        setAuthStatus('Authenticated');
      } else {
        setError(result.error || 'Login failed');
        setAuthStatus('Login failed');
      }
    } catch (err) {
      setError('An unexpected error occurred');
      console.error('Login error:', err);
      setAuthStatus('Login error');
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await logout();
      setAuthStatus('Logged out');
    } catch (err) {
      console.error('Logout error:', err);
      setAuthStatus('Logout error');
    } finally {
      setIsLoggingOut(false);
    }
  };

  const handleCheckAuth = async () => {
    setIsChecking(true);
    try {
      const isAuthenticated = await checkAuth();
      setAuthStatus(isAuthenticated ? 'Authenticated' : 'Not authenticated');
    } catch (err) {
      console.error('Error checking auth:', err);
      setAuthStatus('Error checking auth');
    } finally {
      setIsChecking(false);
    }
  };

  return (
    <div className="min-h-screen p-8 bg-gray-100 dark:bg-gray-900">
      <div className="max-w-md mx-auto bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <h1 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">Auth Flow Test</h1>
        
        <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-md">
          <h2 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">Current Status</h2>
          <p className="text-gray-700 dark:text-gray-300">
            <strong>Loading:</strong> {loading ? 'Yes' : 'No'}
          </p>
          <p className="text-gray-700 dark:text-gray-300">
            <strong>Auth Status:</strong> {authStatus || 'Unknown'}
          </p>
          <p className="text-gray-700 dark:text-gray-300">
            <strong>User:</strong> {user ? `${user.name} (${user.email})` : 'Not logged in'}
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 text-red-700 dark:text-red-400">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="mb-6">
          <div className="mb-4">
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Email
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white"
            />
          </div>
          
          <div className="mb-4">
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Password
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white"
            />
          </div>
          
          <button
            type="submit"
            disabled={isLoggingIn}
            className="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoggingIn ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <div className="flex space-x-4">
          <button
            onClick={handleLogout}
            disabled={isLoggingOut || !user}
            className="flex-1 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoggingOut ? 'Logging out...' : 'Logout'}
          </button>
          
          <button
            onClick={handleCheckAuth}
            disabled={isChecking}
            className="flex-1 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isChecking ? 'Checking...' : 'Check Auth'}
          </button>
        </div>

        <div className="mt-6">
          <button
            onClick={() => router.push('/dashboard')}
            className="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    </div>
  );
}
