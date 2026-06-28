import os
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    GROQ_API_KEY: str = os.getenv("GROQ_API_KEY", "")
    DATABASE_URL: str = "sqlite:///./echobrain.db"
    CHROMA_PERSIST_DIR: str = "./chroma_db"

    class Config:
        env_file = ".env"

settings = Settings()
