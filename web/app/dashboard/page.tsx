'use client';

import { useState } from 'react';
import DashboardCard from '@/components/dashboard/DashboardCard';
import {
  ServerIcon,
  CommandLineIcon,
  KeyIcon,
  UserCircleIcon,
  ClipboardIcon,
  CheckIcon,
  CogIcon,
} from '@heroicons/react/24/outline';
import Link from 'next/link';

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

// Real server data
const realServers = [
  { id: 'unified', type: 'unified' },
  { id: 'git', type: 'git' },
  { id: 'privy', type: 'privy' },
  { id: 'supabase', type: 'supabase' },
  { id: 'sanity', type: 'sanity' },
  { id: 'base', type: 'base' },
];

export default function DashboardPage() {
  // Real stats
  const [stats, setStats] = useState({
    servers: realServers.length,
    tools: 12,
    secrets: 8,
    users: 1,
  });

  // Mock user data
  const user = {
    id: 'admin-user',
    username: 'admin',
    email: 'admin@escape.io',
    role: 'admin',
    scopes: ['admin:access', 'mcp:access']
  };

  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const handleCopyKey = (key: string, id: string) => {
    navigator.clipboard.writeText(key);
    setCopiedKey(id);
    setTimeout(() => setCopiedKey(null), 2000);
  };

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


    </div>
  );
}
