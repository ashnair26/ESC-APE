/**
 * React hook for authentication in the ESCAPE Creator Engine.
 * 
 * This hook provides authentication state and methods for authenticating
 * with the ESCAPE Creator Engine using Privy.
 */

import { useState, useEffect, useContext, createContext } from 'react';
import AuthClient from './auth_client';

// Create a context for the authentication state
const AuthContext = createContext(null);

/**
 * Provider component for the authentication context.
 * 
 * @param {Object} props - The component props.
 * @param {Object} props.children - The child components.
 * @param {Object} props.authClient - The authentication client.
 * @param {Object} props.options - The authentication options.
 * @returns {JSX.Element} The provider component.
 */
export function AuthProvider({ children, authClient, options = {} }) {
  const [state, setState] = useState({
    isAuthenticated: false,
    isLoading: true,
    user: null,
    error: null
  });
  
  // Create the auth client if not provided
  const client = authClient || new AuthClient({
    ...options,
    onAuthStateChanged: ({ user, isAuthenticated }) => {
      setState(prevState => ({
        ...prevState,
        isAuthenticated,
        user,
        isLoading: false
      }));
    }
  });
  
  // Define authentication methods
  const verifyPrivyToken = async (privyToken) => {
    setState(prevState => ({ ...prevState, isLoading: true, error: null }));
    
    try {
      const result = await client.verifyPrivyToken(privyToken);
      
      if (!result.success) {
        setState(prevState => ({
          ...prevState,
          isLoading: false,
          error: result.error
        }));
      }
      
      return result;
    } catch (error) {
      setState(prevState => ({
        ...prevState,
        isLoading: false,
        error: error.message
      }));
      
      return { success: false, error: error.message };
    }
  };
  
  const logout = async () => {
    setState(prevState => ({ ...prevState, isLoading: true, error: null }));
    
    try {
      const result = await client.logout();
      
      if (!result.success) {
        setState(prevState => ({
          ...prevState,
          isLoading: false,
          error: result.error
        }));
      }
      
      return result;
    } catch (error) {
      setState(prevState => ({
        ...prevState,
        isLoading: false,
        error: error.message
      }));
      
      return { success: false, error: error.message };
    }
  };
  
  // Check for an existing session on mount
  useEffect(() => {
    // The client will check for an existing session in its constructor
    setState(prevState => ({
      ...prevState,
      isLoading: false,
      isAuthenticated: client.isAuthenticated(),
      user: client.getUser()
    }));
  }, []);
  
  // Create the context value
  const value = {
    ...state,
    verifyPrivyToken,
    logout,
    hasRole: (role) => client.hasRole(role),
    hasScope: (scope) => client.hasScope(scope),
    getToken: () => client.getToken()
  };
  
  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

/**
 * Hook for accessing the authentication context.
 * 
 * @returns {Object} The authentication context.
 */
export function useAuth() {
  const context = useContext(AuthContext);
  
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
}

export default useAuth;
