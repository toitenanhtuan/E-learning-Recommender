from pydantic import BaseModel
from typing import List, Optional


class SkillBase(BaseModel):
    skill_name: str


class Skill(SkillBase):
    id: int

    class Config:
        orm_mode = True


class CourseBase(BaseModel):
    course_name: str
    university: Optional[str] = None
    difficulty_level: Optional[str] = None
    course_rating: Optional[float] = None
    course_url: Optional[str] = None
    course_description: Optional[str] = None


# Schema dùng để tạo một khóa học mới
class CourseCreate(CourseBase):
    pass


class Course(CourseBase):
    id: int

    class Config:
        orm_mode = True


class CourseWithSkills(Course):
    skills: List[Skill] = []

    class Config:
        orm_mode = True
