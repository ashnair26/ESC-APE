'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ServerIcon, CommandLineIcon, ArrowLeftIcon, ArrowTopRightOnSquareIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';
import { checkServerStatus } from '@/utils/server-status';

interface Tool {
  name: string;
  description: string;
  parameters: any;
}

interface ServerType {
  value: string;
  label: string;
}

export default function ServerDetailPage() {
  const params = useParams();
  const router = useRouter();
  const serverId = params.id as string;
  const [tools, setTools] = useState<Tool[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [serverName, setServerName] = useState('');
  const [serverDescription, setServerDescription] = useState('');
  const [serverStatus, setServerStatus] = useState<'online' | 'offline'>('offline');
  const [serverUrl, setServerUrl] = useState('');
  const [serverType, setServerType] = useState<string>('sse');

  // Server type options
  const serverTypeOptions: ServerType[] = [
    { value: 'sse', label: 'SSE' },
    { value: 'command', label: 'Command' }
  ];

  // Helper function to get server URL
  const getServerUrl = (id: string): string => {
    const serverPorts: Record<string, number> = {
      unified: 8000,
      git: 8004,
      privy: 8005,
      supabase: 8006,
      sanity: 8007,
      base: 8008,
      context7: 8009,
      figma: 3333
    };

    const port = serverPorts[id];
    return port ? `http://localhost:${port}` : '';
  };

  // Helper function to get server name
  const getServerName = (id: string): string => {
    const serverNames: Record<string, string> = {
      unified: 'Unified MCP',
      git: 'Git MCP',
      privy: 'Privy MCP',
      supabase: 'Supabase MCP',
      sanity: 'Sanity CMS',
      base: 'BASE MCP',
      context7: 'Context7 MCP',
      figma: 'Figma MCP'
    };

    return serverNames[id] || id.charAt(0).toUpperCase() + id.slice(1);
  };

  // Helper function to get server description
  const getServerDescription = (id: string): string => {
    const serverDescriptions: Record<string, string> = {
      unified: 'Main unified MCP server',
      git: 'Git repository integration server',
      privy: 'Privy authentication integration server',
      supabase: 'Supabase database integration server',
      sanity: 'Sanity CMS integration server',
      base: 'BASE blockchain integration server',
      context7: 'Up-to-date documentation for LLMs and AI code editors',
      figma: 'Figma design system integration server'
    };

    return serverDescriptions[id] || '';
  };

  useEffect(() => {
    const fetchServerDetails = async () => {
      setIsLoading(true);
      setError(null);

      try {
        // Get server URL
        const url = getServerUrl(serverId);
        if (!url) {
          throw new Error(`Server ${serverId} not found`);
        }
        setServerUrl(url);

        // Set server name and description
        setServerName(getServerName(serverId));
        setServerDescription(getServerDescription(serverId));

        // Check if server is running
        const isRunning = await checkServerStatus(url);
        setServerStatus(isRunning ? 'online' : 'offline');

        // Fetch tools if server is running
        if (isRunning) {
          try {
            const response = await fetch(`${url}/tools`);
            if (response.ok) {
              const data = await response.json();
              setTools(data.tools || []);
            }
          } catch (toolsErr) {
            console.error(`Error fetching tools for ${serverId}:`, toolsErr);
            // Don't set an error, just leave tools empty
          }
        }
      } catch (err) {
        console.error(`Error fetching server ${serverId} details:`, err);
        setError(`Failed to load server details: ${err}`);
      } finally {
        setIsLoading(false);
      }
    };

    fetchServerDetails();

    // Set up interval to refresh server status
    const intervalId = setInterval(async () => {
      try {
        const url = getServerUrl(serverId);
        if (url) {
          const isRunning = await checkServerStatus(url);
          setServerStatus(isRunning ? 'online' : 'offline');
        }
      } catch (err) {
        console.error(`Error checking server status:`, err);
      }
    }, 10000);

    return () => clearInterval(intervalId);
  }, [serverId]);

  return (
    <div>
      <div className="mb-8">
        <div className="flex items-center">
          <button
            onClick={() => router.back()}
            className="mr-4 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
          >
            <ArrowLeftIcon className="h-5 w-5" />
          </button>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            {serverName}
          </h1>
          <span
            className={`ml-2 px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
              serverStatus === 'online'
                ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
            }`}
          >
            {serverStatus}
          </span>
        </div>
        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
          {serverDescription}
        </p>
        <div className="mt-2">
          <a
            href={serverUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center text-sm font-medium text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300"
          >
            <ArrowTopRightOnSquareIcon className="h-4 w-4 mr-1" />
            {serverUrl}
          </a>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
        </div>
      ) : error ? (
        <div className="rounded-md bg-red-50 p-4 dark:bg-red-900/20">
          <div className="flex">
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800 dark:text-red-300">
                Error
              </h3>
              <div className="mt-2 text-sm text-red-700 dark:text-red-400">
                <p>{error}</p>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <>
          <div className="mb-8">
            <h2 className="text-lg font-medium text-gray-900 dark:text-white">
              Server Information
            </h2>
            <div className="mt-4 overflow-hidden rounded-lg bg-white shadow dark:bg-gray-800">
              <div className="px-4 py-5 sm:p-6">
                <dl className="grid grid-cols-1 gap-x-4 gap-y-8 sm:grid-cols-2">
                  <div className="sm:col-span-1">
                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                      Server ID
                    </dt>
                    <dd className="mt-1 text-sm text-gray-900 dark:text-white">
                      {serverId}
                    </dd>
                  </div>
                  <div className="sm:col-span-1">
                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                      Status
                    </dt>
                    <dd className="mt-1 text-sm text-gray-900 dark:text-white">
                      <span
                        className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${
                          serverStatus === 'online'
                            ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                            : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
                        }`}
                      >
                        {serverStatus}
                      </span>
                    </dd>
                  </div>
                  <div className="sm:col-span-1">
                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                      Tools Count
                    </dt>
                    <dd className="mt-1 text-sm text-gray-900 dark:text-white">
                      {tools.length}
                    </dd>
                  </div>
                  <div className="sm:col-span-1">
                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                      Server Type
                    </dt>
                    <dd className="mt-1 text-sm text-gray-900 dark:text-white">
                      <select
                        value={serverType}
                        onChange={(e) => setServerType(e.target.value)}
                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white text-sm"
                      >
                        {serverTypeOptions.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </dd>
                  </div>
                </dl>
              </div>
            </div>
          </div>

          <div className="mb-8">
            <h2 className="text-lg font-medium text-gray-900 dark:text-white">
              Available Tools
            </h2>
            {tools.length === 0 ? (
              <p className="mt-4 text-sm text-gray-500 dark:text-gray-400">
                No tools available for this server.
              </p>
            ) : (
              <div className="mt-4 overflow-hidden bg-white shadow sm:rounded-md dark:bg-gray-800">
                <ul role="list" className="divide-y divide-gray-200 dark:divide-gray-700">
                  {tools.map((tool) => (
                    <li key={tool.name}>
                      <Link
                        href={`/dashboard/tools/${serverId}/${tool.name}`}
                        className="block hover:bg-gray-50 dark:hover:bg-gray-700"
                      >
                        <div className="px-4 py-4 sm:px-6">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center">
                              <CommandLineIcon
                                className="mr-4 h-6 w-6 text-gray-400 dark:text-gray-500"
                                aria-hidden="true"
                              />
                              <p className="truncate text-sm font-medium text-primary-600 dark:text-primary-400">
                                {tool.name}
                              </p>
                            </div>
                          </div>
                          <div className="mt-2 sm:flex sm:justify-between">
                            <div className="sm:flex">
                              <p className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                                {tool.description}
                              </p>
                            </div>
                          </div>
                        </div>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
