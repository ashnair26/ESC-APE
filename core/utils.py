#!/usr/bin/env python3
"""
Utility functions for the ESCAPE Creator Engine.
"""

import os
import json
import logging
from typing import Any, Dict, List, Optional, Union
from pathlib import Path

import dotenv

# Load environment variables from .env file
dotenv.load_dotenv()

# Configure logging
logging.basicConfig(
    level=os.getenv("LOG_LEVEL", "INFO"),
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
)
logger = logging.getLogger(__name__)


def get_env_var(name: str, default: Optional[str] = None) -> Optional[str]:
    """
    Get an environment variable or raise an exception if it's not set.

    Args:
        name: The name of the environment variable.
        default: The default value to return if the environment variable is not set.
            If None, an exception will be raised if the variable is not set.

    Returns:
        The value of the environment variable or the default value.

    Raises:
        ValueError: If the environment variable is not set and no default is provided.
    """
    value = os.getenv(name, default)
    if value is None and default is None:
        raise ValueError(f"Environment variable {name} is not set")
    return value


def load_json_file(file_path: Union[str, Path]) -> Dict[str, Any]:
    """
    Load a JSON file.

    Args:
        file_path: The path to the JSON file.

    Returns:
        The parsed JSON data.

    Raises:
        FileNotFoundError: If the file does not exist.
        json.JSONDecodeError: If the file is not valid JSON.
    """
    file_path = Path(file_path)
    if not file_path.exists():
        raise FileNotFoundError(f"File {file_path} does not exist")

    with open(file_path, "r") as f:
        return json.load(f)


def save_json_file(data: Dict[str, Any], file_path: Union[str, Path], indent: int = 2) -> None:
    """
    Save data to a JSON file.

    Args:
        data: The data to save.
        file_path: The path to the JSON file.
        indent: The indentation level for the JSON file.
    """
    file_path = Path(file_path)
    file_path.parent.mkdir(parents=True, exist_ok=True)

    with open(file_path, "w") as f:
        json.dump(data, f, indent=indent)


def format_error_message(error: Exception) -> str:
    """
    Format an exception into a user-friendly error message.

    Args:
        error: The exception to format.

    Returns:
        A formatted error message.
    """
    return f"Error: {type(error).__name__} - {str(error)}"


def chunk_data(data: Union[str, Dict, List], chunk_size: int = 100000) -> List[str]:
    """
    Split large data into chunks.

    Args:
        data: The data to chunk. Can be a string, dict, or list.
        chunk_size: The maximum size of each chunk in characters.

    Returns:
        A list of chunks as strings.
    """
    # Convert data to string if it's not already
    if not isinstance(data, str):
        data = json.dumps(data)

    # Split the data into chunks
    return [data[i:i + chunk_size] for i in range(0, len(data), chunk_size)]


def reassemble_chunks(chunks: List[str]) -> Union[str, Dict, List]:
    """
    Reassemble chunks into the original data.

    Args:
        chunks: The list of chunks to reassemble.

    Returns:
        The reassembled data. If the data is valid JSON, it will be parsed into a dict or list.
        Otherwise, it will be returned as a string.
    """
    # Join the chunks
    data = ''.join(chunks)

    # Try to parse as JSON
    try:
        return json.loads(data)
    except json.JSONDecodeError:
        return data
