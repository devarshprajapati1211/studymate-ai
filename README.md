# StudyMate AI 🎓✨
> **"Study smarter. Plan better. Achieve more."**

StudyMate AI is a production-quality, personalized AI study planner built specifically for college students. It analyzes a student's subjects, difficulty levels, exam countdowns, preparation deficit, and daily available study hours to generate an adaptive, realistic study roadmap.

---

## 🌟 Key Features

1. **Student Onboarding & Profile Setup**:
   - 4-step wizard: Academic details (Degree/Year/Branch) ➔ Subjects, Difficulties & Exam Dates ➔ Daily Study Availability ➔ Preferred Learning Style (Reading, Videos, Practice, Mixed).
2. **AI Priority Engine (Deterministic)**:
   - Evaluates:
     - Days remaining until exam (urgency curve)
     - Syllabus difficulty weight (Easy, Medium, Hard)
     - Preparation deficit (`100 - preparation%`)
     - Subject importance (Low, Medium, High)
   - Outputs a calibrated `0–100` score with **HIGH 🔴**, **MEDIUM 🟠**, and **LOW 🟢** badges and plain-English rationales.
3. **Adaptive Study Plan Generator**:
   - Allocates balanced study time blocks (30–90 min) without overwhelming the student.
   - Rotates topics: Concept Revisions, Derivations, Previous-Year Questions (PYQs), and Timed Mock Assessments.
   - Fallback mode ensures 100% functionality even without external LLM keys.
4. **Smart Plan Adjustment (Missed Task Recovery)**:
   - When a student misses a task, StudyMate AI redistributes missed hours into bite-sized recovery sessions across the next 3 days rather than dropping or overloading.
5. **Interactive Dashboard**:
   - Exam countdown pill with urgency color coding.
   - Top priority subject spotlight with quick `Start Studying` action.
   - Today's checklist with real-time completion tracking and celebratory micro-animations.
6. **Progress Analytics**:
   - Built with **Recharts**:
     - Subject-wise preparation level bar chart.
     - Weekly study hours area chart (Planned vs. Completed).
     - Consecutive study streak counter and completion percentage.
7. **Context-Aware AI Study Assistant**:
   - Direct access to student's live subjects, exam dates, preparation %, and task list.
   - Answers questions like:
     - *"What should I study today?"*
     - *"I only have 1 hour today. Make me a plan."*
     - *"Which subject should I prioritize?"*
     - *"My DBMS exam is in 3 days. What should I do?"*
8. **1-Click College Demo Mode (Alex Mercer)**:
   - Instantly pre-seeds realistic college semester exam data:
     - **DBMS**: Hard, Exam in 5 days, 45% prep (Priority ~91, HIGH 🔴)
     - **Python**: Medium, Exam in 10 days, 65% prep (Priority ~48, MEDIUM 🟠)
     - **Computer Networks**: Hard, Exam in 12 days, 50% prep (Priority ~64, MEDIUM 🟠)
     - **Artificial Intelligence**: Medium, Exam in 15 days, 70% prep (Priority ~42, MEDIUM 🟠)
     - Daily availability: 3 hours/day.

---

## 🛠️ Technology Stack

- **Frontend**:
  - React 19 + Vite 8
  - Tailwind CSS v4
  - React Router DOM v7
  - Lucide React Icons
  - Recharts
  - Canvas Confetti
- **Backend**:
  - Python 3.13 + FastAPI
  - MongoDB + Motor (Async driver)
  - JWT Authentication + Passlib (Bcrypt hashing)
  - Pydantic v2 validation
  - HTTPX for optional LLM integration (OpenAI / Gemini) with seamless deterministic fallback

---

## 🚀 Quick Start Guide

### 1. Prerequisites
- Python 3.10+
- Node.js 18+ and npm
- MongoDB running locally on `mongodb://127.0.0.1:27017`

### 2. Backend Setup
```bash
cd backend
# Install Python dependencies
pip install -r requirements.txt

# Start FastAPI backend server
uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```
The API server will run at: `http://127.0.0.1:8000`  
Swagger API Docs available at: `http://127.0.0.1:8000/docs`

### 3. Frontend Setup
```bash
cd frontend
# Install npm dependencies
npm install

# Start Vite dev server
npm run dev
```
Open your browser at: `http://localhost:5173`

---

## 🔑 Environment Configuration

Backend configuration is located in `backend/.env` (example provided in `backend/.env.example`):
```env
PROJECT_NAME="StudyMate AI"
MONGODB_URL="mongodb://127.0.0.1:27017"
DATABASE_NAME="studymate_ai"
JWT_SECRET="studymate_ai_super_secret_jwt_key_2026_secure_random_key_production"
JWT_ALGORITHM="HS256"
ACCESS_TOKEN_EXPIRE_MINUTES=1440
OPENAI_API_KEY="" # Optional: Add OpenAI API key for LLM conversational synthesis
GEMINI_API_KEY="" # Optional
AI_FALLBACK_MODE=true
CORS_ORIGINS="http://localhost:5173,http://127.0.0.1:5173,http://localhost:3000"
```

---

