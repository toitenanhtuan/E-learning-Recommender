from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from app.db import models
from app.schemas import user as user_schema, course as course_schema
from app.crud import course as crud_course
from app.services.recommendation import recommendation_service
from app.api.v1.deps import get_current_active_user  # Sẽ tạo dependency này ở bước sau
from app.api.v1.endpoints import get_db

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
