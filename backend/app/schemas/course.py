from pydantic import BaseModel
from typing import List, Optional

# --- Schemas cho Skills ---


# Schema cơ bản, dùng khi tạo hoặc đọc skill
class SkillBase(BaseModel):
    skill_name: str


# Schema dùng khi trả về dữ liệu skill từ CSDL (có id)
class Skill(SkillBase):
    id: int

    # Cấu hình để Pydantic có thể đọc từ ORM model (SQLAlchemy)
    class Config:
        orm_mode = True


# --- Schemas cho Courses ---


# Schema cơ bản nhất của một khóa học
class CourseBase(BaseModel):
    course_name: str
    university: Optional[str] = None
    difficulty_level: Optional[str] = None
    course_rating: Optional[float] = None
    course_url: Optional[str] = None
    course_description: Optional[str] = None


# Schema dùng để tạo một khóa học mới
# Thường sẽ không cần, vì chúng ta seed từ file CSV
class CourseCreate(CourseBase):
    pass


# Đây chính là class 'Course' đang bị thiếu!
# Dùng khi trả về một danh sách khóa học (không cần chi tiết skill)
class Course(CourseBase):
    id: int

    class Config:
        orm_mode = True


# Schema đầy đủ, dùng khi trả về chi tiết một khóa học
# Kế thừa từ Course và thêm danh sách các skills
class CourseWithSkills(Course):
    skills: List[Skill] = []

    class Config:
        orm_mode = True
