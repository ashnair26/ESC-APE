'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function CreatorHubPage() {
  const router = useRouter();
  
  // Redirect to landing page
  useEffect(() => {
    router.replace('/creatorhub/landing');
  }, [router]);
  
  // Show a simple loading state while redirecting
  return (
    <div className="flex flex-col items-center justify-center h-[calc(100vh-80px)]">
      <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-white"></div>
      <p className="mt-4 text-gray-400">Redirecting to landing page...</p>
    </div>
  );
}
