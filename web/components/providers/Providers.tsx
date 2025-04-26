'use client';

import React from 'react';
import { ApiProvider } from '@/components/api/ApiProvider';

// This component now only wraps providers intended for the *entire* application.
// AuthProvider and PrivyProvider will be added in separate layouts for specific routes.
export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ApiProvider>
      {children}
    </ApiProvider>
  );
}
