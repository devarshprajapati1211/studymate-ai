import asyncio
from app.db.mongodb import connect_to_mongo, close_mongo_connection, get_database
from app.services.priority_engine import calculate_subject_priority
from app.services.study_planner import generate_deterministic_plan


async def main():
    print("Testing Priority Engine...")
    p1 = calculate_subject_priority("DBMS", "2026-09-14", "Hard", 45, "High")
    print(f"DBMS Priority Score: {p1['priority_score']} ({p1['priority_level']}) - {p1['priority_explanation']}")
    
    p2 = calculate_subject_priority("Python", "2026-09-24", "Medium", 65, "Medium")
    print(f"Python Priority Score: {p2['priority_score']} ({p2['priority_level']}) - {p2['priority_explanation']}")
    
    await connect_to_mongo()
    db = get_database()
    print("MongoDB Connected:", await db.command("ping"))
    await close_mongo_connection()
    print("All backend tests passed!")


if __name__ == "__main__":
    asyncio.run(main())
