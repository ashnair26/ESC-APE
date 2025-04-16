#!/usr/bin/env python3
"""
Authentication API server for the ESCAPE Creator Engine.

This server provides API endpoints for authentication flows, such as
verifying Privy tokens, refreshing JWT tokens, and logging out.
"""

import os
import json
from typing import Dict, Any, Optional

from fastapi import FastAPI, HTTPException, Depends, Request, Response, Cookie
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from core.auth_flow import verify_privy_token, refresh_token, logout, AuthFlowResult

# Create the FastAPI app
app = FastAPI(title="ESCAPE Authentication API")

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=os.environ.get("CORS_ORIGINS", "*").split(","),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Define request and response models
class VerifyTokenRequest(BaseModel):
    token: str


class RefreshTokenRequest(BaseModel):
    refresh_token: str


class AuthResponse(BaseModel):
    success: bool
    token: Optional[str] = None
    refresh_token: Optional[str] = None
    expires_in: Optional[int] = None
    user: Optional[Dict[str, Any]] = None
    error: Optional[str] = None


@app.post("/auth/verify", response_model=AuthResponse)
async def verify_token_endpoint(request: VerifyTokenRequest, response: Response) -> AuthResponse:
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
    refresh_token: Optional[str] = Cookie(None)
) -> AuthResponse:
    """
    Refresh a JWT token using a refresh token.
    
    Args:
        request: The request containing the refresh token (optional).
        response: The response object for setting cookies.
        refresh_token: The refresh token from cookies (optional).
        
    Returns:
        An AuthResponse object.
    """
    # Get the refresh token from the request body or cookies
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
    refresh_token: Optional[str] = Cookie(None)
) -> AuthResponse:
    """
    Log out a user by revoking their refresh token.
    
    Args:
        request: The request containing the refresh token (optional).
        response: The response object for clearing cookies.
        refresh_token: The refresh token from cookies (optional).
        
    Returns:
        An AuthResponse object.
    """
    # Get the refresh token from the request body or cookies
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
async def get_user_endpoint(request: Request) -> AuthResponse:
    """
    Get the current user from the JWT token.
    
    Args:
        request: The request object.
        
    Returns:
        An AuthResponse object.
    """
    # Get the JWT token from the Authorization header or cookies
    token = None
    auth_header = request.headers.get("Authorization")
    if auth_header and auth_header.startswith("Bearer "):
        token = auth_header[7:]
    else:
        token = request.cookies.get("token")
    
    if not token:
        raise HTTPException(status_code=401, detail="JWT token is required")
    
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
        
        # Create the user dictionary
        user_dict = {
            "id": payload.get("sub", "unknown"),
            "username": payload.get("username"),
            "email": payload.get("email"),
            "role": payload.get("role"),
            "scopes": payload.get("scopes", [])
        }
        
        return AuthResponse(
            success=True,
            user=user_dict
        )
    except PyJWTError as e:
        raise HTTPException(status_code=401, detail=f"Invalid JWT token: {str(e)}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error decoding JWT token: {str(e)}")


if __name__ == "__main__":
    import uvicorn
    
    # Run the server
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run(app, host="0.0.0.0", port=port)
