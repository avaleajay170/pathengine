from fastapi import APIRouter

router = APIRouter(prefix="/recommend", tags=["recommend"])


@router.post("/")
def get_recommendations(payload: dict):
    return {"recommendations": [], "trace_id": "stub"}
