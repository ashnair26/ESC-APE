#!/usr/bin/env python3
"""
Unified API server for the ESCAPE Creator Engine.

This server provides a RESTful API for accessing all the MCP servers' functionality.
It acts as a bridge between HTTP clients and the MCP servers.
"""

import os
import sys
import json
import asyncio
import logging
from typing import Dict, List, Any, Optional, Union
from pathlib import Path

# Add the project root to the Python path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from fastapi import FastAPI, HTTPException, Depends, Request, Response, Header, Body
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel, Field

from mcp import ClientSession, StdioServerParameters
from mcp.client.stdio import stdio_client

from core.auth import AuthUser
from core.auth_flow import verify_privy_token, refresh_token, logout, AuthFlowResult

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Create the FastAPI app
app = FastAPI(title="ESCAPE Unified API")

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=os.environ.get("CORS_ORIGINS", "*").split(","),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Security scheme
security = HTTPBearer()

# MCP server parameters
MCP_SERVERS = {
    "unified": StdioServerParameters(
        command="python",
        args=["-m", "servers.unified.server"],
        env=None,
    ),
    "supabase": StdioServerParameters(
        command="python",
        args=["-m", "servers.supabase.server"],
        env=None,
    ),
    "git": StdioServerParameters(
        command="python",
        args=["-m", "servers.git.server"],
        env=None,
    ),
    "sanity": StdioServerParameters(
        command="python",
        args=["-m", "servers.sanity.server"],
        env=None,
    ),
    "privy": StdioServerParameters(
        command="python",
        args=["-m", "servers.privy.server"],
        env=None,
    ),
    "base": StdioServerParameters(
        command="python",
        args=["-m", "servers.base.server"],
        env=None,
    ),
}

# MCP client sessions
mcp_sessions: Dict[str, ClientSession] = {}


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


async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security)
) -> AuthUser:
    """
    Get the current user from the JWT token.
    
    Args:
        credentials: The HTTP authorization credentials.
        
    Returns:
        The authenticated user.
        
    Raises:
        HTTPException: If the token is invalid or expired.
    """
    token = credentials.credentials
    
    # Decode and validate the JWT token
    try:
        import jwt
        from jwt.exceptions import PyJWTError
        
        # Get the JWT secret
        jwt_secret = os.environ.get("JWT_SECRET")
        if not jwt_secret:
            raise HTTPException(status_code=500, detail="JWT secret is not configured")
        
        # Decode the token
        payload = jwt.decode(
            token,
            jwt_secret,
            algorithms=["HS256"]
        )
        
        # Check if the token is expired
        import time
        if "exp" in payload and payload["exp"] < time.time():
            raise HTTPException(status_code=401, detail="JWT token has expired")
        
        # Create the user
        user = AuthUser(
            id=payload.get("sub", "unknown"),
            username=payload.get("username"),
            email=payload.get("email"),
            role=payload.get("role"),
            scopes=payload.get("scopes", [])
        )
        
        return user
    except PyJWTError as e:
        raise HTTPException(status_code=401, detail=f"Invalid JWT token: {str(e)}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error decoding JWT token: {str(e)}")


async def get_mcp_session(server: str) -> ClientSession:
    """
    Get an MCP client session for the specified server.
    
    Args:
        server: The name of the MCP server.
        
    Returns:
        The MCP client session.
        
    Raises:
        HTTPException: If the server is not found or the connection fails.
    """
    # Check if the server exists
    if server not in MCP_SERVERS:
        raise HTTPException(status_code=404, detail=f"MCP server '{server}' not found")
    
    # Check if we already have a session for this server
    if server in mcp_sessions and mcp_sessions[server].is_connected():
        return mcp_sessions[server]
    
    # Create a new session
    try:
        server_params = MCP_SERVERS[server]
        
        # Connect to the MCP server
        read_stream, write_stream = await stdio_client(server_params)
        session = ClientSession(read_stream, write_stream)
        
        # Initialize the session
        await session.initialize()
        
        # Store the session
        mcp_sessions[server] = session
        
        return session
    except Exception as e:
        logger.error(f"Error connecting to MCP server '{server}': {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error connecting to MCP server: {str(e)}")


