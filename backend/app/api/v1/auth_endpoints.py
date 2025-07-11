from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session

# TRƯỚC KHI SỬA: from app import schemas
# SAU KHI SỬA: Import trực tiếp các module bạn cần
from app.schemas import user as user_schema
from app.schemas import token as token_schema

from app.crud import user as crud_user
from app.core.security import create_access_token, verify_password

# Đổi tên import này để tránh nhầm lẫn, hoặc đảm bảo nó import đúng file
from .endpoints import get_db

router = APIRouter()


# Dùng user_schema.User thay vì schemas.user.User
@router.post("/register", response_model=user_schema.User)
def register_user(user: user_schema.UserCreate, db: Session = Depends(get_db)):
    db_user = crud_user.get_user_by_email(db, email=user.email)
    if db_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    return crud_user.create_user(db=db, user=user)


# Dùng token_schema.Token thay vì schemas.token.Token
@router.post("/login/token", response_model=token_schema.Token)
def login_for_access_token(
    form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)
):
    user = crud_user.get_user_by_email(db, email=form_data.username)
    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token = create_access_token(data={"sub": user.email})
    return {"access_token": access_token, "token_type": "bearer"}
