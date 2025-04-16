'use client';

import React, { useState, useRef, useEffect } from 'react';
import clsx from 'clsx';

interface NavbarProps {
  items: string[];
  initialActive?: number;
  onChange?: (index: number) => void;
  className?: string;
}

const Navbar: React.FC<NavbarProps> = ({
  items,
  initialActive = 0,
  onChange,
  className,
}) => {
  const [activeIndex, setActiveIndex] = useState(initialActive);
  const [indicatorStyle, setIndicatorStyle] = useState({});
  const navRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<(HTMLButtonElement | null)[]>([]);

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

  // Initialize the indicator position
  useEffect(() => {
    updateIndicator(activeIndex);
    // Add resize listener to update indicator on window resize
    window.addEventListener('resize', () => updateIndicator(activeIndex));
    return () => {
      window.removeEventListener('resize', () => updateIndicator(activeIndex));
    };
  }, [activeIndex]);

  const handleItemClick = (index: number) => {
    setActiveIndex(index);
    if (onChange) {
      onChange(index);
    }
  };

  return (
    <div
      ref={navRef}
      className={clsx(
        'relative flex items-center justify-between rounded-full bg-white p-1.5 shadow dark:bg-gray-800 border border-gray-200 dark:border-gray-700 overflow-x-auto',
        className
      )}
      style={{ borderWidth: '0.5px' }}
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
            'relative z-10 rounded-full px-5 py-2.5 text-sm font-medium transition-colors whitespace-nowrap mx-0.5',
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
  );
};

export default Navbar;
