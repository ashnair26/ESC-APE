'use client';

import React from 'react';

export default function AnalyticsPage() {
  return (
    <div className="flex flex-col items-center justify-center mt-12">
      <h1 className="text-3xl font-normal mb-4" style={{ fontFamily: 'League Spartan, sans-serif' }}>
        Analytics Page
      </h1>
      <p className="text-center text-gray-400 max-w-lg mb-8">
        This is the analytics page of your CreatorHub where you can track performance metrics.
      </p>
      
      {/* Sample analytics cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-4xl">
        <div className="bg-gray-900 bg-opacity-50 p-6 rounded-xl border border-gray-800">
          <h2 className="text-xl font-normal mb-3" style={{ fontFamily: 'League Spartan, sans-serif' }}>
            Audience Growth
          </h2>
          <div className="h-40 bg-gray-800 rounded-lg flex items-center justify-center">
            <p className="text-gray-400">Growth chart placeholder</p>
          </div>
          <p className="text-gray-400 mt-4">
            Track your audience growth and engagement metrics over time.
          </p>
        </div>
        
        <div className="bg-gray-900 bg-opacity-50 p-6 rounded-xl border border-gray-800">
          <h2 className="text-xl font-normal mb-3" style={{ fontFamily: 'League Spartan, sans-serif' }}>
            Content Performance
          </h2>
          <div className="h-40 bg-gray-800 rounded-lg flex items-center justify-center">
            <p className="text-gray-400">Performance chart placeholder</p>
          </div>
          <p className="text-gray-400 mt-4">
            Analyze which content performs best with your audience.
          </p>
        </div>
      </div>
    </div>
  );
}
