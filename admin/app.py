#!/usr/bin/env python3
"""
Main application for the ESCAPE Creator Engine admin dashboard.
"""

import os
from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse

from admin.routes import router as admin_router

# Create the FastAPI application
app = FastAPI(
    title="ESCAPE Creator Engine Admin Dashboard",
    description="Admin dashboard for the ESCAPE Creator Engine",
    version="0.1.0"
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, this should be restricted to your frontend domain
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include the admin router
app.include_router(admin_router)

# Serve static files
app.mount("/static", StaticFiles(directory="admin/static"), name="static")

# Serve the frontend
@app.get("/", include_in_schema=False)
async def serve_frontend():
    """
    Serve the frontend application.
    """
    return FileResponse("admin/static/index.html")


if __name__ == "__main__":
    import uvicorn
    
    # Get the port from the environment or use 8000 as default
    port = int(os.environ.get("PORT", 8000))
    
    # Run the application
    uvicorn.run(
        "admin.app:app",
        host="0.0.0.0",
        port=port,
        reload=True
    )
