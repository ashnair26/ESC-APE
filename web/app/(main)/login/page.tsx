'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { usePrivy } from '@privy-io/react-auth';
import LoadingSpinner from '@/components/ui/LoadingSpinner'; // Assuming this component exists
import './login-animations.css';

export default function LoginPage() {
  const router = useRouter();
  const { ready, authenticated, login } = usePrivy();
  const [isPulsing, setIsPulsing] = useState(false);

  // Add pulse effect every few seconds to draw attention to the login button
  useEffect(() => {
    if (ready && !authenticated) {
      const interval = setInterval(() => {
        setIsPulsing(true);
        setTimeout(() => setIsPulsing(false), 2000);
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [ready, authenticated]);

  // Redirect to dashboard if user is already authenticated and Privy is ready
  useEffect(() => {
    if (ready && authenticated) {
      // Redirect non-admin users away from the generic /login page if already logged in
      // Admins might have a different flow, handled elsewhere
      router.push('/dashboard'); // Or wherever non-admin users should go
    }
  }, [ready, authenticated, router]);

  // Show loading indicator while Privy is initializing
  if (!ready) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  // If ready and not authenticated, show the login page content
  return (
    <div className="flex min-h-screen flex-col items-center justify-center py-12 sm:px-6 lg:px-8 login-container">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        {/* Added logo */}
        <div className="flex justify-center">
          <img src="/images/escape1.svg" alt="ESCAPE Logo" className="h-20 w-auto login-logo" />
        </div>
        <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-gray-900 dark:text-white login-title">
          Sign in to ESCAPE
        </h2>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="card px-4 py-8 sm:px-10 login-card">
          {/* Display login button only if not authenticated */}
          {!authenticated && (
             <button
                type="button"
                className={`btn btn-primary w-full relative overflow-hidden group transition-all duration-300 ease-in-out transform hover:scale-105 hover:shadow-lg ${isPulsing ? 'pulse-button' : ''}`}
                onClick={() => {
                  // Add a small delay for the button animation effect
                  setIsPulsing(true);
                  setTimeout(() => {
                    login(); // Trigger Privy modal
                  }, 200);
                }}
                disabled={!ready} // Disable button until Privy is ready
              >
                <span className="absolute inset-0 w-full h-full bg-gradient-to-br from-blue-400 to-purple-600 opacity-0 group-hover:opacity-20 transition-opacity duration-300 ease-in-out"></span>
                <span className="relative z-10 flex items-center justify-center">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"></path>
                  </svg>
                  Sign In / Sign Up
                </span>
              </button>
          )}
           <p className="mt-4 text-center text-sm text-gray-500 dark:text-gray-400">
             Use Wallet, X.com, Farcaster, or Google to sign in.
           </p>
        </div>
      </div>
    </div>
  );
}
