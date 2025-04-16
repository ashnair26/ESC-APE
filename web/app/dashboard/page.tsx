'use client';

import { useState, useEffect } from 'react';
import { useApi } from '@/components/api/useApi';
import { useAuth } from '@/components/auth/useAuth';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import DashboardCard from '@/components/dashboard/DashboardCard';
import {
  ServerIcon,
  CommandLineIcon,
  KeyIcon,
  UserCircleIcon,
} from '@heroicons/react/24/outline';

export default function DashboardPage() {
  const { client } = useApi();
  const { user } = useAuth();
  const [stats, setStats] = useState({
    servers: 0,
    tools: 0,
    secrets: 0,
    users: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      setIsLoading(true);
      setError(null);

      try {
        // Fetch servers
        const servers = await client.listServers();
        const serverCount = Object.keys(servers).length;

        // Fetch tools from the unified server
        const toolsResponse = await client.listTools('unified');
        const toolCount = toolsResponse.tools?.length || 0;

        // Set the stats
        setStats({
          servers: serverCount,
          tools: toolCount,
          secrets: 0, // This would come from a secrets API
          users: 1, // This would come from a users API
        });
      } catch (err) {
        console.error('Error fetching dashboard stats:', err);
        setError('Failed to load dashboard stats');
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, [client]);

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Dashboard
        </h1>
        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
          Welcome to the ESCAPE Creator Engine admin dashboard.
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
        <>
          <div className="mb-8">
            <h2 className="text-lg font-medium text-gray-900 dark:text-white">
              System Overview
            </h2>
            <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <DashboardCard
                title="MCP Servers"
                value={stats.servers.toString()}
                icon={ServerIcon}
                color="primary"
              />
              <DashboardCard
                title="Available Tools"
                value={stats.tools.toString()}
                icon={CommandLineIcon}
                color="secondary"
              />
              <DashboardCard
                title="Secrets"
                value={stats.secrets.toString()}
                icon={KeyIcon}
                color="accent"
              />
              <DashboardCard
                title="Users"
                value={stats.users.toString()}
                icon={UserCircleIcon}
                color="success"
              />
            </div>
          </div>

          <div className="mb-8">
            <h2 className="text-lg font-medium text-gray-900 dark:text-white">
              User Information
            </h2>
            <div className="mt-4 overflow-hidden rounded-lg bg-white shadow dark:bg-gray-800">
              <div className="px-4 py-5 sm:p-6">
                <dl className="grid grid-cols-1 gap-x-4 gap-y-8 sm:grid-cols-2">
                  <div className="sm:col-span-1">
                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                      User ID
                    </dt>
                    <dd className="mt-1 text-sm text-gray-900 dark:text-white">
                      {user?.id}
                    </dd>
                  </div>
                  <div className="sm:col-span-1">
                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                      Username
                    </dt>
                    <dd className="mt-1 text-sm text-gray-900 dark:text-white">
                      {user?.username || 'N/A'}
                    </dd>
                  </div>
                  <div className="sm:col-span-1">
                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                      Email
                    </dt>
                    <dd className="mt-1 text-sm text-gray-900 dark:text-white">
                      {user?.email || 'N/A'}
                    </dd>
                  </div>
                  <div className="sm:col-span-1">
                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                      Role
                    </dt>
                    <dd className="mt-1 text-sm text-gray-900 dark:text-white">
                      {user?.role || 'N/A'}
                    </dd>
                  </div>
                  <div className="sm:col-span-2">
                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                      Scopes
                    </dt>
                    <dd className="mt-1 text-sm text-gray-900 dark:text-white">
                      <div className="flex flex-wrap gap-2">
                        {user?.scopes?.map((scope) => (
                          <span
                            key={scope}
                            className="inline-flex items-center rounded-full bg-primary-100 px-2.5 py-0.5 text-xs font-medium text-primary-800 dark:bg-primary-900 dark:text-primary-300"
                          >
                            {scope}
                          </span>
                        )) || 'N/A'}
                      </div>
                    </dd>
                  </div>
                </dl>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
