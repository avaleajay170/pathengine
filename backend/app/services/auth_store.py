from __future__ import annotations

from dataclasses import dataclass
from datetime import datetime, timezone
from hashlib import pbkdf2_hmac
from hmac import compare_digest
from os import urandom
from secrets import token_urlsafe
from uuid import uuid4

from fastapi import HTTPException, status

from app.models.auth import AuthUser


def _utc_now() -> str:
    return datetime.now(timezone.utc).isoformat()


def _hash_password(password: str, salt: bytes) -> str:
    digest = pbkdf2_hmac("sha256", password.encode("utf-8"), salt, 120_000)
    return digest.hex()


@dataclass
class StoredAccount:
    id: str
    name: str
    email: str
    password_hash: str
    salt: str
    created_at: str

    def to_user(self) -> AuthUser:
        return AuthUser(
            id=self.id,
            name=self.name,
            email=self.email,
            createdAt=self.created_at,
        )


class AuthStore:
    def __init__(self) -> None:
        self._accounts_by_email: dict[str, StoredAccount] = {}

    def signup(self, name: str, email: str, password: str) -> tuple[AuthUser, str]:
        normalized_email = email.strip().lower()
        if normalized_email in self._accounts_by_email:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail={"message": "An account with this email already exists."},
            )

        salt = urandom(16)
        account = StoredAccount(
            id=str(uuid4()),
            name=name.strip(),
            email=normalized_email,
            password_hash=_hash_password(password, salt),
            salt=salt.hex(),
            created_at=_utc_now(),
        )
        self._accounts_by_email[normalized_email] = account
        return account.to_user(), token_urlsafe(24)

    def login(self, email: str, password: str) -> tuple[AuthUser, str]:
        normalized_email = email.strip().lower()
        account = self._accounts_by_email.get(normalized_email)
        if not account:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail={"message": "Incorrect email or password."},
            )

        attempted_hash = _hash_password(password, bytes.fromhex(account.salt))
        if not compare_digest(attempted_hash, account.password_hash):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail={"message": "Incorrect email or password."},
            )

        return account.to_user(), token_urlsafe(24)


auth_store = AuthStore()
