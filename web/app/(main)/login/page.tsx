'use client';

import { useEffect } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { usePrivy } from '@privy-io/react-auth';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { FrostedButton } from '@/components/ui/FrostedButton';
import ParticleBackground from '@/components/ui/ParticleBackground';
import './login-animations.css';
import { setupPrivyAnimations } from './privy-animations';

export default function LoginPage() {
  const router = useRouter();
  const { ready, authenticated, login, logout } = usePrivy(); // Import logout

  // Log Privy state changes
  console.log(`[Login Page] Privy State: ready=${ready}, authenticated=${authenticated}`);

  // Set up Privy animations
  useEffect(() => {
    setupPrivyAnimations();
  }, []);

  // Redirect logic:
  // - If authenticated, redirect immediately to /auth-check for verification & routing.
  // - If not authenticated and Privy is ready, show the login page.
  useEffect(() => {
    if (ready && authenticated) {
      console.log('[Login Page] User authenticated, redirecting to /auth-check...');
      router.replace('/auth-check'); // Use replace to avoid adding login page to history
    }
    // No need for else, component will render login UI if not authenticated
  }, [ready, authenticated, router]);

  // Show loading indicator while Privy is initializing OR if authenticated (before redirect)
  if (!ready || (ready && authenticated)) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  // If ready and not authenticated, show the login page content
  return (
    <div className="min-h-screen flex flex-col login-container bg-black text-white relative overflow-hidden">
      <ParticleBackground />
      {/* Navbar-style header */}
      <header className="w-full py-4 px-6 flex justify-between items-center bg-black bg-opacity-20 backdrop-blur-sm z-10">
        {/* Logo on the left */}
        <div className="flex items-center">
          <Image
            src="/images/ESCAPE3.svg"
            alt="ESCAPE Logo"
            width={120}
            height={45}
            priority
            className="login-logo"
          />
        </div>

        {/* Sign in button on the right */}
        {!authenticated && (
          <FrostedButton
            onClick={login} // Trigger Privy modal directly
            disabled={!ready} // Disable button until Privy is ready
          >
            Sign In
          </FrostedButton>
        )}
        {/* Temporary Logout Button */}
        {ready && authenticated && (
          <FrostedButton
            onClick={logout}
            disabled={!ready}
            variant="outline"
          >
            Logout
          </FrostedButton>
        )}
      </header>

      {/* Main content area */}
      <main className="flex-grow flex items-center justify-center z-10">
        <div className="text-center px-4">
          <Image
            src="/images/ESCAPE3.svg"
            alt="ESCAPE Logo"
            width={300}
            height={120}
            priority
            className="max-w-md w-full mx-auto login-title"
          />
        </div>
      </main>
    </div>
  );
}
