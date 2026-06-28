from fastapi import APIRouter, HTTPException, BackgroundTasks, Depends
from pydantic import BaseModel
from sqlalchemy.orm import Session
from services.youtube import extract_video_id, get_video_metadata, get_transcript, get_full_transcript_text
from services.ai import process_transcript_for_mindmap
from langchain_groq import ChatGroq
from langchain_core.prompts import PromptTemplate
from core.config import settings
from database.session import get_db
from database.models import Video
import uuid
import json
import logging

logger = logging.getLogger(__name__)

router = APIRouter()

# In-memory cache for active processing jobs (supplements the DB)
jobs: dict = {}

class ProcessRequest(BaseModel):
    url: str

class ChatRequest(BaseModel):
    video_id: str
    message: str


async def process_video_background(job_id: str, video_id: str, url: str):
    """Background task: fetch transcript, generate mind map, persist to DB."""
    try:
        jobs[job_id]["status"] = "processing"
        jobs[job_id]["step"] = "Fetching metadata..."
        
        metadata = get_video_metadata(video_id)
        jobs[job_id]["metadata"] = metadata
        
        jobs[job_id]["step"] = "Fetching transcript..."
        transcript = get_transcript(video_id)
        transcript_text = get_full_transcript_text(transcript)
        
        jobs[job_id]["step"] = "Analyzing content with AI..."
        mindmap_data = await process_transcript_for_mindmap(transcript_text)
        
        result = {
            "metadata": metadata,
            "transcript": transcript,
            "mindmap": mindmap_data
        }
        
        jobs[job_id]["status"] = "completed"
        jobs[job_id]["result"] = result
        
        # Persist to SQLite
        try:
            from database.session import SessionLocal
            db = SessionLocal()
            existing = db.query(Video).filter(Video.id == video_id).first()
            if existing:
                existing.status = "completed"
                existing.title = metadata.get("title", "Unknown")
                existing.transcript_json = transcript
                existing.mindmap_json = mindmap_data
            else:
                video = Video(
                    id=video_id,
                    url=url,
                    title=metadata.get("title", "Unknown"),
                    status="completed",
                    transcript_json=transcript,
                    mindmap_json=mindmap_data
                )
                db.add(video)
            db.commit()
            db.close()
            logger.info(f"Persisted video {video_id} to database")
        except Exception as db_err:
            logger.error(f"Failed to persist to DB: {db_err}")
        
    except Exception as e:
        logger.error(f"Processing failed for job {job_id}: {e}")
        jobs[job_id]["status"] = "failed"
        jobs[job_id]["error"] = str(e)


@router.post("/process")
async def process_video(req: ProcessRequest, background_tasks: BackgroundTasks):
    """Start processing a YouTube video URL."""
    try:
        video_id = extract_video_id(req.url)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    
    job_id = str(uuid.uuid4())
    jobs[job_id] = {
        "status": "pending",
        "video_id": video_id,
        "url": req.url
    }
    
    background_tasks.add_task(process_video_background, job_id, video_id, req.url)
    return {"job_id": job_id, "video_id": video_id}


@router.get("/status/{job_id}")
def get_status(job_id: str):
    """Check the processing status of a job."""
    if job_id not in jobs:
        raise HTTPException(status_code=404, detail="Job not found")
    return jobs[job_id]


@router.post("/chat")
async def chat_with_video(req: ChatRequest):
    """Chat with the AI about a processed video's content."""
    try:
        # Find transcript from in-memory jobs first
        transcript_text = None
        for job in jobs.values():
            if job.get("video_id") == req.video_id and job.get("status") == "completed":
                transcript_text = get_full_transcript_text(job["result"]["transcript"])
                break
        
        # Fallback: check the database
        if not transcript_text:
            try:
                from database.session import SessionLocal
                db = SessionLocal()
                video = db.query(Video).filter(Video.id == req.video_id).first()
                db.close()
                if video and video.transcript_json:
                    transcript_text = get_full_transcript_text(video.transcript_json)
            except Exception as db_err:
                logger.error(f"DB lookup failed: {db_err}")
        
        if not transcript_text:
            return {"response": "Sorry, I couldn't find the analyzed data for this video. Please try re-analyzing it."}
            
        # Truncate transcript to fit in context window
        truncated_transcript = transcript_text[:40000]
        
        llm = ChatGroq(
            model_name="llama-3.3-70b-versatile",
            temperature=0.3,
            groq_api_key=settings.GROQ_API_KEY
        )
        
        prompt = PromptTemplate(
            input_variables=["transcript", "question"],
            template="""You are EchoBrain, an intelligent AI assistant for understanding YouTube video content.
Answer the user's question based ONLY on the transcript below. Be detailed, well-structured, and helpful.
Use bullet points and clear formatting when listing items. If the answer is not in the transcript, say so honestly.

Transcript:
{transcript}

Question: {question}

Answer:"""
        )
        
        chain = prompt | llm
        response = await chain.ainvoke({"transcript": truncated_transcript, "question": req.message})
        
        return {"response": response.content}
    except Exception as e:
        logger.error(f"Chat error: {e}")
        return {"response": f"Sorry, I encountered an error processing your question. Please try again."}


@router.get("/videos")
def list_videos(db: Session = Depends(get_db)):
    """List all previously analyzed videos."""
    videos = db.query(Video).filter(Video.status == "completed").order_by(Video.created_at.desc()).limit(20).all()
    return [
        {
            "id": v.id,
            "title": v.title,
            "url": v.url,
            "status": v.status,
            "created_at": str(v.created_at) if v.created_at else None
        }
        for v in videos
    ]
