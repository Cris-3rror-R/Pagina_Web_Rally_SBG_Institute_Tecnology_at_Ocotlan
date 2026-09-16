"""
Rally Competition Platform - Backend API
Main FastAPI application entry point.
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Initialize FastAPI app
app = FastAPI(
    title="Rally Competition Platform API",
    description="REST API backend for the Rally Competition Platform",
    version="1.0.0"
)

# Configure CORS middleware
allowed_origins = [
    "http://localhost:3000",  # Development
    "https://rally.example.com",  # Production (update with actual domain)
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
    max_age=3600,
)


# Health check endpoint
@app.get("/health")
async def health_check():
    """
    Health check endpoint for monitoring application status.
    
    Returns:
        dict: Status of the application and current timestamp
    """
    from datetime import datetime, timezone
    return {
        "status": "healthy",
        "timestamp": datetime.now(timezone.utc).isoformat()
    }


@app.get("/")
async def root():
    """
    Root endpoint providing basic API information.
    
    Returns:
        dict: API name and documentation links
    """
    return {
        "message": "Welcome to Rally Competition Platform API",
        "docs": "/docs",
        "openapi_schema": "/openapi.json"
    }


if __name__ == "__main__":
    import uvicorn
    
    # Get host and port from environment variables or use defaults
    host = os.getenv("API_HOST", "0.0.0.0")
    port = int(os.getenv("API_PORT", 8000))
    
    uvicorn.run(
        "main:app",
        host=host,
        port=port,
        reload=os.getenv("ENV", "development") == "development"
    )
