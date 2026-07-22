from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers.simulation import router as simulation_router
from app.config import settings
from app.database import Base, engine
from app.models.analysis import Analysis
from app.models.chat import Chat
from app.models.user import User
from app.routers.auth import router as auth_router
from app.routers.chat import router as chat_router
from app.routers.daily import router as daily_router

Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="EchoLens API",
    description="Critical thinking and perspective-taking platform",
    version="1.0.0",
)
app.add_middleware(
    CORSMiddleware,
    allow_origin_regex=r"https://.*\.vercel\.app",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router)
app.include_router(chat_router)
app.include_router(daily_router)
app.include_router(simulation_router)
@app.get("/")
def root():
    return {"message": "🚀 Welcome to EchoLens AI API"}

@app.get("/health")
def health():
    return {
        "status": "healthy",
        "version": "1.0.0"
    }