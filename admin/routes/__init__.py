"""
API routes for the ESCAPE Creator Engine admin dashboard.
"""

from fastapi import APIRouter

from admin.routes.auth import router as auth_router
from admin.routes.secrets import router as secrets_router

# Create the main router
router = APIRouter(
    prefix="/api/admin",
    tags=["admin"]
)

# Include the auth and secrets routers
router.include_router(auth_router)
router.include_router(secrets_router)
