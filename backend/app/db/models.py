from sqlalchemy import Boolean, Column, Integer, String, Float, Text, Table, ForeignKey
from sqlalchemy.orm import relationship
from .database import Base


course_skills_association = Table(
    "course_skills",
    Base.metadata,
    Column("course_id", Integer, ForeignKey("courses.id"), primary_key=True),
    Column("skill_id", Integer, ForeignKey("skills.id"), primary_key=True),
)
user_known_skills_association = Table(
    "user_known_skills",
    Base.metadata,
    Column("user_id", Integer, ForeignKey("users.id")),
    Column("skill_id", Integer, ForeignKey("skills.id")),
)
user_target_skills_association = Table(
    "user_target_skills",
    Base.metadata,
    Column("user_id", Integer, ForeignKey("users.id")),
    Column("skill_id", Integer, ForeignKey("skills.id")),
)

# --- CÁC MODEL CHÍNH ---


class Course(Base):
    __tablename__ = "courses"
    id = Column(Integer, primary_key=True, index=True)
    course_name = Column(String, index=True)
    university = Column(String)
    difficulty_level = Column(String)
    course_rating = Column(Float)
    course_url = Column(String)
    course_description = Column(Text)
    course_format = Column(String, default="mixed")

    skills = relationship(
        "Skill", secondary=course_skills_association, back_populates="courses"
    )

    # Mối quan hệ mới
    user_progress = relationship("UserCourseProgress", back_populates="course")


class Skill(Base):
    __tablename__ = "skills"
    id = Column(Integer, primary_key=True, index=True)
    skill_name = Column(String, unique=True, index=True)

    courses = relationship(
        "Course", secondary=course_skills_association, back_populates="skills"
    )


class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    is_active = Column(Boolean, default=True)

    known_skills = relationship("Skill", secondary=user_known_skills_association)
    target_skills = relationship("Skill", secondary=user_target_skills_association)
    profile = relationship("UserProfile", uselist=False, back_populates="user")

    # Mối quan hệ mới với tiến độ
    progress = relationship(
        "UserCourseProgress", back_populates="user", cascade="all, delete-orphan"
    )


class UserProfile(Base):
    __tablename__ = "user_profiles"
    user_id = Column(Integer, ForeignKey("users.id"), primary_key=True)
    full_name = Column(String, nullable=True)
    learning_style = Column(String, nullable=True)
    user = relationship("User", back_populates="profile")


# MODEL MỚI ĐỂ LƯU TIẾN ĐỘ
class UserCourseProgress(Base):
    __tablename__ = "user_course_progress"
    user_id = Column(Integer, ForeignKey("users.id"), primary_key=True)
    course_id = Column(Integer, ForeignKey("courses.id"), primary_key=True)
    status = Column(String, nullable=False, default="not_started")

    user = relationship("User", back_populates="progress")
    course = relationship("Course", back_populates="user_progress")
