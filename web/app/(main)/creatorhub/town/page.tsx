'use client';

import React from 'react';

export default function TownPage() {
  return (
    <div className="flex flex-col items-center justify-center mt-12">
      <h1 className="text-3xl font-normal mb-4" style={{ fontFamily: 'League Spartan, sans-serif' }}>
        Town Page
      </h1>
      <p className="text-center text-gray-400 max-w-lg mb-8">
        This is the town page of your CreatorHub where you can manage your community.
      </p>
      
      {/* Sample town card */}
      <div className="bg-gray-900 bg-opacity-50 p-6 rounded-xl border border-gray-800 w-full max-w-lg">
        <h2 className="text-xl font-normal mb-3" style={{ fontFamily: 'League Spartan, sans-serif' }}>
          Town Management
        </h2>
        <p className="text-gray-400 mb-4">
          Manage your town settings, members, and engagement. Build a thriving community around your content.
        </p>
        <div className="flex space-x-4">
          <button className="px-4 py-2 bg-[#c20023] bg-opacity-50 rounded-full text-white hover:bg-opacity-70 transition-all">
            Invite Members
          </button>
          <button className="px-4 py-2 bg-transparent border border-gray-600 rounded-full text-white hover:border-white transition-all">
            Town Settings
          </button>
        </div>
      </div>
    </div>
  );
}
