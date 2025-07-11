from pydantic import BaseModel
from typing import Literal

# Sử dụng Literal để giới hạn các giá trị status hợp lệ
StatusType = Literal["not_started", "in_progress", "completed"]


class ProgressUpdate(BaseModel):
    course_id: int
    status: StatusType


class ProgressInDB(ProgressUpdate):
    user_id: int

    class Config:
        from_attributes = True
