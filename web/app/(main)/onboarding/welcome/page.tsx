'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { usePrivy } from '@privy-io/react-auth';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import OnboardingProgress from '@/components/onboarding/OnboardingProgress';

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
    <div className="min-h-screen bg-black text-white">
      {/* Use the OnboardingProgress component for consistency */}
      <div className="pt-16 md:pt-24 flex justify-center">
        <OnboardingProgress currentStep={1} totalSteps={4} />
      </div>

      {/* Embed the HTML implementation */}
      <iframe
        src="/welcome-page/index.html"
        className="w-full h-[calc(100vh-120px)] border-none"
        title="Welcome to ESCAPE"
      />

      {/* Add event listener to handle navigation */}
      <script dangerouslySetInnerHTML={{ __html: `
        window.addEventListener('message', function(event) {
          if (event.data === 'createCommunity') {
            window.location.href = '/onboarding/select-template';
          }
        });
      `}} />
    </div>
  );
}
