# Nội dung cho backend/app/schemas/token.py
from pydantic import BaseModel
from typing import Optional  # <--- IMPORT Optional


class Token(BaseModel):
    access_token: str
    token_type: str


class TokenData(BaseModel):
    email: Optional[str] = None  # <--- SỬA LẠI Ở ĐÂY