@app.post("/auth/verify", response_model=AuthResponse)
async def verify_token_endpoint(request: AuthRequest, response: Response) -> AuthResponse:
    """
    Verify a Privy authentication token and create a JWT token.
    
    Args:
        request: The request containing the Privy token.
        response: The response object for setting cookies.
        
    Returns:
        An AuthResponse object.
    """
    result = await verify_privy_token(request.token)
    
    if not result.success:
        raise HTTPException(status_code=401, detail=result.error)
    
    # Set the JWT token as an HTTP-only cookie
    if result.token:
        response.set_cookie(
            key="token",
            value=result.token,
            httponly=True,
            secure=True,
            samesite="strict",
            max_age=result.expires_in
        )
    
    # Set the refresh token as an HTTP-only cookie
    if result.refresh_token:
        response.set_cookie(
            key="refresh_token",
            value=result.refresh_token,
            httponly=True,
            secure=True,
            samesite="strict",
            max_age=2592000  # 30 days
        )
    
    # Convert the user object to a dictionary
    user_dict = None
    if result.user:
        user_dict = {
            "id": result.user.id,
            "username": result.user.username,
            "email": result.user.email,
            "role": result.user.role,
            "scopes": result.user.scopes
        }
    
    return AuthResponse(
        success=result.success,
        token=result.token,
        refresh_token=result.refresh_token,
        expires_in=result.expires_in,
        user=user_dict,
        error=result.error
    )


@app.post("/auth/refresh", response_model=AuthResponse)
async def refresh_token_endpoint(
    request: Optional[RefreshTokenRequest] = None,
    response: Response = None,
    refresh_token: Optional[str] = Header(None, alias="X-Refresh-Token")
) -> AuthResponse:
    """
    Refresh a JWT token using a refresh token.
    
    Args:
        request: The request containing the refresh token (optional).
        response: The response object for setting cookies.
        refresh_token: The refresh token from the header (optional).
        
    Returns:
        An AuthResponse object.
    """
    # Get the refresh token from the request body or header
    token = None
    if request and request.refresh_token:
        token = request.refresh_token
    elif refresh_token:
        token = refresh_token
    
    if not token:
        raise HTTPException(status_code=401, detail="Refresh token is required")
    
    result = await refresh_token(token)
    
    if not result.success:
        raise HTTPException(status_code=401, detail=result.error)
    
    # Set the JWT token as an HTTP-only cookie
    if result.token:
        response.set_cookie(
            key="token",
            value=result.token,
            httponly=True,
            secure=True,
            samesite="strict",
            max_age=result.expires_in
        )
    
    # Convert the user object to a dictionary
    user_dict = None
    if result.user:
        user_dict = {
            "id": result.user.id,
            "username": result.user.username,
            "email": result.user.email,
            "role": result.user.role,
            "scopes": result.user.scopes
        }
    
    return AuthResponse(
        success=result.success,
        token=result.token,
        refresh_token=result.refresh_token,
        expires_in=result.expires_in,
        user=user_dict,
        error=result.error
    )


@app.post("/auth/logout", response_model=AuthResponse)
async def logout_endpoint(
    request: Optional[RefreshTokenRequest] = None,
    response: Response = None,
    refresh_token: Optional[str] = Header(None, alias="X-Refresh-Token")
) -> AuthResponse:
    """
    Log out a user by revoking their refresh token.
    
    Args:
        request: The request containing the refresh token (optional).
        response: The response object for clearing cookies.
        refresh_token: The refresh token from the header (optional).
        
    Returns:
        An AuthResponse object.
    """
    # Get the refresh token from the request body or header
    token = None
    if request and request.refresh_token:
        token = request.refresh_token
    elif refresh_token:
        token = refresh_token
    
    if not token:
        raise HTTPException(status_code=401, detail="Refresh token is required")
    
    result = await logout(token)
    
    # Clear the cookies even if the logout failed
    response.delete_cookie(key="token")
    response.delete_cookie(key="refresh_token")
    
    if not result.success:
        raise HTTPException(status_code=500, detail=result.error)
    
    return AuthResponse(
        success=result.success,
        error=result.error
    )


@app.get("/auth/user", response_model=AuthResponse)
async def get_user_endpoint(user: AuthUser = Depends(get_current_user)) -> AuthResponse:
    """
    Get the current user from the JWT token.
    
    Args:
        user: The authenticated user.
        
    Returns:
        An AuthResponse object.
    """
    # Convert the user object to a dictionary
    user_dict = {
        "id": user.id,
        "username": user.username,
        "email": user.email,
        "role": user.role,
        "scopes": user.scopes
    }
    
    return AuthResponse(
        success=True,
        user=user_dict
    )


