#!/usr/bin/env python3
"""
Supabase client implementation for the ESCAPE Creator Engine.
"""

import json
from typing import Any, Dict, List, Optional, Union
from dataclasses import dataclass

import httpx
from mcp.server.fastmcp import Context

from core.utils import get_env_var, format_error_message


@dataclass
class SupabaseClient:
    """
    Client for interacting with the Supabase REST API.
    """
    
    url: str
    key: str
    
    @classmethod
    def from_env(cls) -> "SupabaseClient":
        """
        Create a SupabaseClient from environment variables.
        
        Returns:
            A SupabaseClient instance.
            
        Raises:
            ValueError: If the required environment variables are not set.
        """
        url = get_env_var("SUPABASE_URL")
        key = get_env_var("SUPABASE_SERVICE_ROLE_KEY")
        return cls(url=url, key=key)
    
    async def _request(
        self, 
        method: str, 
        path: str, 
        json_data: Optional[Dict[str, Any]] = None,
        params: Optional[Dict[str, Any]] = None,
        headers: Optional[Dict[str, str]] = None
    ) -> Dict[str, Any]:
        """
        Make a request to the Supabase REST API.
        
        Args:
            method: The HTTP method to use.
            path: The path to request.
            json_data: The JSON data to send in the request body.
            params: The query parameters to include in the request.
            headers: Additional headers to include in the request.
            
        Returns:
            The response data.
            
        Raises:
            Exception: If the request fails.
        """
        # Ensure path starts with a slash
        if not path.startswith("/"):
            path = f"/{path}"
        
        # Build the full URL
        url = f"{self.url}{path}"
        
        # Set up headers
        request_headers = {
            "apikey": self.key,
            "Authorization": f"Bearer {self.key}",
            "Content-Type": "application/json",
            "Prefer": "return=representation"
        }
        
        # Add any additional headers
        if headers:
            request_headers.update(headers)
        
        async with httpx.AsyncClient() as client:
            response = await client.request(
                method=method,
                url=url,
                headers=request_headers,
                json=json_data,
                params=params
            )
            
            if response.status_code >= 400:
                error_msg = f"Supabase API error: {response.status_code} - {response.text}"
                raise Exception(error_msg)
                
            return response.json()
    
    async def read_rows(
        self, 
        table: str, 
        select: str = "*",
        filters: Optional[Dict[str, Any]] = None,
        order: Optional[str] = None,
        limit: Optional[int] = None,
        offset: Optional[int] = None
    ) -> List[Dict[str, Any]]:
        """
        Read rows from a table with optional filtering and pagination.
        
        Args:
            table: The name of the table to read from.
            select: Comma-separated list of columns to return.
            filters: Dictionary of filter conditions.
            order: Order by clause (e.g. "column.asc" or "column.desc").
            limit: Maximum number of rows to return.
            offset: Number of rows to skip.
            
        Returns:
            List of rows that match the query.
        """
        # Build query parameters
        params = {"select": select}
        
        # Add filters
        if filters:
            for key, value in filters.items():
                params[key] = value
        
        # Add order
        if order:
            params["order"] = order
        
        # Add pagination
        if limit is not None:
            params["limit"] = str(limit)
        
        if offset is not None:
            params["offset"] = str(offset)
        
        # Make the request
        return await self._request("GET", f"/rest/v1/{table}", params=params)
    
    async def create_records(
        self, 
        table: str, 
        records: Union[Dict[str, Any], List[Dict[str, Any]]]
    ) -> List[Dict[str, Any]]:
        """
        Create one or more records in a table.
        
        Args:
            table: The name of the table to create records in.
            records: The record(s) to create.
            
        Returns:
            The created record(s).
        """
        # Ensure records is a list
        if not isinstance(records, list):
            records = [records]
            
        # Make the request
        return await self._request("POST", f"/rest/v1/{table}", json_data=records)
    
    async def update_records(
        self, 
        table: str, 
        records: Union[Dict[str, Any], List[Dict[str, Any]]], 
        match_column: str
    ) -> List[Dict[str, Any]]:
        """
        Update one or more records in a table based on a match column.
        
        Args:
            table: The name of the table to update records in.
            records: The record(s) to update.
            match_column: The column to use for matching records to update.
            
        Returns:
            The updated record(s).
            
        Raises:
            ValueError: If the match column is not found in a record.
        """
        # Ensure records is a list
        if not isinstance(records, list):
            records = [records]
        
        results = []
        for record in records:
            if match_column not in record:
                raise ValueError(f"Match column '{match_column}' not found in record")
            
            match_value = record[match_column]
            path = f"/rest/v1/{table}?{match_column}=eq.{match_value}"
            
            # Remove the match column from the update data
            update_data = {k: v for k, v in record.items() if k != match_column}
            
            result = await self._request("PATCH", path, json_data=update_data)
            results.extend(result)
            
        return results
    
    async def delete_records(
        self, 
        table: str, 
        filters: Dict[str, Any]
    ) -> Dict[str, Any]:
        """
        Delete records from a table based on filters.
        
        Args:
            table: The name of the table to delete records from.
            filters: Dictionary of filter conditions.
            
        Returns:
            The result of the delete operation.
        """
        # Build the path with filters
        path = f"/rest/v1/{table}"
        
        # Add filters to path
        if filters:
            filter_parts = []
            for key, value in filters.items():
                filter_parts.append(f"{key}=eq.{value}")
            
            filter_string = "&".join(filter_parts)
            path = f"{path}?{filter_string}"
        
        # Make the request
        return await self._request("DELETE", path)
    
    async def execute_rpc(
        self, 
        function_name: str, 
        params: Dict[str, Any]
    ) -> Dict[str, Any]:
        """
        Execute a Postgres function via the Supabase REST API.
        
        Args:
            function_name: The name of the function to execute.
            params: The parameters to pass to the function.
            
        Returns:
            The result of the function execution.
        """
        # Make the request
        return await self._request("POST", f"/rest/v1/rpc/{function_name}", json_data=params)


def get_supabase_client(ctx: Optional[Context] = None) -> SupabaseClient:
    """
    Get a Supabase client from environment variables.
    
    Args:
        ctx: Optional MCP Context for logging.
        
    Returns:
        A SupabaseClient instance.
        
    Raises:
        ValueError: If the required environment variables are not set.
    """
    try:
        return SupabaseClient.from_env()
    except ValueError as e:
        if ctx:
            ctx.error(str(e))
        raise
