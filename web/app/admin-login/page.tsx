'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

export default function AdminLoginPage() {
  const router = useRouter();

  // Redirect to the correct admin login page
  useEffect(() => {
    router.replace('/admin/login');
  }, [router]);

  // Show loading spinner while redirecting
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <LoadingSpinner size="lg" />
        <p className="mt-4 text-gray-700 dark:text-gray-300">Redirecting to admin login...</p>
      </div>
    </div>
  );
}
