'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { usePrivy } from '@privy-io/react-auth';
import LoadingSpinner from '@/components/ui/LoadingSpinner'; // Assuming this component exists

export default function LoginPage() {
  const router = useRouter();
  const { ready, authenticated, login } = usePrivy();

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
    <div className="flex min-h-screen flex-col items-center justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        {/* You can add a logo or title here if desired */}
        <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
          Sign in to ESCAPE
        </h2>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="card px-4 py-8 sm:px-10">
          {/* Display login button only if not authenticated */}
          {!authenticated && (
             <button
                type="button"
                className="btn btn-primary w-full"
                onClick={login} // Trigger Privy modal on click
                disabled={!ready} // Disable button until Privy is ready
              >
                Sign In / Sign Up
              </button>
          )}
           <p className="mt-4 text-center text-sm text-gray-500 dark:text-gray-400">
             Use Wallet, X.com, or Farcaster to sign in.
           </p>
        </div>
      </div>
    </div>
  );
}
