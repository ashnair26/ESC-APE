from typing import Dict, List, Any, Optional, Union
from pydantic import BaseModel, Field

# Define request and response models
class ToolCallRequest(BaseModel):
    """Request model for calling a tool."""

    server: str = Field(..., description="The MCP server to call")
    tool: str = Field(..., description="The tool to call")
    arguments: Dict[str, Any] = Field(default_factory=dict, description="The arguments to pass to the tool")


class ToolCallResponse(BaseModel):
    """Response model for a tool call."""

    success: bool = Field(..., description="Whether the call was successful")
    result: Optional[Any] = Field(None, description="The result of the call")
    error: Optional[str] = Field(None, description="Error message if the call failed")


class ListToolsResponse(BaseModel):
    """Response model for listing tools."""

    success: bool = Field(..., description="Whether the call was successful")
    tools: Optional[List[Dict[str, Any]]] = Field(None, description="The list of tools")
    error: Optional[str] = Field(None, description="Error message if the call failed")


class AuthRequest(BaseModel):
    """Request model for authentication."""

    token: str = Field(..., description="The Privy authentication token")


class AuthResponse(BaseModel):
    """Response model for authentication."""

    success: bool = Field(..., description="Whether the authentication was successful")
    token: Optional[str] = Field(None, description="The JWT token")
    refresh_token: Optional[str] = Field(None, description="The refresh token")
    expires_in: Optional[int] = Field(None, description="The token expiration time in seconds")
    user: Optional[Dict[str, Any]] = Field(None, description="The user data")
    error: Optional[str] = Field(None, description="Error message if the authentication failed")


class RefreshTokenRequest(BaseModel):
    """Request model for refreshing a token."""

    refresh_token: str = Field(..., description="The refresh token")