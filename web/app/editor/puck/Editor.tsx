'use client';

import React, { useState, useEffect, Component, ErrorInfo, ReactNode } from 'react';
import { Puck } from '@measured/puck';
import '@measured/puck/puck.css';
import '../puck-editor.css'; // Import our custom CSS for Puck editor
import '../puck-force-dark.css'; // Import force dark mode CSS
import config from './puck.config.tsx';
import { ClientOnly } from '@/components/ClientOnly';
import { useDebugSortableItems } from '@/hooks/useDebugSortableItems';
// Generate a random ID without using uuid package
function generateRandomId() {
  return Math.random().toString(36).substring(2, 15) +
         Math.random().toString(36).substring(2, 15);
}

// Simple ErrorBoundary component to catch and handle errors
class ErrorBoundary extends Component<
  { children: ReactNode; fallback: ReactNode },
  { hasError: boolean }
> {
  constructor(props: { children: ReactNode; fallback: ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(_: Error) {
    // Update state so the next render will show the fallback UI
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log the error to console
    console.error('Puck Editor error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      // Render fallback UI
      return this.props.fallback;
    }

    return this.props.children;
  }
}

// Initial data structure for Puck with a simple starter template
const defaultData = {
  content: [
    {
      id: 'hero-1', // Adding explicit ID
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
      id: 'hero-1', // Adding explicit ID
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
      id: 'ip-showcase-1', // Adding explicit ID
      type: 'IPShowcaseBlock',
      props: {
        title: 'Showcase Your IP',
        description: 'Display your intellectual property and creative work to the world.',
        images: [],
        learnMoreLink: '#',
      },
    },
    {
      id: 'community-hub-1', // Adding explicit ID
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
      id: 'nft-display-1', // Adding explicit ID
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
      id: 'cta-1', // Adding explicit ID
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

// Safe empty data structure with minimal required fields
const safeEmptyData = {
  content: [],
  root: { props: { title: 'ESC/APE Landing Page' } },
  zones: {},
};

// Generate a stable ID for blocks
function generateStableId(prefix = 'block') {
  return `${prefix}-${generateRandomId()}`;
}

// Cache for storing stable IDs to prevent regeneration
const idCache = new Map();

// Strong defensive function to ensure blocks are always properly formatted with stable IDs
function safeBlocks(blocks) {
  if (!Array.isArray(blocks)) {
    console.warn('Blocks is not an array, returning empty array');
    return [];
  }

  return blocks.map((block, index) => {
    // Ensure block is an object
    if (!block || typeof block !== 'object') {
      console.warn(`Block at index ${index} is not an object, creating safe block`);
      const newId = generateStableId('safe-block');
      return {
        id: newId,
        type: 'unknown',
        props: {},
      };
    }

    // For existing blocks with valid IDs, preserve them
    if (typeof block.id === 'string' && block.id.trim() !== '') {
      // Ensure type is a string
      const type = typeof block.type === 'string' && block.type.trim() !== ''
        ? block.type
        : 'unknown';

      // Ensure props is an object
      const props = block.props && typeof block.props === 'object'
        ? block.props
        : {};

      return {
        id: block.id,
        type,
        props,
      };
    }

    // For blocks without IDs, use cached ID or generate a new stable one
    const cacheKey = `${index}-${block.type || 'unknown'}`;
    if (!idCache.has(cacheKey)) {
      const prefix = typeof block.type === 'string' && block.type.trim() !== ''
        ? block.type.toLowerCase()
        : 'block';
      idCache.set(cacheKey, generateStableId(prefix));
    }

    // Get the stable ID from cache
    const stableId = idCache.get(cacheKey);

    // Ensure type is a string
    const type = typeof block.type === 'string' && block.type.trim() !== ''
      ? block.type
      : 'unknown';

    // Ensure props is an object
    const props = block.props && typeof block.props === 'object'
      ? block.props
      : {};

    return {
      id: stableId,
      type,
      props,
    };
  });
}

// Helper function to validate and ensure all blocks have IDs
const validateBlockIds = (inputData) => {
  if (!inputData || !inputData.content) {
    console.warn('Invalid data structure, using safe empty data');
    return safeEmptyData;
  }

  // Apply strong validation to content blocks
  const validatedContent = safeBlocks(inputData.content);

  // Return validated data
  return {
    root: inputData.root || { props: { title: 'ESC/APE Landing Page' } },
    content: validatedContent,
    zones: inputData.zones || {},
  };
};

// Create a server-safe initial state
// This ensures that even during server-side rendering, we have valid data
const getInitialSafeState = () => {
  // During server-side rendering or initial client render,
  // ensure we have a valid empty state with proper structure
  return {
    content: [],
    root: { props: { title: 'ESC/APE Landing Page' } },
    zones: {},
  };
};

export function Editor() {
  // Initialize with safe empty data to ensure proper loading
  // Use the function form of useState to ensure this runs only once
  const [data, setData] = useState(() => getInitialSafeState());
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);

  // Debug hook at the top level of the component, outside of any conditional logic
  useDebugSortableItems(data?.content || []);

  // Add dark mode class to HTML element
  useEffect(() => {
    document.documentElement.classList.add('dark-mode-enabled');

    // Function to expand all component categories
    const expandAllCategories = () => {
      // Find all collapsed sections and expand them
      const collapsedSections = document.querySelectorAll('[aria-expanded="false"]');
      collapsedSections.forEach(section => {
        section.setAttribute('aria-expanded', 'true');
      });
    };

    // Run once after a short delay to ensure the UI is rendered
    const timeout = setTimeout(expandAllCategories, 500);

    return () => {
      document.documentElement.classList.remove('dark-mode-enabled');
      clearTimeout(timeout);
    };
  }, []);

  // Diagnostic validation to check for invalid blocks
  useEffect(() => {
    if (data && Array.isArray(data.content)) {
      // Check for blocks with invalid IDs
      const invalidBlocks = data.content.filter(
        block => typeof block.id !== 'string' || block.id.trim() === ''
      );

      if (invalidBlocks.length > 0) {
        console.error('Invalid blocks detected with missing or invalid IDs:', invalidBlocks);
      }

      // Check for duplicate IDs
      const ids = data.content.map(block => block.id);
      const uniqueIds = new Set(ids);

      if (ids.length !== uniqueIds.size) {
        console.error('Duplicate block IDs detected. This will cause drag operations to fail.');

        // Find the duplicates
        const duplicates = ids.filter((id, index) => ids.indexOf(id) !== index);
        console.error('Duplicate IDs:', [...new Set(duplicates)]);
      }

      // Log the block structure for debugging
      console.log('Current blocks structure:', data.content);
    }
  }, [data]);

  // Load data from localStorage on component mount
  useEffect(() => {
    try {
      // Try to get saved data from localStorage
      const savedData = localStorage.getItem('landingPageData');

      if (savedData) {
        try {
          // Parse the saved data
          const parsedData = JSON.parse(savedData);
          // Validate and ensure all blocks have IDs
          const validatedData = validateBlockIds(parsedData);
          setData(validatedData);
        } catch (error) {
          console.error('Error parsing saved data:', error);
          // Use validated default data if parsing fails
          setData(validateBlockIds(defaultData));
        }
      } else {
        // Use validated default data if nothing is saved
        setData(validateBlockIds(defaultData));
      }
    } catch (error) {
      console.error('Critical error loading data:', error);
      setIsError(true);
      // Use safe empty data in case of critical error
      setData(safeEmptyData);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Save function to store the data
  const handlePublish = async (publishData: any) => {
    try {
      console.log('Publishing data:', publishData);

      // Validate data before saving
      const validatedData = validateBlockIds(publishData);

      // Save to localStorage
      localStorage.setItem('landingPageData', JSON.stringify(validatedData));

      // Show success message
      alert('Changes saved successfully!');
    } catch (error) {
      console.error('Error saving data:', error);
      alert('Error saving changes. Please try again.');
    }
  };

  // Safe onChange handler to ensure IDs are always present and stable
  const handleChange = (newData: any) => {
    try {
      if (!newData || !newData.content) {
        console.error('Invalid data structure in onChange handler');
        return;
      }

      // Map of existing IDs to preserve them
      const existingBlockIds = new Map();

      // Build a map of existing block IDs
      if (data && Array.isArray(data.content)) {
        data.content.forEach(block => {
          if (typeof block.id === 'string' && block.id.trim() !== '') {
            existingBlockIds.set(block.id, true);
          }
        });
      }

      // Process new content to preserve existing IDs and ensure new blocks have stable IDs
      const processedContent = newData.content.map((block, index) => {
        // If block already has a valid ID and it exists in our current data, preserve it
        if (typeof block.id === 'string' && block.id.trim() !== '' && existingBlockIds.has(block.id)) {
          return block;
        }

        // For new blocks or blocks with invalid IDs, generate a stable ID
        const prefix = typeof block.type === 'string' && block.type.trim() !== ''
          ? block.type.toLowerCase()
          : 'block';

        const newId = generateStableId(prefix);

        return {
          ...block,
          id: newId
        };
      });

      // Create the new data with processed content
      const processedData = {
        ...newData,
        content: processedContent
      };

      // Validate the processed data
      const validatedData = validateBlockIds(processedData);

      // Update the state with validated data
      setData(validatedData);
    } catch (error) {
      console.error('Error in onChange handler:', error);
      // Keep existing data if there's an error
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen text-white">
        <div className="text-center">
          <div className="mb-4">Loading editor...</div>
          <div className="animate-pulse h-2 w-24 bg-white/20 rounded mx-auto"></div>
        </div>
      </div>
    );
  }

  // Error state
  if (isError) {
    return (
      <div className="flex items-center justify-center h-screen text-white">
        <div className="text-center">
          <div className="text-red-500 mb-4">Error loading editor</div>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-[#c20023] text-white rounded"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // Render the editor with safety measures
  return (
    <div className="puck-editor-container">
      <div className="flex justify-between items-center p-4 bg-[#010101] border-b border-white/10">
        <h1 className="text-white text-lg">ESC/APE Page Editor</h1>
        <div>
          <button
            onClick={() => {
              // Reset to default data
              const validatedDefault = validateBlockIds(defaultData);
              setData(validatedDefault);
              localStorage.removeItem('landingPageData');
            }}
            className="px-3 py-1 mr-2 bg-transparent border border-white/20 text-white rounded text-sm"
          >
            Reset
          </button>
        </div>
      </div>

      <ErrorBoundary fallback={
        <div className="flex items-center justify-center h-screen text-white">
          <div className="text-center">
            <div className="text-red-500 mb-4">Something went wrong with the editor</div>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-[#c20023] text-white rounded"
            >
              Reload
            </button>
          </div>
        </div>
      }>
        {/* Wrap Puck editor in ClientOnly to prevent hydration issues */}
        <ClientOnly>
          {/* Apply final safety check right before rendering Puck */}
          {(() => {
            // Create a final safe version of the data with guaranteed valid structure
            const safeContent = safeBlocks(data.content || []);

            // Ensure no duplicate IDs in the content
            const contentIds = safeContent.map(block => block.id);
            const uniqueIds = [...new Set(contentIds)];

            // If there are duplicates, make them unique
            let finalContent = safeContent;
            if (contentIds.length !== uniqueIds.length) {
              console.warn('Fixing duplicate IDs before rendering');

              // Create a map to track seen IDs
              const seenIds = new Map();

              // Make duplicate IDs unique
              finalContent = safeContent.map((block) => {
                if (seenIds.has(block.id)) {
                  // This is a duplicate, create a new unique ID
                  const newId = generateStableId(block.type.toLowerCase());
                  console.warn(`Replacing duplicate ID ${block.id} with ${newId}`);
                  return { ...block, id: newId };
                }

                // Mark this ID as seen
                seenIds.set(block.id, true);
                return block;
              });
            }

            const finalSafeData = {
              root: data.root || { props: { title: 'ESC/APE Landing Page' } },
              content: finalContent,
              zones: data.zones || {},
            };

            // Log validation for debugging
            console.log('Rendering Puck with validated data structure');
            console.log('Block IDs for SortableContext:', finalContent.map(block => block.id));

            return (
              <Puck
                config={config}
                data={finalSafeData}
                onPublish={handlePublish}
                onChange={handleChange}
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
            );
          })()}
        </ClientOnly>
      </ErrorBoundary>
    </div>
  );
}

export default Editor;
