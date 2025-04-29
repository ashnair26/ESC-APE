'use client';

import React from 'react';
import { Config } from '@measured/puck';

// Hero Block component
const HeroBlock = ({ title = 'Welcome', subtitle = 'Subtitle', ctaText = 'Click Me', ctaLink = '#', backgroundImage = '' }) => (
  <div
    className="py-16 px-6 text-center bg-black text-white relative"
    style={backgroundImage ? {
      backgroundImage: `url(${backgroundImage})`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      position: 'relative',
    } : {}}
  >
    {/* Overlay for better text readability when there's a background image */}
    {backgroundImage && <div className="absolute inset-0 bg-black bg-opacity-50"></div>}

    <div className="max-w-4xl mx-auto relative z-10">
      <h1 className="text-5xl font-bold mb-4">{title}</h1>
      <p className="text-xl mb-8">{subtitle}</p>
      <a
        href={ctaLink}
        className="inline-block px-6 py-3 bg-[#C20023] text-white rounded-md hover:bg-opacity-90 transition-colors"
      >
        {ctaText}
      </a>
    </div>
  </div>
);

// IP Showcase Block component
const IPShowcaseBlock = ({ title = 'Our IP', description = 'Explore our intellectual property', images = [], learnMoreLink = '#' }) => (
  <div className="py-12 px-6 bg-gray-900 text-white">
    <div className="max-w-6xl mx-auto">
      <h2 className="text-3xl font-bold mb-4 text-center">{title}</h2>
      <p className="text-lg mb-8 text-center max-w-3xl mx-auto">{description}</p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {images.length > 0 ? (
          images.map((image, index) => (
            <div key={index} className="aspect-square bg-gray-800 rounded-lg overflow-hidden">
              {image ? (
                <img src={image} alt={`IP Showcase ${index + 1}`} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-500">
                  <span>Add Image</span>
                </div>
              )}
            </div>
          ))
        ) : (
          // Placeholder images when none are provided
          Array(3).fill(0).map((_, index) => (
            <div key={index} className="aspect-square bg-gray-800 rounded-lg flex items-center justify-center text-gray-500">
              <span>Add Image</span>
            </div>
          ))
        )}
      </div>

      {learnMoreLink && (
        <div className="text-center">
          <a
            href={learnMoreLink}
            className="inline-block px-6 py-2 border border-white text-white rounded-md hover:bg-white hover:bg-opacity-10 transition-colors"
          >
            Learn More
          </a>
        </div>
      )}
    </div>
  </div>
);

