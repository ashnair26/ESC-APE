#!/usr/bin/env python3
"""
Web-based admin panel for managing secrets.

This script provides a web-based admin panel for managing secrets in the
ESCAPE Creator Engine. It allows you to list, get, set, and delete secrets.
"""

import os
import sys
import json
import asyncio
from typing import Optional, Dict, Any, List

# Add the project root to the Python path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "../..")))

import uvicorn
from fastapi import FastAPI, HTTPException, Depends, Request, Form
from fastapi.responses import HTMLResponse, RedirectResponse
from fastapi.templating import Jinja2Templates
from fastapi.staticfiles import StaticFiles
from fastapi.security import HTTPBasic, HTTPBasicCredentials
from starlette.status import HTTP_401_UNAUTHORIZED
import secrets

from core.secrets import get_secret, set_secret, delete_secret, list_secrets

# Create the FastAPI app
app = FastAPI(title="ESCAPE Secrets Admin")

# Set up authentication
security = HTTPBasic()

# Set up templates
templates_dir = os.path.join(os.path.dirname(__file__), "templates")
os.makedirs(templates_dir, exist_ok=True)
templates = Jinja2Templates(directory=templates_dir)

# Set up static files
static_dir = os.path.join(os.path.dirname(__file__), "static")
os.makedirs(static_dir, exist_ok=True)
app.mount("/static", StaticFiles(directory=static_dir), name="static")


def get_admin_credentials() -> Dict[str, str]:
    """
    Get the admin credentials from environment variables.
    
    Returns:
        A dictionary with the admin username and password.
    """
    username = os.environ.get("SECRETS_ADMIN_USERNAME", "admin")
    password = os.environ.get("SECRETS_ADMIN_PASSWORD")
    
    if not password:
        # Generate a random password if none is provided
        password = secrets.token_urlsafe(16)
        print(f"WARNING: No admin password provided. Using a random password: {password}")
        print("Set the SECRETS_ADMIN_PASSWORD environment variable to use a custom password.")
    
    return {"username": username, "password": password}


def authenticate(credentials: HTTPBasicCredentials = Depends(security)) -> str:
    """
    Authenticate the user.
    
    Args:
        credentials: The HTTP basic auth credentials.
        
    Returns:
        The username if authentication is successful.
        
    Raises:
        HTTPException: If authentication fails.
    """
    admin_credentials = get_admin_credentials()
    
    correct_username = secrets.compare_digest(credentials.username, admin_credentials["username"])
    correct_password = secrets.compare_digest(credentials.password, admin_credentials["password"])
    
    if not (correct_username and correct_password):
        raise HTTPException(
            status_code=HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials",
            headers={"WWW-Authenticate": "Basic"},
        )
    
    return credentials.username


@app.get("/", response_class=HTMLResponse)
async def index(request: Request, username: str = Depends(authenticate)):
    """
    Render the index page.
    
    Args:
        request: The HTTP request.
        username: The authenticated username.
        
    Returns:
        The rendered HTML template.
    """
    secrets_list = await list_secrets()
    
    return templates.TemplateResponse(
        "index.html",
        {"request": request, "username": username, "secrets": secrets_list}
    )


@app.get("/secret/{name}", response_class=HTMLResponse)
async def get_secret_page(
    request: Request,
    name: str,
    creator_id: Optional[str] = None,
    username: str = Depends(authenticate)
):
    """
    Render the secret detail page.
    
    Args:
        request: The HTTP request.
        name: The name of the secret.
        creator_id: The creator ID.
        username: The authenticated username.
        
    Returns:
        The rendered HTML template.
    """
    value = await get_secret(name, creator_id)
    
    if value is None:
        raise HTTPException(status_code=404, detail=f"Secret '{name}' not found")
    
    return templates.TemplateResponse(
        "secret.html",
        {"request": request, "username": username, "name": name, "value": value, "creator_id": creator_id}
    )


@app.get("/new", response_class=HTMLResponse)
async def new_secret_page(request: Request, username: str = Depends(authenticate)):
    """
    Render the new secret page.
    
    Args:
        request: The HTTP request.
        username: The authenticated username.
        
    Returns:
        The rendered HTML template.
    """
    return templates.TemplateResponse(
        "new.html",
        {"request": request, "username": username}
    )


@app.post("/new")
async def create_secret(
    name: str = Form(...),
    value: str = Form(...),
    creator_id: Optional[str] = Form(None),
    description: Optional[str] = Form(None),
    username: str = Depends(authenticate)
):
    """
    Create a new secret.
    
    Args:
        name: The name of the secret.
        value: The value of the secret.
        creator_id: The creator ID.
        description: A description of the secret.
        username: The authenticated username.
        
    Returns:
        A redirect to the index page.
    """
    result = await set_secret(name, value, creator_id, description)
    
    if not result:
        raise HTTPException(status_code=500, detail=f"Failed to create secret '{name}'")
    
    return RedirectResponse(url="/", status_code=303)


@app.post("/delete/{name}")
async def delete_secret_handler(
    name: str,
    creator_id: Optional[str] = Form(None),
    username: str = Depends(authenticate)
):
    """
    Delete a secret.
    
    Args:
        name: The name of the secret.
        creator_id: The creator ID.
        username: The authenticated username.
        
    Returns:
        A redirect to the index page.
    """
    result = await delete_secret(name, creator_id)
    
    if not result:
        raise HTTPException(status_code=500, detail=f"Failed to delete secret '{name}'")
    
    return RedirectResponse(url="/", status_code=303)


