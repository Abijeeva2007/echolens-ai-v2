from pydantic import BaseModel

class DailyRequest(BaseModel):
    text: str