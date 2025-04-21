import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminToken } from '@/utils/auth'; // Assuming admin-only access

// Define the known MCP servers and their base URLs based on mock_servers.py
// In a real scenario, this might come from a dynamic registry or config
const MCP_SERVERS: Record<string, string> = {
    unified: 'http://localhost:8000',
    git: 'http://localhost:8004',
    privy: 'http://localhost:8005',
    supabase: 'http://localhost:8006',
    sanity: 'http://localhost:8007',
    base: 'http://localhost:8008',
    context7: 'http://localhost:8009',
    figma: 'http://localhost:8010',
};

export async function GET(request: NextRequest) {
    // Optional: Verify user is an authenticated admin
    // const adminData = await verifyAdminToken(request);
    // if (!adminData) {
    //     return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    // }

    try {
        // Here we just return the hardcoded list
        // In a more complex system, you might ping each server for health status
        const serverList = Object.keys(MCP_SERVERS).reduce((acc, key) => {
            // Format expected by the frontend ApiProvider might just be the map
             acc[key] = MCP_SERVERS[key];
             return acc;
        }, {} as Record<string, string>);


        return NextResponse.json(serverList); // Return the map directly

    } catch (error) {
        console.error('Error listing MCP servers:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to list MCP servers' },
            { status: 500 }
        );
    }
}

// Ensure this route also uses the Node.js runtime if it needs Node-specific APIs
// export const runtime = 'nodejs'; // Add if needed, but likely not for this simple route
