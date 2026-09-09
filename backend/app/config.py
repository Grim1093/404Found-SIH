"""Application configuration loaded from environment variables."""
import ssl
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    # Database
    DATABASE_URL: str = "postgresql+psycopg://avnadmin:AVNS_QX5HiKHmKYPVczSMpUc@pg-327e8968-grimllre-0a0a.k.aivencloud.com:23004/defaultdb"
    DATABASE_SSL: bool = True

    # JWT
    JWT_SECRET: str = "voxguard-dev-secret-change-in-production"
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 15
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7

    # ML Service
    ML_SERVICE_URL: str = "http://localhost:8001"

    # CORS
    CORS_ORIGINS: list[str] = ["http://localhost:3000"]

    # App
    APP_NAME: str = "VoxGuard API"
    DEBUG: bool = True

    # Valkey / Redis
    VALKEY_URL: str = "rediss://default:AVNS_2RmDqZ4UKjSM9hNbKsq@valkey-245c566-grimllre-0a0a.b.aivencloud.com:23005"

    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8")


settings = Settings()
