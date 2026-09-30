import os

class Settings:
    PROJECT_NAME: str = "Hospital Flow AI - Agent Service"
    LLM_PROVIDER: str = os.getenv("LLM_PROVIDER", "mock")  # mock, gemini, openai
    GEMINI_API_KEY: str = os.getenv("GEMINI_API_KEY", "")
    OPENAI_API_KEY: str = os.getenv("OPENAI_API_KEY", "")
    BACKEND_API_URL: str = os.getenv("BACKEND_API_URL", "http://localhost:8080/api")

settings = Settings()
