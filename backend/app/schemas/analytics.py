# trong app/schemas/analytics.py
from pydantic import BaseModel
from typing import List


class SkillGapAnalytics(BaseModel):
    total_target_skills: int
    known_skills: int
    gap_skills: int
    known_skills_percentage: float
    gap_skills_percentage: float
    gap_skill_names: List[str]
