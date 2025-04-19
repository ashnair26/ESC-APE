'use client';

import { useState } from 'react';

export default function CookieTestPage() {
  const [cookies, setCookies] = useState<any[]>([]);
  const [hasAdminToken, setHasAdminToken] = useState<boolean>(false);
  const [adminTokenPrefix, setAdminTokenPrefix] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleCheckCookies = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/admin/auth/cookie-test', {
        credentials: 'include',
      });
      
      const data = await response.json();
      console.log('Cookie test response:', data);
      
      setCookies(data.cookies || []);
      setHasAdminToken(data.hasAdminToken || false);
      setAdminTokenPrefix(data.adminTokenPrefix);
    } catch (err) {
      console.error('Error checking cookies:', err);
      setError('Error checking cookies');
    } finally {
      setLoading(false);
    }
  };
  
  const handleSetTestCookie = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/admin/auth/cookie-test', {
        method: 'POST',
        credentials: 'include',
      });
      
      const data = await response.json();
      console.log('Set cookie response:', data);
      
      // Check cookies again
      handleCheckCookies();
    } catch (err) {
      console.error('Error setting test cookie:', err);
      setError('Error setting test cookie');
      setLoading(false);
    }
  };
  
  const handleLogin = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/admin/auth/mock-login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          email: 'admin@escape.io', 
          password: 'admin123' 
        }),
        credentials: 'include',
      });
      
      const data = await response.json();
      console.log('Login response:', data);
      
      if (data.success) {
        // Check cookies again
        handleCheckCookies();
      } else {
        setError(data.error || 'Login failed');
        setLoading(false);
      }
    } catch (err) {
      console.error('Error logging in:', err);
      setError('Error logging in');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900">
      <div className="w-full max-w-md p-8 space-y-8 bg-white dark:bg-gray-800 rounded-lg shadow-md">
        <div className="text-center">
          <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white">Cookie Test</h1>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Test cookies and authentication
          </p>
        </div>

        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 p-4 mb-4">
            <p className="text-red-700 dark:text-red-400">{error}</p>
          </div>
        )}

        <div className="flex flex-col space-y-4">
          <button
            onClick={handleCheckCookies}
            disabled={loading}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Loading...' : 'Check Cookies'}
          </button>
          
          <button
            onClick={handleSetTestCookie}
            disabled={loading}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Set Test Cookie
          </button>
          
          <button
            onClick={handleLogin}
            disabled={loading}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Login
          </button>
        </div>
        
        <div className="mt-6">
          <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Cookie Status</h2>
          
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
            <p className="text-gray-700 dark:text-gray-300 mb-2">
              Admin Token: <span className="font-bold">{hasAdminToken ? 'Present' : 'Not Present'}</span>
            </p>
            
            {adminTokenPrefix && (
              <p className="text-gray-700 dark:text-gray-300 mb-2">
                Token Prefix: <span className="font-mono">{adminTokenPrefix}</span>
              </p>
            )}
            
            <h3 className="text-md font-medium text-gray-800 dark:text-gray-200 mt-4 mb-2">All Cookies:</h3>
            
            {cookies.length > 0 ? (
              <ul className="list-disc list-inside">
                {cookies.map((cookie, index) => (
                  <li key={index} className="text-gray-700 dark:text-gray-300">
                    <span className="font-bold">{cookie.name}</span>: {cookie.value}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-500 dark:text-gray-400">No cookies found</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
