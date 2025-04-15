#!/usr/bin/env python3
"""
Sanity CMS client implementation for the ESCAPE Creator Engine.
"""

import json
import urllib.parse
from typing import Any, Dict, List, Optional, Union
from dataclasses import dataclass

import httpx
from mcp.server.fastmcp import Context

from core.utils import get_env_var, format_error_message
from core.secrets import get_secret


@dataclass
class SanityClient:
    """
    Client for interacting with the Sanity CMS API.
    """

    project_id: str
    dataset: str
    api_version: str
    token: Optional[str] = None
    use_cdn: bool = True

    @classmethod
    async def from_env(cls, creator_id: Optional[str] = None) -> "SanityClient":
        """
        Create a SanityClient from environment variables and secrets manager.

        Args:
            creator_id: The ID of the creator to get secrets for.

        Returns:
            A SanityClient instance.

        Raises:
            ValueError: If the required environment variables are not set.
        """
        # Get project ID and dataset from environment variables
        project_id = get_env_var("SANITY_PROJECT_ID")
        dataset = get_env_var("SANITY_DATASET", "production")
        api_version = get_env_var("SANITY_API_VERSION", "v2021-10-21")
        use_cdn = get_env_var("SANITY_USE_CDN", "true").lower() == "true"

        # Try to get the token from the secrets manager first
        token_name = "SANITY_API_TOKEN"
        token = await get_secret(token_name, creator_id)

        # If the token is not in the secrets manager, try to get it from environment variables
        if token is None:
            token = get_env_var("SANITY_API_TOKEN", None)

        return cls(
            project_id=project_id,
            dataset=dataset,
            api_version=api_version,
            token=token,
            use_cdn=use_cdn
        )

    def _get_base_url(self) -> str:
        """
        Get the base URL for the Sanity API.

        Returns:
            The base URL.
        """
        if self.use_cdn and not self.token:
            return f"https://{self.project_id}.apicdn.sanity.io/{self.api_version}"
        else:
            return f"https://{self.project_id}.api.sanity.io/{self.api_version}"

    async def _request(
        self,
        method: str,
        path: str,
        json_data: Optional[Dict[str, Any]] = None,
        params: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """
        Make a request to the Sanity API.

        Args:
            method: The HTTP method to use.
            path: The path to request.
            json_data: The JSON data to send in the request body.
            params: The query parameters to include in the request.

        Returns:
            The response data.

        Raises:
            Exception: If the request fails.
        """
        # Ensure path starts with a slash
        if not path.startswith("/"):
            path = f"/{path}"

        # Build the full URL
        url = f"{self._get_base_url()}{path}"

        # Set up headers
        headers = {
            "Content-Type": "application/json"
        }

        # Add authorization header if token is provided
        if self.token:
            headers["Authorization"] = f"Bearer {self.token}"

        async with httpx.AsyncClient() as client:
            response = await client.request(
                method=method,
                url=url,
                headers=headers,
                json=json_data,
                params=params
            )

            if response.status_code >= 400:
                error_msg = f"Sanity API error: {response.status_code} - {response.text}"
                raise Exception(error_msg)

            return response.json()

    async def query(
        self,
        query: str,
        params: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """
        Execute a GROQ query against the Sanity dataset.

        Args:
            query: The GROQ query to execute.
            params: Parameters to substitute in the query.

        Returns:
            The query results.
        """
        # Build the query parameters
        query_params = {"query": query}

        # Add parameters if provided
        if params:
            for key, value in params.items():
                query_params[f"${key}"] = json.dumps(value)

        # Make the request
        return await self._request(
            method="GET",
            path=f"/data/query/{self.dataset}",
            params=query_params
        )

    async def get_document(self, id: str) -> Dict[str, Any]:
        """
        Get a document by ID.

        Args:
            id: The document ID.

        Returns:
            The document.
        """
        # Build the query
        query = f"*[_id == $id][0]"

        # Make the request
        result = await self.query(query, {"id": id})

        # Return the document
        return result.get("result", {})

    async def create_document(self, document: Dict[str, Any]) -> Dict[str, Any]:
        """
        Create a new document.

        Args:
            document: The document to create.

        Returns:
            The created document.

        Raises:
            Exception: If the token is not provided.
        """
        if not self.token:
            raise Exception("API token is required for mutations")

        # Make the request
        return await self._request(
            method="POST",
            path=f"/data/mutate/{self.dataset}",
            json_data={
                "mutations": [
                    {
                        "create": document
                    }
                ]
            }
        )

    async def update_document(
        self,
        id: str,
        patch: Dict[str, Any]
    ) -> Dict[str, Any]:
        """
        Update a document by ID.

        Args:
            id: The document ID.
            patch: The patch to apply to the document.

        Returns:
            The result of the update operation.

        Raises:
            Exception: If the token is not provided.
        """
        if not self.token:
            raise Exception("API token is required for mutations")

        # Make the request
        return await self._request(
            method="POST",
            path=f"/data/mutate/{self.dataset}",
            json_data={
                "mutations": [
                    {
                        "patch": {
                            "id": id,
                            "set": patch
                        }
                    }
                ]
            }
        )

    async def delete_document(self, id: str) -> Dict[str, Any]:
        """
        Delete a document by ID.

        Args:
            id: The document ID.

        Returns:
            The result of the delete operation.

        Raises:
            Exception: If the token is not provided.
        """
        if not self.token:
            raise Exception("API token is required for mutations")

        # Make the request
        return await self._request(
            method="POST",
            path=f"/data/mutate/{self.dataset}",
            json_data={
                "mutations": [
                    {
                        "delete": {
                            "id": id
                        }
                    }
                ]
            }
        )

    async def get_assets(
        self,
        type: str = "image",
        limit: int = 100,
        offset: int = 0
    ) -> Dict[str, Any]:
        """
        Get assets from the Sanity dataset.

        Args:
            type: The type of asset to get (image or file).
            limit: Maximum number of assets to return.
            offset: Number of assets to skip.

        Returns:
            The assets.
        """
        # Build the query
        query = f"*[_type == 'sanity.{type}Asset'][{offset}...{offset + limit}]"

        # Make the request
        return await self.query(query)

    async def upload_asset(
        self,
        file_path: str,
        type: str = "image",
        filename: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Upload an asset to Sanity.

        Args:
            file_path: The path to the file to upload.
            type: The type of asset to upload (image or file).
            filename: The filename to use for the asset.

        Returns:
            The uploaded asset.

        Raises:
            Exception: If the token is not provided.
        """
        if not self.token:
            raise Exception("API token is required for mutations")

        # This is a placeholder for the actual implementation
        # Uploading assets requires a more complex implementation with multipart/form-data
        # which is beyond the scope of this example
        raise NotImplementedError("Asset upload is not implemented yet")

    async def get_schema(self) -> Dict[str, Any]:
        """
        Get the schema for the Sanity dataset.

        Returns:
            The schema.
        """
        # Make the request
        return await self._request(
            method="GET",
            path=f"/metadata/schema/{self.dataset}"
        )


async def get_sanity_client(ctx: Optional[Context] = None, creator_id: Optional[str] = None) -> SanityClient:
    """
    Get a Sanity client from environment variables and secrets manager.

    Args:
        ctx: Optional MCP Context for logging.
        creator_id: The ID of the creator to get secrets for.

    Returns:
        A SanityClient instance.

    Raises:
        ValueError: If the required environment variables are not set.
    """
    try:
        return await SanityClient.from_env(creator_id)
    except ValueError as e:
        if ctx:
            ctx.error(str(e))
        raise
