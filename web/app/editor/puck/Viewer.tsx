'use client';

import React, { useState, useEffect } from 'react';
import { Render } from '@measured/puck';
import config from './puck.config.tsx';

interface ViewerProps {
  data?: any;
}

export function Viewer({ data }: ViewerProps) {
  const [renderData, setRenderData] = useState<any>(data || null);
  const [isLoading, setIsLoading] = useState(!data);

  // Load data from localStorage if no data is provided
  useEffect(() => {
    if (!data && typeof window !== 'undefined') {
      try {
        const savedData = localStorage.getItem('landingPageData');
        if (savedData) {
          setRenderData(JSON.parse(savedData));
        }
      } catch (error) {
        console.error('Error loading landing page data:', error);
      } finally {
        setIsLoading(false);
      }
    }
  }, [data]);

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-pulse text-gray-400">Loading landing page...</div>
      </div>
    );
  }

  // If there's no data to render, show a placeholder with instructions
  if (!renderData) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] bg-gray-100 text-gray-700 p-8">
        <h2 className="text-2xl font-bold mb-4">No Landing Page Content Yet</h2>
        <p className="text-center max-w-md mb-6">
          Your landing page hasn't been created yet. Click the CUSTOMISE button in the top navigation to start building your page.
        </p>
        <div className="bg-gray-200 p-4 rounded-lg max-w-md text-sm">
          <p className="font-medium mb-2">How to create your landing page:</p>
          <ol className="list-decimal pl-5 space-y-2">
            <li>Click the <strong>CUSTOMISE</strong> button in the top navigation</li>
            <li>Drag blocks from the left panel to build your page</li>
            <li>Edit the content of each block by clicking on it</li>
            <li>Click <strong>Publish</strong> to save your changes</li>
            <li>Return to this page to see your published landing page</li>
          </ol>
        </div>
      </div>
    );
  }

  // Render the landing page with the provided data
  return <Render config={config} data={renderData} />;
}

export default Viewer;
