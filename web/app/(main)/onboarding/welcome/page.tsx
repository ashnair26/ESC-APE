'use client';

import React from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { usePrivy } from '@privy-io/react-auth';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import OnboardingProgress from '@/components/onboarding/OnboardingProgress';
import { FrostedButton } from '@/components/ui/FrostedButton';

export default function WelcomeOnboardingPage() {
  const router = useRouter();
  const { ready, authenticated, user, logout } = usePrivy();
  // State removed as selection buttons were deleted

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

  // This function is now handled inline in the button

  const handleNext = () => {
    router.push('/onboarding/select-template');
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center">
      {/* Card container */}
      <div className="w-[814px] h-[738px] bg-[#111111] rounded-2xl p-12 mx-4 flex flex-col relative border-[0.5px] border-white border-opacity-50" style={{ fontFamily: 'var(--font-league-spartan)' }}>
        {/* Progress indicator - positioning handled in component */}
        <OnboardingProgress currentStep={1} totalSteps={4} />

        {/* Header row with back button, logo and next button */}
        <div className="flex justify-between items-center absolute top-6 left-0 right-0 px-6">
          {/* Back Button */}
          <div className="flex-1 flex justify-start">
            <button
              onClick={() => {
                // Log the user out using Privy
                logout();
                // Then redirect to login page
                router.replace('/login');
              }}
              className="w-10 h-10 rounded-full border-[0.5px] border-white border-opacity-50 flex items-center justify-center hover:border-[#C20023] hover:border-opacity-100 transition-all duration-200"
              aria-label="Back"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M15 18L9 12L15 6" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          </div>
          {/* Logo */}
          <div className="flex-1 flex justify-center">
            <Image
              src="/images/ESCAPE3.svg"
              alt="ESCAPE Logo"
              width={180}
              height={70}
              priority
            />
          </div>
          {/* Next Button */}
          <div className="flex-1 flex justify-end">
            <FrostedButton onClick={handleNext} className="text-sm">
              Next
            </FrostedButton>
          </div>
        </div>

        {/* Welcome text - positioned below progress bars */}
        <div style={{ position: 'absolute', top: '200px', left: '0', right: '0', textAlign: 'center' }}>
          <h1 className="text-3xl font-semibold" style={{ fontFamily: 'League Spartan, sans-serif' }}>Hello! What would you like to do?</h1>
        </div>

        {/* Selection buttons */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '10px',
          position: 'absolute',
          top: '313px',
          left: '211px'
        }}>
          {/* Create Community Option */}
          <button
            style={{
              width: '392px',
              height: '110px',
              borderRadius: '13px',
              border: '0.5px solid white',
              backgroundColor: 'transparent',
              display: 'flex',
              alignItems: 'center',
              paddingLeft: '24px',
              fontFamily: 'League Spartan, sans-serif',
              fontWeight: 400,
              fontSize: '20px',
              textAlign: 'left',
              color: 'white',
              cursor: 'pointer'
            }}
            onClick={() => router.push('/onboarding/select-template')}
          >
            Create a community
          </button>

          {/* Join Community Option (Disabled) */}
          <button
            style={{
              width: '392px',
              height: '110px',
              borderRadius: '13px',
              border: '0.5px solid white',
              backgroundColor: 'transparent',
              display: 'flex',
              alignItems: 'center',
              paddingLeft: '24px',
              fontFamily: 'League Spartan, sans-serif',
              fontWeight: 400,
              fontSize: '20px',
              textAlign: 'left',
              color: '#888',
              opacity: 0.6,
              cursor: 'not-allowed'
            }}
            disabled
          >
            Join a community
          </button>
        </div>

        {/* User info */}
        <div className="text-center text-xs text-gray-500 mt-auto mb-4">
          Logged in as: {user?.wallet?.address || (user?.email?.address ? user.email.address : '...')}
        </div>
      </div>
    </div>
  );
}
