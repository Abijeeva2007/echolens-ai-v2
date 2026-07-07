from sqlalchemy.orm import Session
from app.models.chat import Chat


def save_chat(db: Session, user_id: int, message: str, reply: str):
    chat = Chat(
        user_id=user_id,
        message=message,
        reply=reply,
    )

    db.add(chat)
    db.commit()
    db.refresh(chat)

    return chat


def get_chat_history(db: Session, user_id: int):
    return (
        db.query(Chat)
        .filter(Chat.user_id == user_id)
        .order_by(Chat.created_at.asc())
        .all()
    )