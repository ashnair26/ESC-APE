'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    // Simple redirect to admin login page
    // This avoids using AuthProvider at the root level
    router.push('/admin-login');
  }, [router]);

  return (
    <div className="flex min-h-screen items-center justify-center">
      <LoadingSpinner size="lg" />
    </div>
  );
}
