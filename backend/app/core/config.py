from typing import List, Union
from pydantic import AnyHttpUrl, field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    PROJECT_NAME: str = "StudyMate AI"
    API_V1_STR: str = "/api"
    
    MONGODB_URL: str = "mongodb://127.0.0.1:27017"
    DATABASE_NAME: str = "studymate_ai"
    
    JWT_SECRET: str = "studymate_ai_super_secret_jwt_key_2026_secure_random_key_production"
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24  # 24 hours
    
    OPENAI_API_KEY: str = ""
    GEMINI_API_KEY: str = ""
    AI_FALLBACK_MODE: bool = True
    
    CORS_ORIGINS: Union[str, List[str]] = "http://localhost:5173,http://127.0.0.1:5173,http://localhost:5174,http://127.0.0.1:5174,http://localhost:3000"

    @property
    def cors_origins_list(self) -> List[str]:
        if isinstance(self.CORS_ORIGINS, str):
            return [origin.strip() for origin in self.CORS_ORIGINS.split(",") if origin.strip()]
        return self.CORS_ORIGINS

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore"
    )


settings = Settings()
