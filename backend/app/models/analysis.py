from sqlalchemy import Column, Integer, Text, DateTime, ForeignKey, String
from sqlalchemy.sql import func

from app.database import Base


class Analysis(Base):
    __tablename__ = "analysis_history"

    id = Column(Integer, primary_key=True, index=True)

    user_id = Column(Integer, ForeignKey("users.id"))

    mode = Column(String(30))

    title = Column(String(255))

    input_text = Column(Text)

    result = Column(Text)

    created_at = Column(DateTime(timezone=True), server_default=func.now())