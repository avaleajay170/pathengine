"""
Skill Gap Engine. Deterministic logic only � no LLM calls here.
"""


def calculate_skill_gaps(learner_skills: dict, required_skills: dict) -> list[dict]:
    gaps = []
    for skill, required_level in required_skills.items():
        current = learner_skills.get(skill, 0.0)
        gap = max(required_level - current, 0.0)
        gaps.append({"skill": skill, "gap": gap, "required": required_level, "current": current})
    return sorted(gaps, key=lambda g: g["gap"], reverse=True)
