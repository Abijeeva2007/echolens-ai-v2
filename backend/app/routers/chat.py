from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
import google.generativeai as genai

from app.schemas.chat import ChatRequest
from app.database import SessionLocal
from app.services.chat_service import save_chat, get_chat_history
from app.config import settings

genai.configure(api_key=settings.GEMINI_API_KEY)
model = genai.GenerativeModel("gemini-2.0-flash")

router = APIRouter(
    prefix="/chat",
    tags=["Chat"]
)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@router.post("/")
def chat(
    request: ChatRequest,
    db: Session = Depends(get_db)
):

    prompt = f"""
You are EchoLens AI.

You are a compassionate AI assistant focused on:
- emotional wellbeing
- mental health awareness
- stress management
- anxiety support
- student wellbeing

Always answer politely.
Never give dangerous medical advice.
If someone is in crisis, encourage contacting a trusted adult.

User:
{request.message}
"""

    try:
        response = model.generate_content(prompt)
        reply = response.text

    except Exception as e:
        print("Gemini Error:", e)
        reply = "⚠️ EchoLens AI is temporarily busy. Please try again later."

    try:
        save_chat(
            db=db,
            user_id=1,
            message=request.message,
            reply=reply,
        )
        print("Chat saved successfully!")

    except Exception as e:
        print("Database Error:", e)

    return {
        "reply": reply
    }
@router.get("/history")
def history(
    db: Session = Depends(get_db)
):
    chats = get_chat_history(db, user_id=1)

    return [
        {
            "id": chat.id,
            "message": chat.message,
            "reply": chat.reply,
            "created_at": chat.created_at,
        }
        for chat in chats
    ]