from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.db import models
from app.schemas import survey as survey_schema
from app.schemas import survey as skill_schema
from app.api.v1.deps import get_current_active_user
from app.api.v1.deps import get_db

router = APIRouter()


@router.post("/", status_code=status.HTTP_204_NO_CONTENT)
def submit_user_survey(
    *,
    db: Session = Depends(get_db),
    survey_data: survey_schema.SurveySubmission,
    current_user: models.User = Depends(get_current_active_user),
):
    # 1. Tìm các đối tượng Skill từ danh sách các ID
    known_skills = (
        db.query(models.Skill)
        .filter(models.Skill.id.in_(survey_data.known_skill_ids))
        .all()
    )
    target_skills = (
        db.query(models.Skill)
        .filter(models.Skill.id.in_(survey_data.target_skill_ids))
        .all()
    )

    profile = (
        db.query(models.UserProfile)
        .filter(models.UserProfile.user_id == current_user.id)
        .first()
    )
    if not profile:
        profile = models.UserProfile(user_id=current_user.id)

    profile.learning_style = survey_data.learning_style
    db.add(profile)

    db.commit()

    if len(known_skills) != len(survey_data.known_skill_ids) or len(
        target_skills
    ) != len(survey_data.target_skill_ids):
        raise HTTPException(status_code=404, detail="One or more skill IDs not found.")
    current_user.known_skills = known_skills
    current_user.target_skills = target_skills
    db.add(current_user)
    db.commit()
    return


@router.get("/skills", response_model=List[skill_schema.Skill])
def get_all_skills(db: Session = Depends(get_db)):
    """
    Lấy danh sách tất cả các kỹ năng có sẵn.
    """
    return db.query(models.Skill).order_by(models.Skill.skill_name).all()
