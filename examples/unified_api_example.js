/**
 * Example usage of the unified API for the ESCAPE Creator Engine.
 * 
 * This example demonstrates how to use the unified API to interact with
 * the various MCP servers in the ESCAPE Creator Engine.
 */

import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from '../client/useAuth';
import { ApiProvider, useApi, useServers, useTools, useApiRequest } from '../client/useApi';

/**
 * Example component for listing MCP servers.
 * 
 * @returns {JSX.Element} The servers list component.
 */
function ServersList() {
  const { servers, isLoading, error, listServers } = useServers({ autoExecute: true });
  
  if (isLoading) {
    return <div>Loading servers...</div>;
  }
  
  if (error) {
    return (
      <div>
        <p>Error loading servers: {error}</p>
        <button onClick={listServers}>Retry</button>
      </div>
    );
  }
  
  if (!servers) {
    return <div>No servers found.</div>;
  }
  
  return (
    <div>
      <h2>Available MCP Servers</h2>
      <ul>
        {Object.entries(servers).map(([name, description]) => (
          <li key={name}>
            <strong>{name}</strong>: {description}
          </li>
        ))}
      </ul>
    </div>
  );
}

/**
 * Example component for listing tools on an MCP server.
 * 
 * @param {Object} props - The component props.
 * @param {string} props.server - The MCP server to use.
 * @returns {JSX.Element} The tools list component.
 */
function ToolsList({ server }) {
  const { tools, isLoading, error, listTools } = useTools(server, { autoExecute: true });
  
  if (isLoading) {
    return <div>Loading tools...</div>;
  }
  
  if (error) {
    return (
      <div>
        <p>Error loading tools: {error}</p>
        <button onClick={listTools}>Retry</button>
      </div>
    );
  }
  
  if (!tools || tools.length === 0) {
    return <div>No tools found.</div>;
  }
  
  return (
    <div>
      <h2>Tools on {server}</h2>
      <ul>
        {tools.map(tool => (
          <li key={tool.name}>
            <strong>{tool.name}</strong>: {tool.description}
          </li>
        ))}
      </ul>
    </div>
  );
}

/**
 * Example component for calling a tool on an MCP server.
 * 
 * @param {Object} props - The component props.
 * @param {string} props.server - The MCP server to use.
 * @param {string} props.tool - The tool to call.
 * @param {Object} props.args - The arguments to pass to the tool.
 * @returns {JSX.Element} The tool call component.
 */
function ToolCall({ server, tool, args }) {
  const { data, isLoading, error, execute } = useApiRequest(server, tool, args);
  
  useEffect(() => {
    execute();
  }, [execute]);
  
  if (isLoading) {
    return <div>Calling tool...</div>;
  }
  
  if (error) {
    return (
      <div>
        <p>Error calling tool: {error}</p>
        <button onClick={() => execute()}>Retry</button>
      </div>
    );
  }
  
  if (!data) {
    return <div>No result.</div>;
  }
  
  return (
    <div>
      <h2>Result of {tool} on {server}</h2>
      <pre>{JSON.stringify(data, null, 2)}</pre>
    </div>
  );
}

/**
 * Example component for working with Supabase.
 * 
 * @returns {JSX.Element} The Supabase example component.
 */
function SupabaseExample() {
  const { client } = useApi();
  const [result, setResult] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const executeQuery = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Use the Supabase client to execute a query
      const response = await client.callTool('supabase', 'supabase_query', {
        query: 'SELECT * FROM users LIMIT 10'
      });
      
      setResult(response.result);
    } catch (error) {
      setError(error.message || 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div>
      <h2>Supabase Example</h2>
      <button onClick={executeQuery} disabled={isLoading}>
        {isLoading ? 'Executing query...' : 'Execute query'}
      </button>
      
      {error && <p>Error: {error}</p>}
      
      {result && (
        <div>
          <h3>Query Result</h3>
          <pre>{JSON.stringify(result, null, 2)}</pre>
        </div>
      )}
    </div>
  );
}

/**
 * Example component for working with Git.
 * 
 * @returns {JSX.Element} The Git example component.
 */
function GitExample() {
  const { git } = useApi();
  const [result, setResult] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const getStatus = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Use the Git client to get the repository status
      const response = await git.status();
      
      setResult(response.result);
    } catch (error) {
      setError(error.message || 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div>
      <h2>Git Example</h2>
      <button onClick={getStatus} disabled={isLoading}>
        {isLoading ? 'Getting status...' : 'Get repository status'}
      </button>
      
      {error && <p>Error: {error}</p>}
      
      {result && (
        <div>
          <h3>Repository Status</h3>
          <pre>{JSON.stringify(result, null, 2)}</pre>
        </div>
      )}
    </div>
  );
}

