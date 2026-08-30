from fastapi import APIRouter

from app.models.auth import AuthResponse, LoginRequest, SignupRequest
from app.services.auth_store import auth_store

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/signup", response_model=AuthResponse)
def signup(payload: SignupRequest):
    user, token = auth_store.signup(payload.name, payload.email, payload.password)
    return AuthResponse(user=user, token=token)


@router.post("/login", response_model=AuthResponse)
def login(payload: LoginRequest):
    user, token = auth_store.login(payload.email, payload.password)
    return AuthResponse(user=user, token=token)
