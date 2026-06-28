import logging
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from api.routes import router
from database.session import engine
from database.models import Base

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
    datefmt="%H:%M:%S"
)
logger = logging.getLogger("echobrain")

# Create tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="EchoBrain AI Backend",
    description="Backend services for EchoBrain AI — your second brain for YouTube videos",
    version="2.0.0"
)

# Configure CORS for frontend access
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, restrict to frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(router, prefix="/api")

@app.get("/")
def health_check():
    return {"status": "ok", "service": "EchoBrain AI Backend", "version": "2.0.0"}

@app.on_event("startup")
async def startup():
    logger.info("═" * 50)
    logger.info("  EchoBrain AI Backend v2.0.0")
    logger.info("  API docs: http://localhost:8000/docs")
    logger.info("═" * 50)
