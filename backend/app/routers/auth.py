from datetime import datetime
from fastapi import APIRouter, HTTPException, status, Depends
from bson import ObjectId
from app.db.mongodb import get_database
from app.core.security import verify_password, get_password_hash, create_access_token
from app.core.deps import get_current_user
from app.schemas.user import UserRegister, UserLogin, Token, UserResponse

router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post("/register", response_model=Token)
async def register(user_in: UserRegister):
    db = get_database()
    existing = await db.users.find_one({"email": user_in.email.lower()})
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="A user with this email already exists"
        )
    
    hashed_pw = get_password_hash(user_in.password)
    user_doc = {
        "name": user_in.name,
        "email": user_in.email.lower(),
        "password": hashed_pw,
        "is_onboarded": False,
        "created_at": datetime.utcnow()
    }
    result = await db.users.insert_one(user_doc)
    user_id = str(result.inserted_id)

    # Pre-create student profile
    student_doc = {
        "user_id": user_id,
        "name": user_in.name,
        "college": "",
        "degree": "",
        "branch": "",
        "year": "",
        "available_hours": 3.0,
        "preferred_start_time": "09:00",
        "preferred_end_time": "21:00",
        "preferred_break_duration": 15,
        "learning_preference": "Mixed",
        "is_onboarded": False
    }
    await db.students.insert_one(student_doc)

    token = create_access_token(user_id)
    return Token(
        access_token=token,
        token_type="bearer",
        is_onboarded=False,
        user=UserResponse(
            id=user_id,
            name=user_in.name,
            email=user_in.email,
            is_onboarded=False,
            created_at=user_doc["created_at"]
        )
    )


@router.post("/login", response_model=Token)
async def login(credentials: UserLogin):
    db = get_database()
    user = await db.users.find_one({"email": credentials.email.lower()})
    if not user or not verify_password(credentials.password, user.get("password", "")):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password"
        )
    
    user_id = str(user["_id"])
    student = await db.students.find_one({"user_id": user_id})
    is_onboarded = student.get("is_onboarded", False) if student else False

    token = create_access_token(user_id)
    return Token(
        access_token=token,
        token_type="bearer",
        is_onboarded=is_onboarded,
        user=UserResponse(
            id=user_id,
            name=user.get("name", "Student"),
            email=user["email"],
            is_onboarded=is_onboarded,
            created_at=user.get("created_at")
        )
    )


@router.get("/me")
async def get_me(current_user: dict = Depends(get_current_user)):
    db = get_database()
    student = await db.students.find_one({"user_id": current_user["id"]})
    return {
        "id": current_user["id"],
        "name": current_user.get("name"),
        "email": current_user.get("email"),
        "is_onboarded": student.get("is_onboarded", False) if student else False,
        "student": {
            "college": student.get("college") if student else "",
            "degree": student.get("degree") if student else "",
            "branch": student.get("branch") if student else "",
            "year": student.get("year") if student else "",
            "available_hours": student.get("available_hours", 3.0) if student else 3.0,
            "learning_preference": student.get("learning_preference", "Mixed") if student else "Mixed"
        }
    }
