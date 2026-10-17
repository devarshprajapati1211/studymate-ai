from datetime import date, datetime
from typing import Tuple, Dict, Any


def calculate_days_until_exam(exam_date_str: str) -> int:
    try:
        if isinstance(exam_date_str, (date, datetime)):
            target_date = exam_date_str.date() if isinstance(exam_date_str, datetime) else exam_date_str
        else:
            target_date = datetime.strptime(str(exam_date_str)[:10], "%Y-%m-%d").date()
        today = date.today()
        delta = (target_date - today).days
        return delta
    except Exception:
        return 7  # default fallback to 1 week


def calculate_subject_priority(
    name: str,
    exam_date_str: str,
    difficulty: str,
    preparation_percentage: int,
    importance: str = "Medium"
) -> Dict[str, Any]:
    """
    Deterministic AI Priority Scoring Engine.
    Evaluates:
      1. Days remaining until exam (urgency) - 38%
      2. Difficulty rating - 27%
      3. Preparation deficit (100 - prep%) - 25%
      4. Importance weight - 10%
    """
    days = calculate_days_until_exam(exam_date_str)
    prep = max(0, min(100, int(preparation_percentage)))
    diff = str(difficulty).strip().capitalize()
    imp = str(importance).strip().capitalize()

    # 1. Urgency score calculation based on countdown
    if days <= 0:
        urgency_score = 100
        days_desc = "exam is today or overdue"
    elif days <= 2:
        urgency_score = 98
        days_desc = f"critical exam in {days} day(s)"
    elif days <= 5:
        urgency_score = 88 - ((days - 3) * 4)  # 80-88
        days_desc = f"exam is very close in {days} days"
    elif days <= 10:
        urgency_score = 70 - ((days - 6) * 3)  # 58-70
        days_desc = f"exam in {days} days"
    elif days <= 20:
        urgency_score = 45 - ((days - 11) * 1.5)  # 31-45
        days_desc = f"exam in {days} days"
    else:
        urgency_score = max(10, 30 - ((days - 20) * 0.5))
        days_desc = f"exam is {days} days away"

    # 2. Difficulty score
    diff_map = {"Hard": 100, "Medium": 65, "Easy": 30}
    diff_score = diff_map.get(diff, 65)

    # 3. Preparation deficit score (higher deficit = higher study priority)
    deficit_score = 100 - prep

    # 4. Importance score
    imp_map = {"High": 100, "Medium": 65, "Low": 30}
    imp_score = imp_map.get(imp, 65)

    # Weighted calculation
    raw_score = (
        urgency_score * 0.38 +
        diff_score * 0.27 +
        deficit_score * 0.25 +
        imp_score * 0.10
    )

    # Calibration boost for imminent hard exams with low prep
    if days <= 5 and diff == "Hard" and prep < 50:
        raw_score = min(98, raw_score + 10)
    elif days <= 3 and prep < 60:
        raw_score = min(99, raw_score + 8)

    final_score = int(round(max(5, min(100, raw_score))))

    # Level categorization
    if final_score >= 70:
        level = "HIGH"
        badge_symbol = "🔴"
    elif final_score >= 40:
        level = "MEDIUM"
        badge_symbol = "🟠"
    else:
        level = "LOW"
        badge_symbol = "🟢"

    # Human-readable AI priority rationale
    reasons = []
    if days <= 5:
        reasons.append(f"exam is in only {days} day(s)")
    elif days <= 10:
        reasons.append(f"exam is approaching in {days} days")
    else:
        reasons.append(f"exam is {days} days away")

    if diff == "Hard":
        reasons.append("high syllabus difficulty")
    elif diff == "Medium":
        reasons.append("moderate difficulty")
    
    if prep < 40:
        reasons.append(f"preparation is low ({prep}%)")
    elif prep < 70:
        reasons.append(f"preparation is progressing ({prep}%)")
    else:
        reasons.append(f"well prepared ({prep}%)")

    explanation = f"{name} received {final_score}/100 ({level} {badge_symbol}) because {', '.join(reasons)}."

    return {
        "priority_score": final_score,
        "priority_level": level,
        "priority_explanation": explanation,
        "days_until_exam": days,
        "badge_symbol": badge_symbol
    }
