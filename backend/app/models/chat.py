from sqlalchemy import Column, Integer, Text, ForeignKey, DateTime
from sqlalchemy.sql import func

from app.database import Base

class Chat(Base):
    __tablename__ = "chat_history"

    id = Column(Integer, primary_key=True, index=True)

    user_id = Column(Integer, ForeignKey("users.id"))

    message = Column(Text)

    reply = Column(Text)

    created_at = Column(DateTime(timezone=True), server_default=func.now())