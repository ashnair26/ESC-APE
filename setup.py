#!/usr/bin/env python3
"""
Setup script for the ESCAPE Creator Engine.
"""

from setuptools import setup, find_packages

setup(
    name="escape",
    version="0.1.0",
    description="ESCAPE Creator Engine - A Web3-native creator platform",
    author="ESCAPE Team",
    author_email="info@escape.xyz",
    packages=find_packages(),
    install_requires=[
        "mcp>=1.5.0",
        "httpx>=0.24.0",
        "pydantic>=2.0.0",
        "python-dotenv>=1.0.0",
    ],
    extras_require={
        "dev": [
            "pytest>=7.0.0",
            "pytest-cov>=4.0.0",
            "black>=23.0.0",
            "isort>=5.0.0",
            "mypy>=1.0.0",
        ],
    },
    python_requires=">=3.8",
    classifiers=[
        "Development Status :: 3 - Alpha",
        "Intended Audience :: Developers",
        "License :: OSI Approved :: MIT License",
        "Programming Language :: Python :: 3",
        "Programming Language :: Python :: 3.8",
        "Programming Language :: Python :: 3.9",
        "Programming Language :: Python :: 3.10",
        "Programming Language :: Python :: 3.11",
    ],
)
