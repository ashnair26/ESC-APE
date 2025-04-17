'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import ThemeSelector from '@/components/theme/ThemeSelector';
import { useTheme } from '@/components/theme/ThemeProvider';
import Card from '@/components/ui/Card';
import BrutalistButton from '@/components/ui/BrutalistButton';

export default function SettingsPage() {
  const { theme } = useTheme();
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <header className="bg-white shadow dark:bg-[#181818]">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex items-center">
            <Link
              href="/dashboard"
              className="mr-4 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
            >
              <ArrowLeftIcon className="h-5 w-5" />
            </Link>
            <h1 className={`text-2xl font-bold text-gray-900 dark:text-white ${theme === 'escape' ? 'font-escape-heading' : theme === 'default' ? 'font-default-heading' : ''}`}>
              Community Settings
            </h1>
          </div>
          <p className={`mt-2 text-sm text-gray-500 dark:text-gray-400 ${theme === 'escape' ? 'font-escape-body' : theme === 'default' ? 'font-default-body' : ''}`}>
            Customize your ESCAPE Creator Community experience
          </p>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <div>
            <Card title="Theme Settings">
              <ThemeSelector />
            </Card>
          </div>

          <div>
            <Card title="Theme Preview">
              <div className="space-y-6">
                <div>
                  <h3 className={`text-lg font-bold mb-2 ${theme === 'escape' ? 'font-escape-heading' : theme === 'default' ? 'font-default-heading' : ''}`}>Typography</h3>
                  <div className="space-y-2">
                    <div className="text-2xl">
                      <span className={`${theme === 'escape' ? 'font-escape-heading' : theme === 'default' ? 'font-default-heading' : ''}`}>
                        {theme === 'escape' ? 'Heading Text (Lemonmilk)' :
                         theme === 'default' ? 'Heading Text (Inter)' :
                         'Heading Text'}
                      </span>
                    </div>
                    <div>
                      <span className={`${theme === 'escape' ? 'font-escape-body' : theme === 'default' ? 'font-default-body' : ''}`}>
                        {theme === 'escape' ? 'Body Text (ManlyMenBB). This is how paragraphs will appear throughout your community.' :
                         theme === 'default' ? 'Body Text (Inter). This is how paragraphs will appear throughout your community.' :
                         'Body Text. This is how paragraphs will appear throughout your community.'}
                      </span>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className={`text-lg font-bold mb-2 ${theme === 'escape' ? 'font-escape-heading' : theme === 'default' ? 'font-default-heading' : ''}`}>Buttons</h3>
                  <div className="flex flex-wrap gap-4">
                    {theme === 'escape' ? (
                      <>
                        <BrutalistButton color="red" style={{ backgroundColor: '#c20023', borderColor: '#000000' }}>
                          READ NOW
                        </BrutalistButton>
                        <BrutalistButton color="black">
                          EXPLORE
                        </BrutalistButton>
                      </>
                    ) : theme === 'default' ? (
                      <>
                        <button className="px-4 py-2 bg-blue-600 text-white rounded-md font-sans hover:bg-blue-700 transition-colors">
                          Read Now
                        </button>
                        <button className="px-4 py-2 bg-gray-800 text-white rounded-md font-sans hover:bg-gray-900 transition-colors">
                          Explore
                        </button>
                      </>
                    ) : (
                      <>
                        <button className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors">
                          Read Now
                        </button>
                        <button className="px-4 py-2 bg-gray-800 text-white rounded-md hover:bg-gray-900 transition-colors">
                          Explore
                        </button>
                      </>
                    )}
                  </div>
                </div>

                <div>
                  <h3 className={`text-lg font-bold mb-2 ${theme === 'escape' ? 'font-escape-heading' : theme === 'default' ? 'font-default-heading' : ''}`}>Links</h3>
                  <div className="space-y-2">
                    <a
                      href="#"
                      className={`hover:underline ${theme === 'escape'
                        ? 'text-[#c20023] font-escape-heading'
                        : theme === 'default'
                        ? 'text-blue-600 font-default-heading'
                        : 'text-purple-600'}`}
                    >
                      This is a link
                    </a>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
