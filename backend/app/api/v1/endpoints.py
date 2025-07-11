from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.db import database, models
from app.crud import course as crud_course
from app.schemas import course as schemas
from app.services.recommendation import recommendation_service

router = APIRouter()


def get_db():
    db = database.SessionLocal()
    try:
        yield db
    finally:
        db.close()


@router.get("/courses", response_model=List[schemas.Course])
def read_courses(
    search: str = "", skip: int = 0, limit: int = 20, db: Session = Depends(get_db)
):
    courses = crud_course.get_courses(db, skip=skip, limit=limit, search=search)
    return courses


@router.get("/courses/{course_id}", response_model=schemas.CourseWithSkills)
def read_course_detail(course_id: int, db: Session = Depends(get_db)):
    db_course = crud_course.get_course_by_id(db, course_id=course_id)
    if db_course is None:
        raise HTTPException(status_code=404, detail="Course not found")
    return db_course


@router.get(
    "/recommendations/content-based/{course_id}", response_model=List[schemas.Course]
)
def get_content_based_recommendations(course_id: int, db: Session = Depends(get_db)):
    """
    Lấy các khóa học tương tự dựa trên nội dung (Content-Based).
    """
    # 1. Gọi service để lấy list các ID được gợi ý
    recommended_ids = recommendation_service.get_recommendations(course_id)

    if not recommended_ids:
        # Nếu không có gợi ý, trả về một danh sách rỗng
        return []

    # 2. Dùng các ID đó để truy vấn thông tin đầy đủ của khóa học từ CSDL
    # Điều này đảm bảo dữ liệu trả về luôn mới nhất
    recommended_courses = crud_course.get_courses_by_ids(db, course_ids=recommended_ids)

    return recommended_courses
