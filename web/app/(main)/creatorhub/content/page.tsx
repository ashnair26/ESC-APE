'use client';

import React from 'react';

export default function ContentPage() {
  return (
    <div className="flex flex-col items-center justify-center mt-12">
      <h1 className="text-3xl font-normal mb-4" style={{ fontFamily: 'League Spartan, sans-serif' }}>
        Content Page
      </h1>
      <p className="text-center text-gray-400 max-w-lg mb-8">
        This is the content page of your CreatorHub where you can manage your content.
      </p>
      
      {/* Content management section */}
      <div className="w-full max-w-4xl">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-normal" style={{ fontFamily: 'League Spartan, sans-serif' }}>
            Your Content
          </h2>
          <button className="px-4 py-2 bg-[#c20023] bg-opacity-50 rounded-full text-white hover:bg-opacity-70 transition-all">
            Create New Content
          </button>
        </div>
        
        {/* Content list */}
        <div className="space-y-4">
          {/* Sample content items */}
          {[1, 2, 3].map((item) => (
            <div key={item} className="bg-gray-900 bg-opacity-50 p-4 rounded-xl border border-gray-800 flex justify-between items-center">
              <div>
                <h3 className="text-white font-normal" style={{ fontFamily: 'League Spartan, sans-serif' }}>
                  Sample Content {item}
                </h3>
                <p className="text-gray-400 text-sm">
                  Last updated: {new Date().toLocaleDateString()}
                </p>
              </div>
              <div className="flex space-x-2">
                <button className="px-3 py-1 bg-transparent border border-gray-600 rounded-full text-sm text-white hover:border-white transition-all">
                  Edit
                </button>
                <button className="px-3 py-1 bg-transparent border border-gray-600 rounded-full text-sm text-white hover:border-white transition-all">
                  Preview
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
