'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useApi } from '@/components/api/useApi';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { ServerIcon } from '@heroicons/react/24/outline';

interface Server {
  id: string;
  name: string;
  description: string;
  status: 'online' | 'offline' | 'error';
}

export default function ServersPage() {
  const { client } = useApi();
  const [servers, setServers] = useState<Server[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchServers = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const serversData = await client.listServers();
        
        // Convert the servers data to our format
        const formattedServers = Object.entries(serversData).map(
          ([id, description]) => ({
            id,
            name: id.charAt(0).toUpperCase() + id.slice(1),
            description: description as string,
            status: 'online' as const,
          })
        );

        setServers(formattedServers);
      } catch (err) {
        console.error('Error fetching servers:', err);
        setError('Failed to load servers');
      } finally {
        setIsLoading(false);
      }
    };

    fetchServers();
  }, [client]);

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          MCP Servers
        </h1>
        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
          Manage and monitor your MCP servers.
        </p>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <LoadingSpinner size="lg" />
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
        <div className="overflow-hidden bg-white shadow sm:rounded-md dark:bg-gray-800">
          <ul role="list" className="divide-y divide-gray-200 dark:divide-gray-700">
            {servers.map((server) => (
              <li key={server.id}>
                <Link
                  href={`/dashboard/servers/${server.id}`}
                  className="block hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  <div className="px-4 py-4 sm:px-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <ServerIcon
                          className="mr-4 h-6 w-6 text-gray-400 dark:text-gray-500"
                          aria-hidden="true"
                        />
                        <p className="truncate text-sm font-medium text-primary-600 dark:text-primary-400">
                          {server.name}
                        </p>
                      </div>
                      <div className="ml-2 flex flex-shrink-0">
                        <p
                          className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${
                            server.status === 'online'
                              ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                              : server.status === 'error'
                              ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
                              : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                          }`}
                        >
                          {server.status}
                        </p>
                      </div>
                    </div>
                    <div className="mt-2 sm:flex sm:justify-between">
                      <div className="sm:flex">
                        <p className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                          {server.description}
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
  );
}
