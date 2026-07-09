# EchoLens AI

EchoLens AI is an AI-powered platform that helps users break out of information bubbles by promoting critical thinking, perspective-taking, and media literacy.

## Features

### Authentication
- User Registration
- User Login
- JWT Authentication

### Dashboard
- User Profile
- XP Tracking
- Streak Tracking
- Navigation to all learning modes

### Daily Mode
Analyze articles and social media posts to identify:
- Persuasion techniques
- Logical fallacies
- Bias indicators
- Perspective score

### Simulation Mode
Explore how different people or groups may interpret the same topic using perspective-based simulations.

### Learning Mode
Interactive exercises including:
- Fallacy Spotter
- Bias Matcher
- XP-based learning

---

## Tech Stack

### Frontend
- Next.js
- React
- TypeScript
- Tailwind CSS

### Backend
- FastAPI
- SQLAlchemy
- JWT Authentication
- SQLite
- Google Gemini API

---

## Project Structure

```
echolens-ai/
│
├── frontend/
├── backend/
├── database/
├── assets/
└── README.md
```

---

## Running the Project

### Backend

```bash
cd backend
pip install -r requirements.txt
uvicorn app.main:app --reload
```

Runs on:

```
http://127.0.0.1:8000
```

---

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Runs on:

```
http://localhost:3000
```

---

## Current MVP Status

Implemented:
- Authentication
- Dashboard
- Daily Mode UI
- Simulation Mode UI
- Learning Mode UI
- Backend APIs
- Local development setup

In Progress:
- Full AI integration
- Production deployment
- UI enhancements
- Growth analytics

---

## Developer

Abi Jeeva

B.Tech Artificial Intelligence

Amrita Vishwa Vidyapeetham