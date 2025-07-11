from pydantic import BaseModel


# Schema cơ bản, không có ID (dùng khi tạo)
class SkillBase(BaseModel):
    skill_name: str


# Schema đầy đủ, có ID (dùng khi đọc từ CSDL)
class Skill(SkillBase):
    id: int

    # Cấu hình quan trọng để Pydantic có thể đọc từ SQLAlchemy model
    class Config:
        from_attributes = True
