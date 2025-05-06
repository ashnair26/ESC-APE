'use client';

import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';

// Dynamically import Lucide icons with SSR disabled
const LucideIcons = dynamic(() => import('./LucideIconsClient'), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-40">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-brand"></div>
    </div>
  ),
});

interface LucideIconsDemoProps {
  className?: string;
}

export function LucideIconsDemo({ className }: LucideIconsDemoProps) {
  return (
    <div className={className}>
      <h2 className="text-xl font-bold mb-4">Lucide Icons</h2>
      <LucideIcons />
    </div>
  );
}
