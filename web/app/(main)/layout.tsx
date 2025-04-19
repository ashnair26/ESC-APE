import React from 'react';
import { PrivyLayout } from '@/components/layout/PrivyLayout';

// This layout wraps all non-admin pages with the PrivyProvider
export default function MainAppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <PrivyLayout>{children}</PrivyLayout>;
}
