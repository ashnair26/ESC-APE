'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

interface LogoutButtonProps {
  className?: string;
  variant?: 'primary' | 'secondary' | 'danger';
  size?: 'sm' | 'md' | 'lg';
}

export default function LogoutButton({
  className = '',
  variant = 'danger',
  size = 'md',
}: LogoutButtonProps) {
  const router = useRouter();
  const { logout } = useAuth();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await logout();
      router.push('/admin/login');
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      setIsLoggingOut(false);
    }
  };

  // Base classes
  let buttonClasses = `inline-flex items-center justify-center font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 ${className}`;

  // Size classes
  if (size === 'sm') {
    buttonClasses += ' px-2.5 py-1.5 text-xs';
  } else if (size === 'lg') {
    buttonClasses += ' px-6 py-3 text-base';
  } else {
    buttonClasses += ' px-4 py-2 text-sm'; // Default medium
  }

  // Variant classes
  if (variant === 'primary') {
    buttonClasses += ' text-white bg-primary-600 hover:bg-primary-700 focus:ring-primary-500 disabled:bg-primary-400';
  } else if (variant === 'secondary') {
    buttonClasses += ' text-gray-700 bg-gray-100 hover:bg-gray-200 focus:ring-gray-500 disabled:bg-gray-100 disabled:text-gray-400';
  } else {
    buttonClasses += ' text-white bg-red-600 hover:bg-red-700 focus:ring-red-500 disabled:bg-red-400'; // Default danger
  }

  // Disabled state
  buttonClasses += ' disabled:cursor-not-allowed disabled:opacity-50';

  return (
    <button
      onClick={handleLogout}
      disabled={isLoggingOut}
      className={buttonClasses}
    >
      {isLoggingOut ? 'Logging out...' : 'Logout'}
    </button>
  );
}
