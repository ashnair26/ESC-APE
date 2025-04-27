'use client';

import React from 'react';
import { Inter } from 'next/font/google';

// Use the Inter font as a fallback
const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

export default function EditorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className={`${inter.variable} min-h-screen bg-[#010101] text-white`}>
      {children}
    </div>
  );
}
