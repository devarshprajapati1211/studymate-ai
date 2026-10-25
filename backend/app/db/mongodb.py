import logging
from motor.motor_asyncio import AsyncIOMotorClient, AsyncIOMotorDatabase
from app.core.config import settings

logger = logging.getLogger("studymate.db")


class Database:
    client: AsyncIOMotorClient = None
    db: AsyncIOMotorDatabase = None


db = Database()

async def connect_to_mongo():

    logger.info("Connecting to MongoDB Atlas...")

    db.client = AsyncIOMotorClient(
        settings.MONGODB_URL,
        maxPoolSize=50,
        minPoolSize=0,
        serverSelectionTimeoutMS=10000
    )

    try:
        # Verify MongoDB connection and authentication
        await db.client.admin.command("ping")

        logger.info("MongoDB Atlas connection successful!")

        db.db = db.client[settings.DATABASE_NAME]

        # Create indexes
        await db.db.users.create_index(
            "email",
            unique=True
        )

        await db.db.students.create_index(
            "user_id",
            unique=True
        )

        await db.db.subjects.create_index([
            ("student_id", 1),
            ("name", 1)
        ])

        await db.db.tasks.create_index([
            ("student_id", 1),
            ("scheduled_date", 1)
        ])

        await db.db.study_plans.create_index(
            "student_id"
        )

        logger.info(
            "MongoDB connected and indexes created successfully!"
        )

    except Exception:
        logger.exception(
            "MongoDB connection or initialization failed!"
        )
        db.client.close()
        db.client = None
        db.db = None
        raise


async def close_mongo_connection():
    if db.client:
        logger.info("Closing MongoDB connection...")
        db.client.close()
        logger.info("MongoDB connection closed.")


def get_database() -> AsyncIOMotorDatabase:
    return db.db
