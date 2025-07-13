from pydantic import BaseModel


class SkillBase(BaseModel):
    skill_name: str


class Skill(SkillBase):
    id: int

    class Config:
        from_attributes = True
