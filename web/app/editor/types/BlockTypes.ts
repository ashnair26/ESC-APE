// Block type definitions for the landing page builder
export interface HeroBlockProps {
  title?: string;
  subtitle?: string;
  backgroundImage?: string;
  ctaText?: string;
  ctaLink?: string;
  alignment?: 'left' | 'center' | 'right';
}

export interface IPShowcaseBlockProps {
  title?: string;
  description?: string;
  images?: string[];
  learnMoreLink?: string;
}

export interface CommunityHubBlockProps {
  title?: string;
  memberCount?: number;
  testimonials?: {
    name: string;
    avatar?: string;
    quote: string;
  }[];
  socialLinks?: {
    platform: string;
    url: string;
  }[];
}

export interface NFTDisplayBlockProps {
  title?: string;
  description?: string;
  nfts?: {
    image: string;
    name: string;
    link?: string;
  }[];
  collectionLink?: string;
}

export interface CTABlockProps {
  headline?: string;
  text?: string;
  buttonText?: string;
  buttonLink?: string;
  hasEmailCapture?: boolean;
  emailPlaceholder?: string;
}

// Union type for all block props
export type BlockProps = 
  | HeroBlockProps
  | IPShowcaseBlockProps
  | CommunityHubBlockProps
  | NFTDisplayBlockProps
  | CTABlockProps;

// Block type enum
export enum BlockType {
  Hero = 'HeroBlock',
  IPShowcase = 'IPShowcaseBlock',
  CommunityHub = 'CommunityHubBlock',
  NFTDisplay = 'NFTDisplayBlock',
  CTA = 'CTABlock',
}

// Block interface
export interface Block {
  id: string;
  type: BlockType;
  props: BlockProps;
}
