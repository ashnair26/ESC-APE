/**
 * API client for the ESCAPE Creator Engine.
 * 
 * This client provides methods for interacting with the ESCAPE Creator Engine
 * through the unified API.
 */

class ApiClient {
  /**
   * Create a new ApiClient.
   * 
   * @param {Object} options - The client options.
   * @param {string} options.apiUrl - The URL of the unified API.
   * @param {Function} options.getToken - Function that returns the JWT token.
   * @param {Function} options.onError - Callback for API errors.
   */
  constructor(options = {}) {
    this.apiUrl = options.apiUrl || process.env.API_URL || '/api';
    this.getToken = options.getToken || (() => null);
    this.onError = options.onError || console.error;
  }
  
  /**
   * Make an API request.
   * 
   * @param {string} method - The HTTP method.
   * @param {string} path - The API path.
   * @param {Object} data - The request data.
   * @param {Object} options - Additional options.
   * @returns {Promise<Object>} The response data.
   */
  async request(method, path, data = null, options = {}) {
    const url = `${this.apiUrl}${path}`;
    
    // Get the JWT token
    const token = this.getToken();
    
    // Set up the request options
    const requestOptions = {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      },
      credentials: 'include',
      ...options
    };
    
    // Add the authorization header if we have a token
    if (token) {
      requestOptions.headers.Authorization = `Bearer ${token}`;
    }
    
    // Add the request body if we have data
    if (data) {
      requestOptions.body = JSON.stringify(data);
    }
    
