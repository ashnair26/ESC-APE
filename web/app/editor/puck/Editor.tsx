'use client';

import React, { useState, useEffect } from 'react';
import { Puck } from '@measured/puck';
import '@measured/puck/puck.css';
import '../puck-editor.css'; // Import our custom CSS for Puck editor
import config from './puck.config.tsx';

// Initial data structure for Puck with a simple starter template
const defaultData = {
  content: [
    {
      type: 'HeroBlock',
      props: {
        title: 'Welcome to Your ESC/APE World',
        subtitle: 'Create and customize your landing page with our easy-to-use editor.',
        ctaText: 'Explore More',
        ctaLink: '#',
        backgroundImage: '',
      },
    },
  ],
  root: { props: { title: 'ESC/APE Landing Page' } },
  zones: {},
};

// Example data with all block types
const exampleData = {
  content: [
    {
      type: 'HeroBlock',
      props: {
        title: 'Welcome to Your ESC/APE World',
        subtitle: 'Create and customize your landing page with our easy-to-use editor.',
        ctaText: 'Explore More',
        ctaLink: '#',
        backgroundImage: '',
      },
    },
    {
      type: 'IPShowcaseBlock',
      props: {
        title: 'Showcase Your IP',
        description: 'Display your intellectual property and creative work to the world.',
        images: [],
        learnMoreLink: '#',
      },
    },
    {
      type: 'CommunityHubBlock',
      props: {
        title: 'Join Our Community',
        memberCount: 1000,
        testimonials: [
          { name: 'Member 1', quote: 'This community is amazing!', avatar: '' },
          { name: 'Member 2', quote: 'Best decision I ever made!', avatar: '' },
        ],
        socialLinks: [
          { platform: 'Twitter', url: '#' },
          { platform: 'Discord', url: '#' },
          { platform: 'Instagram', url: '#' },
        ],
      },
    },
    {
      type: 'NFTDisplayBlock',
      props: {
        title: 'Our NFT Collection',
        description: 'Explore our exclusive digital collectibles',
        nfts: [
          { name: 'NFT 1', image: '', link: '#' },
          { name: 'NFT 2', image: '', link: '#' },
          { name: 'NFT 3', image: '', link: '#' },
          { name: 'NFT 4', image: '', link: '#' },
        ],
        collectionLink: '#',
      },
    },
    {
      type: 'CTABlock',
      props: {
        headline: 'Ready to Join?',
        text: 'Become part of our community today and unlock exclusive benefits.',
        buttonText: 'Join Now',
        buttonLink: '#',
        hasEmailCapture: false,
        emailPlaceholder: 'Enter your email',
      },
    },
  ],
  root: { props: { title: 'ESC/APE Landing Page' } },
  zones: {},
};

export function Editor() {
  // Initialize with empty data to ensure proper loading
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load data from localStorage on component mount
  useEffect(() => {
    // Try to get saved data from localStorage
    const savedData = localStorage.getItem('landingPageData');

    if (savedData) {
      try {
        // Parse the saved data
        const parsedData = JSON.parse(savedData);
        setData(parsedData);
      } catch (error) {
        console.error('Error parsing saved data:', error);
        setData(defaultData);
      }
    } else {
      // Use default data if nothing is saved
      setData(defaultData);
    }

    setIsLoading(false);
  }, []);

  // Save function to store the data
  const handlePublish = async (publishData: any) => {
    console.log('Publishing data:', publishData);

    // Save to localStorage
    localStorage.setItem('landingPageData', JSON.stringify(publishData));

    // Show success message
    alert('Changes saved successfully!');
  };



  if (isLoading) {
    return <div className="flex items-center justify-center h-screen text-white">Loading editor...</div>;
  }

  return (
    <div className="puck-editor-container">
      <Puck
        config={config}
        data={data}
        onPublish={handlePublish}
        onChange={setData}
      />
    </div>
  );
}

export default Editor;
