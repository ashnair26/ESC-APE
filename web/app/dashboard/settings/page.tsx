'use client';

import React, { useState, useEffect } from 'react';
import { CheckIcon, XMarkIcon } from '@heroicons/react/24/outline';

// API key data with brand colors
const apiServices = [
  {
    id: 'supabase',
    name: 'Supabase API',
    description: 'Database and authentication service',
    color: '#3ECF8E', // Supabase green
    logo: '/images/logos/supabase.svg',
    placeholder: 'Enter your Supabase API key',
    status: 'active', // active, inactive, error
  },
  {
    id: 'sanity',
    name: 'Sanity CMS API',
    description: 'Content management system',
    color: '#F03E2F', // Sanity red
    logo: '/images/logos/sanity.svg',
    placeholder: 'Enter your Sanity API key (starts with sk)',
    status: 'active',
  },
  {
    id: 'privy',
    name: 'Privy Authentication',
    description: 'User authentication service (App ID)',
    color: '#3B82F6', // Privy blue
    logo: '/images/logos/privy.svg',
    placeholder: 'Enter your Privy App ID (starts with cm)',
    status: 'active',
  },
  {
    id: 'github',
    name: 'GitHub API',
    description: 'Repository access and management',
    color: '#24292E', // GitHub dark
    logo: '/images/logos/github.svg',
    placeholder: 'Enter your GitHub API key (starts with ghp_)',
    status: 'active',
  },
];

