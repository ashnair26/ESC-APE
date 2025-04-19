'use client';

import { useState, useEffect, FormEvent } from 'react';
import { useParams } from 'next/navigation';
import { useApi } from '@/components/api/useApi';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import Link from 'next/link';
import { ArrowLeftIcon } from '@heroicons/react/20/solid';

// Define interfaces for tool details and parameters (adjust as needed based on actual API response)
interface ToolParameter {
  name: string;
  description?: string;
  type: string; // e.g., 'string', 'number', 'boolean', 'json'
  required?: boolean;
  default?: any;
}

interface ToolDetails {
  name: string;
  description: string;
  parameters: ToolParameter[];
}

export default function ToolExecutionPage() {
  const params = useParams();
  const { client } = useApi();
  const [toolDetails, setToolDetails] = useState<ToolDetails | null>(null);
  const [formValues, setFormValues] = useState<Record<string, any>>({});
  const [result, setResult] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isExecuting, setIsExecuting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [executionError, setExecutionError] = useState<string | null>(null);

  const server = params.server as string;
  const toolName = params.toolName as string;

  useEffect(() => {
    const fetchToolDetails = async () => {
      if (!server || !toolName) return;

      setIsLoading(true);
      setError(null);
      setToolDetails(null); // Reset details on fetch
      setFormValues({}); // Reset form values
      setResult(null); // Reset result
      setExecutionError(null); // Reset execution error

      try {
        const response = await client.listTools(server);
        if (response.success && response.tools) {
          const foundTool = response.tools.find((t: any) => t.name === toolName);
          if (foundTool) {
            // Assuming the API returns parameters in a 'parameters' array
            const details: ToolDetails = {
              name: foundTool.name,
              description: foundTool.description,
              parameters: foundTool.parameters || [], // Adjust based on actual API structure
            };
            setToolDetails(details);
            // Initialize form values with defaults
            const initialValues: Record<string, any> = {};
            details.parameters.forEach(param => {
              if (param.default !== undefined) {
                initialValues[param.name] = param.default;
              } else {
                 // Set default based on type for controlled components
                 initialValues[param.name] = param.type === 'boolean' ? false : '';
              }
            });
            setFormValues(initialValues);
          } else {
            setError(`Tool "${toolName}" not found on server "${server}".`);
          }
        } else {
          setError(response.error || `Failed to fetch tools for server "${server}".`);
        }
      } catch (err: any) {
        console.error('Error fetching tool details:', err);
        setError(err.message || 'An unexpected error occurred while fetching tool details.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchToolDetails();
  }, [client, server, toolName]);

  const handleInputChange = (paramName: string, value: any) => {
    setFormValues(prev => ({ ...prev, [paramName]: value }));
  };

  const handleCheckboxChange = (paramName: string, checked: boolean) => {
    setFormValues(prev => ({ ...prev, [paramName]: checked }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!toolDetails) return;

    setIsExecuting(true);
    setResult(null);
    setExecutionError(null);

    // Prepare arguments, potentially parsing JSON strings
    const args: Record<string, any> = {};
    try {
        toolDetails.parameters.forEach(param => {
            const value = formValues[param.name];
            if (param.type === 'json') {
                if (value && typeof value === 'string') {
                    args[param.name] = JSON.parse(value);
                } else if (value) {
                    args[param.name] = value; // Assume already object/array if not string
                } else if (param.required) {
                    throw new Error(`Parameter "${param.name}" is required and must be valid JSON.`);
                }
            } else if (param.type === 'number') {
                if (value !== '' && value !== null && value !== undefined) {
                    const num = Number(value);
                    if (isNaN(num)) {
                        throw new Error(`Parameter "${param.name}" must be a valid number.`);
                    }
                    args[param.name] = num;
                } else if (param.required) {
                     throw new Error(`Parameter "${param.name}" is required.`);
                }
            } else if (value !== undefined && value !== null && value !== '') {
                args[param.name] = value;
            } else if (param.required) {
                throw new Error(`Parameter "${param.name}" is required.`);
            }
        });

        const response = await client.callTool(server, toolName, args);
        setResult(response); // Store the entire response

    } catch (err: any) {
        console.error('Error executing tool:', err);
        setExecutionError(err.message || 'An unexpected error occurred during execution.');
    } finally {
        setIsExecuting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-md bg-red-50 p-4 dark:bg-red-900/20">
        <h3 className="text-sm font-medium text-red-800 dark:text-red-300">Error Loading Tool</h3>
        <p className="mt-2 text-sm text-red-700 dark:text-red-400">{error}</p>
        <Link href="/dashboard/tools" className="mt-4 inline-flex items-center text-sm font-medium text-primary-600 hover:text-primary-500">
          <ArrowLeftIcon className="mr-1 h-4 w-4" />
          Back to Tools List
        </Link>
      </div>
    );
  }

  if (!toolDetails) {
    // Should ideally be caught by the error state, but as a fallback
    return <div>Tool details not available.</div>;
  }

  return (
    <div>
      <Link href="/dashboard/tools" className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 mb-4">
        <ArrowLeftIcon className="mr-1 h-4 w-4" />
        Back to Tools List
      </Link>

      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{toolDetails.name}</h1>
      <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Server: {server}</p>
      <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">{toolDetails.description}</p>

      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <h2 className="text-lg font-medium text-gray-900 dark:text-white">Parameters</h2>
        {toolDetails.parameters.length === 0 ? (
           <p className="text-sm text-gray-500 dark:text-gray-400">This tool requires no parameters.</p>
        ) : (
          toolDetails.parameters.map((param) => (
            <div key={param.name}>
              <label htmlFor={param.name} className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                {param.name} {param.required && <span className="text-red-500">*</span>}
                {param.description && <span className="ml-2 text-xs text-gray-500 dark:text-gray-400">({param.description})</span>}
              </label>
              {param.type === 'textarea' || param.type === 'json' ? (
                <textarea
                  id={param.name}
                  name={param.name}
                  rows={param.type === 'json' ? 5 : 3}
                  value={formValues[param.name] || ''}
                  onChange={(e) => handleInputChange(param.name, e.target.value)}
                  required={param.required}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white sm:text-sm"
                  placeholder={param.type === 'json' ? 'Enter valid JSON...' : ''}
                />
              ) : param.type === 'boolean' ? (
                 <input
                    id={param.name}
                    name={param.name}
                    type="checkbox"
                    checked={!!formValues[param.name]}
                    onChange={(e) => handleCheckboxChange(param.name, e.target.checked)}
                    className="mt-1 h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500 dark:bg-gray-700 dark:border-gray-600"
                 />
              ) : (
                <input
                  id={param.name}
                  name={param.name}
                  type={param.type === 'number' ? 'number' : 'text'}
                  value={formValues[param.name] || ''}
                  onChange={(e) => handleInputChange(param.name, e.target.value)}
                  required={param.required}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white sm:text-sm"
                />
              )}
            </div>
          ))
        )}

        <button
          type="submit"
          disabled={isExecuting}
          className="inline-flex justify-center rounded-md border border-transparent bg-primary-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50"
        >
          {isExecuting ? <LoadingSpinner size="sm" className="mr-2" /> : null}
          {isExecuting ? 'Executing...' : 'Execute Tool'}
        </button>
      </form>

      {(result || executionError) && (
        <div className="mt-6">
          <h2 className="text-lg font-medium text-gray-900 dark:text-white">Result</h2>
          {executionError ? (
             <div className="mt-2 rounded-md bg-red-50 p-4 dark:bg-red-900/20">
               <p className="text-sm text-red-700 dark:text-red-400">{executionError}</p>
             </div>
          ) : (
            <pre className="mt-2 overflow-x-auto rounded-md bg-gray-100 p-4 text-sm text-gray-800 dark:bg-gray-900 dark:text-gray-200">
              {JSON.stringify(result, null, 2)}
            </pre>
          )}
        </div>
      )}
    </div>
  );
}
