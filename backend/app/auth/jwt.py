from datetime import datetime, timedelta, timezone
from uuid import uuid4
from jose import JWTError, jwt

from app.config import (
    JWT_SECRET_KEY,
    JWT_ALGORITHM,
    ACCESS_TOKEN_EXPIRE_MINUTES,
)


def create_access_token(
    data: dict,
    expires_delta: timedelta | None = None
) -> str:

    to_encode = data.copy()

    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = (
            datetime.now(timezone.utc)
            + timedelta(
                minutes=ACCESS_TOKEN_EXPIRE_MINUTES
            )
        )

    to_encode.update({
    "exp": expire,
    "jti": str(uuid4())
})

    return jwt.encode(
        to_encode,
        JWT_SECRET_KEY,
        algorithm=JWT_ALGORITHM
    )


def decode_access_token(token: str) -> dict | None:

    try:
        payload = jwt.decode(
            token,
            JWT_SECRET_KEY,
            algorithms=[JWT_ALGORITHM]
        )

        return payload

    except JWTError:
        return None