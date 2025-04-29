'use client';

import React from 'react';

export default function MintPage() {
  return (
    <div className="flex flex-col items-center justify-center mt-12">
      <h1 className="text-3xl font-normal mb-4">
        Mint Page
      </h1>
      <p className="text-center text-gray-400 max-w-lg mb-8">
        This is the mint page of your CreatorHub where you can create and manage NFTs.
      </p>

      {/* Mint section */}
      <div className="bg-gray-900 bg-opacity-50 p-6 rounded-xl border border-gray-800 w-full max-w-lg mb-8">
        <h2 className="text-xl font-normal mb-3" style={{ fontFamily: 'League Spartan, sans-serif' }}>
          Create New NFT Collection
        </h2>
        <p className="text-gray-400 mb-6">
          Mint new NFTs for your community. Create exclusive content and experiences for your supporters.
        </p>

        {/* Simple form */}
        <div className="space-y-4">
          <div>
            <label className="block text-gray-300 mb-2">Collection Name</label>
            <input
              type="text"
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white"
              placeholder="Enter collection name"
            />
          </div>

          <div>
            <label className="block text-gray-300 mb-2">Description</label>
            <textarea
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white"
              placeholder="Enter collection description"
              rows={3}
            />
          </div>

          <button className="w-full px-4 py-2 bg-[#c20023] bg-opacity-50 rounded-full text-white hover:bg-opacity-70 transition-all">
            Create Collection
          </button>
        </div>
      </div>

      {/* Existing collections */}
      <div className="w-full max-w-lg">
        <h2 className="text-xl font-normal mb-3" style={{ fontFamily: 'League Spartan, sans-serif' }}>
          Your Collections
        </h2>
        <div className="bg-gray-900 bg-opacity-50 p-4 rounded-xl border border-gray-800">
          <p className="text-gray-400 text-center py-8">
            You haven't created any collections yet.
          </p>
        </div>
      </div>
    </div>
  );
}