    try {
      // Make the request
      const response = await fetch(url, requestOptions);
      
      // Parse the response
      const responseData = await response.json();
      
      // Check if the response is an error
      if (!response.ok) {
        const error = new Error(responseData.detail || 'API request failed');
        error.status = response.status;
        error.data = responseData;
        throw error;
      }
      
      return responseData;
    } catch (error) {
      // Call the error handler
      this.onError(error);
      
      // Re-throw the error
      throw error;
    }
  }
  
  /**
   * List all available MCP servers.
   * 
   * @returns {Promise<Object>} The list of servers.
   */
  async listServers() {
    return this.request('GET', '/servers');
  }
  
  /**
   * List all tools available on the specified MCP server.
   * 
   * @param {string} server - The name of the MCP server.
   * @returns {Promise<Object>} The list of tools.
   */
  async listTools(server) {
    return this.request('GET', `/servers/${server}/tools`);
  }
  
  /**
   * Call a tool on the specified MCP server.
   * 
   * @param {string} server - The name of the MCP server.
   * @param {string} tool - The name of the tool to call.
   * @param {Object} arguments - The arguments to pass to the tool.
   * @returns {Promise<Object>} The tool call response.
   */
  async callTool(server, tool, arguments = {}) {
    return this.request('POST', `/servers/${server}/tools/${tool}`, arguments);
  }
  
  /**
   * Call a tool on any MCP server.
   * 
   * @param {Object} request - The tool call request.
   * @param {string} request.server - The name of the MCP server.
   * @param {string} request.tool - The name of the tool to call.
   * @param {Object} request.arguments - The arguments to pass to the tool.
   * @returns {Promise<Object>} The tool call response.
   */
  async callToolUnified(request) {
    return this.request('POST', '/tools', request);
  }
  
  /**
   * Get the current user.
   * 
   * @returns {Promise<Object>} The user data.
   */
  async getUser() {
    return this.request('GET', '/auth/user');
  }
  
  /**
   * Verify a Privy authentication token.
   * 
   * @param {string} token - The Privy authentication token.
   * @returns {Promise<Object>} The authentication response.
   */
  async verifyToken(token) {
    return this.request('POST', '/auth/verify', { token });
  }
  
  /**
   * Refresh the JWT token.
   * 
   * @param {string} refreshToken - The refresh token.
   * @returns {Promise<Object>} The refresh response.
   */
  async refreshToken(refreshToken) {
    return this.request('POST', '/auth/refresh', { refresh_token: refreshToken });
  }
  
  /**
   * Log out the current user.
   * 
   * @param {string} refreshToken - The refresh token.
   * @returns {Promise<Object>} The logout response.
   */
  async logout(refreshToken) {
    return this.request('POST', '/auth/logout', { refresh_token: refreshToken });
  }
  
  /**
   * Create a Supabase client instance.
   * 
   * @returns {Object} The Supabase client.
   */
  supabase() {
    return {
      /**
       * Execute a query on the Supabase database.
       * 
       * @param {string} query - The SQL query to execute.
       * @param {Object} params - The query parameters.
       * @returns {Promise<Object>} The query result.
       */
      query: async (query, params = {}) => {
        return this.callTool('supabase', 'supabase_query', { query, params });
      },
      
      /**
       * Get data from a Supabase table.
       * 
       * @param {string} table - The table name.
       * @param {Object} options - The query options.
       * @returns {Promise<Object>} The query result.
       */
      from: (table) => ({
        /**
         * Select columns from the table.
         * 
         * @param {string} columns - The columns to select.
         * @returns {Object} The query builder.
         */
        select: (columns = '*') => ({
          /**
           * Filter the results.
           * 
           * @param {string} column - The column to filter on.
           * @param {string} operator - The filter operator.
           * @param {any} value - The filter value.
           * @returns {Object} The query builder.
           */
          filter: (column, operator, value) => ({
            /**
             * Execute the query.
             * 
             * @returns {Promise<Object>} The query result.
             */
            execute: async () => {
              return this.callTool('supabase', 'supabase_select', {
                table,
                columns,
                filter: { column, operator, value }
              });
            }
          }),
          
          /**
           * Execute the query.
           * 
           * @returns {Promise<Object>} The query result.
           */
          execute: async () => {
            return this.callTool('supabase', 'supabase_select', {
              table,
              columns
            });
          }
        }),
        
        /**
         * Insert data into the table.
         * 
         * @param {Object} data - The data to insert.
         * @returns {Promise<Object>} The insert result.
         */
        insert: async (data) => {
          return this.callTool('supabase', 'supabase_insert', {
            table,
            data
          });
        },
        
        /**
         * Update data in the table.
         * 
         * @param {Object} data - The data to update.
         * @param {Object} filter - The filter to apply.
         * @returns {Promise<Object>} The update result.
         */
        update: async (data, filter) => {
          return this.callTool('supabase', 'supabase_update', {
            table,
            data,
            filter
          });
        },
        
        /**
         * Delete data from the table.
         * 
         * @param {Object} filter - The filter to apply.
         * @returns {Promise<Object>} The delete result.
         */
        delete: async (filter) => {
          return this.callTool('supabase', 'supabase_delete', {
            table,
            filter
          });
        }
      })
    };
  }
  
  /**
   * Create a Git client instance.
   * 
   * @returns {Object} The Git client.
   */
  git() {
    return {
      /**
       * Get the status of the Git repository.
       * 
       * @param {string} workingDir - The working directory.
       * @returns {Promise<Object>} The status result.
       */
      status: async (workingDir) => {
        return this.callTool('git', 'git_status_tool', { working_dir: workingDir });
      },
      
      /**
       * Add files to the Git staging area.
       * 
       * @param {string} paths - The paths to add.
       * @param {string} workingDir - The working directory.
       * @returns {Promise<Object>} The add result.
       */
      add: async (paths, workingDir) => {
        return this.callTool('git', 'git_add_tool', { paths, working_dir: workingDir });
      },
      
      /**
       * Commit changes to the Git repository.
       * 
       * @param {string} message - The commit message.
       * @param {string} author - The commit author.
       * @param {string} workingDir - The working directory.
       * @returns {Promise<Object>} The commit result.
       */
      commit: async (message, author, workingDir) => {
        return this.callTool('git', 'git_commit_tool', {
          message,
          author,
          working_dir: workingDir
        });
      },
      
      /**
       * Push changes to a remote Git repository.
       * 
       * @param {string} remote - The remote name.
       * @param {string} branch - The branch name.
       * @param {string} workingDir - The working directory.
       * @returns {Promise<Object>} The push result.
       */
      push: async (remote, branch, workingDir) => {
        return this.callTool('git', 'git_push_tool', {
          remote,
          branch,
          working_dir: workingDir
        });
      }
    };
  }
  
  /**
   * Create a Privy client instance.
   * 
   * @returns {Object} The Privy client.
   */
  privy() {
    return {
      /**
       * Verify a Privy authentication token.
       * 
       * @param {string} token - The token to verify.
       * @param {string} creatorId - The creator ID.
       * @returns {Promise<Object>} The verification result.
       */
      verifyToken: async (token, creatorId) => {
        return this.callTool('privy', 'privy_verify_token', {
          token,
          creator_id: creatorId
        });
      },
      
      /**
       * Get a user by ID.
       * 
       * @param {string} userId - The user ID.
       * @param {string} creatorId - The creator ID.
       * @returns {Promise<Object>} The user data.
       */
      getUser: async (userId, creatorId) => {
        return this.callTool('privy', 'privy_get_user', {
          user_id: userId,
          creator_id: creatorId
        });
      },
      
      /**
       * List users.
       * 
       * @param {number} limit - The maximum number of users to return.
       * @param {string} cursor - The cursor for pagination.
       * @param {string} creatorId - The creator ID.
       * @returns {Promise<Object>} The users data.
       */
      listUsers: async (limit, cursor, creatorId) => {
        return this.callTool('privy', 'privy_list_users', {
          limit,
          cursor,
          creator_id: creatorId
        });
      }
    };
  }
  
  /**
   * Create a BASE blockchain client instance.
   * 
   * @returns {Object} The BASE client.
   */
  base() {
    return {
      /**
       * Get the balance of an address.
       * 
       * @param {string} address - The address to check.
       * @param {string} creatorId - The creator ID.
       * @returns {Promise<Object>} The balance data.
       */
      getBalance: async (address, creatorId) => {
        return this.callTool('base', 'base_get_balance', {
          address,
          creator_id: creatorId
        });
      },
      
      /**
       * Get a transaction by hash.
       * 
       * @param {string} txHash - The transaction hash.
       * @param {string} creatorId - The creator ID.
       * @returns {Promise<Object>} The transaction data.
       */
      getTransaction: async (txHash, creatorId) => {
        return this.callTool('base', 'base_get_transaction', {
          tx_hash: txHash,
          creator_id: creatorId
        });
      }
    };
  }
}

// Export the ApiClient
export default ApiClient;
