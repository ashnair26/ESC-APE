#!/usr/bin/env python3
"""
Adapters for FastAPI-based MCP servers.

This module provides adapters for integrating FastAPI-based MCP servers
with the Unified MCP server.
"""

import os
import json
import logging
import aiohttp
from typing import Dict, List, Optional, Any, Union

logger = logging.getLogger("unified-mcp-adapters")

class FastAPIAdapter:
    """Base adapter for FastAPI-based MCP servers."""

    def __init__(self, base_url: str, server_name: str):
        """Initialize the adapter.
        
        Args:
            base_url: The base URL of the FastAPI server.
            server_name: The name of the server.
        """
        self.base_url = base_url
        self.server_name = server_name
        self.session = None
        self.tools = []

    async def initialize(self):
        """Initialize the adapter."""
        if not self.session:
            self.session = aiohttp.ClientSession()
        
        # Fetch the tools from the server
        await self.fetch_tools()

    async def close(self):
        """Close the adapter."""
        if self.session:
            await self.session.close()
            self.session = None

    async def fetch_tools(self):
        """Fetch the tools from the server."""
        try:
            async with self.session.get(f"{self.base_url}/tools") as response:
                if response.status != 200:
                    error_text = await response.text()
                    logger.error(f"Failed to fetch tools from {self.server_name}: {error_text}")
                    return
                
                data = await response.json()
                self.tools = data.get("tools", [])
                logger.info(f"Fetched {len(self.tools)} tools from {self.server_name}")
        except Exception as e:
            logger.error(f"Error fetching tools from {self.server_name}: {e}")

    async def call_tool(self, tool_name: str, **kwargs):
        """Call a tool on the server.
        
        Args:
            tool_name: The name of the tool to call.
            **kwargs: The arguments to pass to the tool.
            
        Returns:
            The result of the tool call.
        """
        try:
            url = f"{self.base_url}/tools/{tool_name}"
            async with self.session.post(url, json=kwargs) as response:
                if response.status != 200:
                    error_text = await response.text()
                    logger.error(f"Failed to call tool {tool_name} on {self.server_name}: {error_text}")
                    raise Exception(f"Failed to call tool {tool_name}: {error_text}")
                
                return await response.json()
        except Exception as e:
            logger.error(f"Error calling tool {tool_name} on {self.server_name}: {e}")
            raise


class Context7Adapter(FastAPIAdapter):
    """Adapter for the Context7 MCP server."""

    def __init__(self, base_url: str = "http://localhost:8009"):
        """Initialize the adapter.
        
        Args:
            base_url: The base URL of the Context7 server.
        """
        super().__init__(base_url, "Context7")

    async def resolve_library_id(self, libraryName: Optional[str] = None):
        """Resolve a library name to a Context7-compatible library ID.
        
        Args:
            libraryName: The name of the library to resolve.
            
        Returns:
            The Context7-compatible library ID.
        """
        payload = {}
        if libraryName:
            payload["libraryName"] = libraryName
        
        return await self.call_tool("resolve-library-id", **payload)

    async def get_library_docs(self, context7CompatibleLibraryID: str, topic: Optional[str] = None, tokens: Optional[int] = 5000):
        """Get documentation for a library.
        
        Args:
            context7CompatibleLibraryID: The Context7-compatible library ID.
            topic: Optional topic to focus the documentation on.
            tokens: Maximum number of tokens to return.
            
        Returns:
            The library documentation.
        """
        payload = {
            "context7CompatibleLibraryID": context7CompatibleLibraryID
        }
        if topic:
            payload["topic"] = topic
        if tokens:
            payload["tokens"] = tokens
        
        return await self.call_tool("get-library-docs", **payload)


class FigmaAdapter(FastAPIAdapter):
    """Adapter for the Figma MCP server."""

    def __init__(self, base_url: str = "http://localhost:8010"):
        """Initialize the adapter.
        
        Args:
            base_url: The base URL of the Figma server.
        """
        super().__init__(base_url, "Figma")

    async def get_file(self, fileKey: str, accessToken: Optional[str] = None):
        """Get a Figma file by its key.
        
        Args:
            fileKey: The key of the Figma file to retrieve.
            accessToken: Optional Figma access token.
            
        Returns:
            The Figma file data.
        """
        payload = {"fileKey": fileKey}
        if accessToken:
            payload["accessToken"] = accessToken
        
        return await self.call_tool("get-file", **payload)

    async def get_components(self, fileKey: str, accessToken: Optional[str] = None):
        """Get components from a Figma file.
        
        Args:
            fileKey: The key of the Figma file to retrieve components from.
            accessToken: Optional Figma access token.
            
        Returns:
            List of components in the Figma file.
        """
        payload = {"fileKey": fileKey}
        if accessToken:
            payload["accessToken"] = accessToken
        
        return await self.call_tool("get-components", **payload)

    async def get_styles(self, fileKey: str, accessToken: Optional[str] = None):
        """Get styles from a Figma file.
        
        Args:
            fileKey: The key of the Figma file to retrieve styles from.
            accessToken: Optional Figma access token.
            
        Returns:
            List of styles in the Figma file.
        """
        payload = {"fileKey": fileKey}
        if accessToken:
            payload["accessToken"] = accessToken
        
        return await self.call_tool("get-styles", **payload)
