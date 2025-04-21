#!/usr/bin/env python3
"""
Context7 client for ESC-APE.

This module provides a client for interacting with the Context7 API.
"""

import os
import json
import logging
import aiohttp
from typing import Dict, List, Optional, Any, Union

logger = logging.getLogger("context7-client")

class Context7Client:
    """Client for interacting with the Context7 API."""

    def __init__(self, base_url: str = "http://localhost:8009"):
        """Initialize the Context7 client.
        
        Args:
            base_url: The base URL of the Context7 MCP server.
        """
        self.base_url = base_url
        self.session = None

    async def __aenter__(self):
        """Enter the async context manager."""
        self.session = aiohttp.ClientSession()
        return self

    async def __aexit__(self, exc_type, exc_val, exc_tb):
        """Exit the async context manager."""
        if self.session:
            await self.session.close()
            self.session = None

    async def resolve_library_id(self, library_name: Optional[str] = None) -> str:
        """Resolve a library name to a Context7-compatible library ID.
        
        Args:
            library_name: The name of the library to resolve.
            
        Returns:
            The Context7-compatible library ID.
        """
        if not self.session:
            self.session = aiohttp.ClientSession()

        url = f"{self.base_url}/tools/resolve-library-id"
        payload = {}
        if library_name:
            payload["libraryName"] = library_name

        async with self.session.post(url, json=payload) as response:
            if response.status != 200:
                error_text = await response.text()
                logger.error(f"Failed to resolve library ID: {error_text}")
                raise Exception(f"Failed to resolve library ID: {error_text}")
            
            data = await response.json()
            return data.get("libraryId", "")

    async def get_library_docs(
        self, 
        library_id: str, 
        topic: Optional[str] = None, 
        tokens: Optional[int] = 5000
    ) -> str:
        """Get documentation for a library.
        
        Args:
            library_id: The Context7-compatible library ID.
            topic: Optional topic to focus the documentation on.
            tokens: Maximum number of tokens to return.
            
        Returns:
            The library documentation.
        """
        if not self.session:
            self.session = aiohttp.ClientSession()

        url = f"{self.base_url}/tools/get-library-docs"
        payload = {
            "context7CompatibleLibraryID": library_id
        }
        if topic:
            payload["topic"] = topic
        if tokens:
            payload["tokens"] = tokens

        async with self.session.post(url, json=payload) as response:
            if response.status != 200:
                error_text = await response.text()
                logger.error(f"Failed to get library docs: {error_text}")
                raise Exception(f"Failed to get library docs: {error_text}")
            
            data = await response.json()
            return data.get("documentation", "")
