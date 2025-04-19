'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ArrowLeftIcon, ClipboardIcon, CheckIcon } from '@heroicons/react/24/outline';
import Card from '@/components/ui/Card';

// API key data
const apiKeys = [
  {
    id: 'api-key-1',
    name: 'Supabase API',
    key: 'sbp_1234567890abcdef1234567890abcdef',
    description: 'Used for database operations',
    created: '2023-10-15',
    lastUsed: '2023-11-01',
  },
  {
    id: 'api-key-2',
    name: 'Sanity CMS API',
    key: 'skQJd8vC3X5AdG9z8QpXpL7Tz9M3F2J8Y6N1R0B4',
    description: 'Content management system access',
    created: '2023-09-20',
    lastUsed: '2023-10-28',
  },
  {
    id: 'api-key-3',
    name: 'Privy Authentication',
    key: 'prv_test_7b4d8f2e1a5c9b6d3e7f8a2c5d9b6a3f',
    description: 'User authentication service',
    created: '2023-08-05',
    lastUsed: '2023-10-30',
  },
  {
    id: 'api-key-4',
    name: 'GitHub API',
    key: 'ghp_A1B2C3D4E5F6G7H8I9J0K1L2M3N4O5P6Q7R8',
    description: 'Repository access and management',
    created: '2023-07-12',
    lastUsed: '2023-10-25',
  },
];

export default function SettingsPage() {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const handleCopyKey = (key: string, id: string) => {
    navigator.clipboard.writeText(key);
    setCopiedKey(id);
    setTimeout(() => setCopiedKey(null), 2000);
  };
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
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Settings
            </h1>
          </div>
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
            Manage your API keys and other configuration options
          </p>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-6">
          <div>
            <Card title="API Keys">
              <div className="space-y-4">
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Manage your API keys for various services. Keep these keys secure and do not share them publicly.
                </p>
                <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
                  <table className="min-w-full divide-y divide-gray-300 dark:divide-gray-700">
                    <thead className="bg-gray-50 dark:bg-gray-800">
                      <tr>
                        <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 dark:text-white sm:pl-6">Name</th>
                        <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-white">API Key</th>
                        <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-white">Description</th>
                        <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-white">Created</th>
                        <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-white">Last Used</th>
                        <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6">
                          <span className="sr-only">Actions</span>
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700 bg-white dark:bg-gray-900">
                      {apiKeys.map((apiKey) => (
                        <tr key={apiKey.id}>
                          <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 dark:text-white sm:pl-6">{apiKey.name}</td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 dark:text-gray-400">
                            <div className="flex items-center">
                              <span className="font-mono">{apiKey.key.substring(0, 8)}...{apiKey.key.substring(apiKey.key.length - 4)}</span>
                              <button
                                onClick={() => handleCopyKey(apiKey.key, apiKey.id)}
                                className="ml-2 p-1 text-gray-400 hover:text-gray-500 dark:text-gray-500 dark:hover:text-gray-400"
                                title="Copy API key"
                              >
                                {copiedKey === apiKey.id ? (
                                  <CheckIcon className="h-5 w-5 text-green-500" />
                                ) : (
                                  <ClipboardIcon className="h-5 w-5" />
                                )}
                              </button>
                            </div>
                          </td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 dark:text-gray-400">{apiKey.description}</td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 dark:text-gray-400">{apiKey.created}</td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 dark:text-gray-400">{apiKey.lastUsed}</td>
                          <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                            <button className="text-primary-600 hover:text-primary-900 dark:text-primary-400 dark:hover:text-primary-300">Revoke</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="flex justify-end">
                  <button className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500">
                    Generate New API Key
                  </button>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
