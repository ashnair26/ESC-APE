/**
 * Example usage of the authentication flow in the ESCAPE Creator Engine.
 * 
 * This example demonstrates how to use the authentication flow with Privy
 * in a React application.
 */

import React, { useState, useEffect } from 'react';
import { PrivyProvider, usePrivy } from '@privy-io/react-auth';
import { AuthProvider, useAuth } from '../client/useAuth';

/**
 * Example login button component.
 * 
 * @returns {JSX.Element} The login button component.
 */
function LoginButton() {
  const { login } = usePrivy();
  
  return (
    <button onClick={login}>
      Login with Privy
    </button>
  );
}

/**
 * Example authenticated content component.
 * 
 * @returns {JSX.Element} The authenticated content component.
 */
function AuthenticatedContent() {
  const { user, logout, hasRole, hasScope } = useAuth();
  
  return (
    <div>
      <h2>Welcome, {user.username || user.id}!</h2>
      
      <div>
        <h3>User Information</h3>
        <p>ID: {user.id}</p>
        {user.email && <p>Email: {user.email}</p>}
        <p>Role: {user.role}</p>
        <p>Scopes: {user.scopes.join(', ')}</p>
      </div>
      
      <div>
        <h3>Authorization</h3>
        <p>Is Admin: {hasRole('admin') ? 'Yes' : 'No'}</p>
        <p>Can Access MCP: {hasScope('mcp:access') ? 'Yes' : 'No'}</p>
      </div>
      
      <button onClick={logout}>
        Logout
      </button>
    </div>
  );
}

/**
 * Example authentication bridge component.
 * 
 * This component bridges Privy authentication with our custom auth flow.
 * 
 * @returns {JSX.Element} The authentication bridge component.
 */
function AuthBridge() {
  const { ready, authenticated, user, getAccessToken } = usePrivy();
  const { isAuthenticated, verifyPrivyToken } = useAuth();
  const [isVerifying, setIsVerifying] = useState(false);
  
  // When the user authenticates with Privy, verify the token with our auth flow
  useEffect(() => {
    const verifyToken = async () => {
      if (ready && authenticated && !isAuthenticated && !isVerifying) {
        setIsVerifying(true);
        
        try {
          // Get the Privy access token
          const privyToken = await getAccessToken();
          
          // Verify the token with our auth flow
          await verifyPrivyToken(privyToken);
        } catch (error) {
          console.error('Error verifying Privy token:', error);
        } finally {
          setIsVerifying(false);
        }
      }
    };
    
    verifyToken();
  }, [ready, authenticated, isAuthenticated, isVerifying, getAccessToken, verifyPrivyToken]);
  
  if (!ready) {
    return <div>Loading...</div>;
  }
  
  return null;
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
  
  return (
    <div>
      <h1>ESCAPE Creator Engine</h1>
      
      <AuthBridge />
      
      {isAuthenticated ? (
        <AuthenticatedContent />
      ) : (
        <div>
          <p>Please log in to continue.</p>
          <LoginButton />
        </div>
      )}
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
    <PrivyProvider
      appId={process.env.PRIVY_APP_ID}
      config={{
        loginMethods: ['email', 'wallet'],
        appearance: {
          theme: 'light',
          accentColor: '#3B82F6'
        }
      }}
    >
      <AuthProvider
        options={{
          authApiUrl: '/api/auth',
          privyAppId: process.env.PRIVY_APP_ID
        }}
      >
        <App />
      </AuthProvider>
    </PrivyProvider>
  );
}

export default Root;
