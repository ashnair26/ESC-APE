import logging
from typing import Dict, List, Any

from fastapi import APIRouter, HTTPException, Depends, Body

from core.auth import AuthUser
from .models import ToolCallRequest, ToolCallResponse, ListToolsResponse
from .session_utils import get_mcp_session, MCP_SERVERS
from .auth_routes import get_current_user # Import get_current_user from auth_routes

# Configure logging
logger = logging.getLogger(__name__)

router = APIRouter(
    prefix="/servers",
    tags=["servers"],
)


@router.get("", response_model=Dict[str, str])
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


@router.get("/{server}/tools", response_model=ListToolsResponse)
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


@router.post("/{server}/tools/{tool}", response_model=ToolCallResponse)
async def call_tool(
    server: str,
    tool: str,
    arguments: Dict[str, Any] = Body(default_factory=dict),
    user: AuthUser = Depends(get_current_user)
) -> ToolCallResponse:
    """
    Call a specific tool on an MCP server.

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
        result = await session.call_tool(tool, arguments)

        return ToolCallResponse(
            success=True,
            result=result
        )
    except HTTPException as e:
        # Re-raise HTTP exceptions
        raise e
    except Exception as e:
        logger.error(f"Error calling tool '{tool}' on server '{server}': {str(e)}")
        return ToolCallResponse(
            success=False,
            error=f"Error calling tool: {str(e)}"
        )

# Add a unified tools endpoint as well
@router.post("/tools", response_model=ToolCallResponse)
async def call_tool_unified(
    request: ToolCallRequest,
    user: AuthUser = Depends(get_current_user)
) -> ToolCallResponse:
    """
    Call a specific tool on an MCP server using a unified endpoint.

    Args:
        request: The request containing server, tool, and arguments.
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
        session = await get_mcp_session(request.server)

        # Call the tool
        result = await session.call_tool(request.tool, request.arguments)

        return ToolCallResponse(
            success=True,
            result=result
        )
    except HTTPException as e:
        # Re-raise HTTP exceptions
        raise e
    except Exception as e:
        logger.error(f"Error calling tool '{request.tool}' on server '{request.server}': {str(e)}")
        return ToolCallResponse(
            success=False,
            error=f"Error calling tool: {str(e)}"
        )