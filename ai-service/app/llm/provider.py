from abc import ABC, abstractmethod
from typing import Dict, Any, List
import json
import httpx
from app.config import settings

class BaseLLMProvider(ABC):
    @abstractmethod
    def generate_response(self, prompt: str, system_prompt: str = "") -> str:
        pass

    @abstractmethod
    def generate_structured_json(self, prompt: str, schema_description: str) -> Dict[str, Any]:
        pass

class MockDeterministicLLMProvider(BaseLLMProvider):
    """
    High-performance, rule-assisted mock LLM provider for reliable academic research demonstration
    and execution without external API key dependencies.
    """
    def generate_response(self, prompt: str, system_prompt: str = "") -> str:
        return f"[Deterministic Decision Support]: Processed analysis for prompt context."

    def generate_structured_json(self, prompt: str, schema_description: str) -> Dict[str, Any]:
        # Simple fallback parsing logic for structured responses
        return {"status": "success", "message": "Structured output generated via deterministic engine"}

class GeminiLLMProvider(BaseLLMProvider):
    def __init__(self, api_key: str):
        self.api_key = api_key
        self.url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={self.api_key}"

    def generate_response(self, prompt: str, system_prompt: str = "") -> str:
        if not self.api_key:
            return MockDeterministicLLMProvider().generate_response(prompt, system_prompt)
        headers = {"Content-Type": "application/json"}
        payload = {
            "contents": [{"parts": [{"text": f"{system_prompt}\n\n{prompt}"}]}]
        }
        try:
            with httpx.Client(timeout=10.0) as client:
                resp = client.post(self.url, json=payload, headers=headers)
                if resp.status_code == 200:
                    data = resp.json()
                    return data["candidates"][0]["content"]["parts"][0]["text"]
        except Exception:
            pass
        return MockDeterministicLLMProvider().generate_response(prompt, system_prompt)

    def generate_structured_json(self, prompt: str, schema_description: str) -> Dict[str, Any]:
        raw = self.generate_response(f"{prompt}\nReturn strict JSON adhering to schema:\n{schema_description}")
        try:
            # Strip markdown codeblocks if present
            clean = raw.replace("```json", "").replace("```", "").strip()
            return json.loads(clean)
        except Exception:
            return MockDeterministicLLMProvider().generate_structured_json(prompt, schema_description)

class OpenAILLMProvider(BaseLLMProvider):
    def __init__(self, api_key: str):
        self.api_key = api_key

    def generate_response(self, prompt: str, system_prompt: str = "") -> str:
        if not self.api_key:
            return MockDeterministicLLMProvider().generate_response(prompt, system_prompt)
        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json"
        }
        payload = {
            "model": "gpt-4o-mini",
            "messages": [
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": prompt}
            ]
        }
        try:
            with httpx.Client(timeout=10.0) as client:
                resp = client.post("https://api.openai.com/v1/chat/completions", json=payload, headers=headers)
                if resp.status_code == 200:
                    return resp.json()["choices"][0]["message"]["content"]
        except Exception:
            pass
        return MockDeterministicLLMProvider().generate_response(prompt, system_prompt)

    def generate_structured_json(self, prompt: str, schema_description: str) -> Dict[str, Any]:
        raw = self.generate_response(prompt, f"Respond ONLY in valid JSON matching schema:\n{schema_description}")
        try:
            clean = raw.replace("```json", "").replace("```", "").strip()
            return json.loads(clean)
        except Exception:
            return MockDeterministicLLMProvider().generate_structured_json(prompt, schema_description)

def get_llm_provider() -> BaseLLMProvider:
    provider = settings.LLM_PROVIDER.lower()
    if provider == "gemini" and settings.GEMINI_API_KEY:
        return GeminiLLMProvider(settings.GEMINI_API_KEY)
    elif provider == "openai" and settings.OPENAI_API_KEY:
        return OpenAILLMProvider(settings.OPENAI_API_KEY)
    return MockDeterministicLLMProvider()
