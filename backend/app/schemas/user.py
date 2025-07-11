# Nội dung cho backend/app/schemas/user.py
from pydantic import BaseModel, EmailStr
from typing import Optional  # Có thể cần Optional cho các schema khác sau này


class UserBase(BaseModel):
    email: EmailStr


class UserCreate(UserBase):
    password: str


class User(UserBase):
    id: int
    is_active: bool = True

    class Config:
        from_attributes = True
