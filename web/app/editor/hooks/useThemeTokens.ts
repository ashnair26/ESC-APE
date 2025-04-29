'use client';

import { useMemo } from 'react';
import { useLandingPageStore } from './useLandingPageStore';

// Simple function to generate lighter and darker variations of a color
const generateColorVariations = (hexColor: string) => {
  // Convert hex to RGB
  const r = parseInt(hexColor.slice(1, 3), 16);
  const g = parseInt(hexColor.slice(3, 5), 16);
  const b = parseInt(hexColor.slice(5, 7), 16);
  
  // Generate lighter variation (add 20% white)
  const lighterR = Math.min(255, r + 51);
  const lighterG = Math.min(255, g + 51);
  const lighterB = Math.min(255, b + 51);
  
  // Generate darker variation (add 20% black)
  const darkerR = Math.max(0, r - 51);
  const darkerG = Math.max(0, g - 51);
  const darkerB = Math.max(0, b - 51);
  
  // Convert back to hex
  const lighter = `#${lighterR.toString(16).padStart(2, '0')}${lighterG.toString(16).padStart(2, '0')}${lighterB.toString(16).padStart(2, '0')}`;
  const darker = `#${darkerR.toString(16).padStart(2, '0')}${darkerG.toString(16).padStart(2, '0')}${darkerB.toString(16).padStart(2, '0')}`;
  
  return { lighter, darker };
};

// Function to determine if text should be white or black based on background color
const getContrastColor = (hexColor: string) => {
  // Convert hex to RGB
  const r = parseInt(hexColor.slice(1, 3), 16);
  const g = parseInt(hexColor.slice(3, 5), 16);
  const b = parseInt(hexColor.slice(5, 7), 16);
  
  // Calculate luminance (perceived brightness)
  // Formula: 0.299*R + 0.587*G + 0.114*B
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  
  // Return white for dark backgrounds, black for light backgrounds
  return luminance > 0.5 ? '#000000' : '#ffffff';
};

// Hook to generate theme tokens based on the current theme settings
export function useThemeTokens() {
  const { theme } = useLandingPageStore();
  
  const tokens = useMemo(() => {
    const baseVariations = generateColorVariations(theme.baseColor);
    const secondaryVariations = generateColorVariations(theme.secondaryColor);
    const accentVariations = generateColorVariations(theme.accentColor);
    
    return {
      base: {
        primary: theme.baseColor,
        lighter: baseVariations.lighter,
        darker: baseVariations.darker,
      },
      secondary: {
        primary: theme.secondaryColor,
        lighter: secondaryVariations.lighter,
        darker: secondaryVariations.darker,
      },
      accent: {
        primary: theme.accentColor,
        lighter: accentVariations.lighter,
        darker: accentVariations.darker,
      },
      text: {
        onBase: getContrastColor(theme.baseColor),
        onSecondary: getContrastColor(theme.secondaryColor),
        onAccent: getContrastColor(theme.accentColor),
        muted: '#a0a0a0',
      },
      fonts: {
        body: theme.fontFamily,
        heading: theme.headingFontFamily,
      },
    };
  }, [theme]);
  
  return tokens;
}

export default useThemeTokens;
