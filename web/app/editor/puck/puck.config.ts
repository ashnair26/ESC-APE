'use client';

import React from 'react';
import { Config } from '@measured/puck';
import HeroBlock from './blocks/HeroBlock';

// Define the component types
type Components = {
  HeroBlock: {
    title?: string;
    subtitle?: string;
    backgroundImage?: string;
    ctaText?: string;
    ctaLink?: string;
    alignment?: 'left' | 'center' | 'right';
  };
};

// Create the Puck configuration
const config: Config<Components> = {
  components: {
    HeroBlock: {
      fields: {
        title: {
          type: 'text',
          label: 'Title',
          defaultValue: 'Welcome to Your World',
        },
        subtitle: {
          type: 'text',
          label: 'Subtitle',
          defaultValue: 'This is the starting point of your lore.',
        },
        backgroundImage: {
          type: 'image',
          label: 'Background Image',
        },
        ctaText: {
          type: 'text',
          label: 'Button Text',
          defaultValue: 'Get Started',
        },
        ctaLink: {
          type: 'text',
          label: 'Button Link',
          defaultValue: '#',
        },
        alignment: {
          type: 'select',
          label: 'Alignment',
          options: [
            { label: 'Left', value: 'left' },
            { label: 'Center', value: 'center' },
            { label: 'Right', value: 'right' },
          ],
          defaultValue: 'center',
        },
      },
      render: HeroBlock,
    },
  },
};

export default config;
