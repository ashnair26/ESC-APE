'use client';

import React from 'react';
import { AuthProvider } from '@/contexts/AuthContext';

// This layout is specifically for admin routes and does NOT use PrivyProvider
export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    // We're using AuthProvider here to ensure admin authentication works
    // but NOT using PrivyProvider to avoid Privy authentication
    <AuthProvider>
      {children}
    </AuthProvider>
  );
}
