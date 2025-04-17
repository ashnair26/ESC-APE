'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';
import Image from 'next/image';

// Import admin-specific styles
import '../../dashboard/admin-styles.css';

export default function AdminLoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      // Call the admin login API
      const response = await fetch('/api/admin/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok && data.token) {
        // Store the token in localStorage
        localStorage.setItem('admin_token', data.token);

        // Redirect to the admin dashboard
        router.push('/dashboard');
      } else {
        throw new Error(data.error || 'Login failed');
      }
    } catch (error: any) {
      setError(error.message || 'An error occurred during login');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="admin-dashboard min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900">
      <div className="max-w-md w-full space-y-4 p-8 rounded-xl shadow-md" style={{ backgroundColor: '#010101' }}>
        <div className="flex flex-col items-center space-y-0 mb-2">
          <div className="w-36 h-36 relative">
            <Image
              src="/images/logos/ESCAPE_logo_2.png"
              alt="ESCAPE Logo 2"
              fill
              priority
              className="object-contain"
            />
          </div>
          <div className="w-36 h-36 relative">
            <Image
              src="/images/logos/ESCAPE_logo_1.png"
              alt="ESCAPE Logo 1"
              fill
              priority
              className="object-contain"
            />
          </div>
        </div>

        <div>
          <h2 className="mt-2 text-center text-3xl font-extrabold text-white">
            ADMIN LOGIN
          </h2>
          <p className="mt-2 text-center text-sm text-gray-300">
            Please sign in to access the admin dashboard
          </p>
        </div>

        {error && (
          <div className="bg-red-900/30 border border-red-800 text-red-200 px-4 py-3 rounded relative" role="alert">
            <span className="block sm:inline">{error}</span>
          </div>
        )}

        <form className="mt-4 space-y-4" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="email-address" className="sr-only">
                Email address
              </label>
              <input
                id="email-address"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-700 placeholder-gray-400 text-white rounded-t-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 bg-gray-800 focus:z-10 sm:text-sm"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
              />
            </div>
            <div className="relative">
              <label htmlFor="password" className="sr-only">
                Password
              </label>
              <input
                id="password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-700 placeholder-gray-400 text-white rounded-b-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 bg-gray-800 focus:z-10 sm:text-sm pr-10"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <EyeSlashIcon className="h-5 w-5 text-gray-300" />
                ) : (
                  <EyeIcon className="h-5 w-5 text-gray-300" />
                )}
              </button>
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-[#c20023] hover:bg-[#a10018] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#c20023] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Signing in...' : 'Sign in'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
