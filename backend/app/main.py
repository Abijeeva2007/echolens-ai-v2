from fastapi import FastAPI
from app.routers.auth import router as auth_router
from app.routers.chat import router as chat_router
from app.database import Base, engine
from app.models.user import User
from fastapi.middleware.cors import CORSMiddleware
from app.models.chat import Chat
from app.routers.daily import router as daily_router
from app.models.analysis import Analysis

Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="EchoLens AI API",
    version="1.0.0"
)
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://192.168.199.10:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router)
app.include_router(chat_router)
app.include_router(daily_router)
@app.get("/")
def root():
    return {"message": "🚀 Welcome to EchoLens AI API"}

@app.get("/health")
def health():
    return {
        "status": "healthy",
        "version": "1.0.0"
    }