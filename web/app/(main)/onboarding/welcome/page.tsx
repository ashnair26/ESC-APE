'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { usePrivy } from '@privy-io/react-auth';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import Button from '@/components/ui/Button';
// Card component is a default export, sub-components are not exported separately
import Card from '@/components/ui/Card';

export default function WelcomeOnboardingPage() {
  const router = useRouter();
  const { ready, authenticated, user } = usePrivy();

  // Basic loading state
  if (!ready) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  // Redirect if not authenticated
  if (!authenticated) {
     router.replace('/login');
     return (
        <div className="flex min-h-screen items-center justify-center">
            <LoadingSpinner size="lg" /> Redirecting to login...
        </div>
     );
  }

  const handleCreateCommunity = () => {
    router.push('/onboarding/select-template');
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-100 dark:bg-gray-900 p-4">
      <div className="w-full max-w-4xl text-center mb-12">
         <h1 className="text-4xl font-bold mb-4 text-gray-900 dark:text-white">
          Welcome to ESCAPE!
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-300">
          Let's get started on your creative journey.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-4xl">
        {/* Card 1: Create Community */}
        <Card
          className="flex flex-col justify-between transform transition-transform hover:scale-105"
          onClick={handleCreateCommunity} // Make card clickable
          title={<span className="text-2xl">Create Community</span>} // Updated Title
          footer={
            <Button
              onClick={handleCreateCommunity}
              className="w-full btn-primary"
              size="lg"
            >
              Start Building
            </Button>
          }
        >
          {/* Removed descriptive paragraph */}
          <p>Start from scratch or use a template to define your IP, quests, and NFTs.</p>
          {/* Add an icon or image here if desired */}
        </Card>

        {/* Card 2: Join Community (Disabled) */}
        <Card
          className="flex flex-col justify-between opacity-50 cursor-not-allowed"
          title={<span className="text-2xl">Join Community</span>} // Updated Title
          footer={
            <Button
              className="w-full btn-secondary"
              size="lg"
              variant="outline"
              disabled={true}
            >
              Explore Communities
            </Button>
          }
        >
           {/* Removed descriptive paragraph */}
           <p>Discover and participate in established ESCAPE communities.</p>
           {/* Add an icon or image here if desired */}
        </Card>
      </div>

        {/* Optional: Display user info */}
        <div className="mt-12 text-sm text-gray-500 dark:text-gray-400">
          Logged in as: {user?.wallet?.address || '...'}
        </div>
    </div>
  );
}
