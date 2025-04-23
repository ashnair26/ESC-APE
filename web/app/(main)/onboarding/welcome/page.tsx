'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { usePrivy } from '@privy-io/react-auth';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import OnboardingProgress from '@/components/onboarding/OnboardingProgress';

export default function WelcomeOnboardingPage() {
  const router = useRouter();
  const { ready, authenticated, user } = usePrivy();
  const [selectedOption, setSelectedOption] = useState<'create' | 'join' | null>(null);

  // Basic loading state
  if (!ready) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-black">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  // Redirect if not authenticated
  if (!authenticated) {
    router.replace('/login');
    return (
      <div className="flex min-h-screen items-center justify-center bg-black text-white">
        <LoadingSpinner size="lg" />
        <span className="ml-3">Redirecting to login...</span>
      </div>
    );
  }

  const handleCreateCommunity = () => {
    setSelectedOption('create');
    setTimeout(() => {
      router.push('/onboarding/select-template');
    }, 300); // Small delay for the selection effect to be visible
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center">
      {/* Card container */}
      <div className="w-full max-w-3xl bg-[#111111] rounded-2xl p-8 mx-4">
        {/* Progress indicator */}
        <div className="mb-8">
          <OnboardingProgress currentStep={1} totalSteps={4} />
        </div>

        {/* Logo */}
        <div className="flex justify-center mb-8">
          <Image
            src="/images/ESCAPE3.svg"
            alt="ESCAPE Logo"
            width={160}
            height={60}
            priority
          />
        </div>

        {/* Welcome text */}
        <div className="text-center mb-10">
          <h1 className="text-2xl font-semibold mb-2">Hello! What experience would you like?</h1>
        </div>

        {/* Options */}
        <div className="space-y-4 mb-6">
          {/* Create Community Option */}
          <button
            className={`w-full p-4 rounded-lg border text-left text-lg font-medium transition-all duration-200 ${selectedOption === 'create' ? 'bg-[#C20023] border-[#C20023] text-white' : 'bg-transparent border-[#333333] text-white hover:border-[#C20023]'}`}
            onClick={handleCreateCommunity}
          >
            Create a community
          </button>

          {/* Join Community Option (Disabled) */}
          <button
            className="w-full p-4 rounded-lg border border-[#333333] text-left text-lg font-medium bg-transparent text-gray-500 opacity-60 cursor-not-allowed"
            disabled
          >
            Join a community
          </button>
        </div>

        {/* User info */}
        <div className="text-center text-xs text-gray-500 mt-6">
          Logged in as: {user?.wallet?.address || (user?.email?.address ? user.email.address : '...')}
        </div>
      </div>
    </div>
  );
}
