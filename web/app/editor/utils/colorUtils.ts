// Function to generate lighter and darker variations of a color
export const generateColorVariations = (hexColor: string) => {
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
export const getContrastColor = (hexColor: string) => {
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

// Function to validate the 60/30/10 color distribution
export const validate60_30_10 = (baseColor: string, secondaryColor: string, accentColor: string) => {
  // This is a placeholder for more complex validation logic
  // In a real implementation, this would check for:
  // - Sufficient contrast between colors
  // - Accessibility compliance
  // - Color harmony
  
  // For now, just check that all colors are valid hex colors
  const hexRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;
  
  return {
    isValid: hexRegex.test(baseColor) && hexRegex.test(secondaryColor) && hexRegex.test(accentColor),
    errors: [],
    warnings: [],
  };
};

// Function to calculate contrast ratio between two colors (for accessibility)
export const calculateContrastRatio = (color1: string, color2: string) => {
  // Convert hex to RGB
  const r1 = parseInt(color1.slice(1, 3), 16);
  const g1 = parseInt(color1.slice(3, 5), 16);
  const b1 = parseInt(color1.slice(5, 7), 16);
  
  const r2 = parseInt(color2.slice(1, 3), 16);
  const g2 = parseInt(color2.slice(3, 5), 16);
  const b2 = parseInt(color2.slice(5, 7), 16);
  
  // Calculate relative luminance
  const l1 = 0.2126 * (r1 / 255) + 0.7152 * (g1 / 255) + 0.0722 * (b1 / 255);
  const l2 = 0.2126 * (r2 / 255) + 0.7152 * (g2 / 255) + 0.0722 * (b2 / 255);
  
  // Calculate contrast ratio
  const ratio = (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
  
  return ratio;
};
