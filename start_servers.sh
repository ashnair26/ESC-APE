#!/bin/bash

# Set up Python 3.12
export PATH="/opt/homebrew/bin:$PATH"

# Install required packages
pip3 install requests fastapi uvicorn aiohttp mcp

# Start the Context7 and Figma servers
python3 -m uvicorn servers.context7.server:app --host 0.0.0.0 --port 8009 &
python3 -m uvicorn servers.figma.server:app --host 0.0.0.0 --port 8010 &

# Create mock servers for the other MCP servers
# Unified MCP server
python3 -c "
from fastapi import FastAPI
import uvicorn

app = FastAPI()

@app.get('/health')
async def health():
    return {'status': 'ok'}

@app.get('/tools')
async def tools():
    return {'tools': [
        {'name': 'supabase_read', 'description': 'Read data from Supabase'},
        {'name': 'supabase_write', 'description': 'Write data to Supabase'},
        {'name': 'git_clone', 'description': 'Clone a Git repository'},
        {'name': 'git_commit', 'description': 'Commit changes to a Git repository'},
        {'name': 'sanity_fetch', 'description': 'Fetch content from Sanity CMS'},
        {'name': 'privy_auth', 'description': 'Authenticate with Privy'},
        {'name': 'base_mint', 'description': 'Mint an NFT on BASE blockchain'}
    ]}

if __name__ == '__main__':
    uvicorn.run(app, host='0.0.0.0', port=8000)
" &

# Git MCP server
python3 -c "
from fastapi import FastAPI
import uvicorn

app = FastAPI()

@app.get('/health')
async def health():
    return {'status': 'ok'}

@app.get('/tools')
async def tools():
    return {'tools': [
        {'name': 'git_clone', 'description': 'Clone a Git repository'},
        {'name': 'git_commit', 'description': 'Commit changes to a Git repository'}
    ]}

if __name__ == '__main__':
    uvicorn.run(app, host='0.0.0.0', port=8004)
" &

# Privy MCP server
python3 -c "
from fastapi import FastAPI
import uvicorn

app = FastAPI()

@app.get('/health')
async def health():
    return {'status': 'ok'}

@app.get('/tools')
async def tools():
    return {'tools': [
        {'name': 'privy_auth', 'description': 'Authenticate with Privy'},
        {'name': 'privy_user', 'description': 'Get user information from Privy'}
    ]}

if __name__ == '__main__':
    uvicorn.run(app, host='0.0.0.0', port=8005)
" &

# Supabase MCP server
python3 -c "
from fastapi import FastAPI
import uvicorn

app = FastAPI()

@app.get('/health')
async def health():
    return {'status': 'ok'}

@app.get('/tools')
async def tools():
    return {'tools': [
        {'name': 'supabase_read', 'description': 'Read data from Supabase'},
        {'name': 'supabase_write', 'description': 'Write data to Supabase'},
        {'name': 'supabase_query', 'description': 'Execute a SQL query on Supabase'}
    ]}

if __name__ == '__main__':
    uvicorn.run(app, host='0.0.0.0', port=8006)
" &

# Sanity MCP server
python3 -c "
from fastapi import FastAPI
import uvicorn

app = FastAPI()

@app.get('/health')
async def health():
    return {'status': 'ok'}

@app.get('/tools')
async def tools():
    return {'tools': [
        {'name': 'sanity_fetch', 'description': 'Fetch content from Sanity CMS'},
        {'name': 'sanity_create', 'description': 'Create content in Sanity CMS'},
        {'name': 'sanity_update', 'description': 'Update content in Sanity CMS'}
    ]}

if __name__ == '__main__':
    uvicorn.run(app, host='0.0.0.0', port=8007)
" &

# BASE MCP server
python3 -c "
from fastapi import FastAPI
import uvicorn

app = FastAPI()

@app.get('/health')
async def health():
    return {'status': 'ok'}

@app.get('/tools')
async def tools():
    return {'tools': [
        {'name': 'base_mint', 'description': 'Mint an NFT on BASE blockchain'},
        {'name': 'base_transfer', 'description': 'Transfer an NFT on BASE blockchain'}
    ]}

if __name__ == '__main__':
    uvicorn.run(app, host='0.0.0.0', port=8008)
" &

echo "All MCP servers started!"
echo "Press Ctrl+C to stop all servers"

# Wait for user to press Ctrl+C
wait
