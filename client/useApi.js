/**
 * React hook for the ESCAPE Creator Engine API.
 * 
 * This hook provides access to the unified API for the ESCAPE Creator Engine.
 */

import { useState, useEffect, useContext, createContext, useCallback } from 'react';
import { useAuth } from './useAuth';
import ApiClient from './api_client';

// Create a context for the API client
const ApiContext = createContext(null);

/**
 * Provider component for the API context.
 * 
 * @param {Object} props - The component props.
 * @param {Object} props.children - The child components.
 * @param {Object} props.apiClient - The API client.
 * @param {Object} props.options - The API options.
 * @returns {JSX.Element} The provider component.
 */
export function ApiProvider({ children, apiClient, options = {} }) {
  const { getToken } = useAuth();
  
  // Create the API client if not provided
  const client = apiClient || new ApiClient({
    ...options,
    getToken,
    onError: options.onError || console.error
  });
  
  // Create the context value
  const value = {
    client,
    supabase: client.supabase(),
    git: client.git(),
    privy: client.privy(),
    base: client.base()
  };
  
  return (
    <ApiContext.Provider value={value}>
      {children}
    </ApiContext.Provider>
  );
}

/**
 * Hook for accessing the API context.
 * 
 * @returns {Object} The API context.
 */
export function useApi() {
  const context = useContext(ApiContext);
  
  if (!context) {
    throw new Error('useApi must be used within an ApiProvider');
  }
  
  return context;
}

/**
 * Hook for making API requests.
 * 
 * @param {string} server - The MCP server to use.
 * @param {string} tool - The tool to call.
 * @param {Object} defaultArgs - The default arguments to pass to the tool.
 * @param {Object} options - Additional options.
 * @returns {Object} The hook result.
 */
export function useApiRequest(server, tool, defaultArgs = {}, options = {}) {
  const { client } = useApi();
  const [state, setState] = useState({
    data: null,
    isLoading: false,
    error: null
  });
  
  // Function to make the request
  const execute = useCallback(async (args = {}) => {
    setState(prevState => ({ ...prevState, isLoading: true, error: null }));
    
    try {
      const mergedArgs = { ...defaultArgs, ...args };
      const response = await client.callTool(server, tool, mergedArgs);
      
      setState({
        data: response.result,
        isLoading: false,
        error: null
      });
      
      return response.result;
    } catch (error) {
      setState({
        data: null,
        isLoading: false,
        error: error.message || 'An error occurred'
      });
      
      throw error;
    }
  }, [client, server, tool, defaultArgs]);
  
  // Make the request on mount if autoExecute is true
  useEffect(() => {
    if (options.autoExecute) {
      execute();
    }
  }, [execute, options.autoExecute]);
  
  return {
    ...state,
    execute
  };
}

/**
 * Hook for listing MCP servers.
 * 
 * @param {Object} options - Additional options.
 * @returns {Object} The hook result.
 */
export function useServers(options = {}) {
  const { client } = useApi();
  const [state, setState] = useState({
    servers: null,
    isLoading: false,
    error: null
  });
  
  // Function to list servers
  const listServers = useCallback(async () => {
    setState(prevState => ({ ...prevState, isLoading: true, error: null }));
    
    try {
      const servers = await client.listServers();
      
      setState({
        servers,
        isLoading: false,
        error: null
      });
      
      return servers;
    } catch (error) {
      setState({
        servers: null,
        isLoading: false,
        error: error.message || 'An error occurred'
      });
      
      throw error;
    }
  }, [client]);
  
  // List servers on mount if autoExecute is true
  useEffect(() => {
    if (options.autoExecute) {
      listServers();
    }
  }, [listServers, options.autoExecute]);
  
  return {
    ...state,
    listServers
  };
}

/**
 * Hook for listing tools on an MCP server.
 * 
 * @param {string} server - The MCP server to use.
 * @param {Object} options - Additional options.
 * @returns {Object} The hook result.
 */
export function useTools(server, options = {}) {
  const { client } = useApi();
  const [state, setState] = useState({
    tools: null,
    isLoading: false,
    error: null
  });
  
  // Function to list tools
  const listTools = useCallback(async () => {
    setState(prevState => ({ ...prevState, isLoading: true, error: null }));
    
    try {
      const response = await client.listTools(server);
      
      setState({
        tools: response.tools,
        isLoading: false,
        error: null
      });
      
      return response.tools;
    } catch (error) {
      setState({
        tools: null,
        isLoading: false,
        error: error.message || 'An error occurred'
      });
      
      throw error;
    }
  }, [client, server]);
  
  // List tools on mount if autoExecute is true
  useEffect(() => {
    if (options.autoExecute) {
      listTools();
    }
  }, [listTools, options.autoExecute]);
  
  return {
    ...state,
    listTools
  };
}

/**
 * Hook for working with Supabase.
 * 
 * @returns {Object} The Supabase client.
 */
export function useSupabase() {
  const { supabase } = useApi();
  return supabase;
}

/**
 * Hook for working with Git.
 * 
 * @returns {Object} The Git client.
 */
export function useGit() {
  const { git } = useApi();
  return git;
}

/**
 * Hook for working with Privy.
 * 
 * @returns {Object} The Privy client.
 */
export function usePrivy() {
  const { privy } = useApi();
  return privy;
}

/**
 * Hook for working with BASE blockchain.
 * 
 * @returns {Object} The BASE client.
 */
export function useBase() {
  const { base } = useApi();
  return base;
}

export default useApi;