/**
 * Example component for working with Privy.
 * 
 * @returns {JSX.Element} The Privy example component.
 */
function PrivyExample() {
  const { privy } = useApi();
  const [userId, setUserId] = useState('');
  const [result, setResult] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const getUser = async () => {
    if (!userId) {
      setError('Please enter a user ID');
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      // Use the Privy client to get a user
      const response = await privy.getUser(userId);
      
      setResult(response.result);
    } catch (error) {
      setError(error.message || 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div>
      <h2>Privy Example</h2>
      <div>
        <input
          type="text"
          value={userId}
          onChange={e => setUserId(e.target.value)}
          placeholder="Enter user ID"
        />
        <button onClick={getUser} disabled={isLoading}>
          {isLoading ? 'Getting user...' : 'Get user'}
        </button>
      </div>
      
      {error && <p>Error: {error}</p>}
      
      {result && (
        <div>
          <h3>User Data</h3>
          <pre>{JSON.stringify(result, null, 2)}</pre>
        </div>
      )}
    </div>
  );
}

/**
 * Example component for working with BASE blockchain.
 * 
 * @returns {JSX.Element} The BASE example component.
 */
function BaseExample() {
  const { base } = useApi();
  const [address, setAddress] = useState('');
  const [result, setResult] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const getBalance = async () => {
    if (!address) {
      setError('Please enter an address');
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      // Use the BASE client to get the balance of an address
      const response = await base.getBalance(address);
      
      setResult(response.result);
    } catch (error) {
      setError(error.message || 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div>
      <h2>BASE Example</h2>
      <div>
        <input
          type="text"
          value={address}
          onChange={e => setAddress(e.target.value)}
          placeholder="Enter address"
        />
        <button onClick={getBalance} disabled={isLoading}>
          {isLoading ? 'Getting balance...' : 'Get balance'}
        </button>
      </div>
      
      {error && <p>Error: {error}</p>}
      
      {result && (
        <div>
          <h3>Balance</h3>
          <pre>{JSON.stringify(result, null, 2)}</pre>
        </div>
      )}
    </div>
  );
}

/**
 * Example application component.
 * 
 * @returns {JSX.Element} The application component.
 */
function App() {
  const { isAuthenticated, isLoading, user, error } = useAuth();
  
  if (isLoading) {
    return <div>Loading...</div>;
  }
  
  if (error) {
    return <div>Error: {error}</div>;
  }
  
  if (!isAuthenticated) {
    return <div>Please log in to use the API.</div>;
  }
  
  return (
    <div>
      <h1>ESCAPE Creator Engine API Example</h1>
      
      <div>
        <h2>Welcome, {user.username || user.id}!</h2>
        <p>You are authenticated and can use the API.</p>
      </div>
      
      <ServersList />
      
      <div style={{ display: 'flex', flexWrap: 'wrap' }}>
        <div style={{ flex: '1 1 50%', padding: '1rem' }}>
          <ToolsList server="unified" />
        </div>
        
        <div style={{ flex: '1 1 50%', padding: '1rem' }}>
          <ToolCall
            server="git"
            tool="git_status_tool"
            args={{ working_dir: "." }}
          />
        </div>
      </div>
      
      <div style={{ display: 'flex', flexWrap: 'wrap' }}>
        <div style={{ flex: '1 1 50%', padding: '1rem' }}>
          <SupabaseExample />
        </div>
        
        <div style={{ flex: '1 1 50%', padding: '1rem' }}>
          <GitExample />
        </div>
      </div>
      
      <div style={{ display: 'flex', flexWrap: 'wrap' }}>
        <div style={{ flex: '1 1 50%', padding: '1rem' }}>
          <PrivyExample />
        </div>
        
        <div style={{ flex: '1 1 50%', padding: '1rem' }}>
          <BaseExample />
        </div>
      </div>
    </div>
  );
}

/**
 * Example root component with providers.
 * 
 * @returns {JSX.Element} The root component.
 */
function Root() {
  return (
    <AuthProvider
      options={{
        authApiUrl: '/api/auth',
        privyAppId: process.env.PRIVY_APP_ID
      }}
    >
      <ApiProvider
        options={{
          apiUrl: '/api'
        }}
      >
        <App />
      </ApiProvider>
    </AuthProvider>
  );
}

export default Root;
