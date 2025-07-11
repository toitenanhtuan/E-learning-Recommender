from sqlalchemy.orm import Session, joinedload
from ..db import models
from ..schemas import course as schemas
from typing import List


def get_courses(db: Session, skip: int = 0, limit: int = 20, search: str = ""):
    query = db.query(models.Course)
    if search:
        query = query.filter(models.Course.course_name.ilike(f"%{search}%"))
    return query.offset(skip).limit(limit).all()


def get_course_by_id(db: Session, course_id: int):
    return (
        db.query(models.Course)
        .options(joinedload(models.Course.skills))
        .filter(models.Course.id == course_id)
        .first()
    )


def get_courses_by_ids(db: Session, course_ids: List[int]):
    """
    Lấy thông tin các khóa học dựa trên một danh sách ID.
    """
    if not course_ids:
        return []
    return db.query(models.Course).filter(models.Course.id.in_(course_ids)).all()
