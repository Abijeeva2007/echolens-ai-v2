from fastapi import APIRouter
import google.generativeai as genai
import json

from app.schemas.daily import DailyRequest
from app.config import settings

print("========== DAILY ==========")
print("Gemini key loaded:", bool(settings.GEMINI_API_KEY))
print("Gemini key prefix:", settings.GEMINI_API_KEY[:10])
print("===========================")

genai.configure(api_key=settings.GEMINI_API_KEY)
model = genai.GenerativeModel("gemini-2.0-flash")

router = APIRouter(
    prefix="/daily",
    tags=["Daily Mode"]
)


@router.post("/analyze")
def analyze(request: DailyRequest):

    prompt = f"""
You are EchoLens AI.

Analyze the following content.

Return ONLY valid JSON.

Do NOT use markdown.
Do NOT use triple backticks.
Do NOT explain anything outside the JSON.

Return this exact format:

{{
  "summary": "",
  "main_claim": "",
  "persuasion": [],
  "biases": [],
  "missing_perspectives": [],
  "logical_fallacies": [],
  "emotion": "",
  "credibility_score": 0,
  "confidence": 0,
  "questions": [],
  "recommendation": ""
}}

Content:

{request.text}
"""

    try:
        response = model.generate_content(prompt)

        text = response.text.strip()

        # Gemini sometimes wraps JSON in ```json ... ```
        if text.startswith("```json"):
            text = text.replace("```json", "").replace("```", "").strip()

        analysis = json.loads(text)

    except Exception as e:
        print(e)

        analysis = {
            "summary": "Unable to analyze content.",
            "main_claim": "",
            "persuasion": [],
            "biases": [],
            "missing_perspectives": [],
            "logical_fallacies": [],
            "emotion": "Unknown",
            "credibility_score": 0,
            "confidence": 0,
            "questions": [],
            "recommendation": "Try again later."
        }

    return analysis