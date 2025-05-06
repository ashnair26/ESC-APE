'use client';

import React from 'react';
import { ApiProvider } from '@/components/api/ApiProvider';
import { ThemeProvider } from '@/contexts/ThemeContext';

// This component now only wraps providers intended for the *entire* application.
// AuthProvider and PrivyProvider will be added in separate layouts for specific routes.
export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <ApiProvider>
        {children}
      </ApiProvider>
    </ThemeProvider>
  );
}
