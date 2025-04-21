#!/usr/bin/env python3
"""
Figma client for ESC-APE.

This module provides a client for interacting with the Figma API.
"""

import os
import json
import logging
import aiohttp
from typing import Dict, List, Optional, Any, Union

logger = logging.getLogger("figma-client")

class FigmaClient:
    """Client for interacting with the Figma API."""

    def __init__(self, base_url: str = "http://localhost:8010"):
        """Initialize the Figma client.
        
        Args:
            base_url: The base URL of the Figma MCP server.
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

    async def get_file(self, file_key: str, access_token: Optional[str] = None) -> Dict:
        """Get a Figma file by its key.
        
        Args:
            file_key: The key of the Figma file to retrieve.
            access_token: Optional Figma access token.
            
        Returns:
            The Figma file data.
        """
        if not self.session:
            self.session = aiohttp.ClientSession()

        url = f"{self.base_url}/tools/get-file"
        payload = {"fileKey": file_key}
        if access_token:
            payload["accessToken"] = access_token

        async with self.session.post(url, json=payload) as response:
            if response.status != 200:
                error_text = await response.text()
                logger.error(f"Failed to get Figma file: {error_text}")
                raise Exception(f"Failed to get Figma file: {error_text}")
            
            data = await response.json()
            return data

    async def get_components(self, file_key: str, access_token: Optional[str] = None) -> List[Dict]:
        """Get components from a Figma file.
        
        Args:
            file_key: The key of the Figma file to retrieve components from.
            access_token: Optional Figma access token.
            
        Returns:
            List of components in the Figma file.
        """
        if not self.session:
            self.session = aiohttp.ClientSession()

        url = f"{self.base_url}/tools/get-components"
        payload = {"fileKey": file_key}
        if access_token:
            payload["accessToken"] = access_token

        async with self.session.post(url, json=payload) as response:
            if response.status != 200:
                error_text = await response.text()
                logger.error(f"Failed to get Figma components: {error_text}")
                raise Exception(f"Failed to get Figma components: {error_text}")
            
            data = await response.json()
            return data.get("components", [])

    async def get_styles(self, file_key: str, access_token: Optional[str] = None) -> List[Dict]:
        """Get styles from a Figma file.
        
        Args:
            file_key: The key of the Figma file to retrieve styles from.
            access_token: Optional Figma access token.
            
        Returns:
            List of styles in the Figma file.
        """
        if not self.session:
            self.session = aiohttp.ClientSession()

        url = f"{self.base_url}/tools/get-styles"
        payload = {"fileKey": file_key}
        if access_token:
            payload["accessToken"] = access_token

        async with self.session.post(url, json=payload) as response:
            if response.status != 200:
                error_text = await response.text()
                logger.error(f"Failed to get Figma styles: {error_text}")
                raise Exception(f"Failed to get Figma styles: {error_text}")
            
            data = await response.json()
            return data.get("styles", [])
