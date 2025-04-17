'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import ThemeSelector from '@/components/theme/ThemeSelector';
import Card from '@/components/ui/Card';
import BrutalistButton from '@/components/ui/BrutalistButton';

export default function SettingsPage() {
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
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white font-escape-heading">
              Community Settings
            </h1>
          </div>
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400 font-escape-body">
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
                  <h3 className="text-lg font-bold mb-2 font-escape-heading">Typography</h3>
                  <div className="space-y-2">
                    <p className="text-2xl font-escape-heading">Heading Text (Lemonmilk)</p>
                    <p className="font-escape-body">Body Text (ManlyMenBB). This is how paragraphs will appear throughout your community.</p>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-lg font-bold mb-2 font-escape-heading">Buttons</h3>
                  <div className="flex flex-wrap gap-4">
                    <BrutalistButton color="red" style={{ backgroundColor: '#c20023', borderColor: '#000000' }}>
                      READ NOW
                    </BrutalistButton>
                    <BrutalistButton color="black">
                      EXPLORE
                    </BrutalistButton>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-lg font-bold mb-2 font-escape-heading">Links</h3>
                  <div className="space-y-2">
                    <a href="#" className="text-primary-600 hover:text-primary-800 dark:text-primary-400 dark:hover:text-primary-300 font-escape-heading">
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
