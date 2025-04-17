'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// Define available themes
export type ThemeName = 'escape' | 'default' | 'cyberpunk' | 'fantasy' | 'scifi';

// Theme context type
interface ThemeContextType {
  theme: ThemeName;
  setTheme: (theme: ThemeName) => void;
}

// Create context with default values
const ThemeContext = createContext<ThemeContextType>({
  theme: 'escape',
  setTheme: () => {},
});

// Hook to use theme
export const useTheme = () => useContext(ThemeContext);

interface ThemeProviderProps {
  children: ReactNode;
  defaultTheme?: ThemeName;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({
  children,
  defaultTheme = 'escape',
}) => {
  // Initialize theme from localStorage if available, otherwise use default
  const [theme, setTheme] = useState<ThemeName>(defaultTheme);

  // Load theme from localStorage on mount
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') as ThemeName | null;
    if (savedTheme && isValidTheme(savedTheme)) {
      setTheme(savedTheme);
    }
  }, []);

  // Save theme to localStorage when it changes
  useEffect(() => {
    localStorage.setItem('theme', theme);
    
    // Apply theme classes to the document
    const root = document.documentElement;
    
    // Remove all theme classes
    root.classList.remove('theme-escape', 'theme-default', 'theme-cyberpunk', 'theme-fantasy', 'theme-scifi');
    
    // Add current theme class
    root.classList.add(`theme-${theme}`);
    
  }, [theme]);

  // Validate theme name
  const isValidTheme = (themeName: string): themeName is ThemeName => {
    return ['escape', 'default', 'cyberpunk', 'fantasy', 'scifi'].includes(themeName);
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      <div className={`theme-${theme}`}>
        {children}
      </div>
    </ThemeContext.Provider>
  );
};

export default ThemeProvider;
