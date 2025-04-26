'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useApi } from '@/components/api/useApi';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { CommandLineIcon } from '@heroicons/react/24/outline';
import JsonView from '@/components/ui/JsonView';
import ToolForm from '@/components/tools/ToolForm';

interface Tool {
  name: string;
  description: string;
  parameters: any;
}

export default function ToolDetailPage() {
  const params = useParams();
  const router = useRouter();
  const serverId = params.server as string;
  const toolName = params.name as string;
  const { client } = useApi();
  const [tool, setTool] = useState<Tool | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<any>(null);
  const [isExecuting, setIsExecuting] = useState(false);
  const [executionError, setExecutionError] = useState<string | null>(null);

  useEffect(() => {
    const fetchToolDetails = async () => {
      setIsLoading(true);
      setError(null);

      try {
        // Fetch tools for this server
        const toolsResponse = await client.listTools(serverId);
        if (!toolsResponse.success) {
          throw new Error(toolsResponse.error || 'Failed to load tools');
        }

        // Find the specific tool
        const foundTool = (toolsResponse.tools || []).find(
          (t: any) => t.name === toolName
        );

        if (!foundTool) {
          throw new Error(`Tool ${toolName} not found on server ${serverId}`);
        }

        setTool(foundTool);
      } catch (err) {
        console.error(
          `Error fetching tool ${toolName} on server ${serverId}:`,
          err
        );
        setError(`Failed to load tool details: ${err}`);
      } finally {
        setIsLoading(false);
      }
    };

    fetchToolDetails();
  }, [client, serverId, toolName]);

  const executeTool = async (args: any) => {
    setIsExecuting(true);
    setExecutionError(null);
    setResult(null);

    try {
      const response = await client.callTool(serverId, toolName, args);
      setResult(response);
    } catch (err: any) {
      console.error('Error executing tool:', err);
      setExecutionError(err.message || 'Failed to execute tool');
    } finally {
      setIsExecuting(false);
    }
  };

  return (
    <div>
      <div className="mb-8">
        <div className="flex items-center">
          <button
            onClick={() => router.back()}
            className="mr-4 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
          >
            ← Back
          </button>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            {toolName}
          </h1>
        </div>
        {tool && (
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
            {tool.description}
          </p>
        )}
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
              Tool Information
            </h2>
            <div className="mt-4 overflow-hidden rounded-lg bg-white shadow dark:bg-gray-800">
              <div className="px-4 py-5 sm:p-6">
                <dl className="grid grid-cols-1 gap-x-4 gap-y-8 sm:grid-cols-2">
                  <div className="sm:col-span-1">
                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                      Tool Name
                    </dt>
                    <dd className="mt-1 text-sm text-gray-900 dark:text-white">
                      {toolName}
                    </dd>
                  </div>
                  <div className="sm:col-span-1">
                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                      Server
                    </dt>
                    <dd className="mt-1 text-sm text-gray-900 dark:text-white">
                      {serverId}
                    </dd>
                  </div>
                </dl>
              </div>
            </div>
          </div>

          <div className="mb-8">
            <h2 className="text-lg font-medium text-gray-900 dark:text-white">
              Execute Tool
            </h2>
            <div className="mt-4 overflow-hidden rounded-lg bg-white shadow dark:bg-gray-800">
              <div className="px-4 py-5 sm:p-6">
                {tool && (
                  <ToolForm
                    tool={tool}
                    onSubmit={executeTool}
                    isSubmitting={isExecuting}
                  />
                )}

                {executionError && (
                  <div className="mt-4 rounded-md bg-red-50 p-4 dark:bg-red-900/20">
                    <div className="flex">
                      <div className="ml-3">
                        <h3 className="text-sm font-medium text-red-800 dark:text-red-300">
                          Execution Error
                        </h3>
                        <div className="mt-2 text-sm text-red-700 dark:text-red-400">
                          <p>{executionError}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {result && (
                  <div className="mt-6">
                    <h3 className="text-md font-medium text-gray-900 dark:text-white">
                      Result
                    </h3>
                    <div className="mt-2 overflow-hidden rounded-md bg-gray-50 p-4 dark:bg-gray-900">
                      <JsonView data={result} />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
