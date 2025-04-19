/**
 * Utility functions for checking MCP server status
 */

/**
 * Check if an MCP server is running at the specified URL
 * @param url The URL of the MCP server
 * @returns A promise that resolves to true if the server is running, false otherwise
 */
export async function checkServerStatus(url: string): Promise<boolean> {
  try {
    // Add a timeout to the fetch request to avoid long waits
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2000);
    
    // Try to fetch the server's health endpoint
    const response = await fetch(`${url}/health`, {
      method: 'GET',
      signal: controller.signal,
    });
    
    // Clear the timeout
    clearTimeout(timeoutId);
    
    // If the server responds with a 200 status, it's running
    return response.ok;
  } catch (error) {
    // If there's an error (network error, timeout, etc.), the server is not running
    console.error(`Error checking server status for ${url}:`, error);
    return false;
  }
}

/**
 * Get the tools available on an MCP server
 * @param url The URL of the MCP server
 * @returns A promise that resolves to the number of tools available on the server
 */
export async function getServerTools(url: string): Promise<number> {
  try {
    // Add a timeout to the fetch request to avoid long waits
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2000);
    
    // Try to fetch the server's tools endpoint
    const response = await fetch(`${url}/tools`, {
      method: 'GET',
      signal: controller.signal,
    });
    
    // Clear the timeout
    clearTimeout(timeoutId);
    
    // If the server responds with a 200 status, parse the tools
    if (response.ok) {
      const data = await response.json();
      return Array.isArray(data.tools) ? data.tools.length : 0;
    }
    
    return 0;
  } catch (error) {
    // If there's an error, return 0 tools
    console.error(`Error getting tools for ${url}:`, error);
    return 0;
  }
}

/**
 * Get the last ping time for an MCP server
 * @param url The URL of the MCP server
 * @returns A string representing the last ping time (e.g., "2 minutes ago")
 */
export function getLastPingTime(lastPingTimestamp: number | null): string {
  if (!lastPingTimestamp) {
    return 'Never';
  }
  
  const now = Date.now();
  const diff = now - lastPingTimestamp;
  
  // Convert milliseconds to minutes
  const minutes = Math.floor(diff / 60000);
  
  if (minutes < 1) {
    return 'Just now';
  } else if (minutes === 1) {
    return '1 minute ago';
  } else if (minutes < 60) {
    return `${minutes} minutes ago`;
  } else {
    const hours = Math.floor(minutes / 60);
    if (hours === 1) {
      return '1 hour ago';
    } else if (hours < 24) {
      return `${hours} hours ago`;
    } else {
      const days = Math.floor(hours / 24);
      if (days === 1) {
        return '1 day ago';
      } else {
        return `${days} days ago`;
      }
    }
  }
}