# Create the HTML templates
index_html = """<!DOCTYPE html>
<html>
<head>
    <title>ESCAPE Secrets Admin</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            margin: 0;
            padding: 20px;
        }
        h1 {
            color: #333;
        }
        table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 20px;
        }
        th, td {
            padding: 10px;
            text-align: left;
            border-bottom: 1px solid #ddd;
        }
        th {
            background-color: #f2f2f2;
        }
        tr:hover {
            background-color: #f5f5f5;
        }
        .actions {
            display: flex;
            gap: 10px;
        }
        .btn {
            padding: 5px 10px;
            border: none;
            border-radius: 3px;
            cursor: pointer;
        }
        .btn-primary {
            background-color: #4CAF50;
            color: white;
        }
        .btn-danger {
            background-color: #f44336;
            color: white;
        }
        .header {
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>ESCAPE Secrets Admin</h1>
        <a href="/new" class="btn btn-primary">New Secret</a>
    </div>
    
    <table>
        <thead>
            <tr>
                <th>Name</th>
                <th>Creator ID</th>
                <th>Description</th>
                <th>Created At</th>
                <th>Updated At</th>
                <th>Actions</th>
            </tr>
        </thead>
        <tbody>
            {% for secret in secrets %}
            <tr>
                <td>{{ secret.name }}</td>
                <td>{{ secret.creator_id or "" }}</td>
                <td>{{ secret.description or "" }}</td>
                <td>{{ secret.created_at or "" }}</td>
                <td>{{ secret.updated_at or "" }}</td>
                <td class="actions">
                    <a href="/secret/{{ secret.name }}{% if secret.creator_id %}?creator_id={{ secret.creator_id }}{% endif %}" class="btn btn-primary">View</a>
                    <form method="post" action="/delete/{{ secret.name }}" onsubmit="return confirm('Are you sure you want to delete this secret?');">
                        {% if secret.creator_id %}
                        <input type="hidden" name="creator_id" value="{{ secret.creator_id }}">
                        {% endif %}
                        <button type="submit" class="btn btn-danger">Delete</button>
                    </form>
                </td>
            </tr>
            {% endfor %}
        </tbody>
    </table>
</body>
</html>
"""

secret_html = """<!DOCTYPE html>
<html>
<head>
    <title>ESCAPE Secrets Admin - {{ name }}</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            margin: 0;
            padding: 20px;
        }
        h1 {
            color: #333;
        }
        .secret {
            margin-top: 20px;
            padding: 20px;
            border: 1px solid #ddd;
            border-radius: 5px;
        }
        .label {
            font-weight: bold;
            margin-bottom: 5px;
        }
        .value {
            margin-bottom: 15px;
            word-break: break-all;
        }
        .btn {
            padding: 5px 10px;
            border: none;
            border-radius: 3px;
            cursor: pointer;
            text-decoration: none;
            display: inline-block;
            margin-top: 10px;
        }
        .btn-primary {
            background-color: #4CAF50;
            color: white;
        }
    </style>
</head>
<body>
    <h1>Secret: {{ name }}</h1>
    
    <div class="secret">
        <div class="label">Name:</div>
        <div class="value">{{ name }}</div>
        
        <div class="label">Value:</div>
        <div class="value">{{ value }}</div>
        
        {% if creator_id %}
        <div class="label">Creator ID:</div>
        <div class="value">{{ creator_id }}</div>
        {% endif %}
    </div>
    
    <a href="/" class="btn btn-primary">Back to List</a>
</body>
</html>
"""

new_html = """<!DOCTYPE html>
<html>
<head>
    <title>ESCAPE Secrets Admin - New Secret</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            margin: 0;
            padding: 20px;
        }
        h1 {
            color: #333;
        }
        form {
            margin-top: 20px;
            max-width: 500px;
        }
        .form-group {
            margin-bottom: 15px;
        }
        label {
            display: block;
            margin-bottom: 5px;
            font-weight: bold;
        }
        input[type="text"], textarea {
            width: 100%;
            padding: 8px;
            border: 1px solid #ddd;
            border-radius: 3px;
        }
        textarea {
            height: 100px;
        }
        .btn {
            padding: 8px 15px;
            border: none;
            border-radius: 3px;
            cursor: pointer;
            text-decoration: none;
            display: inline-block;
            margin-top: 10px;
        }
        .btn-primary {
            background-color: #4CAF50;
            color: white;
        }
        .btn-secondary {
            background-color: #f44336;
            color: white;
            margin-left: 10px;
        }
    </style>
</head>
<body>
    <h1>New Secret</h1>
    
    <form method="post" action="/new">
        <div class="form-group">
            <label for="name">Name:</label>
            <input type="text" id="name" name="name" required>
        </div>
        
        <div class="form-group">
            <label for="value">Value:</label>
            <textarea id="value" name="value" required></textarea>
        </div>
        
        <div class="form-group">
            <label for="creator_id">Creator ID (optional):</label>
            <input type="text" id="creator_id" name="creator_id">
        </div>
        
        <div class="form-group">
            <label for="description">Description (optional):</label>
            <textarea id="description" name="description"></textarea>
        </div>
        
        <button type="submit" class="btn btn-primary">Create Secret</button>
        <a href="/" class="btn btn-secondary">Cancel</a>
    </form>
</body>
</html>
"""


def create_templates():
    """
    Create the HTML templates.
    """
    with open(os.path.join(templates_dir, "index.html"), "w") as f:
        f.write(index_html)
    
    with open(os.path.join(templates_dir, "secret.html"), "w") as f:
        f.write(secret_html)
    
    with open(os.path.join(templates_dir, "new.html"), "w") as f:
        f.write(new_html)


def main():
    """
    Main entry point for the admin panel.
    """
    # Create the templates
    create_templates()
    
    # Run the server
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run(app, host="0.0.0.0", port=port)


if __name__ == "__main__":
    main()
