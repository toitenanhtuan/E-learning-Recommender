from sqlalchemy import Boolean, Column, Integer, String, Float, Text, Table, ForeignKey
from sqlalchemy.orm import relationship
from .database import Base

# Bảng nối
course_skills_association = Table(
    "course_skills",
    Base.metadata,
    Column("course_id", Integer, ForeignKey("courses.id"), primary_key=True),
    Column("skill_id", Integer, ForeignKey("skills.id"), primary_key=True),
)


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


class Skill(Base):
    __tablename__ = "skills"
    id = Column(Integer, primary_key=True, index=True)
    skill_name = Column(String, unique=True, index=True)

    courses = relationship(
        "Course", secondary=course_skills_association, back_populates="skills"
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


class UserProfile(Base):
    __tablename__ = "user_profiles"
    user_id = Column(Integer, ForeignKey("users.id"), primary_key=True)
    full_name = Column(String)
    learning_style = Column(String)  # Cột mới

    user = relationship("User", back_populates="profile")


class User(Base):  # Giả sử Base đã được import
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)  # Thêm dòng này
    is_active = Column(Boolean, default=True)  # Thêm dòng này
    known_skills = relationship("Skill", secondary=user_known_skills_association)
    target_skills = relationship("Skill", secondary=user_target_skills_association)
    profile = relationship("UserProfile", uselist=False, back_populates="user")