@app.get("/servers", response_model=Dict[str, str])
async def list_servers() -> Dict[str, str]:
    """
    List all available MCP servers.
    
    Returns:
        A dictionary of server names and descriptions.
    """
    return {
        "unified": "ESCAPE Unified Server",
        "supabase": "ESCAPE Supabase Server",
        "git": "ESCAPE Git Server",
        "sanity": "ESCAPE Sanity CMS Server",
        "privy": "ESCAPE Privy Authentication Server",
        "base": "ESCAPE BASE Blockchain Server"
    }


@app.get("/servers/{server}/tools", response_model=ListToolsResponse)
async def list_tools(
    server: str,
    user: AuthUser = Depends(get_current_user)
) -> ListToolsResponse:
    """
    List all tools available on the specified MCP server.
    
    Args:
        server: The name of the MCP server.
        user: The authenticated user.
        
    Returns:
        A ListToolsResponse object.
    """
    # Check if the user has the required scope
    if "mcp:access" not in user.scopes and "*" not in user.scopes:
        raise HTTPException(
            status_code=403,
            detail="Insufficient permissions. Required scope: mcp:access"
        )
    
    try:
        # Get the MCP session
        session = await get_mcp_session(server)
        
        # List the tools
        tools = await session.list_tools()
        
        # Convert the tools to a list of dictionaries
        tool_list = []
        for tool in tools:
            tool_dict = {
                "name": tool.name,
                "description": tool.description,
                "parameters": tool.inputSchema
            }
            tool_list.append(tool_dict)
        
        return ListToolsResponse(
            success=True,
            tools=tool_list
        )
    except HTTPException as e:
        # Re-raise HTTP exceptions
        raise e
    except Exception as e:
        logger.error(f"Error listing tools: {str(e)}")
        return ListToolsResponse(
            success=False,
            error=f"Error listing tools: {str(e)}"
        )


@app.post("/servers/{server}/tools/{tool}", response_model=ToolCallResponse)
async def call_tool(
    server: str,
    tool: str,
    arguments: Dict[str, Any] = Body(...),
    user: AuthUser = Depends(get_current_user)
) -> ToolCallResponse:
    """
    Call a tool on the specified MCP server.
    
    Args:
        server: The name of the MCP server.
        tool: The name of the tool to call.
        arguments: The arguments to pass to the tool.
        user: The authenticated user.
        
    Returns:
        A ToolCallResponse object.
    """
    # Check if the user has the required scope
    if "mcp:access" not in user.scopes and "*" not in user.scopes:
        raise HTTPException(
            status_code=403,
            detail="Insufficient permissions. Required scope: mcp:access"
        )
    
    try:
        # Get the MCP session
        session = await get_mcp_session(server)
        
        # Call the tool
        result = await session.call_tool(tool, arguments=arguments)
        
        # Try to parse the result as JSON
        try:
            parsed_result = json.loads(result)
            
            # Check if the result contains an error
            if isinstance(parsed_result, dict) and "error" in parsed_result:
                return ToolCallResponse(
                    success=False,
                    error=parsed_result["error"]
                )
            
            return ToolCallResponse(
                success=True,
                result=parsed_result
            )
        except json.JSONDecodeError:
            # If the result is not JSON, return it as a string
            return ToolCallResponse(
                success=True,
                result=result
            )
    except HTTPException as e:
        # Re-raise HTTP exceptions
        raise e
    except Exception as e:
        logger.error(f"Error calling tool: {str(e)}")
        return ToolCallResponse(
            success=False,
            error=f"Error calling tool: {str(e)}"
        )


@app.post("/tools", response_model=ToolCallResponse)
async def call_tool_unified(
    request: ToolCallRequest,
    user: AuthUser = Depends(get_current_user)
) -> ToolCallResponse:
    """
    Call a tool on any MCP server.
    
    Args:
        request: The tool call request.
        user: The authenticated user.
        
    Returns:
        A ToolCallResponse object.
    """
    return await call_tool(
        server=request.server,
        tool=request.tool,
        arguments=request.arguments,
        user=user
    )


@app.on_event("startup")
async def startup_event():
    """
    Event handler for application startup.
    """
    logger.info("Starting ESCAPE Unified API server")


@app.on_event("shutdown")
async def shutdown_event():
    """
    Event handler for application shutdown.
    """
    logger.info("Shutting down ESCAPE Unified API server")
    
    # Close all MCP sessions
    for server, session in mcp_sessions.items():
        if session.is_connected():
            await session.shutdown()
            logger.info(f"Closed MCP session for server '{server}'")


if __name__ == "__main__":
    import uvicorn
    
    # Run the server
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run(app, host="0.0.0.0", port=port)
