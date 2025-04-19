'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function AuthTestPage() {
  const [authStatus, setAuthStatus] = useState<'loading' | 'authenticated' | 'unauthenticated'>('loading');
  const [userData, setUserData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch('/api/admin/auth/user', {
          credentials: 'include',
        });
        
        console.log('Auth check response:', response.status);
        
        const data = await response.json();
        console.log('Auth check data:', data);
        
        if (data.success && data.user) {
          setAuthStatus('authenticated');
          setUserData(data.user);
        } else {
          setAuthStatus('unauthenticated');
          setError(data.error || 'Not authenticated');
        }
      } catch (err) {
        console.error('Auth check error:', err);
        setAuthStatus('unauthenticated');
        setError('Error checking authentication');
      }
    };
    
    checkAuth();
  }, []);
  
  const handleLogout = async () => {
    try {
      await fetch('/api/admin/auth/logout', {
        method: 'POST',
        credentials: 'include',
      });
      setAuthStatus('unauthenticated');
      setUserData(null);
      setError('Logged out successfully');
    } catch (err) {
      console.error('Logout error:', err);
      setError('Error during logout');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900">
      <div className="w-full max-w-md p-8 space-y-8 bg-white dark:bg-gray-800 rounded-lg shadow-md">
        <div className="text-center">
          <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white">Authentication Test</h1>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            This page checks if you're authenticated
          </p>
        </div>

        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 p-4 mb-4">
            <p className="text-red-700 dark:text-red-400">{error}</p>
          </div>
        )}

        <div className="mt-4">
          <p className="text-gray-700 dark:text-gray-300">
            Status: <span className="font-bold">{authStatus}</span>
          </p>
          
          {userData && (
            <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-2">User Data</h2>
              <pre className="text-sm text-gray-700 dark:text-gray-300 overflow-auto">
                {JSON.stringify(userData, null, 2)}
              </pre>
            </div>
          )}
          
          <div className="mt-6 flex flex-col space-y-4">
            {authStatus === 'authenticated' ? (
              <button
                onClick={handleLogout}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              >
                Logout
              </button>
            ) : (
              <Link
                href="/admin/simple-login"
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              >
                Go to Login
              </Link>
            )}
            
            <Link
              href="/dashboard"
              className="w-full flex justify-center py-2 px-4 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              Try Dashboard
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