export default function SettingsPage() {
  // State for API keys
  const [apiKeys, setApiKeys] = useState({
    supabase: { value: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im16cHVrcWlwZWxza2txZG50bXRyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDM2MjAxNDcsImV4cCI6MjA1OTE5NjE0N30.TVBl3CQac3LBLGXx6AAJxzUpXP4zO2LLInzLU9tT6nw', saved: true },
    sanity: { value: 'skQJd8vC3X5AdG9z8QpXpL7Tz9M3F2J8Y6N1R0B4', saved: true },
    privy: { value: 'cm95uq0me018ilb0k33uzaezg', saved: true },
    github: { value: 'ghp_A1B2C3D4E5F6G7H8I9J0K1L2M3N4O5P6Q7R8', saved: true },
  });

  // State for service statuses
  const [serviceStatuses, setServiceStatuses] = useState({
    supabase: 'active',
    sanity: 'active',
    privy: 'active',
    github: 'active',
  });

  // Handle input change
  const handleInputChange = (id, value) => {
    setApiKeys({
      ...apiKeys,
      [id]: { value, saved: false },
    });

    // Update status to inactive when editing
    setServiceStatuses({
      ...serviceStatuses,
      [id]: 'inactive',
    });
  };

  // Function to validate API keys
  const validateApiKey = async (id, key) => {
    try {
      // Set status to 'validating'
      setServiceStatuses(prev => ({
        ...prev,
        [id]: 'validating',
      }));

      let response;

      // Different validation logic for each API
      switch (id) {
        case 'supabase':
          // Make a test request to Supabase
          response = await fetch('https://mzpukqipelskkqdntmtr.supabase.co/rest/v1/admin_users?select=id&limit=1', {
            method: 'GET',
            headers: {
              'apikey': key,
              'Authorization': `Bearer ${key}`,
            },
          });
          break;

        case 'sanity':
          // Make a test request to Sanity API
          response = await fetch('https://api.sanity.io/v1/projects', {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${key}`,
            },
          });
          break;

        case 'privy':
          // For Privy, we're using the App ID which doesn't have a direct validation endpoint
          // Instead, we'll check if it matches the expected format and length
          if (key && key.length >= 20 && key.includes('cm')) {
            // This is likely a valid Privy App ID format
            setServiceStatuses(prev => ({
              ...prev,
              [id]: 'active',
            }));
            return true;
          } else {
            setServiceStatuses(prev => ({
              ...prev,
              [id]: 'error',
            }));
            return false;
          }
          break;

        case 'github':
          // Make a test request to GitHub API
          response = await fetch('https://api.github.com/user', {
            method: 'GET',
            headers: {
              'Authorization': `token ${key}`,
              'Accept': 'application/vnd.github.v3+json',
            },
          });
          break;

        default:
          throw new Error(`Unknown API: ${id}`);
      }

      // Check if the request was successful
      if (response.ok) {
        setServiceStatuses(prev => ({
          ...prev,
          [id]: 'active',
        }));
        return true;
      } else {
        setServiceStatuses(prev => ({
          ...prev,
          [id]: 'error',
        }));
        return false;
      }
    } catch (error) {
      console.error(`Error validating ${id} key:`, error);
      setServiceStatuses(prev => ({
        ...prev,
        [id]: 'error',
      }));
      return false;
    }
  };

  // Handle save
  const handleSave = async (id) => {
    setApiKeys({
      ...apiKeys,
      [id]: { ...apiKeys[id], saved: true },
    });

    // Validate the API key
    await validateApiKey(id, apiKeys[id].value);
  };

  // Handle revoke
  const handleRevoke = (id) => {
    setApiKeys({
      ...apiKeys,
      [id]: { value: '', saved: false },
    });

    // Update status to inactive when revoked
    setServiceStatuses({
      ...serviceStatuses,
      [id]: 'inactive',
    });
  };

  // Validate all API keys on initial load
  useEffect(() => {
    // Validate each saved API key
    Object.entries(apiKeys).forEach(([id, { value, saved }]) => {
      if (value && saved) {
        validateApiKey(id, value);
      }
    });
  }, []);

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          API Settings
        </h1>
        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
          Manage your API keys and integrations
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {apiServices.map((service) => (
          <div
            key={service.id}
            className="overflow-hidden rounded-lg bg-white shadow dark:bg-gray-800"
            style={{ borderTop: `4px solid ${service.color}` }}
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-medium text-gray-900 dark:text-white flex items-center">
                  {service.name}
                  <span
                    className={`ml-2 px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      serviceStatuses[service.id] === 'active'
                        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                        : serviceStatuses[service.id] === 'error'
                        ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
                        : serviceStatuses[service.id] === 'validating'
                        ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300'
                        : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                    }`}
                  >
                    {serviceStatuses[service.id] === 'active'
                      ? 'Active'
                      : serviceStatuses[service.id] === 'error'
                      ? 'Error'
                      : serviceStatuses[service.id] === 'validating'
                      ? 'Validating...'
                      : 'Inactive'}
                  </span>
                </h2>
              </div>

              <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                {service.description}
              </p>

              <div className="mt-4 space-y-4">
                <div>
                  <label htmlFor={`api-key-${service.id}`} className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    {service.id === 'privy' ? 'App ID' : 'API Key'}
                  </label>
                  <div className="mt-1 flex rounded-md shadow-sm">
                    <input
                      type="text"
                      name={`api-key-${service.id}`}
                      id={`api-key-${service.id}`}
                      className="flex-1 min-w-0 block w-full px-3 py-2 rounded-md border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                      placeholder={service.placeholder}
                      value={apiKeys[service.id].value}
                      onChange={(e) => handleInputChange(service.id, e.target.value)}
                    />
                  </div>
                </div>

                <div className="flex justify-between">
                  <button
                    onClick={() => handleSave(service.id)}
                    disabled={apiKeys[service.id].saved || !apiKeys[service.id].value}
                    className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm ${
                      apiKeys[service.id].saved
                        ? 'bg-green-600 hover:bg-green-700 focus:ring-green-500'
                        : 'bg-primary-600 hover:bg-primary-700 focus:ring-primary-500'
                    } text-white focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed`}
                  >
                    {apiKeys[service.id].saved ? (
                      <>
                        <CheckIcon className="h-4 w-4 mr-1" />
                        Saved
                      </>
                    ) : (
                      'Save'
                    )}
                  </button>

                  <button
                    onClick={() => handleRevoke(service.id)}
                    disabled={!apiKeys[service.id].value}
                    className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md shadow-sm text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <XMarkIcon className="h-4 w-4 mr-1" />
                    Revoke
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
