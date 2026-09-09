"""ML service configuration."""
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    # Model
    MODEL_PATH: str = "models/asvspoof_model.pth"
    DEVICE: str = "auto"  # auto, cpu, cuda
    
    # Audio
    SAMPLE_RATE: int = 16000
    MAX_AUDIO_LENGTH_SEC: int = 300  # 5 minutes max
    CHUNK_LENGTH_SEC: float = 3.0  # chunk size for streaming
    
    # Risk scoring
    GENUINE_THRESHOLD: float = 40.0
    SUSPICIOUS_THRESHOLD: float = 70.0
    
    # App
    APP_NAME: str = "VoxGuard ML Service"
    DEBUG: bool = True
    
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8")


settings = Settings()
