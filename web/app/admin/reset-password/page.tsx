'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';
import Image from 'next/image';
import '../../dashboard/admin-styles.css';

export default function ResetPasswordPage() {
  const [token, setToken] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [mode, setMode] = useState<'request' | 'reset'>('request');

  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    // Check if token is provided in URL
    const tokenParam = searchParams.get('token');
    if (tokenParam) {
      setToken(tokenParam);
      setMode('reset');
    }
  }, [searchParams]);

  const handleRequestReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await fetch('/api/admin/auth/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess('If your email is registered, you will receive a password reset link.');
        setEmail('');
      } else {
        throw new Error(data.error || 'Failed to request password reset');
      }
    } catch (error: any) {
      setError(error.message || 'An error occurred during password reset request');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccess('');

    // Validate passwords
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      setIsLoading(false);
      return;
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters long');
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/admin/auth/reset-password/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token, password }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess('Password has been reset successfully. You can now log in with your new password.');
        setTimeout(() => {
          router.push('/admin-login');
        }, 3000);
      } else {
        throw new Error(data.error || 'Failed to reset password');
      }
    } catch (error: any) {
      setError(error.message || 'An error occurred during password reset');
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
            {mode === 'request' ? 'RESET PASSWORD' : 'NEW PASSWORD'}
          </h2>
          <p className="mt-2 text-center text-sm text-gray-300">
            {mode === 'request'
              ? 'Enter your email to receive a password reset link'
              : 'Enter your new password'}
          </p>
        </div>

        {error && (
          <div className="bg-red-900/30 border border-red-800 text-red-200 px-4 py-3 rounded relative" role="alert">
            <span className="block sm:inline">{error}</span>
          </div>
        )}

        {success && (
          <div className="bg-green-900/30 border border-green-800 text-green-200 px-4 py-3 rounded relative" role="alert">
            <span className="block sm:inline">{success}</span>
          </div>
        )}

        {mode === 'request' ? (
          <form className="mt-4 space-y-4" onSubmit={handleRequestReset}>
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
                className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-700 placeholder-gray-400 text-white focus:outline-none focus:ring-primary-500 focus:border-primary-500 bg-gray-800 focus:z-10 sm:text-sm"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
              />
            </div>

            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-[#c20023] hover:bg-[#a10018] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#c20023] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Sending...' : 'Send Reset Link'}
              </button>
            </div>

            <div className="text-center">
              <a
                href="/admin/login"
                className="text-sm text-gray-300 hover:text-white"
              >
                Back to login
              </a>
            </div>
          </form>
        ) : (
          <form className="mt-4 space-y-4" onSubmit={handleResetPassword}>
            <div className="rounded-md shadow-sm -space-y-px">
              <div className="relative">
                <label htmlFor="password" className="sr-only">
                  New Password
                </label>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  required
                  className="appearance-none rounded-t-md relative block w-full px-3 py-2 border border-gray-700 placeholder-gray-400 text-white focus:outline-none focus:ring-primary-500 focus:border-primary-500 bg-gray-800 focus:z-10 sm:text-sm pr-10"
                  placeholder="New password"
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
              <div>
                <label htmlFor="confirm-password" className="sr-only">
                  Confirm Password
                </label>
                <input
                  id="confirm-password"
                  name="confirm-password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  required
                  className="appearance-none rounded-b-md relative block w-full px-3 py-2 border border-gray-700 placeholder-gray-400 text-white focus:outline-none focus:ring-primary-500 focus:border-primary-500 bg-gray-800 focus:z-10 sm:text-sm"
                  placeholder="Confirm password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  disabled={isLoading}
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-[#c20023] hover:bg-[#a10018] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#c20023] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Resetting...' : 'Reset Password'}
              </button>
            </div>

            <div className="text-center">
              <a
                href="/admin/login"
                className="text-sm text-gray-300 hover:text-white"
              >
                Back to login
              </a>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
