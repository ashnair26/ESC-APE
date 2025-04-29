'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// Define the store state type
interface LandingPageState {
  data: any;
  setData: (data: any) => void;
  theme: {
    baseColor: string;      // 60%
    secondaryColor: string; // 30%
    accentColor: string;    // 10%
    fontFamily: string;
    headingFontFamily: string;
  };
  updateTheme: (settings: Partial<LandingPageState['theme']>) => void;
}

// Create the store with persist middleware to save to localStorage
export const useLandingPageStore = create<LandingPageState>()(
  persist(
    (set) => ({
      // Initial data state
      data: null,
      setData: (data) => set({ data }),
      
      // Initial theme state
      theme: {
        baseColor: '#000000',      // 60% - Black
        secondaryColor: '#1a1a1a', // 30% - Dark Gray
        accentColor: '#C20023',    // 10% - ESC/APE Red
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
        headingFontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
      },
      
      // Theme update function
      updateTheme: (settings) => set((state) => ({
        theme: {
          ...state.theme,
          ...settings,
        },
      })),
    }),
    {
      name: 'landing-page-storage', // Name for the localStorage key
    }
  )
);

export default useLandingPageStore;
