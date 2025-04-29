import os
import logging
from typing import Dict, Any, Optional

from fastapi import APIRouter, HTTPException, Depends, Response, Header
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

from core.auth import AuthUser
from core.auth_flow import verify_privy_token, refresh_token, logout, AuthFlowResult

from .models import AuthRequest, AuthResponse, RefreshTokenRequest

# Configure logging
logger = logging.getLogger(__name__)

# Security scheme
security = HTTPBearer()

router = APIRouter(
    prefix="/auth",
    tags=["auth"],
)


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


@router.post("/verify", response_model=AuthResponse)
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


@router.post("/refresh", response_model=AuthResponse)
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

    # Import here to avoid name conflict with the endpoint function
    from core.auth_flow import refresh_token as auth_flow_refresh_token
    result = await auth_flow_refresh_token(token)

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


@router.post("/logout", response_model=AuthResponse)
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

    # Import here to avoid name conflict with the endpoint function
    from core.auth_flow import logout as auth_flow_logout
    result = await auth_flow_logout(token)

    # Clear the cookies even if the logout failed
    response.delete_cookie(key="token")
    response.delete_cookie(key="refresh_token")

    if not result.success:
        raise HTTPException(status_code=500, detail=result.error)

    return AuthResponse(
        success=result.success,
        error=result.error
    )


@router.get("/user", response_model=AuthResponse)
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