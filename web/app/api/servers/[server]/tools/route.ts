import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios'; // Using axios for HTTP requests
import { verifyAdminToken } from '@/utils/auth'; // Assuming admin-only access

// Define the known MCP servers and their base URLs (same as in /api/servers/route.ts)
const MCP_SERVERS: Record<string, string> = {
    unified: 'http://localhost:8000',
    git: 'http://localhost:8004',
    privy: 'http://localhost:8005',
    supabase: 'http://localhost:8006',
    sanity: 'http://localhost:8007',
    base: 'http://localhost:8008',
};

interface RouteParams {
    params: {
        server: string;
    };
}

export async function GET(request: NextRequest, { params }: RouteParams) {
    // Optional: Verify user is an authenticated admin
    // const adminData = await verifyAdminToken(request);
    // if (!adminData) {
    //     return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    // }

    const serverName = params.server;

    if (!serverName || !MCP_SERVERS[serverName]) {
        return NextResponse.json(
            { success: false, error: `Unknown MCP server: ${serverName}` },
            { status: 404 }
        );
    }

    const serverUrl = MCP_SERVERS[serverName];
    const toolsUrl = `${serverUrl}/tools`; // Standard MCP endpoint for listing tools

    try {
        console.log(`[API Route] Fetching tools for server '${serverName}' from URL: ${toolsUrl}`);
        const response = await axios.get(toolsUrl, {
            // Add any necessary headers for MCP server auth if required
            // headers: { 'Authorization': 'Bearer YOUR_MCP_TOKEN' },
            timeout: 5000 // Add a timeout
        });

        console.log(`[API Route] Received response status from ${toolsUrl}: ${response.status}`);
        // console.log(`[API Route] Received response data from ${toolsUrl}:`, response.data); // Optional: Log full data if needed

        // Assuming the MCP server returns a list of tool objects directly
        // And the frontend expects { success: true, tools: [...] }
        return NextResponse.json({ success: true, tools: response.data });

    } catch (error: any) {
        console.error(`[API Route] Error fetching tools from ${serverName} (${toolsUrl}):`, error.message);
        if (error.response) {
            // The request was made and the server responded with a status code
            // that falls out of the range of 2xx
            console.error(`[API Route] MCP Server Response Status: ${error.response.status}`);
            console.error(`[API Route] MCP Server Response Data:`, error.response.data);
        } else if (error.request) {
            // The request was made but no response was received
            console.error('[API Route] No response received from MCP server request.');
        } else {
            // Something happened in setting up the request that triggered an Error
            console.error('[API Route] Error setting up request to MCP server:', error.message);
        }

        // Check if it's a connection error
        if (error.code === 'ECONNREFUSED') {
             return NextResponse.json(
                { success: false, error: `Could not connect to ${serverName} server at ${serverUrl}. Is it running?` },
                { status: 503 } // Service Unavailable
            );
        }
        // Check for timeout
        if (error.code === 'ECONNABORTED') {
             return NextResponse.json(
                { success: false, error: `Request to ${serverName} server timed out.` },
                { status: 504 } // Gateway Timeout
            );
        }
        // General error
        return NextResponse.json(
            { success: false, error: `Failed to fetch tools from ${serverName} server.` },
            { status: 500 }
        );
    }
}

// Ensure this route also uses the Node.js runtime as it makes external HTTP requests
export const runtime = 'nodejs';
