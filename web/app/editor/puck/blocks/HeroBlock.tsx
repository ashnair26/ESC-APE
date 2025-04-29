'use client';

import React from 'react';

interface HeroBlockProps {
  title?: string;
  subtitle?: string;
  backgroundImage?: string;
  ctaText?: string;
  ctaLink?: string;
  alignment?: 'left' | 'center' | 'right';
}

export const HeroBlock: React.FC<HeroBlockProps> = ({
  title = 'Welcome to Your World',
  subtitle = 'This is the starting point of your lore.',
  backgroundImage,
  ctaText = 'Get Started',
  ctaLink = '#',
  alignment = 'center',
}) => {
  const alignClass = alignment === 'left' ? 'text-left' : alignment === 'right' ? 'text-right' : 'text-center';
  return (
    <section
      className={`py-12 px-6 ${alignClass} bg-black text-white`}
      style={backgroundImage ? { backgroundImage: `url(${backgroundImage})`, backgroundSize: 'cover', backgroundPosition: 'center' } : {}}
    >
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-4">{title}</h1>
        <p className="text-xl mb-8">{subtitle}</p>
        <a
          href={ctaLink}
          className="inline-block px-6 py-3 bg-[#C20023] text-white rounded-md hover:bg-opacity-90 transition-colors"
        >
          {ctaText}
        </a>
      </div>
    </section>
  );
};

export default HeroBlock;
