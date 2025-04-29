// Theme type definitions for the landing page builder
export interface ColorThemeTokens {
  // 60% - Primary/Base
  base: {
    primary: string;   // HEX value
    lighter: string;   // Auto-generated variation
    darker: string;    // Auto-generated variation
  };

  // 30% - Secondary
  secondary: {
    primary: string;   // HEX value
    lighter: string;   // Auto-generated variation
    darker: string;    // Auto-generated variation
  };

  // 10% - Accent
  accent: {
    primary: string;   // HEX value
    lighter: string;   // Auto-generated variation
    darker: string;    // Auto-generated variation
  };

  // Text colors that work with the theme
  text: {
    onBase: string;
    onSecondary: string;
    onAccent: string;
    muted: string;
  };

  // Font families
  fonts: {
    body: string;
    heading: string;
  };
}

export interface ThemeSettings {
  baseColor: string;      // 60%
  secondaryColor: string; // 30%
  accentColor: string;    // 10%
  fontFamily: string;
  headingFontFamily: string;
}

export interface ThemePreset {
  id: string;
  name: string;
  baseColor: string;
  secondaryColor: string;
  accentColor: string;
}
