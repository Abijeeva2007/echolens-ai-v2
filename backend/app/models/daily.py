from sqlalchemy import Column, Integer, Text, DateTime, ForeignKey
from sqlalchemy.sql import func

from app.database import Base

class DailyAnalysis(Base):
    __tablename__ = "daily_analysis"

    id = Column(Integer, primary_key=True, index=True)

    user_id = Column(Integer, ForeignKey("users.id"))

    original_text = Column(Text)

    analysis = Column(Text)

    created_at = Column(DateTime(timezone=True), server_default=func.now())