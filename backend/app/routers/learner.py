from fastapi import APIRouter

router = APIRouter(prefix="/learner", tags=["learner"])


@router.get("/{learner_id}")
def get_learner(learner_id: str):
    return {"learner_id": learner_id, "status": "stub"}


@router.post("/")
def create_learner(payload: dict):
    return {"status": "created", "payload": payload}
