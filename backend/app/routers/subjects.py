from datetime import datetime, date
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from bson import ObjectId
from app.db.mongodb import get_database
from app.core.deps import get_current_student
from app.schemas.subject import SubjectCreate, SubjectUpdate, SubjectResponse
from app.services.priority_engine import calculate_subject_priority

router = APIRouter(prefix="/subjects", tags=["Subject Management"])


@router.get("", response_model=List[SubjectResponse])
async def list_subjects(student: dict = Depends(get_current_student)):
    db = get_database()
    cursor = db.subjects.find({"student_id": student["id"]})
    subjects = await cursor.to_list(length=100)
    
    results = []
    for s in subjects:
        # Dynamically recalculate priority with latest date
        p_info = calculate_subject_priority(
            name=s.get("name", ""),
            exam_date_str=s.get("exam_date", str(date.today())),
            difficulty=s.get("difficulty", "Medium"),
            preparation_percentage=s.get("preparation_percentage", 30),
            importance=s.get("importance", "Medium")
        )
        
        # Keep stored priority up-to-date
        if p_info["priority_score"] != s.get("priority_score"):
            await db.subjects.update_one(
                {"_id": s["_id"]},
                {"$set": {
                    "priority_score": p_info["priority_score"],
                    "priority_level": p_info["priority_level"],
                    "priority_explanation": p_info["priority_explanation"],
                    "days_until_exam": p_info["days_until_exam"]
                }}
            )

        results.append(SubjectResponse(
            id=str(s["_id"]),
            student_id=student["id"],
            name=s["name"],
            difficulty=s["difficulty"],
            exam_date=s["exam_date"],
            preparation_percentage=int(s.get("preparation_percentage", 0)),
            importance=s.get("importance", "Medium"),
            days_until_exam=p_info["days_until_exam"],
            priority_score=p_info["priority_score"],
            priority_level=p_info["priority_level"],
            priority_explanation=p_info["priority_explanation"]
        ))

    # Sort descending by priority score
    results.sort(key=lambda x: x.priority_score, reverse=True)
    return results


@router.post("", response_model=SubjectResponse)
async def create_subject(
    payload: SubjectCreate,
    student: dict = Depends(get_current_student)
):
    db = get_database()
    p_info = calculate_subject_priority(
        name=payload.name,
        exam_date_str=payload.exam_date,
        difficulty=payload.difficulty,
        preparation_percentage=payload.preparation_percentage,
        importance=payload.importance
    )
    doc = {
        "student_id": student["id"],
        "name": payload.name,
        "difficulty": payload.difficulty,
        "exam_date": payload.exam_date,
        "preparation_percentage": payload.preparation_percentage,
        "importance": payload.importance,
        "priority_score": p_info["priority_score"],
        "priority_level": p_info["priority_level"],
        "priority_explanation": p_info["priority_explanation"],
        "days_until_exam": p_info["days_until_exam"],
        "created_at": datetime.utcnow()
    }
    res = await db.subjects.insert_one(doc)
    doc_id = str(res.inserted_id)

    return SubjectResponse(
        id=doc_id,
        student_id=student["id"],
        name=payload.name,
        difficulty=payload.difficulty,
        exam_date=payload.exam_date,
        preparation_percentage=payload.preparation_percentage,
        importance=payload.importance,
        days_until_exam=p_info["days_until_exam"],
        priority_score=p_info["priority_score"],
        priority_level=p_info["priority_level"],
        priority_explanation=p_info["priority_explanation"]
    )


@router.put("/{subject_id}", response_model=SubjectResponse)
async def update_subject(
    subject_id: str,
    payload: SubjectUpdate,
    student: dict = Depends(get_current_student)
):
    db = get_database()
    try:
        obj_id = ObjectId(subject_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid subject ID format")

    existing = await db.subjects.find_one({"_id": obj_id, "student_id": student["id"]})
    if not existing:
        raise HTTPException(status_code=404, detail="Subject not found")

    update_dict = {k: v for k, v in payload.dict(exclude_unset=True).items() if v is not None}
    
    # Merge existing and updated values to recalculate priority
    name = update_dict.get("name", existing["name"])
    difficulty = update_dict.get("difficulty", existing["difficulty"])
    exam_date = update_dict.get("exam_date", existing["exam_date"])
    preparation = update_dict.get("preparation_percentage", existing["preparation_percentage"])
    importance = update_dict.get("importance", existing.get("importance", "Medium"))

    p_info = calculate_subject_priority(
        name=name,
        exam_date_str=exam_date,
        difficulty=difficulty,
        preparation_percentage=preparation,
        importance=importance
    )

    update_dict.update({
        "priority_score": p_info["priority_score"],
        "priority_level": p_info["priority_level"],
        "priority_explanation": p_info["priority_explanation"],
        "days_until_exam": p_info["days_until_exam"],
        "updated_at": datetime.utcnow()
    })

    await db.subjects.update_one({"_id": obj_id}, {"$set": update_dict})

    # If name changed, update task subject names
    if "name" in update_dict:
        await db.tasks.update_many(
            {"subject_id": subject_id},
            {"$set": {"subject_name": name}}
        )

    return SubjectResponse(
        id=subject_id,
        student_id=student["id"],
        name=name,
        difficulty=difficulty,
        exam_date=exam_date,
        preparation_percentage=int(preparation),
        importance=importance,
        days_until_exam=p_info["days_until_exam"],
        priority_score=p_info["priority_score"],
        priority_level=p_info["priority_level"],
        priority_explanation=p_info["priority_explanation"]
    )


@router.delete("/{subject_id}")
async def delete_subject(
    subject_id: str,
    student: dict = Depends(get_current_student)
):
    db = get_database()
    try:
        obj_id = ObjectId(subject_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid subject ID format")

    result = await db.subjects.delete_one({"_id": obj_id, "student_id": student["id"]})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Subject not found")

    # Clean up uncompleted tasks for this subject
    await db.tasks.delete_many({"subject_id": subject_id, "completed": False})

    return {"status": "success", "message": "Subject deleted successfully"}
