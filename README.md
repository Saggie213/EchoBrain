# 🧠 EchoBrain AI

**Your AI Second Brain for YouTube**

Turn any YouTube video into an intelligent knowledge workspace — AI-generated mind maps, searchable transcripts, and conversational Q&A, all in one place.

![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)
![FastAPI](https://img.shields.io/badge/FastAPI-0.138-009688?logo=fastapi)
![Groq](https://img.shields.io/badge/Groq-Llama_3.3_70B-orange)
![License](https://img.shields.io/badge/License-MIT-blue)

---

## ✨ Features

- 🗺️ **Visual Mind Maps** — AI generates interactive, explorable mind maps from video content using React Flow
- 💬 **AI-Powered Chat** — Ask questions about any part of the video and get instant, accurate answers
- 📝 **Smart Transcripts** — Searchable, timestamped transcripts with keyword highlighting
- 🔗 **Click-to-Ask** — Click any mind map node or transcript segment to instantly ask the AI about it
- 📚 **Video History** — All analyzed videos are saved and accessible anytime
- ⚡ **Fast Processing** — Background processing with real-time status updates

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | Next.js 16, React 19, TypeScript, Tailwind CSS, Framer Motion |
| **Mind Map** | React Flow (@xyflow/react) |
| **UI Components** | shadcn/ui, Lucide Icons |
| **Backend** | FastAPI (Python) |
| **AI/LLM** | Groq Cloud (Llama 3.3 70B) via LangChain |
| **Database** | SQLite + SQLAlchemy |
| **Transcripts** | youtube-transcript-api |

---

## 🚀 Getting Started

### Prerequisites

- Python 3.10+
- Node.js 18+
- [Groq API Key](https://console.groq.com/) (free tier available)

### 1. Clone the repo

```bash
git clone https://github.com/Saggie213/EchoBrain.git
cd EchoBrain
```

### 2. Set up the Backend

```bash
cd backend

# Create and activate virtual environment
python -m venv venv
venv\Scripts\activate        # Windows
# source venv/bin/activate   # macOS/Linux

# Install dependencies
pip install -r requirements.txt

# Create .env file
echo GROQ_API_KEY=your_groq_api_key_here > .env

# Start the server
uvicorn main:app --reload --port 8000
```

### 3. Set up the Frontend

```bash
cd frontend

# Install dependencies
npm install

# Create .env.local file
echo NEXT_PUBLIC_API_URL=http://localhost:8000 > .env.local

# Start the dev server
npm run dev
```

### 4. Open the app

Visit **http://localhost:3000** and paste any YouTube URL!

> 💡 **Quick start (Windows):** Just run `start.bat` from the root directory to launch both servers at once.

---

## 📸 How It Works

```
┌──────────────────┐     ┌──────────────────┐     ┌──────────────────┐
│  1. Paste URL     │ ──▶ │  2. AI Analysis   │ ──▶ │  3. Explore!      │
│                    │     │                    │     │                    │
│  Drop any YouTube  │     │  Transcript +      │     │  Mind Map, Chat,   │
│  video link        │     │  Groq LLM          │     │  Transcript        │
└──────────────────┘     └──────────────────┘     └──────────────────┘
```

---

## 📁 Project Structure

```
echobrain-ai/
├── backend/
│   ├── api/
│   │   └── routes.py          # API endpoints (process, status, chat, videos)
│   ├── core/
│   │   └── config.py          # App configuration & env vars
│   ├── database/
│   │   ├── models.py          # SQLAlchemy models (Video)
│   │   └── session.py         # Database session management
│   ├── services/
│   │   ├── ai.py              # Groq LLM integration & mind map generation
│   │   └── youtube.py         # Transcript extraction & metadata scraping
│   ├── main.py                # FastAPI app entry point
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── app/
│   │   │   ├── page.tsx             # Landing page
│   │   │   └── dashboard/[jobId]/
│   │   │       └── page.tsx         # Dashboard (mind map, chat, transcript)
│   │   ├── components/
│   │   │   └── MindMap.tsx          # React Flow mind map component
│   │   └── lib/
│   │       └── api.ts               # Backend API client
│   └── package.json
├── start.bat                  # Quick-start script (Windows)
└── README.md
```

---

## 🔌 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/process` | Submit a YouTube URL for processing |
| `GET` | `/api/status/{job_id}` | Check processing status |
| `POST` | `/api/chat` | Ask a question about a processed video |
| `GET` | `/api/videos` | List all previously analyzed videos |
| `GET` | `/` | Health check |

---

## 🌐 Deployment

### Backend → [Render](https://render.com)

- **Root Directory:** `backend`
- **Build Command:** `pip install -r requirements.txt`
- **Start Command:** `uvicorn main:app --host 0.0.0.0 --port $PORT`
- **Env Var:** `GROQ_API_KEY`

### Frontend → [Vercel](https://vercel.com)

- **Root Directory:** `frontend`
- **Env Var:** `NEXT_PUBLIC_API_URL` = your Render backend URL

---

## 📄 License

This project is open source under the [MIT License](LICENSE).

---

<p align="center">
  Built with ❤️ using Next.js, FastAPI, and Groq AI
</p>
