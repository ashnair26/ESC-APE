'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import DashboardHeader from '@/components/layout/DashboardHeader';

export default function AdminDashboardPage() {
  const router = useRouter();
  const { user, loading, checkAuth } = useAuth();

  // Check if authenticated
  useEffect(() => {
    const verifyAuth = async () => {
      try {
        const isAuthenticated = await checkAuth();

        if (!isAuthenticated) {
          router.push('/admin/login');
        }
      } catch (err) {
        console.error('Error checking authentication:', err);
        router.push('/admin/login');
      }
    };

    verifyAuth();
  }, [checkAuth, router]);

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500 mx-auto"></div>
          <p className="mt-4 text-gray-700 dark:text-gray-300">Loading...</p>
        </div>
      </div>
    );
  }

  // Will redirect in useEffect if not authenticated
  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      <DashboardHeader />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">User Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-md">
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">ID</p>
              <p className="mt-1 text-gray-900 dark:text-white">{user.id}</p>
            </div>
            <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-md">
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Email</p>
              <p className="mt-1 text-gray-900 dark:text-white">{user.email}</p>
            </div>
            <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-md">
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Name</p>
              <p className="mt-1 text-gray-900 dark:text-white">{user.name || 'Not set'}</p>
            </div>
            <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-md">
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Role</p>
              <p className="mt-1 text-gray-900 dark:text-white">{user.role}</p>
            </div>
          </div>
        </div>

        <div className="mt-8 bg-white dark:bg-gray-800 shadow rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Dashboard Content</h2>
          <p className="text-gray-700 dark:text-gray-300">
            This is a protected dashboard page. You can only see this if you are authenticated.
          </p>
        </div>
      </main>
    </div>
  );
}
