/**
 * Authentication client for the ESCAPE Creator Engine.
 * 
 * This client provides methods for authenticating with the ESCAPE Creator Engine
 * using Privy and managing JWT tokens.
 */

class AuthClient {
  /**
   * Create a new AuthClient.
   * 
   * @param {Object} options - The client options.
   * @param {string} options.authApiUrl - The URL of the authentication API.
   * @param {string} options.privyAppId - The Privy app ID.
   * @param {Function} options.onAuthStateChanged - Callback for auth state changes.
   */
  constructor(options = {}) {
    this.authApiUrl = options.authApiUrl || process.env.AUTH_API_URL || '/api/auth';
    this.privyAppId = options.privyAppId || process.env.PRIVY_APP_ID;
    this.onAuthStateChanged = options.onAuthStateChanged || (() => {});
    
    // Initialize state
    this.user = null;
    this.token = null;
    this.refreshToken = null;
    this.expiresAt = null;
    
    // Check if we're in a browser environment
    this.isBrowser = typeof window !== 'undefined';
    
    // Initialize Privy if we're in a browser
    if (this.isBrowser && this.privyAppId) {
      this._initializePrivy();
    }
    
    // Check for existing session
    this._checkSession();
  }
  
  /**
   * Initialize Privy.
   * 
   * @private
   */
  _initializePrivy() {
    // This is a placeholder for initializing Privy
    // In a real implementation, you would use the Privy SDK
    console.log('Initializing Privy with app ID:', this.privyAppId);
  }
  
  /**
   * Check for an existing session.
   * 
   * @private
   */
  async _checkSession() {
    try {
      // Try to get the user from the server
      const response = await fetch(`${this.authApiUrl}/user`, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        
        if (data.success && data.user) {
          this.user = data.user;
          this._notifyAuthStateChanged();
        }
      }
    } catch (error) {
      console.error('Error checking session:', error);
    }
  }
  
  /**
   * Notify that the authentication state has changed.
   * 
   * @private
   */
  _notifyAuthStateChanged() {
    if (this.onAuthStateChanged) {
      this.onAuthStateChanged({
        user: this.user,
        isAuthenticated: !!this.user
      });
    }
  }
  
  /**
   * Verify a Privy authentication token.
   * 
   * @param {string} privyToken - The Privy authentication token.
   * @returns {Promise<Object>} The authentication result.
   */
  async verifyPrivyToken(privyToken) {
    try {
      const response = await fetch(`${this.authApiUrl}/verify`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ token: privyToken })
      });
      
      const data = await response.json();
      
      if (data.success) {
        this.user = data.user;
        this.token = data.token;
        this.refreshToken = data.refresh_token;
        
        if (data.expires_in) {
          this.expiresAt = Date.now() + (data.expires_in * 1000);
        }
        
        this._notifyAuthStateChanged();
      }
      
      return data;
    } catch (error) {
      console.error('Error verifying Privy token:', error);
      return { success: false, error: error.message };
    }
  }
  
  /**
   * Refresh the JWT token.
   * 
   * @returns {Promise<Object>} The refresh result.
   */
  async refreshToken() {
    try {
      const response = await fetch(`${this.authApiUrl}/refresh`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ refresh_token: this.refreshToken })
      });
      
      const data = await response.json();
      
      if (data.success) {
        this.user = data.user;
        this.token = data.token;
        
        if (data.expires_in) {
          this.expiresAt = Date.now() + (data.expires_in * 1000);
        }
        
        this._notifyAuthStateChanged();
      }
      
      return data;
    } catch (error) {
      console.error('Error refreshing token:', error);
      return { success: false, error: error.message };
    }
  }
  
  /**
   * Log out the current user.
   * 
   * @returns {Promise<Object>} The logout result.
   */
  async logout() {
    try {
      const response = await fetch(`${this.authApiUrl}/logout`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ refresh_token: this.refreshToken })
      });
      
      const data = await response.json();
      
      // Clear the local state regardless of the server response
      this.user = null;
      this.token = null;
      this.refreshToken = null;
      this.expiresAt = null;
      
      this._notifyAuthStateChanged();
      
      return data;
    } catch (error) {
      console.error('Error logging out:', error);
      
      // Clear the local state even if the server request fails
      this.user = null;
      this.token = null;
      this.refreshToken = null;
      this.expiresAt = null;
      
      this._notifyAuthStateChanged();
      
      return { success: false, error: error.message };
    }
  }
  
  /**
   * Get the current user.
   * 
   * @returns {Object|null} The current user or null if not authenticated.
   */
  getUser() {
    return this.user;
  }
  
  /**
   * Check if the user is authenticated.
   * 
   * @returns {boolean} True if the user is authenticated, false otherwise.
   */
  isAuthenticated() {
    return !!this.user;
  }
  
  /**
   * Get the JWT token.
   * 
   * @returns {string|null} The JWT token or null if not authenticated.
   */
  getToken() {
    // Check if the token has expired
    if (this.expiresAt && Date.now() >= this.expiresAt) {
      // Try to refresh the token
      this.refreshToken();
      return null;
    }
    
    return this.token;
  }
  
  /**
   * Check if the user has a specific role.
   * 
   * @param {string} role - The role to check.
   * @returns {boolean} True if the user has the role, false otherwise.
   */
  hasRole(role) {
    return this.user && this.user.role === role;
  }
  
  /**
   * Check if the user has a specific scope.
   * 
   * @param {string} scope - The scope to check.
   * @returns {boolean} True if the user has the scope, false otherwise.
   */
  hasScope(scope) {
    return this.user && this.user.scopes && (
      this.user.scopes.includes(scope) || this.user.scopes.includes('*')
    );
  }
}

// Export the AuthClient
export default AuthClient;
