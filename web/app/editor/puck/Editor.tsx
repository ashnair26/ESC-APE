'use client';

import React, { useState, useEffect } from 'react';
import { Puck } from '@measured/puck';
import '@measured/puck/puck.css';
import '../puck-editor.css'; // Import our custom CSS for Puck editor
import '../puck-force-dark.css'; // Import force dark mode CSS
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

  // Add dark mode class to HTML element and handle component list
  useEffect(() => {
    document.documentElement.classList.add('dark-mode-enabled');

    // Function to expand all component items and remove dropdowns
    const expandAllComponents = () => {
      // Find all component list containers
      const componentLists = document.querySelectorAll('[class*="puck-component-list"]');

      componentLists.forEach(list => {
        // Find all hidden components or collapsed sections
        const hiddenItems = list.querySelectorAll('[aria-hidden="true"], [hidden], [style*="display: none"]');
        const collapsedSections = list.querySelectorAll('[aria-expanded="false"]');

        // Show all hidden items
        hiddenItems.forEach((item: Element) => {
          (item as HTMLElement).style.display = 'block';
          (item as HTMLElement).style.visibility = 'visible';
          (item as HTMLElement).style.height = 'auto';
          (item as HTMLElement).style.opacity = '1';
          item.removeAttribute('aria-hidden');
          item.removeAttribute('hidden');
        });

        // Expand all collapsed sections
        collapsedSections.forEach(section => {
          section.setAttribute('aria-expanded', 'true');
        });

        // Hide dropdown toggles/buttons
        const toggleButtons = list.querySelectorAll('[role="button"], [class*="accordion-button"], [class*="dropdown-toggle"]');
        toggleButtons.forEach((button: Element) => {
          (button as HTMLElement).style.display = 'none';
        });
      });
    };

    // Run initially and set up an interval to keep checking
    expandAllComponents();
    const interval = setInterval(expandAllComponents, 1000);

    return () => {
      document.documentElement.classList.remove('dark-mode-enabled');
      clearInterval(interval);
    };
  }, []);

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
        // Add custom styling for the iframe content
        iframeHead={
          <>
            <style>{`
              @import url('/app/editor/puck-iframe.css');
              body { background-color: #010101 !important; color: white !important; }

              /* Force dark backgrounds for all containers */
              div, header, nav, aside, main, section, footer {
                background-color: #010101 !important;
              }

              /* Force text color */
              *, p, h1, h2, h3, h4, h5, h6, span, label {
                color: white !important;
              }

              /* Buttons */
              button {
                background-color: #333333 !important;
                color: white !important;
                border: 1px solid rgba(255, 255, 255, 0.1) !important;
              }

              /* Scrollbars */
              ::-webkit-scrollbar {
                width: 8px;
                height: 8px;
              }

              ::-webkit-scrollbar-track {
                background: #181818 !important;
              }

              ::-webkit-scrollbar-thumb {
                background: #333333 !important;
                border-radius: 4px;
              }
            `}</style>
            <script>{`
              // Force dark mode on the iframe
              document.documentElement.style.backgroundColor = '#010101';
              document.body.style.backgroundColor = '#010101';
              document.body.style.color = 'white';
            `}</script>
          </>
        }
        // Custom theme configuration
        theme={{
          colors: {
            background: '#010101',
            foreground: '#ffffff',
            border: 'rgba(255, 255, 255, 0.1)',
            primary: '#c20023',
            primaryLight: 'rgba(194, 0, 35, 0.1)',
            primaryContrast: '#ffffff',
            gray1: '#181818',
            gray2: '#222222',
            gray3: '#333333',
            gray4: '#444444',
            gray5: '#666666',
            gray6: '#888888',
            gray7: '#aaaaaa',
            gray8: '#cccccc',
            gray9: '#eeeeee',
            gray10: '#ffffff',
          }
        }}
      />
    </div>
  );
}

export default Editor;
