import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.db.mongodb import connect_to_mongo, close_mongo_connection
from app.routers import (
    auth,
    student,
    subjects,
    dashboard,
    study_plan,
    tasks,
    progress,
    ai,
    demo
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s"
)
logger = logging.getLogger("studymate")


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: Connect to MongoDB
    logger.info("Initializing StudyMate AI backend...")
    await connect_to_mongo()
    yield
    # Shutdown: Close connections
    logger.info("Shutting down StudyMate AI backend...")
    await close_mongo_connection()


app = FastAPI(
    title="StudyMate AI API",
    description="Personalized AI Study Planner for College Students",
    version="1.0.0",
    lifespan=lifespan
)

# CORS configuration
origins = settings.cors_origins_list
logger.info(f"Configuring CORS for origins: {origins}")

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins if origins else ["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routers
api_prefix = settings.API_V1_STR

app.include_router(auth.router, prefix=api_prefix)
app.include_router(student.router, prefix=api_prefix)
app.include_router(subjects.router, prefix=api_prefix)
app.include_router(dashboard.router, prefix=api_prefix)
app.include_router(study_plan.router, prefix=api_prefix)
app.include_router(tasks.router, prefix=api_prefix)
app.include_router(progress.router, prefix=api_prefix)
app.include_router(ai.router, prefix=api_prefix)
app.include_router(demo.router, prefix=api_prefix)


@app.get("/api/health")
async def health_check():
    return {
        "status": "healthy",
        "app": "StudyMate AI",
        "version": "1.0.0",
        "tagline": "Study smarter. Plan better. Achieve more."
    }
