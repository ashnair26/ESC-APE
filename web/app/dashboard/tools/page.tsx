'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useApi } from '@/components/api/useApi';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { CommandLineIcon, ServerIcon } from '@heroicons/react/24/outline';

interface Tool {
  id: string;
  name: string;
  description: string;
  server: string;
  serverName: string;
}

export default function ToolsPage() {
  const { client } = useApi();
  const [tools, setTools] = useState<Tool[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTools = async () => {
      setIsLoading(true);
      setError(null);

      try {
        // Fetch servers first
        const servers = await client.listServers();
        const serverIds = Object.keys(servers);

        // Fetch tools for each server
        const allTools: Tool[] = [];
        
        for (const serverId of serverIds) {
          try {
            const toolsResponse = await client.listTools(serverId);
            
            if (toolsResponse.success && toolsResponse.tools) {
              const serverTools = toolsResponse.tools.map((tool: any) => ({
                id: `${serverId}-${tool.name}`,
                name: tool.name,
                description: tool.description,
                server: serverId,
                serverName: serverId.charAt(0).toUpperCase() + serverId.slice(1),
              }));
              
              allTools.push(...serverTools);
            }
          } catch (err) {
            console.error(`Error fetching tools for server ${serverId}:`, err);
            // Continue with other servers
          }
        }

        setTools(allTools);
      } catch (err) {
        console.error('Error fetching tools:', err);
        setError('Failed to load tools');
      } finally {
        setIsLoading(false);
      }
    };

    fetchTools();
  }, [client]);

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          MCP Tools
        </h1>
        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
          View and execute tools from all MCP servers.
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
            {tools.map((tool) => (
              <li key={tool.id}>
                <Link
                  href={`/dashboard/tools/${tool.server}/${tool.name}`}
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
                      <div className="ml-2 flex flex-shrink-0">
                        <div className="flex items-center">
                          <ServerIcon
                            className="mr-1 h-4 w-4 text-gray-400 dark:text-gray-500"
                            aria-hidden="true"
                          />
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {tool.serverName}
                          </p>
                        </div>
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
  );
}
