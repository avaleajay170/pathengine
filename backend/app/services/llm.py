"""
LLM layer: used only for NLU, goal/intent extraction, and explanations.
Never used for ranking or planning directly.
"""


async def extract_goal_and_skills(user_message: str) -> dict:
    return {"goal": None, "skills": [], "experience": None, "constraints": {}}


async def explain_recommendation(trace: dict) -> str:
    return "Explanation placeholder."
