from fastapi import APIRouter

router = APIRouter(prefix="/feedback", tags=["feedback"])


@router.post("/{learner_id}")
def submit_feedback(learner_id: str, payload: dict):
    return {"learner_id": learner_id, "status": "recorded"}
