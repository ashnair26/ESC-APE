'use client';

import React from 'react';
import { PrivyLayout } from '@/components/layout/PrivyLayout';
import { AuthProvider } from '@/contexts/AuthContext';

// This layout wraps all non-admin pages with the PrivyProvider and AuthProvider
export default function MainAppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthProvider>
      <PrivyLayout>{children}</PrivyLayout>
    </AuthProvider>
  );
}
