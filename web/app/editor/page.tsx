'use client';

import React from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';

// Dynamically import the Editor component with no SSR to avoid hydration issues
const PuckEditor = dynamic(() => import('./puck/Editor'), { ssr: false });

export default function EditorPage() {
  return (
    <div className="min-h-screen bg-[#010101] text-white flex flex-col">
      {/* Header with back button */}
      <header className="p-4 border-b border-gray-800 flex items-center">
        <Link
          href="/creatorhub/landing"
          className="px-4 py-2 border border-white/20 rounded-md hover:bg-white/10 transition-colors mr-auto"
        >
          Back to Landing
        </Link>
        <h1 className="text-xl font-medium absolute left-1/2 transform -translate-x-1/2">
          Landing Page Editor
        </h1>
      </header>

      {/* Puck Editor */}
      <main className="flex-1">
        <PuckEditor />
      </main>
    </div>
  );
}
