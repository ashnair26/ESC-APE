'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { usePrivy } from '@privy-io/react-auth';
import LoadingSpinner from '@/components/ui/LoadingSpinner'; // Assuming this component exists

export default function AuthCheckPage() {
  const router = useRouter();
  const { ready, authenticated, getAccessToken } = usePrivy();
  const [status, setStatus] = useState('checking'); // 'checking', 'redirecting', 'error'
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleAuthCheck = async () => {
      if (!ready) return; // Wait until Privy is ready

      if (!authenticated) {
        // If user somehow lands here without being authenticated, send them to login
        console.warn('[Auth Check Page] User not authenticated, redirecting to login.');
        router.replace('/login');
        return;
      }

      setStatus('checking');
      setError(null);

      try {
        // 1. Get Privy access token
        const accessToken = await getAccessToken();
        if (!accessToken) {
          throw new Error('Could not retrieve Privy access token.');
        }

        // 2. Send token to backend API for verification and routing logic
        const response = await fetch('/api/auth-check', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ token: accessToken }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Authentication check failed.');
        }

        // 3. Redirect based on backend response
        if (data.redirect) {
          console.log(`[Auth Check Page] Redirecting to: ${data.redirect}`);
          setStatus('redirecting');
          router.replace(data.redirect); // Use replace to avoid adding auth-check to history
        } else {
          // Fallback redirect if backend doesn't specify one
          console.warn('[Auth Check Page] No redirect path received from backend, defaulting to dashboard.');
          setStatus('redirecting');
          router.replace('/dashboard');
        }

      } catch (err: any) {
        console.error('[Auth Check Page] Error:', err);
        setError(err.message || 'An unexpected error occurred during authentication check.');
        setStatus('error');
        // Optional: Redirect to login or show error message
        // router.replace('/login?error=auth_check_failed');
      }
    };

    // Only run check once when component mounts and privy is ready & authenticated
    if (ready && authenticated) {
       handleAuthCheck();
    }

  }, [ready, authenticated, getAccessToken, router]);

  // Display loading or error state
  return (
    <div className="flex min-h-screen items-center justify-center">
      {status === 'error' ? (
        <div className="text-center text-red-600">
          <p>Authentication Error:</p>
          <p>{error}</p>
          {/* Optionally add a button to retry or go to login */}
        </div>
      ) : (
        <>
          <LoadingSpinner size="lg" />
          <span className="ml-4 text-lg">Verifying authentication...</span>
        </>
      )}
    </div>
  );
}
