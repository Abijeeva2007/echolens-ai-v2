from fastapi import APIRouter
import google.generativeai as genai

from app.schemas.daily import DailyRequest
from app.config import settings

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

Your purpose is to help users recognize bias,
persuasion techniques,
missing perspectives,
and logical fallacies.

Never tell the user what to believe.

Instead, help them think critically.

Analyze the following content.

Return your answer in Markdown.

Include exactly these sections:

# Summary

# Main Claim

# Persuasion Techniques

# Possible Biases

# Missing Perspectives

# Questions to Consider

# Fairness Score (out of 10)

Content:

{request.text}
"""

    try:
        response = model.generate_content(prompt)
        analysis = response.text

    except Exception as e:
        print(e)
        analysis = "⚠️ EchoLens AI couldn't analyze this content right now."

    return {
        "analysis": analysis
    }