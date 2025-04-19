'use client';

import React from 'react';
import { PrivyProvider } from '@privy-io/react-auth';
import type { PrivyClientConfig } from '@privy-io/react-auth';

// Re-define Privy config here or import from a shared config file if preferred
const privyConfig: PrivyClientConfig = {
  loginMethods: ['wallet', 'twitter', 'farcaster'],
  appearance: {
    theme: 'light', // Explicitly use 'light' or 'dark'
    accentColor: '#676FFF', // Example accent color
    // logo: 'URL_to_your_logo.png', // Optional: Add your logo URL here
  },
  embeddedWallets: {
    createOnLogin: 'users-without-wallets' // Automatically create embedded wallets for users without their own
  },
  // Add any other configuration options here if needed
  // See: https://docs.privy.io/guide/react/configuration/privy-provider
};

export function PrivyLayout({ children }: { children: React.ReactNode }) {
  const privyAppId = process.env.NEXT_PUBLIC_PRIVY_APP_ID;

  if (!privyAppId) {
    console.error("Privy App ID is not configured. Please set NEXT_PUBLIC_PRIVY_APP_ID in your environment variables.");
    // Optionally render an error message or fallback UI
    return <div>Privy configuration error. App ID missing.</div>;
  }

  return (
    <PrivyProvider
      appId={privyAppId}
      config={privyConfig}
      // onSuccess can be used for post-login actions if needed
      // onSuccess={(user) => console.log(`User ${user.id} logged in!`)}
    >
      {children}
    </PrivyProvider>
  );
}
