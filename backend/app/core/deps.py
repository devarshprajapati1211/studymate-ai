from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from bson import ObjectId
from app.core.security import decode_access_token
from app.db.mongodb import get_database

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login")


async def get_current_user(token: str = Depends(oauth2_scheme)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    user_id = decode_access_token(token)
    if not user_id:
        raise credentials_exception
    
    db = get_database()
    try:
        user = await db.users.find_one({"_id": ObjectId(user_id)})
    except Exception:
        user = await db.users.find_one({"id": user_id})

    if not user:
        raise credentials_exception
    
    user["id"] = str(user["_id"])
    return user


async def get_current_student(current_user: dict = Depends(get_current_user)):
    db = get_database()
    student = await db.students.find_one({"user_id": current_user["id"]})
    if not student:
        # Create empty student record if missing
        student_doc = {
            "user_id": current_user["id"],
            "name": current_user.get("name", "Student"),
            "college": "Tech University",
            "degree": "B.Tech / B.E.",
            "branch": "Computer Science & Engineering",
            "year": "3rd Year",
            "available_hours": 3.0,
            "preferred_start_time": "09:00",
            "preferred_end_time": "21:00",
            "preferred_break_duration": 15,
            "learning_preference": "Mixed",
            "is_onboarded": False
        }
        res = await db.students.insert_one(student_doc)
        student_doc["_id"] = res.inserted_id
        student = student_doc

    student["id"] = str(student["_id"])
    return student
