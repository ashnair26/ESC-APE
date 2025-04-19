'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ServerIcon, ArrowTopRightOnSquareIcon, PlusIcon } from '@heroicons/react/24/outline';
import { checkServerStatus, getServerTools, getLastPingTime } from '@/utils/server-status';

interface Server {
  id: string;
  name: string;
  description: string;
  status: 'online' | 'offline' | 'error' | 'checking';
  url: string;
  type: string;
  tools: number;
  lastPingTimestamp: number | null;
  lastPing: string;
}

// Real server data
const realServers: Server[] = [
  {
    id: 'unified',
    name: 'Unified MCP',
    description: 'Main unified MCP server',
    status: 'checking',
    url: 'http://localhost:8000',
    type: 'unified',
    tools: 0,
    lastPingTimestamp: null,
    lastPing: 'Never'
  },
  {
    id: 'git',
    name: 'Git MCP',
    description: 'Git repository integration server',
    status: 'checking',
    url: 'http://localhost:8004',
    type: 'git',
    tools: 0,
    lastPingTimestamp: null,
    lastPing: 'Never'
  },
  {
    id: 'privy',
    name: 'Privy MCP',
    description: 'Privy authentication integration server',
    status: 'checking',
    url: 'http://localhost:8005',
    type: 'privy',
    tools: 0,
    lastPingTimestamp: null,
    lastPing: 'Never'
  },
  {
    id: 'supabase',
    name: 'Supabase MCP',
    description: 'Supabase database integration server',
    status: 'checking',
    url: 'http://localhost:8006',
    type: 'supabase',
    tools: 0,
    lastPingTimestamp: null,
    lastPing: 'Never'
  },
  {
    id: 'sanity',
    name: 'Sanity MCP',
    description: 'Sanity CMS integration server',
    status: 'checking',
    url: 'http://localhost:8007',
    type: 'sanity',
    tools: 0,
    lastPingTimestamp: null,
    lastPing: 'Never'
  },
  {
    id: 'base',
    name: 'BASE MCP',
    description: 'BASE blockchain integration server',
    status: 'checking',
    url: 'http://localhost:8008',
    type: 'base',
    tools: 0,
    lastPingTimestamp: null,
    lastPing: 'Never'
  }
];

export default function ServersPage() {
  const [servers, setServers] = useState<Server[]>(realServers);
  const [isAddingServer, setIsAddingServer] = useState(false);

  // Check server status on component mount and periodically
  useEffect(() => {
    // Function to check status of all servers
    const checkAllServers = async () => {
      const updatedServers = await Promise.all(
        servers.map(async (server) => {
          // Check if the server is running
          const isRunning = await checkServerStatus(server.url);

          // Get the number of tools if the server is running
          const toolCount = isRunning ? await getServerTools(server.url) : 0;

          // Update the server status and tools count
          const now = Date.now();
          return {
            ...server,
            status: isRunning ? 'online' : 'offline',
            tools: toolCount,
            lastPingTimestamp: now,
            lastPing: getLastPingTime(now)
          };
        })
      );

      setServers(updatedServers);
    };

    // Check server status immediately
    checkAllServers();

    // Set up interval to check server status every 30 seconds
    const intervalId = setInterval(checkAllServers, 30000);

    // Clean up interval on component unmount
    return () => clearInterval(intervalId);
  }, []);

  return (
    <div>
      <div className="mb-8">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            MCP Servers
          </h1>
          <button
            onClick={() => setIsAddingServer(!isAddingServer)}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          >
            <PlusIcon className="h-5 w-5 mr-2" />
            Add Server
          </button>
        </div>
        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
          Manage your Multi-modal Control Protocol (MCP) servers
        </p>
      </div>

      {isAddingServer && (
        <div className="mb-8 p-6 bg-white dark:bg-gray-800 rounded-lg shadow">
          <h2 className="text-lg font-medium mb-4 text-gray-900 dark:text-white">Add New MCP Server</h2>
          <form className="space-y-4">
            <div>
              <label htmlFor="server-name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Server Name
              </label>
              <input
                type="text"
                id="server-name"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                placeholder="e.g., Python MCP"
              />
            </div>
            <div>
              <label htmlFor="server-url" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Server URL
              </label>
              <input
                type="text"
                id="server-url"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                placeholder="e.g., http://localhost:8000"
              />
            </div>
            <div>
              <label htmlFor="server-type" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Server Type
              </label>
              <select
                id="server-type"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              >
                <option value="unified">Unified</option>
                <option value="python">Python</option>
                <option value="nodejs">Node.js</option>
                <option value="git">Git</option>
                <option value="privy">Privy</option>
                <option value="supabase">Supabase</option>
                <option value="sanity">Sanity</option>
                <option value="custom">Custom</option>
              </select>
            </div>
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => setIsAddingServer(false)}
                className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600"
              >
                Cancel
              </button>
              <button
                type="button"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              >
                Add Server
              </button>
            </div>
          </form>
        </div>
      )}
        <div className="overflow-hidden bg-white shadow sm:rounded-md dark:bg-gray-800">
          <ul role="list" className="divide-y divide-gray-200 dark:divide-gray-700">
            {servers.map((server) => (
              <li key={server.id}>
                <div className="px-4 py-4 sm:px-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <ServerIcon className="h-6 w-6 text-gray-400" aria-hidden="true" />
                      </div>
                      <div className="ml-4">
                        <div className="flex items-center">
                          <h3 className="text-sm font-medium text-gray-900 dark:text-white">{server.name}</h3>
                          <span
                            className={`ml-2 px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              server.status === 'online'
                                ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                                : server.status === 'offline'
                                ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
                                : server.status === 'error'
                                ? 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300'
                                : 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300'
                            }`}
                          >
                            {server.status === 'checking' ? 'Checking...' : server.status}
                          </span>
                        </div>
                        <div className="mt-2 flex items-center text-sm text-gray-500 dark:text-gray-400">
                          <span className="truncate">{server.description}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        {server.tools} tools
                      </span>
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        Last ping: {server.lastPing}
                      </span>
                      <Link
                        href={`/dashboard/servers/${server.id}`}
                        className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded-md text-primary-700 bg-primary-100 hover:bg-primary-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 dark:bg-primary-900 dark:text-primary-300 dark:hover:bg-primary-800"
                      >
                        Details
                      </Link>
                      <button
                        onClick={() => window.open(server.url, '_blank')}
                        className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded-md text-primary-700 bg-primary-100 hover:bg-primary-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 dark:bg-primary-900 dark:text-primary-300 dark:hover:bg-primary-800"
                      >
                        <ArrowTopRightOnSquareIcon className="h-4 w-4 mr-1" />
                        Open
                      </button>
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
    </div>
  );
}
