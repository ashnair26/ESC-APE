'use client';

import React from 'react';
import { AuthProvider } from '@/contexts/AuthContext';
import { ApiProvider } from '@/components/api/ApiProvider';

// This component now only wraps providers intended for the *entire* application.
// PrivyProvider will be added in a separate layout for non-admin routes.
export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <ApiProvider>
        {children}
      </ApiProvider>
    </AuthProvider>
  );
}
