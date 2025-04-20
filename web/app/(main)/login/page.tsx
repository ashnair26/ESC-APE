'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { usePrivy } from '@privy-io/react-auth';
import LoadingSpinner from '@/components/ui/LoadingSpinner'; // Assuming this component exists
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
          <img src="/images/escape1.svg" alt="ESCAPE Logo" className="h-6 w-auto login-logo" />
        </div>

        {/* Sign in button on the right */}
        {!authenticated && (
          <button
            type="button"
            className="relative overflow-hidden group px-4 py-2 rounded-md font-medium bg-[#C20023] text-white hover:shadow-lg"
            onClick={login} // Trigger Privy modal directly
            disabled={!ready} // Disable button until Privy is ready
          >
            <span className="absolute inset-0 w-full h-full bg-gradient-to-br from-red-500 to-red-700 opacity-0 group-hover:opacity-20 transition-opacity duration-300 ease-in-out"></span>
            <span className="relative z-10 flex items-center justify-center">
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"></path>
              </svg>
              Sign In
            </span>
          </button>
        )}
        {/* Temporary Logout Button */}
        {ready && authenticated && (
           <button
            type="button"
            className="px-4 py-2 rounded-md font-medium bg-gray-600 text-white hover:bg-gray-700"
            onClick={logout}
            disabled={!ready}
          >
            Logout (Temp)
          </button>
        )}
      </header>

      {/* Main content area */}
      <main className="flex-grow flex items-center justify-center z-10">
        <div className="text-center px-4">
          <img src="/images/escape2.svg" alt="ESCAPE 2 Logo" className="max-w-md w-full mx-auto login-title" />
        </div>
      </main>
    </div>
  );
}
