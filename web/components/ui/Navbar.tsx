'use client';

import React, { useState, useRef, useEffect } from 'react';
import clsx from 'clsx';
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline';

interface NavbarProps {
  items: string[];
  initialActive?: number;
  onChange?: (index: number) => void;
  className?: string;
  breakpoint?: number; // Width in pixels at which to switch to hamburger menu
}

const Navbar: React.FC<NavbarProps> = ({
  items,
  initialActive = 0,
  onChange,
  className,
  breakpoint = 640, // Default to sm breakpoint (640px)
}) => {
  const [activeIndex, setActiveIndex] = useState(initialActive);
  const [indicatorStyle, setIndicatorStyle] = useState({});
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const navRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);

  // Update the indicator position when the active index changes
  const updateIndicator = (index: number) => {
    if (!navRef.current || !itemRefs.current[index]) return;

    const currentItem = itemRefs.current[index];
    const navRect = navRef.current.getBoundingClientRect();
    const itemRect = currentItem?.getBoundingClientRect();

    if (itemRect) {
      setIndicatorStyle({
        left: `${itemRect.left - navRect.left}px`,
        width: `${itemRect.width}px`,
      });
    }
  };

  // Check if we should switch to mobile view
  const checkMobileView = () => {
    if (containerRef.current) {
      const containerWidth = containerRef.current.offsetWidth;
      const shouldBeMobile = containerWidth < breakpoint;

      // Always update the mobile state regardless of previous state
      setIsMobile(shouldBeMobile);

      // If transitioning from mobile to desktop, ensure menu is closed
      if (!shouldBeMobile && isMobile) {
        setIsMenuOpen(false);
      }
    }
  };

  // Initialize the indicator position and check mobile view
  useEffect(() => {
    updateIndicator(activeIndex);
    checkMobileView();

    // Add resize listener to update indicator and check mobile view on window resize
    const handleResize = () => {
      updateIndicator(activeIndex);
      checkMobileView();
    };

    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [activeIndex, breakpoint]);

  const handleItemClick = (index: number) => {
    setActiveIndex(index);
    setIsMenuOpen(false); // Close mobile menu when an item is clicked
    if (onChange) {
      onChange(index);
    }
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <div ref={containerRef} className="w-full">
      {/* Mobile Navbar (Hamburger Menu) */}
      {isMobile && (
        <div
          className={clsx(
            'relative rounded-full bg-white shadow dark:bg-[#181818] border border-gray-200 dark:border-gray-700 border-[0.5px]',
            className
          )}
        >
          <div className="flex items-center justify-between p-1.5">
            {/* Show active item text */}
            <span className="px-4 py-2 text-sm font-medium text-gray-900 dark:text-white">
              {items[activeIndex]}
            </span>

            {/* Hamburger button */}
            <button
              className="rounded-full p-2 text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700"
              onClick={toggleMenu}
            >
              {isMenuOpen ? (
                <XMarkIcon className="h-5 w-5" />
              ) : (
                <Bars3Icon className="h-5 w-5" />
              )}
            </button>
          </div>

          {/* Mobile dropdown menu */}
          {isMenuOpen && (
            <div className="absolute left-0 right-0 top-full z-20 mt-1 rounded-lg bg-white shadow-lg dark:bg-[#181818] border border-gray-200 dark:border-gray-700">
              <div className="py-1">
                {items.map((item, index) => (
                  <button
                    key={item}
                    className={clsx(
                      'block w-full px-4 py-2 text-left text-sm font-escape-heading',
                      activeIndex === index
                        ? 'bg-primary-50 text-primary-700 dark:bg-primary-900/20 dark:text-primary-300'
                        : 'text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-700/50'
                    )}
                    onClick={() => handleItemClick(index)}
                  >
                    {item}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Desktop Navbar (Pill with sliding indicator) */}
      {!isMobile && (
        <div
          ref={navRef}
          className={clsx(
            'relative flex items-center justify-between rounded-full bg-white p-1.5 shadow dark:bg-[#181818] border border-gray-200 dark:border-gray-700 border-[0.5px]',
            className
          )}
        >
          {/* Sliding indicator */}
          <div
            className={clsx(
              'absolute left-0 top-1.5 h-[calc(100%-12px)] rounded-full transition-all duration-300 ease-in-out',
              className?.includes('border-primary') ? 'bg-primary-600 dark:bg-primary-500' :
              className?.includes('border-secondary') ? 'bg-secondary-600 dark:bg-secondary-500' :
              className?.includes('border-accent') ? 'bg-accent-600 dark:bg-accent-500' :
              'bg-primary-600 dark:bg-primary-500'
            )}
            style={indicatorStyle}
          />

          {/* Navigation items */}
          {items.map((item, index) => (
            <button
              key={item}
              ref={(el) => (itemRefs.current[index] = el)}
              className={clsx(
                'relative z-10 rounded-full px-5 py-2.5 text-sm font-medium transition-colors whitespace-nowrap mx-0.5 font-escape-heading',
                activeIndex === index
                  ? 'text-white dark:text-white'
                  : 'text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200'
              )}
              onClick={() => handleItemClick(index)}
            >
              {item}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default Navbar;
