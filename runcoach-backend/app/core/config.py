from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    APP_NAME: str = "RunCoach API"
    API_PREFIX: str = "/api"
    BACKEND_CORS_ORIGINS: str = "http://localhost:3000"

    JWT_SECRET: str
    JWT_EXPIRE_MINUTES: int = 60 * 24 * 30
    JWT_ALG: str = "HS256"

    PG_HOST: str = "localhost"
    PG_PORT: int = 5432
    PG_DB: str = "runcoach"
    PG_USER: str = "runcoach"
    PG_PASSWORD: str = "runcoach"

    OPENAI_API_KEY: str | None = None

    class Config:
        env_file = ".env"

settings = Settings()
