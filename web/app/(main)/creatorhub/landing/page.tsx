'use client';

import React from 'react';
import dynamic from 'next/dynamic';

// Dynamically import the Viewer component with no SSR to avoid hydration issues
const PuckViewer = dynamic(() => import('../../../editor/puck/Viewer'), { ssr: false });

export default function LandingPage() {
  return (
    <div className="landing-page-container">
      {/* Render the Puck Viewer component to display the landing page content */}
      <PuckViewer />
    </div>
  );
}
