# 🌿 BalanceFlow

**Mindful Wellness Companion powered by AI insights**

BalanceFlow is a fullstack AI wellness companion that helps users log yoga, meditation and breathing practices, track personal wellness patterns, view weekly progress, and receive safe AI-generated reflection insights.

The project combines a premium React frontend, a FastAPI backend, Neon PostgreSQL database, and Gemini AI integration with a rule-based fallback system.

---

## ✨ Overview

BalanceFlow is designed as a calm, human-centered wellness application focused on small daily practices, personal reflection and mindful progress.

Users can:

* 🧘 Explore guided yoga, meditation and breathing sessions
* 🌙 Follow structured practice sequences
* 📝 Log completed wellness sessions
* 📊 Track stress, energy, sleep and mood patterns
* 📅 View dashboard statistics and weekly reports
* 🤖 Receive AI-generated wellness insights powered by Gemini
* 🛡️ Continue using safe fallback insights if AI is unavailable

The app avoids medical claims, diagnosis, treatment language or therapy promises. AI insights are designed for personal awareness and reflection only.

---

## 🌟 Key Features

### 🧘 Practice Library

A visual library of guided wellness sessions including:

* Morning Yoga Flow
* Stress Relief Yoga
* Evening Stretch
* Sleep Meditation
* 5-Minute Breathing Reset
* Neck & Shoulder Release

Each practice includes:

* Premium visual card
* Duration and level
* Practice goal
* Structured 4–6 step sequence
* Guided session flow
* Completion summary
* Logging integration

---

### 🌊 Guided Sessions

Users can start a guided practice and move through structured steps with:

* Current pose or technique
* Step-by-step instruction
* Breath cue
* Progress indicator
* Next step preview
* Completion screen

After completing a session, users can log it into their wellness history.

---

### 📝 Wellness Logging

Users can log details such as:

* Practice type
* Practice title
* Duration
* Intensity
* Mood before and after
* Energy before and after
* Stress before and after
* Sleep quality
* Personal reflection

Logs are stored in the backend database and used for dashboard analytics, weekly reports and AI insights.

---

### 📊 Dashboard & Weekly Reports

BalanceFlow provides backend-generated wellness statistics, including:

* Total mindful practice minutes
* Total sessions
* Consistency streak
* Yoga impact score
* Average stress reduction
* Average energy change
* Average sleep quality
* Weekly practice minutes
* Session counts by practice type
* Gentle next-week goal

---

## 🤖 AI Insights

BalanceFlow includes a backend AI insights engine.

### AI Architecture

```text
Frontend
→ FastAPI Backend
→ Neon PostgreSQL
→ Stats Service
→ Prompt Service
→ Gemini AI
→ Safe JSON Response
→ Frontend Insight Cards
```

The AI Insights page can show:

* Pattern Summary
* Gentle Recommendation
* Stress Trend Insight
* Sleep & Energy Connection
* Reflection Summary
* Next Week Focus

The backend uses Gemini when available and automatically falls back to safe rule-based insights if:

* Gemini API key is missing
* Gemini quota is unavailable
* API request fails
* JSON parsing fails

The response always keeps the same structured shape for frontend stability.

---

## 🛡️ AI Safety Approach

BalanceFlow uses safe, supportive and non-medical language.

The AI system avoids:

* Diagnosis
* Treatment claims
* Cure claims
* Medical advice
* Therapy language
* Clinical promises
* Chakra or spiritual healing claims

Preferred language includes:

* “Your data suggests...”
* “You may notice...”
* “A gentle goal could be...”
* “This pattern may indicate...”
* “These insights are for personal awareness and are not medical advice.”

---

## 🛠️ Tech Stack

### Frontend

* React
* TypeScript
* Vite
* CSS
* Responsive premium UI
* Local optimized WebP practice images

### Backend

* Python
* FastAPI
* SQLAlchemy
* Pydantic
* Uvicorn

### Database

