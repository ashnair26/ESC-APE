/** @type {import('tailwindcss').Config} */
const { themeColors } = require('./styles/theme');

module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    fontFamily: {
      sans: ['-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', 'sans-serif', 'Apple Color Emoji', 'Segoe UI Emoji'],
      mono: ['SFMono-Regular', 'Menlo', 'Monaco', 'Consolas', 'Liberation Mono', 'Courier New', 'monospace'],
      lemonmilk: ['Lemonmilk', '-apple-system', 'BlinkMacSystemFont', 'system-ui'],
      manlymebb: ['ManlyMenBB', '-apple-system', 'BlinkMacSystemFont', 'system-ui'],
      // Theme font families
      'escape-heading': ['Lemonmilk', '-apple-system', 'BlinkMacSystemFont', 'system-ui'],
      'escape-body': ['-apple-system', 'BlinkMacSystemFont', 'system-ui'],
      'default-heading': ['-apple-system', 'BlinkMacSystemFont', 'system-ui'],
      'default-body': ['-apple-system', 'BlinkMacSystemFont', 'system-ui'],
    },
    extend: {
      colors: {
        // Use Radix UI colors
        primary: themeColors.primary,
        'primary-dark': themeColors.primaryDark,
        secondary: themeColors.secondary,
        'secondary-dark': themeColors.secondaryDark,
        accent: themeColors.accent,
        'accent-dark': themeColors.accentDark,
        crimson: themeColors.crimson,
        'crimson-dark': themeColors.crimsonDark,
        tomato: themeColors.tomato,
        'tomato-dark': themeColors.tomatoDark,
        slate: themeColors.slate,
        'slate-dark': themeColors.slateDark,
        blackA: themeColors.blackA,
        whiteA: themeColors.whiteA,

        // Keep the dark card color for backward compatibility
        dark: {
          card: '#181818',
        },

        // Add brand color
        brand: {
          DEFAULT: '#C20023', // Keep the original brand color
          light: '#FF0030',
          dark: '#8A0019',
        },
      },
      borderRadius: {
        'custom': '0.575rem', // 9.2px (15% increase from 8px)
      },
      keyframes: {
        shake: {
          '0%, 100%': { transform: 'translateX(0)' },
          '10%, 30%, 50%, 70%, 90%': { transform: 'translateX(-5px)' },
          '20%, 40%, 60%, 80%': { transform: 'translateX(5px)' },
        },
      },
      animation: {
        shake: 'shake 0.5s cubic-bezier(.36,.07,.19,.97) both',
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
  ],
}
