#!/usr/bin/env python3
"""
Testing utilities for the ESCAPE Creator Engine.
"""

import os
import json
import tempfile
from typing import Any, Dict, List, Optional, Union, Callable
from pathlib import Path
from contextlib import contextmanager

import pytest
from dotenv import load_dotenv


@contextmanager
def temp_env_vars(**kwargs):
    """
    Temporarily set environment variables for testing.
    
    Args:
        **kwargs: Environment variables to set.
        
    Yields:
        None
    """
    original_values = {}
    
    # Save original values and set new values
    for key, value in kwargs.items():
        if key in os.environ:
            original_values[key] = os.environ[key]
        os.environ[key] = value
    
    try:
        yield
    finally:
        # Restore original values
        for key in kwargs:
            if key in original_values:
                os.environ[key] = original_values[key]
            else:
                del os.environ[key]


@contextmanager
def temp_json_file(data: Dict[str, Any]) -> Path:
    """
    Create a temporary JSON file for testing.
    
    Args:
        data: The data to write to the file.
        
    Yields:
        The path to the temporary file.
    """
    with tempfile.NamedTemporaryFile(suffix=".json", delete=False) as f:
        json.dump(data, f)
        temp_path = Path(f.name)
    
    try:
        yield temp_path
    finally:
        if temp_path.exists():
            temp_path.unlink()


def load_test_env():
    """
    Load environment variables from .env.test file if it exists.
    """
    test_env_path = Path(".env.test")
    if test_env_path.exists():
        load_dotenv(test_env_path)


class MockResponse:
    """
    Mock HTTP response for testing.
    """
    
    def __init__(
        self, 
        status_code: int = 200, 
        json_data: Optional[Dict[str, Any]] = None,
        text: Optional[str] = None,
        headers: Optional[Dict[str, str]] = None
    ):
        """
        Initialize a mock response.
        
        Args:
            status_code: The HTTP status code.
            json_data: The JSON data to return.
            text: The text to return.
            headers: The HTTP headers.
        """
        self.status_code = status_code
        self._json_data = json_data or {}
        self._text = text or ""
        self.headers = headers or {}
    
    def json(self) -> Dict[str, Any]:
        """
        Get the JSON data.
        
        Returns:
            The JSON data.
        """
        return self._json_data
    
    @property
    def text(self) -> str:
        """
        Get the text.
        
        Returns:
            The text.
        """
        return self._text


def mock_async_response(
    status_code: int = 200,
    json_data: Optional[Dict[str, Any]] = None,
    text: Optional[str] = None,
    headers: Optional[Dict[str, str]] = None
) -> Callable:
    """
    Create a mock async response function.
    
    Args:
        status_code: The HTTP status code.
        json_data: The JSON data to return.
        text: The text to return.
        headers: The HTTP headers.
        
    Returns:
        A function that returns a mock response.
    """
    async def mock_response(*args, **kwargs):
        return MockResponse(
            status_code=status_code,
            json_data=json_data,
            text=text,
            headers=headers
        )
    return mock_response