* Neon PostgreSQL for production preparation
* SQLite fallback for local development

### AI

* Gemini API
* google-genai SDK
* Prompt engineering
* Structured JSON response
* Rule-based fallback engine

### Tools & Deployment

* Git
* GitHub
* Render-ready backend
* Vercel-ready frontend
* Environment-based configuration

---

## 📁 Project Structure

```text
balanceflow-ai/
│
├── backend/
│   ├── app/
│   │   ├── routers/
│   │   │   ├── ai.py
│   │   │   ├── entries.py
│   │   │   ├── reports.py
│   │   │   └── stats.py
│   │   │
│   │   ├── services/
│   │   │   ├── ai_service.py
│   │   │   ├── prompt_service.py
│   │   │   └── stats_service.py
│   │   │
│   │   ├── core/
│   │   │   └── config.py
│   │   │
│   │   ├── database.py
│   │   ├── models.py
│   │   ├── schemas.py
│   │   └── main.py
│   │
│   ├── requirements.txt
│   └── .env.example
│
├── frontend/
│   ├── public/
│   │   └── practice-images/
│   │
│   ├── src/
│   │   ├── components/
│   │   ├── services/
│   │   ├── types/
│   │   ├── App.tsx
│   │   └── main.tsx
│   │
│   └── package.json
│
└── README.md
```

---

## 🔐 Environment Variables

### Backend

Create a local `backend/.env` file:

```env
DATABASE_URL=postgresql://username:password@host/database?sslmode=require
GEMINI_API_KEY=your_gemini_api_key_here
GEMINI_MODEL=gemini-2.5-flash
CORS_ORIGINS=http://localhost:5173,http://127.0.0.1:5173
```

If `DATABASE_URL` is not provided, the backend falls back to local SQLite.

Never commit real environment variables.

---

### Frontend

Create a local `frontend/.env` file if needed:

```env
VITE_API_BASE_URL=http://127.0.0.1:8000
```

For production, this should point to the deployed backend URL.

---

## 🚀 Run Locally

### Backend

```bash
cd backend
source .venv/Scripts/activate
python3 -m pip install -r requirements.txt
uvicorn app.main:app --reload
```

Backend runs at:

```text
http://127.0.0.1:8000
```

Swagger API docs:

```text
http://127.0.0.1:8000/docs
```

---

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend runs at:

```text
http://localhost:5173
```

---

## 🔌 API Endpoints

### Health

```text
GET /health
```

### Entries

```text
POST /api/entries/
GET /api/entries/
GET /api/entries/{entry_id}
DELETE /api/entries/{entry_id}
DELETE /api/entries/
```

### Stats

```text
GET /api/stats/dashboard
```

### Reports

```text
GET /api/reports/weekly
```

### AI Insights

```text
GET /api/ai/insights
```

---

## ✅ Current Status

BalanceFlow is currently prepared for deployment.

Completed:

* Premium frontend UI
* Practice Library
* Guided practice sequences
* Practice visuals
* Session logging
* FastAPI backend
* Neon PostgreSQL connection
* Stats and weekly reports
* Gemini AI insights
* Rule-based fallback insights
* Frontend AI Insights integration
* Deployment preparation

Next steps:

* Deploy backend to Render
* Deploy frontend to Vercel
* Connect production frontend to production backend
* Add live demo link
* Add portfolio case study

---

## 💼 Portfolio Summary

BalanceFlow is a fullstack AI wellness companion built with React, TypeScript, FastAPI, Neon PostgreSQL and Gemini AI.

It demonstrates:

* Frontend product design
* Backend API architecture
* Database integration
* AI prompt engineering
* Safe AI response handling
* Fallback logic
* Human-centered AI product thinking
* Deployment-ready fullstack development

---

## ⚠️ Disclaimer

BalanceFlow is a personal wellness and reflection app.

It does not provide medical advice, diagnosis, treatment or therapy. AI-generated insights are for personal awareness only.
