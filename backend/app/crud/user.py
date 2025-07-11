# Nội dung cho backend/app/crud/user.py
from sqlalchemy.orm import Session
from app.db import models
from app.schemas import user as schemas
from app.core.security import get_password_hash


def get_user_by_email(db: Session, email: str):
    """Lấy người dùng theo email."""
    return db.query(models.User).filter(models.User.email == email).first()


def create_user(db: Session, user: schemas.UserCreate):
    """Tạo người dùng mới."""
    hashed_password = get_password_hash(user.password)
    db_user = models.User(email=user.email, hashed_password=hashed_password)
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user
