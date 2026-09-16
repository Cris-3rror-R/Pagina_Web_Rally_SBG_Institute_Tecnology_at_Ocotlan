"""
Application configuration using Pydantic Settings.
"""

from pydantic_settings import BaseSettings
from typing import Optional


class Settings(BaseSettings):
    """
    Application settings loaded from environment variables.
    """
    
    # API Configuration
    api_title: str = "Rally Competition Platform API"
    api_version: str = "1.0.0"
    api_host: str = "0.0.0.0"
    api_port: int = 8000
    environment: str = "development"
    
    # Supabase Configuration
    supabase_url: str
    supabase_key: str
    supabase_anon_key: str
    jwt_secret: Optional[str] = None
    
    # CORS Configuration
    allowed_origins: list = ["http://localhost:3000"]
    
    # Database Configuration
    database_url: Optional[str] = None
    
    class Config:
        env_file = ".env"
        case_sensitive = False


# Create global settings instance
settings = Settings()
