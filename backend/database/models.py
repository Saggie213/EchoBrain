from sqlalchemy import Column, String, Integer, Text, DateTime, ForeignKey, JSON
from sqlalchemy.orm import relationship
from database.session import Base
import datetime

class Video(Base):
    __tablename__ = "videos"

    id = Column(String, primary_key=True, index=True) # YouTube Video ID
    url = Column(String, unique=True, index=True)
    title = Column(String)
    status = Column(String) # pending, processing, completed, failed
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    
    # Store the complex JSONs here for simplicity instead of separate tables for now
    transcript_json = Column(JSON, nullable=True) 
    mindmap_json = Column(JSON, nullable=True)

# Later we could add explicit TranscriptChunk tables, etc., 
# but for a quick production-ready v1 we will store chunks directly in ChromaDB
# and the full transcript in Video.transcript_json for rendering.
