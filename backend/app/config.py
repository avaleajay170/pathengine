from pydantic import BaseSettings


class Settings(BaseSettings):
    mongodb_uri: str = "mongodb://localhost:27017"
    mongodb_db_name: str = "trajectory"

    llm_provider: str = "sarvam"
    llm_api_key: str = ""
    llm_fallback_provider: str = "openai"
    llm_fallback_api_key: str = ""

    embedding_model: str = "all-MiniLM-L6-v2"

    env: str = "development"

    class Config:
        env_file = ".env"


settings = Settings()