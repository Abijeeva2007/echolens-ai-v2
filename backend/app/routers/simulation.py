from fastapi import APIRouter
import google.generativeai as genai
import json

from app.config import settings

from app.config import settings

print("======= SIMULATION ========")
print("Gemini key loaded:", bool(settings.GEMINI_API_KEY))
print("Gemini key prefix:", settings.GEMINI_API_KEY[:10])
print("===========================")

genai.configure(api_key=settings.GEMINI_API_KEY)
model = genai.GenerativeModel("gemini-2.0-flash")

router = APIRouter(
    prefix="/simulation",
    tags=["Simulation"]
)


@router.post("/debate")
def simulate(data: dict):

    topic = data.get("topic", "")

    prompt = f"""
You are EchoLens AI.

A user submitted this topic:

"{topic}"

Your job is to simulate a balanced debate.

FIRST determine which viewpoints are actually relevant to this topic.

Choose ONLY 4-6 viewpoints.

They can come from ANY field including:

• Religious scholar
• LGBTQ+ advocate
• Conservative parent
• Clinical psychologist
• Human rights lawyer
• Economist
• Teacher
• Scientist
• Historian
• Philosopher
• Environmental activist
• Government policymaker
• National security expert
• Feminist
• Libertarian
• Socialist
• Capitalist
• Tech Optimist
• Privacy Advocate
• Medical Doctor
• Bioethicist
• Journalist
• Student
• Small Business Owner
• Investor
• Rural Citizen
• Urban Planner
• Cultural Anthropologist

Choose whatever perspectives best fit the topic.

Each perspective must have:

- id
- name
- emoji
- description
- response

After all viewpoints finish produce:

- tension
- common_ground
- synthesis

Return ONLY valid JSON.

Format:

{{
  "perspectives":[
    {{
      "id":"",
      "name":"",
      "emoji":"",
      "description":"",
      "response":""
    }}
  ],
  "reflection":{{
      "tension":"",
      "common_ground":"",
      "synthesis":""
  }}
}}
"""

    try:
        response = model.generate_content(prompt)

        text = response.text
        text = text.replace("```json", "").replace("```", "")

        data = json.loads(text)

        participants = []

        for p in data["perspectives"]:
            participants.append({
                "lensId": p["id"],
                "name": p["name"],
                "emoji": p["emoji"],
                "description": p["description"],
                "message": p["response"]
            })

        return {
            "participants": participants,
            "reflection": data["reflection"]
        }

    except Exception as e:
        return {
            "participants": [
                {
                    "lensId": "error",
                    "name": "EchoLens",
                    "emoji": "🤖",
                    "description": "Simulation Error",
                    "message": str(e)
                }
            ],
            "reflection": {
                "tension": "",
                "common_ground": "",
                "synthesis": ""
            }
        }