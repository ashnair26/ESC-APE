// Import Radix UI colors
const {
  red,
  redDark,
  crimson,
  crimsonDark,
  tomato,
  tomatoDark,
  amber,
  amberDark,
  blue,
  blueDark,
  slate,
  slateDark,
  blackA,
  whiteA,
} = require('@radix-ui/colors');

// Helper function to convert Radix UI color scales to Tailwind format
const convertRadixToTailwind = (radixScale, prefix) => {
  const result = {};

  Object.entries(radixScale).forEach(([key, value]) => {
    // Convert from 'red1', 'red2' to '50', '100', etc.
    const scaleNumber = key.replace(/[^0-9]/g, '');
    let tailwindKey;

    switch (scaleNumber) {
      case '1': tailwindKey = '50'; break;
      case '2': tailwindKey = '100'; break;
      case '3': tailwindKey = '200'; break;
      case '4': tailwindKey = '300'; break;
      case '5': tailwindKey = '400'; break;
      case '6': tailwindKey = '500'; break;
      case '7': tailwindKey = '600'; break;
      case '8': tailwindKey = '700'; break;
      case '9': tailwindKey = '800'; break;
      case '10': tailwindKey = '900'; break;
      case '11': tailwindKey = '950'; break;
      case '12': tailwindKey = '1000'; break;
      default: tailwindKey = scaleNumber;
    }

    result[tailwindKey] = value;
  });

  return result;
};

// Create theme colors
export const themeColors = {
  // Primary color (red)
  primary: convertRadixToTailwind(red, 'red'),
  primaryDark: convertRadixToTailwind(redDark, 'red'),

  // Secondary color (blue)
  secondary: convertRadixToTailwind(blue, 'blue'),
  secondaryDark: convertRadixToTailwind(blueDark, 'blue'),

  // Accent color (amber)
  accent: convertRadixToTailwind(amber, 'amber'),
  accentDark: convertRadixToTailwind(amberDark, 'amber'),

  // Crimson (alternative red)
  crimson: convertRadixToTailwind(crimson, 'crimson'),
  crimsonDark: convertRadixToTailwind(crimsonDark, 'crimson'),

  // Tomato (alternative red/orange)
  tomato: convertRadixToTailwind(tomato, 'tomato'),
  tomatoDark: convertRadixToTailwind(tomatoDark, 'tomato'),

  // Slate (gray scale)
  slate: convertRadixToTailwind(slate, 'slate'),
  slateDark: convertRadixToTailwind(slateDark, 'slate'),

  // Alpha colors
  blackA: convertRadixToTailwind(blackA, 'blackA'),
  whiteA: convertRadixToTailwind(whiteA, 'whiteA'),
};

// Export specific colors for easy access
const colors = {
  // Brand color (using crimson9 as the main brand color)
  brand: red.red9,
  brandDark: redDark.red9,

  // Text colors
  text: {
    primary: slate.slate12,
    secondary: slate.slate11,
    tertiary: slate.slate10,
    primaryDark: slateDark.slate12,
    secondaryDark: slateDark.slate11,
    tertiaryDark: slateDark.slate10,
  },

  // Background colors
  background: {
    primary: whiteA.whiteA1,
    secondary: slate.slate2,
    tertiary: slate.slate3,
    primaryDark: blackA.blackA12,
    secondaryDark: slateDark.slate2,
    tertiaryDark: slateDark.slate3,
  },

  // Border colors
  border: {
    light: slate.slate6,
    medium: slate.slate7,
    dark: slate.slate8,
    lightDark: slateDark.slate6,
    mediumDark: slateDark.slate7,
    darkDark: slateDark.slate8,
  },
};

module.exports = { themeColors, colors };
