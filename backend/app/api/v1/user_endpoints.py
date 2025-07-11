from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session, joinedload
from typing import List

from app.db import models
from app.db.models import UserCourseProgress
from app.schemas import user as user_schema, course as course_schema
from app.schemas import analytics as analytics_schema, progress as progress_schema
from app.crud import course as crud_course
from app.services.recommendation import recommendation_service
from app.api.v1.deps import get_current_active_user, get_db

router = APIRouter()


@router.get("/me", response_model=user_schema.User)
def read_users_me(current_user: models.User = Depends(get_current_active_user)):
    """
    Lấy thông tin của người dùng hiện tại đã được xác thực.
    """
    return current_user


@router.post("/me/progress", response_model=progress_schema.ProgressInDB)
def update_course_progress(
    *,
    db: Session = Depends(get_db),
    progress_update: progress_schema.ProgressUpdate,
    current_user: models.User = Depends(get_current_active_user)
):
    """
    Cập nhật hoặc tạo mới trạng thái tiến độ của một khóa học cho người dùng.
    Trạng thái hợp lệ: "not_started", "in_progress", "completed".
    """
    # Kiểm tra khóa học có tồn tại không
    course = (
        db.query(models.Course)
        .filter(models.Course.id == progress_update.course_id)
        .first()
    )
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")

    # Tìm hoặc tạo bản ghi progress
    progress_item = (
        db.query(UserCourseProgress)
        .filter(
            UserCourseProgress.user_id == current_user.id,
            UserCourseProgress.course_id == progress_update.course_id,
        )
        .first()
    )

    if progress_item:
        progress_item.status = progress_update.status
    else:
        progress_item = UserCourseProgress(
            user_id=current_user.id,
            course_id=progress_update.course_id,
            status=progress_update.status,
        )

    db.add(progress_item)
    db.commit()
    db.refresh(progress_item)
    return progress_item


@router.get("/me/progress", response_model=List[progress_schema.ProgressInDB])
def get_my_progress(
    *,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_active_user)
):
    """
    Lấy tất cả các bản ghi tiến độ (trạng thái khóa học) của người dùng hiện tại.
    """
    return (
        db.query(UserCourseProgress)
        .filter(UserCourseProgress.user_id == current_user.id)
        .all()
    )


def get_dynamic_known_skills(user: models.User) -> set:
    """Helper function to calculate user's current known skills."""
    # Lấy kỹ năng từ khảo sát
    known_from_survey = {skill.id for skill in user.known_skills}

    # Lấy kỹ năng từ các khóa học đã hoàn thành
    # Eager loading 'course' and 'course.skills' is recommended for performance
    completed_progress = [
        p for p in user.progress if p.status == "completed" and p.course
    ]

    known_from_completed = set()
    for progress_item in completed_progress:
        for skill in progress_item.course.skills:
            known_from_completed.add(skill.id)

    return known_from_survey.union(known_from_completed)


@router.get(
    "/me/skill-gap-analytics", response_model=analytics_schema.SkillGapAnalytics
)
def get_my_skill_gap_analytics(
    *,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_active_user)
):
    """
    Lấy dữ liệu phân tích "động" về khoảng trống kỹ năng của người dùng.
    """
    if not current_user.target_skills:
        raise HTTPException(status_code=400, detail="Please complete the survey first.")

    dynamic_known_skills = get_dynamic_known_skills(current_user)

    target_skills_set = set(current_user.target_skills)
    target_skill_ids = {skill.id for skill in target_skills_set}
    skill_gap_ids = target_skill_ids - dynamic_known_skills

    total_target = len(target_skill_ids)
    if total_target == 0:
        return analytics_schema.SkillGapAnalytics(
            total_target_skills=0,
            known_skills=0,
            gap_skills=0,
            known_skills_percentage=0,
            gap_skills_percentage=0,
            gap_skill_names=[],
        )

    known_count = len(target_skill_ids.intersection(dynamic_known_skills))
    gap_count = len(skill_gap_ids)

    gap_skill_objects = {
        skill for skill in target_skills_set if skill.id in skill_gap_ids
    }
    gap_skill_names = sorted([skill.skill_name for skill in gap_skill_objects])

    return analytics_schema.SkillGapAnalytics(
        total_target_skills=total_target,
        known_skills=known_count,
        gap_skills=gap_count,
        known_skills_percentage=round((known_count / total_target) * 100, 2),
        gap_skills_percentage=round((gap_count / total_target) * 100, 2),
        gap_skill_names=gap_skill_names,
    )


@router.get("/me/personalized-path", response_model=List[course_schema.Course])
def get_my_personalized_learning_path(
    *,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_active_user)
):
    """
    Lấy lộ trình học tập "động" cho người dùng, tính đến cả tiến độ hiện tại.
    """
    if not current_user.target_skills:
        raise HTTPException(
            status_code=400, detail="User has not completed the survey yet."
        )

    dynamic_known_skills = get_dynamic_known_skills(current_user)

    recommended_ids = recommendation_service.get_personalized_path(
        user=current_user, known_skill_ids=dynamic_known_skills, db=db
    )

    if not recommended_ids:
        return []

    courses = crud_course.get_courses_by_ids(db, course_ids=recommended_ids)

    course_map = {course.id: course for course in courses}
    sorted_courses = [course_map[id] for id in recommended_ids if id in course_map]

    return sorted_courses
