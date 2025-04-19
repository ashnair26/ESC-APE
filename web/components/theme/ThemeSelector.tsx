'use client';

import React from 'react';
import { useTheme, ThemeName } from './ThemeProvider';

interface ThemeOption {
  name: ThemeName;
  label: string;
  description: string;
}

const themeOptions: ThemeOption[] = [
  {
    name: 'escape',
    label: 'ESCAPE',
    description: 'Bold Lemonmilk headings with Inter body text',
  },
  {
    name: 'default',
    label: 'Default',
    description: 'Clean, modern interface with system fonts',
  },
  {
    name: 'cyberpunk',
    label: 'Cyberpunk',
    description: 'Neon colors with futuristic styling',
  },
  {
    name: 'fantasy',
    label: 'Fantasy',
    description: 'Medieval-inspired with ornate decorations',
  },
  {
    name: 'scifi',
    label: 'Sci-Fi',
    description: 'Sleek, minimalist design with space-age aesthetics',
  },
];

interface ThemeSelectorProps {
  className?: string;
}

const ThemeSelector: React.FC<ThemeSelectorProps> = ({ className }) => {
  const { theme, setTheme } = useTheme();

  return (
    <div className={className}>
      <h3 className="text-lg font-bold mb-4 font-escape-heading">Theme Selection</h3>
      <div className="space-y-4">
        {themeOptions.map((option) => (
          <div
            key={option.name}
            className={`p-4 rounded-lg cursor-pointer transition-all ${
              theme === option.name
                ? 'bg-primary-100 border-2 border-primary-500 dark:bg-primary-900/30 dark:border-primary-400'
                : 'bg-white hover:bg-gray-50 border border-gray-200 dark:bg-[#181818] dark:hover:bg-gray-800 dark:border-gray-700'
            }`}
            onClick={() => setTheme(option.name)}
          >
            <div className="flex items-center justify-between">
              <div>
                <h4 className={`font-bold ${option.name === 'escape' ? 'font-escape-heading' : ''}`}>
                  {option.label}
                </h4>
                <p className={`text-sm text-gray-600 dark:text-gray-400 mt-1 ${option.name === 'escape' ? 'font-escape-body' : ''}`}>
                  {option.description}
                </p>
              </div>
              <div className={`w-5 h-5 rounded-full ${theme === option.name ? 'bg-primary-500' : 'bg-gray-200 dark:bg-gray-700'}`}>
                {theme === option.name && (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="white"
                    className="w-5 h-5"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ThemeSelector;
