from sqlalchemy import Column, Integer, String, Float, Text, Table, ForeignKey
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