// Community Hub Block component
const CommunityHubBlock = ({
  title = 'Join Our Community',
  memberCount = 1000,
  testimonials = [
    { name: 'Member 1', quote: 'This community is amazing!', avatar: '' },
    { name: 'Member 2', quote: 'Best decision I ever made!', avatar: '' },
  ],
  socialLinks = [
    { platform: 'Twitter', url: '#' },
    { platform: 'Discord', url: '#' },
    { platform: 'Instagram', url: '#' },
  ]
}) => (
  <div className="py-12 px-6 bg-black text-white">
    <div className="max-w-6xl mx-auto">
      <h2 className="text-3xl font-bold mb-4 text-center">{title}</h2>

      <div className="flex justify-center items-center mb-8">
        <div className="bg-gray-800 px-6 py-3 rounded-full">
          <span className="font-bold text-[#C20023]">{memberCount.toLocaleString()}</span> members and growing
        </div>
      </div>

      {/* Testimonials */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
        {testimonials.map((testimonial, index) => (
          <div key={index} className="bg-gray-900 p-6 rounded-lg">
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 rounded-full bg-gray-700 overflow-hidden mr-4">
                {testimonial.avatar ? (
                  <img src={testimonial.avatar} alt={testimonial.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-500">
                    <span>👤</span>
                  </div>
                )}
              </div>
              <h3 className="font-bold">{testimonial.name}</h3>
            </div>
            <p className="italic">"{testimonial.quote}"</p>
          </div>
        ))}
      </div>

      {/* Social Links */}
      <div className="flex justify-center space-x-4">
        {socialLinks.map((link, index) => (
          <a
            key={index}
            href={link.url}
            className="px-4 py-2 bg-gray-800 rounded-md hover:bg-gray-700 transition-colors"
            target="_blank"
            rel="noopener noreferrer"
          >
            {link.platform}
          </a>
        ))}
      </div>
    </div>
  </div>
);

// NFT Display Block component
const NFTDisplayBlock = ({
  title = 'Our NFT Collection',
  description = 'Explore our exclusive digital collectibles',
  nfts = [
    { name: 'NFT 1', image: '', link: '#' },
    { name: 'NFT 2', image: '', link: '#' },
    { name: 'NFT 3', image: '', link: '#' },
    { name: 'NFT 4', image: '', link: '#' },
  ],
  collectionLink = '#'
}) => (
  <div className="py-12 px-6 bg-gray-900 text-white">
    <div className="max-w-6xl mx-auto">
      <h2 className="text-3xl font-bold mb-4 text-center">{title}</h2>
      <p className="text-lg mb-8 text-center max-w-3xl mx-auto">{description}</p>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {nfts.map((nft, index) => (
          <a
            key={index}
            href={nft.link}
            className="block bg-gray-800 rounded-lg overflow-hidden transition-transform hover:scale-105"
          >
            <div className="aspect-square">
              {nft.image ? (
                <img src={nft.image} alt={nft.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-500">
                  <span>NFT Image</span>
                </div>
              )}
            </div>
            <div className="p-3">
              <h3 className="font-medium">{nft.name}</h3>
            </div>
          </a>
        ))}
      </div>

      <div className="text-center">
        <a
          href={collectionLink}
          className="inline-block px-6 py-3 bg-[#C20023] text-white rounded-md hover:bg-opacity-90 transition-colors"
        >
          View Collection
        </a>
      </div>
    </div>
  </div>
);

// CTA Block component
const CTABlock = ({
  headline = 'Ready to Join?',
  text = 'Become part of our community today and unlock exclusive benefits.',
  buttonText = 'Join Now',
  buttonLink = '#',
  hasEmailCapture = false,
  emailPlaceholder = 'Enter your email'
}) => (
  <div className="py-16 px-6 bg-black text-white">
    <div className="max-w-4xl mx-auto text-center">
      <h2 className="text-4xl font-bold mb-4">{headline}</h2>
      <p className="text-xl mb-8 max-w-2xl mx-auto">{text}</p>

      {hasEmailCapture ? (
        <div className="flex flex-col sm:flex-row justify-center gap-4 mb-6">
          <input
            type="email"
            placeholder={emailPlaceholder}
            className="px-4 py-3 bg-gray-800 border border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-[#C20023] min-w-[300px]"
          />
          <a
            href={buttonLink}
            className="px-6 py-3 bg-[#C20023] text-white rounded-md hover:bg-opacity-90 transition-colors"
          >
            {buttonText}
          </a>
        </div>
      ) : (
        <a
          href={buttonLink}
          className="inline-block px-8 py-4 bg-[#C20023] text-white rounded-md hover:bg-opacity-90 transition-colors text-lg"
        >
          {buttonText}
        </a>
      )}
    </div>
  </div>
);

// Define the component types
type Components = {
  HeroBlock: {
    title?: string;
    subtitle?: string;
    ctaText?: string;
    ctaLink?: string;
    backgroundImage?: string;
  };
  IPShowcaseBlock: {
    title?: string;
    description?: string;
    images?: string[];
    learnMoreLink?: string;
  };
  CommunityHubBlock: {
    title?: string;
    memberCount?: number;
    testimonials?: {
      name: string;
      quote: string;
      avatar?: string;
    }[];
    socialLinks?: {
      platform: string;
      url: string;
    }[];
  };
  NFTDisplayBlock: {
    title?: string;
    description?: string;
    nfts?: {
      name: string;
      image?: string;
      link?: string;
    }[];
    collectionLink?: string;
  };
  CTABlock: {
    headline?: string;
    text?: string;
    buttonText?: string;
    buttonLink?: string;
    hasEmailCapture?: boolean;
    emailPlaceholder?: string;
  };
};

// Create the Puck configuration
const config: Config<Components> = {
  // Use a single category for all components
  categories: [
    {
      name: 'All Components',
      components: ['HeroBlock', 'IPShowcaseBlock', 'CommunityHubBlock', 'NFTDisplayBlock', 'CTABlock']
    }
  ],

  components: {
    HeroBlock: {
      // Display name in the editor
      displayName: 'Hero Section',
      // Description for the component
      description: 'A prominent banner section with title, subtitle, and call-to-action button.',
      // Fields for the component
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
        backgroundImage: {
          type: 'image',
          label: 'Background Image',
        },
      },
      // Render function for the component
      render: HeroBlock,
    },
    IPShowcaseBlock: {
      displayName: 'IP Showcase',
      description: 'Display your intellectual property with images and description.',
      fields: {
        title: {
          type: 'text',
          label: 'Title',
          defaultValue: 'Our IP',
        },
        description: {
          type: 'textarea',
          label: 'Description',
          defaultValue: 'Explore our intellectual property',
        },
        images: {
          type: 'array',
          label: 'Images',
          itemLabel: 'Image',
          min: 0,
          max: 6,
          defaultValue: [],
          arrayFields: {
            type: 'image',
            label: 'Image URL',
          },
        },
        learnMoreLink: {
          type: 'text',
          label: 'Learn More Link',
          defaultValue: '#',
        },
      },
      render: IPShowcaseBlock,
    },
    CommunityHubBlock: {
      displayName: 'Community Hub',
      description: 'Showcase your community with member count, testimonials, and social links.',
      fields: {
        title: {
          type: 'text',
          label: 'Title',
          defaultValue: 'Join Our Community',
        },
        memberCount: {
          type: 'number',
          label: 'Member Count',
          defaultValue: 1000,
        },
        testimonials: {
          type: 'array',
          label: 'Testimonials',
          itemLabel: 'Testimonial',
          min: 0,
          max: 4,
          defaultValue: [
            { name: 'Member 1', quote: 'This community is amazing!', avatar: '' },
            { name: 'Member 2', quote: 'Best decision I ever made!', avatar: '' },
          ],
          arrayFields: {
            name: {
              type: 'text',
              label: 'Name',
            },
            quote: {
              type: 'textarea',
              label: 'Quote',
            },
            avatar: {
              type: 'image',
              label: 'Avatar',
            },
          },
        },
        socialLinks: {
          type: 'array',
          label: 'Social Links',
          itemLabel: 'Social Link',
          min: 0,
          max: 5,
          defaultValue: [
            { platform: 'Twitter', url: '#' },
            { platform: 'Discord', url: '#' },
            { platform: 'Instagram', url: '#' },
          ],
          arrayFields: {
            platform: {
              type: 'text',
              label: 'Platform',
            },
            url: {
              type: 'text',
              label: 'URL',
            },
          },
        },
      },
      render: CommunityHubBlock,
    },
    NFTDisplayBlock: {
      displayName: 'NFT Collection',
      description: 'Display your NFT collection with images and links.',
      fields: {
        title: {
          type: 'text',
          label: 'Title',
          defaultValue: 'Our NFT Collection',
        },
        description: {
          type: 'textarea',
          label: 'Description',
          defaultValue: 'Explore our exclusive digital collectibles',
        },
        nfts: {
          type: 'array',
          label: 'NFTs',
          itemLabel: 'NFT',
          min: 0,
          max: 8,
          defaultValue: [
            { name: 'NFT 1', image: '', link: '#' },
            { name: 'NFT 2', image: '', link: '#' },
            { name: 'NFT 3', image: '', link: '#' },
            { name: 'NFT 4', image: '', link: '#' },
          ],
          arrayFields: {
            name: {
              type: 'text',
              label: 'Name',
            },
            image: {
              type: 'image',
              label: 'Image',
            },
            link: {
              type: 'text',
              label: 'Link',
            },
          },
        },
        collectionLink: {
          type: 'text',
          label: 'Collection Link',
          defaultValue: '#',
        },
      },
      render: NFTDisplayBlock,
    },
    CTABlock: {
      displayName: 'Call to Action',
      description: 'Add a call-to-action section with button and optional email capture.',
      fields: {
        headline: {
          type: 'text',
          label: 'Headline',
          defaultValue: 'Ready to Join?',
        },
        text: {
          type: 'textarea',
          label: 'Text',
          defaultValue: 'Become part of our community today and unlock exclusive benefits.',
        },
        buttonText: {
          type: 'text',
          label: 'Button Text',
          defaultValue: 'Join Now',
        },
        buttonLink: {
          type: 'text',
          label: 'Button Link',
          defaultValue: '#',
        },
        hasEmailCapture: {
          type: 'boolean',
          label: 'Include Email Capture',
          defaultValue: false,
        },
        emailPlaceholder: {
          type: 'text',
          label: 'Email Placeholder',
          defaultValue: 'Enter your email',
        },
      },
      render: CTABlock,
    },
  },

  // Default root props for the page
  defaultProps: {
    root: {
      title: 'ESC/APE Landing Page',
    },
  },
};

export default config;
