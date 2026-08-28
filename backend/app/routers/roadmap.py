from fastapi import APIRouter

router = APIRouter(prefix="/roadmap", tags=["roadmap"])


@router.get("/{learner_id}")
def get_roadmap(learner_id: str):
    return {"learner_id": learner_id, "milestones": []}


@router.post("/{learner_id}/replan")
def replan_roadmap(learner_id: str):
    return {"learner_id": learner_id, "status": "replanned", "milestones": []}
