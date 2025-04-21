#!/usr/bin/env python3
"""
Figma MCP Server for ESC-APE.

This module provides a Model Context Protocol (MCP) server for Figma,
which allows access to Figma files, components, and styles.
"""

import os
import json
import logging
import asyncio
import argparse
from typing import Dict, List, Optional, Any, Union
from pathlib import Path

from fastapi import FastAPI, HTTPException, Request, Response
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
)
logger = logging.getLogger("figma-mcp")

# Create FastAPI app
app = FastAPI(
    title="Figma MCP Server",
    description="Model Context Protocol server for Figma",
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
class GetFileRequest(BaseModel):
    fileKey: str = Field(..., description="The key of the Figma file to retrieve")
    accessToken: Optional[str] = Field(None, description="Figma access token")

class GetFileResponse(BaseModel):
    document: Dict = Field(..., description="The Figma document")
    name: str = Field(..., description="The name of the Figma file")

class GetComponentsRequest(BaseModel):
    fileKey: str = Field(..., description="The key of the Figma file to retrieve components from")
    accessToken: Optional[str] = Field(None, description="Figma access token")

class GetComponentsResponse(BaseModel):
    components: List[Dict] = Field(..., description="List of components in the Figma file")

class GetStylesRequest(BaseModel):
    fileKey: str = Field(..., description="The key of the Figma file to retrieve styles from")
    accessToken: Optional[str] = Field(None, description="Figma access token")

class GetStylesResponse(BaseModel):
    styles: List[Dict] = Field(..., description="List of styles in the Figma file")

# Define MCP tool schemas
TOOLS = [
    {
        "name": "get-file",
        "description": "Retrieves a Figma file by its key.",
        "input_schema": {
            "type": "object",
            "properties": {
                "fileKey": {
                    "type": "string",
                    "description": "The key of the Figma file to retrieve"
                },
                "accessToken": {
                    "type": "string",
                    "description": "Figma access token"
                }
            },
            "required": ["fileKey"]
        }
    },
    {
        "name": "get-components",
        "description": "Retrieves components from a Figma file.",
        "input_schema": {
            "type": "object",
            "properties": {
                "fileKey": {
                    "type": "string",
                    "description": "The key of the Figma file to retrieve components from"
                },
                "accessToken": {
                    "type": "string",
                    "description": "Figma access token"
                }
            },
            "required": ["fileKey"]
        }
    },
    {
        "name": "get-styles",
        "description": "Retrieves styles from a Figma file.",
        "input_schema": {
            "type": "object",
            "properties": {
                "fileKey": {
                    "type": "string",
                    "description": "The key of the Figma file to retrieve styles from"
                },
                "accessToken": {
                    "type": "string",
                    "description": "Figma access token"
                }
            },
            "required": ["fileKey"]
        }
    }
]

# Mock Figma data for demonstration purposes
MOCK_FILES = {
    "esc-ape-design": {
        "name": "ESC-APE Design System",
        "document": {
            "id": "0:0",
            "name": "Document",
            "type": "DOCUMENT",
            "children": [
                {
                    "id": "1:0",
                    "name": "Page 1",
                    "type": "CANVAS",
                    "children": [
                        {
                            "id": "2:0",
                            "name": "Frame 1",
                            "type": "FRAME",
                            "children": []
                        }
                    ]
                }
            ]
        }
    },
    "esc-ape-components": {
        "name": "ESC-APE Components",
        "document": {
            "id": "0:1",
            "name": "Document",
            "type": "DOCUMENT",
            "children": [
                {
                    "id": "1:1",
                    "name": "Components",
                    "type": "CANVAS",
                    "children": [
                        {
                            "id": "2:1",
                            "name": "Button",
                            "type": "COMPONENT",
                            "description": "Primary button component"
                        },
                        {
                            "id": "2:2",
                            "name": "Card",
                            "type": "COMPONENT",
                            "description": "Card component for displaying content"
                        },
                        {
                            "id": "2:3",
                            "name": "Input",
                            "type": "COMPONENT",
                            "description": "Input field component"
                        }
                    ]
                }
            ]
        }
    },
    "esc-ape-styles": {
        "name": "ESC-APE Styles",
        "document": {
            "id": "0:2",
            "name": "Document",
            "type": "DOCUMENT",
            "children": [
                {
                    "id": "1:2",
                    "name": "Styles",
                    "type": "CANVAS",
                    "children": []
                }
            ]
        }
    }
}

MOCK_COMPONENTS = {
    "esc-ape-design": [],
    "esc-ape-components": [
        {
            "id": "2:1",
            "name": "Button",
            "type": "COMPONENT",
            "description": "Primary button component",
            "key": "button",
            "styles": {
                "fill": "#C20023",
                "text": "white",
                "borderRadius": "4px"
            }
        },
        {
            "id": "2:2",
            "name": "Card",
            "type": "COMPONENT",
            "description": "Card component for displaying content",
            "key": "card",
            "styles": {
                "fill": "#181818",
                "stroke": "#333333",
                "borderRadius": "8px"
            }
        },
        {
            "id": "2:3",
            "name": "Input",
            "type": "COMPONENT",
            "description": "Input field component",
            "key": "input",
            "styles": {
                "fill": "#222222",
                "stroke": "#444444",
                "borderRadius": "4px"
            }
        }
    ],
    "esc-ape-styles": []
}

MOCK_STYLES = {
    "esc-ape-design": [],
    "esc-ape-components": [],
    "esc-ape-styles": [
        {
            "id": "S:1",
            "name": "Primary",
            "type": "FILL",
            "description": "Primary color",
            "key": "primary",
            "value": "#C20023"
        },
        {
            "id": "S:2",
            "name": "Secondary",
            "type": "FILL",
            "description": "Secondary color",
            "key": "secondary",
            "value": "#181818"
        },
        {
            "id": "S:3",
            "name": "Accent",
            "type": "FILL",
            "description": "Accent color",
            "key": "accent",
            "value": "#FBBF24"
        },
        {
            "id": "S:4",
            "name": "Text Primary",
            "type": "TEXT",
            "description": "Primary text color",
            "key": "text-primary",
            "value": "#FFFFFF"
        },
        {
            "id": "S:5",
            "name": "Text Secondary",
            "type": "TEXT",
            "description": "Secondary text color",
            "key": "text-secondary",
            "value": "#AAAAAA"
        }
    ]
}

@app.get("/")
async def root():
    """Root endpoint."""
    return {"message": "Figma MCP Server"}

@app.get("/health")
async def health():
    """Health check endpoint."""
    return {"status": "ok"}

@app.get("/tools")
async def get_tools():
    """Get available tools."""
    return {"tools": TOOLS}

@app.post("/tools/get-file")
async def get_file(request: GetFileRequest):
    """Get a Figma file by its key."""
    file_key = request.fileKey
    
    # In a real implementation, we would use the Figma API to get the file
    # For now, we'll use mock data
    if file_key in MOCK_FILES:
        return {
            "document": MOCK_FILES[file_key]["document"],
            "name": MOCK_FILES[file_key]["name"]
        }
    else:
        # Try to find a file that contains the file_key
        for key, file_data in MOCK_FILES.items():
            if file_key.lower() in key.lower():
                return {
                    "document": file_data["document"],
                    "name": file_data["name"]
                }
        
        # If no file is found, return a 404
        raise HTTPException(status_code=404, detail=f"File '{file_key}' not found")

@app.post("/tools/get-components")
async def get_components(request: GetComponentsRequest):
    """Get components from a Figma file."""
    file_key = request.fileKey
    
    # In a real implementation, we would use the Figma API to get the components
    # For now, we'll use mock data
    if file_key in MOCK_COMPONENTS:
        return {"components": MOCK_COMPONENTS[file_key]}
    else:
        # Try to find a file that contains the file_key
        for key, components in MOCK_COMPONENTS.items():
            if file_key.lower() in key.lower():
                return {"components": components}
        
        # If no file is found, return a 404
        raise HTTPException(status_code=404, detail=f"Components for file '{file_key}' not found")

@app.post("/tools/get-styles")
async def get_styles(request: GetStylesRequest):
    """Get styles from a Figma file."""
    file_key = request.fileKey
    
    # In a real implementation, we would use the Figma API to get the styles
    # For now, we'll use mock data
    if file_key in MOCK_STYLES:
        return {"styles": MOCK_STYLES[file_key]}
    else:
        # Try to find a file that contains the file_key
        for key, styles in MOCK_STYLES.items():
            if file_key.lower() in key.lower():
                return {"styles": styles}
        
        # If no file is found, return a 404
        raise HTTPException(status_code=404, detail=f"Styles for file '{file_key}' not found")

def parse_args():
    """Parse command line arguments."""
    parser = argparse.ArgumentParser(description="Figma MCP Server")
    parser.add_argument(
        "--host", type=str, default="0.0.0.0", help="Host to bind to"
    )
    parser.add_argument(
        "--port", type=int, default=8010, help="Port to bind to"
    )
    return parser.parse_args()

if __name__ == "__main__":
    import uvicorn
    
    args = parse_args()
    uvicorn.run(app, host=args.host, port=args.port)
