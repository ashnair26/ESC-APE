#!/usr/bin/env python3
"""
Context7 MCP Server for ESC-APE.

This module provides a Model Context Protocol (MCP) server for Context7,
which provides up-to-date documentation for LLMs and AI code editors.
"""

import os
import json
import logging
import asyncio
import argparse
from typing import Dict, List, Optional, Any, Union

from fastapi import FastAPI, HTTPException, Request, Response
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
)
logger = logging.getLogger("context7-mcp")

# Create FastAPI app
app = FastAPI(
    title="Context7 MCP Server",
    description="Model Context Protocol server for Context7",
    version="0.1.0",
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Define models
class ResolveLibraryIdRequest(BaseModel):
    libraryName: Optional[str] = Field(None, description="Search and rerank results")

class ResolveLibraryIdResponse(BaseModel):
    libraryId: str = Field(..., description="Context7-compatible library ID")

class GetLibraryDocsRequest(BaseModel):
    context7CompatibleLibraryID: str = Field(..., description="Context7-compatible library ID")
    topic: Optional[str] = Field(None, description="Focus the docs on a specific topic (e.g., 'routing', 'hooks')")
    tokens: Optional[int] = Field(5000, description="Max number of tokens to return")

class GetLibraryDocsResponse(BaseModel):
    documentation: str = Field(..., description="Documentation for the library")

# Define MCP tool schemas
TOOLS = [
    {
        "name": "resolve-library-id",
        "description": "Resolves a general library name into a Context7-compatible library ID.",
        "input_schema": {
            "type": "object",
            "properties": {
                "libraryName": {
                    "type": "string",
                    "description": "Search and rerank results"
                }
            },
            "required": []
        }
    },
    {
        "name": "get-library-docs",
        "description": "Fetches documentation for a library using a Context7-compatible library ID.",
        "input_schema": {
            "type": "object",
            "properties": {
                "context7CompatibleLibraryID": {
                    "type": "string",
                    "description": "Context7-compatible library ID"
                },
                "topic": {
                    "type": "string",
                    "description": "Focus the docs on a specific topic (e.g., 'routing', 'hooks')"
                },
                "tokens": {
                    "type": "integer",
                    "description": "Max number of tokens to return",
                    "default": 5000
                }
            },
            "required": ["context7CompatibleLibraryID"]
        }
    }
]

# Mock library data for demonstration purposes
MOCK_LIBRARIES = {
    "react": {
        "id": "react@18.2.0",
        "documentation": "# React Documentation\n\nReact is a JavaScript library for building user interfaces.\n\n## Hooks\n\n### useState\n\n```jsx\nconst [state, setState] = useState(initialState);\n```\n\nReturns a stateful value, and a function to update it.\n\n### useEffect\n\n```jsx\nuseEffect(() => {\n  // Side effects here\n  return () => {\n    // Cleanup function\n  };\n}, [dependencies]);\n```\n\nPerforms side effects in function components.\n\n## Components\n\n```jsx\nfunction Welcome(props) {\n  return <h1>Hello, {props.name}</h1>;\n}\n```\n\nComponents let you split the UI into independent, reusable pieces."
    },
    "next.js": {
        "id": "next@14.0.0",
        "documentation": "# Next.js Documentation\n\nNext.js is a React framework for production.\n\n## Routing\n\n### App Router\n\nThe App Router is a new paradigm for building applications using React's latest features.\n\n```jsx\n// app/page.js\nexport default function Page() {\n  return <h1>Hello, Next.js!</h1>;\n}\n```\n\n### Pages Router\n\nThe Pages Router has been the Next.js router since the beginning.\n\n```jsx\n// pages/index.js\nexport default function Home() {\n  return <h1>Hello, Next.js!</h1>;\n}\n```\n\n## Data Fetching\n\n### Server Components\n\n```jsx\nasync function getData() {\n  const res = await fetch('https://api.example.com/data');\n  return res.json();\n}\n\nexport default async function Page() {\n  const data = await getData();\n  return <main>{data.map(item => <div key={item.id}>{item.name}</div>)}</main>;\n}\n```\n\n### Client Components\n\n```jsx\n'use client';\n\nimport { useState, useEffect } from 'react';\n\nexport default function Page() {\n  const [data, setData] = useState(null);\n\n  useEffect(() => {\n    fetch('https://api.example.com/data')\n      .then(res => res.json())\n      .then(data => setData(data));\n  }, []);\n\n  return <main>{data?.map(item => <div key={item.id}>{item.name}</div>)}</main>;\n}\n```"
    },
    "tailwindcss": {
        "id": "tailwindcss@3.3.0",
        "documentation": "# Tailwind CSS Documentation\n\nTailwind CSS is a utility-first CSS framework.\n\n## Installation\n\n```bash\nnpm install -D tailwindcss\nnpx tailwindcss init\n```\n\n## Configuration\n\n```js\n// tailwind.config.js\nmodule.exports = {\n  content: ['./pages/**/*.{js,ts,jsx,tsx}', './components/**/*.{js,ts,jsx,tsx}'],\n  theme: {\n    extend: {},\n  },\n  plugins: [],\n}\n```\n\n## Utility Classes\n\n### Flexbox\n\n```html\n<div class=\"flex items-center justify-between\">\n  <div>1</div>\n  <div>2</div>\n  <div>3</div>\n</div>\n```\n\n### Grid\n\n```html\n<div class=\"grid grid-cols-3 gap-4\">\n  <div>1</div>\n  <div>2</div>\n  <div>3</div>\n</div>\n```\n\n### Responsive Design\n\n```html\n<div class=\"text-sm md:text-base lg:text-lg\">\n  Responsive text\n</div>\n```"
    }
}

@app.get("/")
async def root():
    """Root endpoint."""
    return {"message": "Context7 MCP Server"}

@app.get("/health")
async def health():
    """Health check endpoint."""
    return {"status": "ok"}

@app.get("/tools")
async def get_tools():
    """Get available tools."""
    return {"tools": TOOLS}

@app.post("/tools/resolve-library-id")
async def resolve_library_id(request: ResolveLibraryIdRequest):
    """Resolve a library name to a Context7-compatible library ID."""
    library_name = request.libraryName or ""
    
    # Simple mock implementation
    if "react" in library_name.lower():
        return {"libraryId": "react@18.2.0"}
    elif "next" in library_name.lower():
        return {"libraryId": "next@14.0.0"}
    elif "tailwind" in library_name.lower():
        return {"libraryId": "tailwindcss@3.3.0"}
    else:
        # Default to React if no match
        return {"libraryId": "react@18.2.0"}

@app.post("/tools/get-library-docs")
async def get_library_docs(request: GetLibraryDocsRequest):
    """Get documentation for a library."""
    library_id = request.context7CompatibleLibraryID
    topic = request.topic
    tokens = request.tokens or 5000
    
    # Extract the library name from the ID (e.g., "react@18.2.0" -> "react")
    library_name = library_id.split("@")[0] if "@" in library_id else library_id
    
    # Find the library in our mock data
    for lib_key, lib_data in MOCK_LIBRARIES.items():
        if lib_key == library_name or lib_data["id"] == library_id:
            docs = lib_data["documentation"]
            
            # Filter by topic if provided
            if topic:
                # Very simple topic filtering for demonstration
                topic_lower = topic.lower()
                lines = docs.split("\n")
                filtered_lines = []
                include_section = False
                
                for line in lines:
                    if line.lower().startswith("## ") or line.lower().startswith("# "):
                        include_section = topic_lower in line.lower()
                    
                    if include_section or topic_lower in line.lower():
                        filtered_lines.append(line)
                
                docs = "\n".join(filtered_lines)
            
            # Truncate to approximate token count (very rough approximation)
            words = docs.split()
            if len(words) > tokens / 0.75:  # Assuming ~0.75 words per token
                words = words[:int(tokens / 0.75)]
                docs = " ".join(words) + "...\n\n[Documentation truncated due to token limit]"
            
            return {"documentation": docs}
    
    # If library not found
    raise HTTPException(status_code=404, detail=f"Library '{library_id}' not found")

def parse_args():
    """Parse command line arguments."""
    parser = argparse.ArgumentParser(description="Context7 MCP Server")
    parser.add_argument(
        "--host", type=str, default="0.0.0.0", help="Host to bind to"
    )
    parser.add_argument(
        "--port", type=int, default=8009, help="Port to bind to"
    )
    return parser.parse_args()

if __name__ == "__main__":
    import uvicorn
    
    args = parse_args()
    uvicorn.run(app, host=args.host, port=args.port)
