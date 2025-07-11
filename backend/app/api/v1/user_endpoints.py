from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from app.db import models
from app.schemas import user as user_schema, course as course_schema
from app.crud import course as crud_course
from app.services.recommendation import recommendation_service
from app.api.v1.deps import get_current_active_user  # Sẽ tạo dependency này ở bước sau
from app.api.v1.endpoints import get_db
from app.schemas import analytics as analytics_schema

router = APIRouter()


@router.get("/me", response_model=user_schema.User)
def read_users_me(current_user: models.User = Depends(get_current_active_user)):
    """
    Lấy thông tin của người dùng hiện tại.
    """
    return current_user


@router.get("/me/personalized-path", response_model=List[course_schema.Course])
def get_my_personalized_learning_path(
    *,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_active_user)
):
    """
    Lấy lộ trình học tập được cá nhân hóa cho người dùng hiện tại.
    Yêu cầu người dùng phải hoàn thành khảo sát trước.
    """
    # Kiểm tra xem người dùng đã làm khảo sát chưa
    if not current_user.target_skills:
        raise HTTPException(
            status_code=400,
            detail="User has not completed the survey yet. Please complete the survey to get a personalized path.",
        )

    # Gọi service để lấy danh sách ID khóa học
    recommended_ids = recommendation_service.get_personalized_path(
        user=current_user, db=db
    )

    if not recommended_ids:
        return []

    # Lấy thông tin đầy đủ và trả về, giữ nguyên thứ tự đã sắp xếp
    courses = crud_course.get_courses_by_ids(db, course_ids=recommended_ids)

    # Sắp xếp lại kết quả từ DB theo đúng thứ tự của `recommended_ids`
    course_map = {course.id: course for course in courses}
    sorted_courses = [course_map[id] for id in recommended_ids if id in course_map]

    return sorted_courses


@router.get(
    "/me/skill-gap-analytics", response_model=analytics_schema.SkillGapAnalytics
)
def get_my_skill_gap_analytics(
    current_user: models.User = Depends(get_current_active_user),
):
    """
    Lấy dữ liệu phân tích về khoảng trống kỹ năng của người dùng.
    """
    # Kiểm tra xem user đã làm khảo sát chưa
    if not current_user.target_skills:
        raise HTTPException(
            status_code=400, detail="User has not completed the survey yet."
        )

    known_skill_ids = {skill.id for skill in current_user.known_skills}
    target_skills_set = set(current_user.target_skills)
    target_skill_ids = {skill.id for skill in target_skills_set}

    # Tính toán skill gap
    skill_gap_ids = target_skill_ids - known_skill_ids

    total_target = len(target_skill_ids)
    known_count = len(target_skill_ids.intersection(known_skill_ids))
    gap_count = len(skill_gap_ids)

    # Tránh lỗi chia cho 0
    if total_target == 0:
        return analytics_schema.SkillGapAnalytics(
            total_target_skills=0,
            known_skills=0,
            gap_skills=0,
            known_skills_percentage=0,
            gap_skills_percentage=0,
            gap_skill_names=[],
        )

    # Lấy tên của các kỹ năng còn thiếu
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
