'use client';

import { useAuth } from '@/contexts/AuthContext';
import LogoutButton from '@/components/auth/LogoutButton';

export default function DashboardHeader() {
  const { user } = useAuth();

  return (
    <header className="bg-white dark:bg-gray-800 shadow">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
        <div className="flex items-center space-x-4">
          {user && (
            <div className="text-sm text-gray-700 dark:text-gray-300">
              Welcome, <span className="font-medium">{user.name || user.email}</span>
            </div>
          )}
          <LogoutButton size="sm" />
        </div>
      </div>
    </header>
  );
}
