from pydantic_settings import BaseSettings

import os

enviroment = os.environ.get("ENVIRONMENT", "dev")


class AppSettings(BaseSettings):
    # MongoDB
    app_name: str = "Proyecto Agentes"
    environment: str = "dev"
    debug: bool = True

    # CORS 
    allowed_origins: list[str]
    
    # Server settings
    host: str = "0.0.0.0"
    port: int = 8000
    
    class Config:
        env_file = f"core/envs/.app.{enviroment}.env"

