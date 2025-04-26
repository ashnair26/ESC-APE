'use client';

import React from 'react';

export default function LandingPage() {
  return (
    <div className="flex flex-col items-center justify-center mt-12">
      <h1 className="text-3xl font-normal mb-4" style={{ fontFamily: 'League Spartan, sans-serif' }}>
        Landing Page
      </h1>
      <p className="text-center text-gray-400 max-w-lg mb-8">
        This is the landing page of your CreatorHub.
      </p>
    </div>
  );
}
