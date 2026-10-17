import logging
from motor.motor_asyncio import AsyncIOMotorClient, AsyncIOMotorDatabase
from app.core.config import settings

logger = logging.getLogger("studymate.db")


class Database:
    client: AsyncIOMotorClient = None
    db: AsyncIOMotorDatabase = None


db = Database()


async def connect_to_mongo():
    logger.info(f"Connecting to MongoDB at {settings.MONGODB_URL}...")
    db.client = AsyncIOMotorClient(
        settings.MONGODB_URL,
        maxPoolSize=50,
        minPoolSize=10,
        serverSelectionTimeoutMS=5000
    )
    db.db = db.client[settings.DATABASE_NAME]
    
    # Ensure indexes
    try:
        await db.db.users.create_index("email", unique=True)
        await db.db.students.create_index("user_id", unique=True)
        await db.db.subjects.create_index([("student_id", 1), ("name", 1)])
        await db.db.tasks.create_index([("student_id", 1), ("scheduled_date", 1)])
        await db.db.study_plans.create_index("student_id")
        logger.info("Connected to MongoDB successfully and indexes verified.")
    except Exception as e:
        logger.warning(f"Database index creation note: {e}")


async def close_mongo_connection():
    if db.client:
        logger.info("Closing MongoDB connection...")
        db.client.close()
        logger.info("MongoDB connection closed.")


def get_database() -> AsyncIOMotorDatabase:
    return db.db
