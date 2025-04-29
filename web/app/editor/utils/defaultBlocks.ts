// Default blocks for the landing page builder
export const defaultBlocks = {
  content: [
    {
      type: 'HeroBlock',
      props: {
        title: 'Welcome to Your ESC/APE World',
        subtitle: 'Create and customize your landing page with our easy-to-use editor.',
        ctaText: 'Explore More',
        ctaLink: '#',
        alignment: 'center',
      },
    },
  ],
  root: { props: { title: 'ESC/APE Landing Page' } },
  zones: {},
};

export default defaultBlocks;
