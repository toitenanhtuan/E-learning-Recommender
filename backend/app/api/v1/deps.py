from typing import Generator
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import jwt, JWTError
from sqlalchemy.orm import Session
from pydantic import ValidationError

from app.db import models
from app.schemas import token as token_schema
from app.crud import user as crud_user
from app.core import config
from app.db.database import SessionLocal

# Tạo một "scheme" OAuth2, nó sẽ yêu cầu token từ header "Authorization: Bearer <token>"
# tokenUrl trỏ đến API login của chúng ta, điều này giúp Swagger UI hoạt động tốt
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/login/token")


def get_db() -> Generator:
    """
    Dependency để lấy một session CSDL.
    (Chúng ta định nghĩa lại ở đây để tránh import vòng lặp)
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def get_current_user(
    db: Session = Depends(get_db), token: str = Depends(oauth2_scheme)
) -> models.User:
    """
    Dependency để lấy người dùng hiện tại từ JWT token.
    """
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        # Giải mã token JWT
        payload = jwt.decode(token, config.SECRET_KEY, algorithms=[config.ALGORITHM])
        # Lấy email từ payload. 'sub' (subject) là một trường phổ biến để chứa định danh user
        email: str = payload.get("sub")
        if email is None:
            raise credentials_exception
        token_data = token_schema.TokenData(email=email)
    except (JWTError, ValidationError):
        raise credentials_exception

    # Lấy thông tin user từ CSDL
    user = crud_user.get_user_by_email(db, email=token_data.email)
    if user is None:
        raise credentials_exception
    return user


def get_current_active_user(
    current_user: models.User = Depends(get_current_user),
) -> models.User:
    """
    Dependency để lấy người dùng hiện tại và kiểm tra xem họ có "active" không.
    """
    if not current_user.is_active:
        raise HTTPException(status_code=400, detail="Inactive user")
    return current_user
