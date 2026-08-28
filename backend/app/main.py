from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routers import learner, recommend, roadmap, feedback

app = FastAPI(title="Trajectory API", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # tighten before final submission
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(learner.router)
app.include_router(recommend.router)
app.include_router(roadmap.router)
app.include_router(feedback.router)


@app.get("/health")
def health():
    return {"status": "ok"}
