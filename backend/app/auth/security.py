
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy.orm import Session
from datetime import datetime
from app.database import get_db
from app.models import User, LoginSession
from app.auth.jwt import decode_access_token

from pwdlib import PasswordHash


# ==================================================
# PASSWORD HASHING
# ==================================================

password_hash = PasswordHash.recommended()


def hash_password(password: str) -> str:
    return password_hash.hash(password)


def verify_password(
    plain_password: str,
    hashed_password: str
) -> bool:
    return password_hash.verify(
        plain_password,
        hashed_password
    )


# ==================================================
# BEARER AUTHENTICATION
# ==================================================

bearer_scheme = HTTPBearer()


# ==================================================
# GET CURRENT USER
# ==================================================

def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(
        bearer_scheme
    ),
    db: Session = Depends(get_db)
):

    # --------------------------------------------------
    # GET TOKEN
    # --------------------------------------------------

    token = credentials.credentials

    # --------------------------------------------------
    # DECODE TOKEN
    # --------------------------------------------------

    payload = decode_access_token(token)

    if payload is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token",
            headers={
                "WWW-Authenticate": "Bearer"
            }
        )

    # --------------------------------------------------
    # GET USER ID + JTI
    # --------------------------------------------------

    user_id = payload.get("sub")
    jti = payload.get("jti")

    if user_id is None or jti is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token",
            headers={
                "WWW-Authenticate": "Bearer"
            }
        )

    # --------------------------------------------------
    # CONVERT USER ID
    # --------------------------------------------------

    try:
        user_id = int(user_id)

    except (TypeError, ValueError):

        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token",
            headers={
                "WWW-Authenticate": "Bearer"
            }
        )

    # --------------------------------------------------
    # CHECK LOGIN SESSION
    # --------------------------------------------------

    session = (
        db.query(LoginSession)
        .filter(
            LoginSession.user_id == user_id,
            LoginSession.token_jti == jti
        )
        .first()
    )

    if session is None:

        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Session not found",
            headers={
                "WWW-Authenticate": "Bearer"
            }
        )

    # --------------------------------------------------
    # CHECK REVOCATION
    # --------------------------------------------------

    if session.revoked:

        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Session has been revoked",
            headers={
                "WWW-Authenticate": "Bearer"
            }
        )

    # --------------------------------------------------
    # CHECK SESSION EXPIRATION
    # --------------------------------------------------

    if session.expires_at < datetime.utcnow():

        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Session has expired",
            headers={
                "WWW-Authenticate": "Bearer"
            }
        )

    # --------------------------------------------------
    # FIND USER
    # --------------------------------------------------

    user = (
        db.query(User)
        .filter(User.id == user_id)
        .first()
    )

    if user is None:

        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found",
            headers={
                "WWW-Authenticate": "Bearer"
            }
        )

    # --------------------------------------------------
    # CHECK USER ACTIVE
    # --------------------------------------------------

    if not user.is_active:

        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="User account is inactive"
        )

    # --------------------------------------------------
    # RETURN USER
    # --------------------------------------------------

    return user
