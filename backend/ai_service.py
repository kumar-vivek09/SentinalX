import os
import logging
import requests
from google import genai

logger = logging.getLogger(__name__)

# ENV
OLLAMA_HOST = os.environ.get("OLLAMA_HOST", "http://localhost:11434")
OLLAMA_MODEL = os.environ.get("OLLAMA_MODEL", "llama3.1")
GOOGLE_API_KEY = os.environ.get("GOOGLE_API_KEY")

# Create Gemini client
client = None
if GOOGLE_API_KEY:
    try:
        client = genai.Client(api_key=GOOGLE_API_KEY)
        logger.info("✅ Gemini client initialized")
    except Exception as e:
        logger.error(f"❌ Gemini init failed: {e}")
else:
    logger.warning("⚠️ No GOOGLE_API_KEY found")


def analyze_threat(message: str) -> str:

    # -------------------------
    # 1. GEMINI (NEW SDK)
    # -------------------------
    if client:
        try:
            logger.info("🚀 Using Gemini (new SDK)")

            response = client.models.generate_content(
                model="gemini-2.0-flash-exp",
                contents=f"""
You are a cybersecurity threat analysis assistant.

Analyze:
{message}

Give:
- Threat type
- Severity
- Fix
"""
            )

            if response and response.text:
                return response.text.strip()

            logger.warning("⚠️ Gemini empty response")

        except Exception as e:
            logger.error(f"❌ Gemini failed: {e}")

    # -------------------------
    # 2. OLLAMA FALLBACK
    # -------------------------
    try:
        logger.info("🔁 Falling back to Ollama")

        response = requests.post(
            f"{OLLAMA_HOST}/api/generate",
            json={
                "model": OLLAMA_MODEL,
                "prompt": f"""
You are a cybersecurity threat analysis assistant.

Analyze:
{message}
""",
                "stream": False
            },
            timeout=30
        )

        if response.status_code == 200:
            return response.json().get("response", "Analyzing...")

    except Exception as e:
        logger.error(f"❌ Ollama failed: {e}")

    # -------------------------
    # 3. FINAL SAFE RESPONSE
    # -------------------------
    return (
        "Potential security threat detected. Recommend immediate investigation, "
        "access control review, and log analysis."
    )