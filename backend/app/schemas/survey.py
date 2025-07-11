from pydantic import BaseModel
from typing import List
from app.schemas.skill import Skill


class SurveySubmission(BaseModel):
    known_skill_ids: List[int]
    target_skill_ids: List[int]
    learning_style: str
