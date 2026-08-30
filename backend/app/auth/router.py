
from fastapi import (
    APIRouter,
    Depends,
    HTTPException
)

from fastapi.security import HTTPAuthorizationCredentials

from sqlalchemy.orm import Session

from datetime import datetime, timezone

from app.database import get_db

from app.models import (
    User,
    LoginSession
)

from app.schemas import (
    UserRegister,
    UserResponse,
    UserLogin
)

from app.auth.security import (
    hash_password,
    verify_password,
    get_current_user,
    bearer_scheme
)

from app.auth.jwt import (
    create_access_token,
    decode_access_token
)


router = APIRouter(
    prefix="/auth",
    tags=["Authentication"]
)


# ============================================================
# REGISTER
# ============================================================

@router.post(
    "/register",
    response_model=UserResponse
)
def register_user(
    user_data: UserRegister,
    db: Session = Depends(get_db)
):

    # --------------------------------------------------------
    # CHECK USERNAME
    # --------------------------------------------------------

    existing_username = (
        db.query(User)
        .filter(
            User.username == user_data.username
        )
        .first()
    )

    if existing_username:
        raise HTTPException(
            status_code=400,
            detail="Username already registered"
        )

    # --------------------------------------------------------
    # CHECK EMAIL
    # --------------------------------------------------------

    existing_email = (
        db.query(User)
        .filter(
            User.email == user_data.email
        )
        .first()
    )

    if existing_email:
        raise HTTPException(
            status_code=400,
            detail="Email already registered"
        )

    # --------------------------------------------------------
    # HASH PASSWORD
    # --------------------------------------------------------

    hashed_password = hash_password(
        user_data.password
    )

    # --------------------------------------------------------
    # CREATE USER
    # --------------------------------------------------------

    user = User(
        username=user_data.username,
        email=user_data.email,
        hashed_password=hashed_password,
        is_active=True
    )

    db.add(user)

    db.commit()

    db.refresh(user)

    return user


# ============================================================
# LOGIN
# ============================================================

@router.post("/login")
def login_user(
    user_data: UserLogin,
    db: Session = Depends(get_db)
):

    # --------------------------------------------------------
    # FIND USER
    # --------------------------------------------------------

    user = (
        db.query(User)
        .filter(
            User.username == user_data.username
        )
        .first()
    )

    if user is None:
        raise HTTPException(
            status_code=401,
            detail="Invalid username or password"
        )

    # --------------------------------------------------------
    # VERIFY PASSWORD
    # --------------------------------------------------------

    if not verify_password(
        user_data.password,
        user.hashed_password
    ):
        raise HTTPException(
            status_code=401,
            detail="Invalid username or password"
        )

    # --------------------------------------------------------
    # CHECK USER ACTIVE
    # --------------------------------------------------------

    if not user.is_active:
        raise HTTPException(
            status_code=400,
            detail="User account is inactive"
        )

    # --------------------------------------------------------
    # CREATE JWT
    # --------------------------------------------------------

    access_token = create_access_token(
        {
            "sub": str(user.id),
            "username": user.username
        }
    )

    # --------------------------------------------------------
    # DECODE JWT
    # --------------------------------------------------------

    payload = decode_access_token(
        access_token
    )

    if payload is None:
        raise HTTPException(
            status_code=500,
            detail="Failed to create authentication token"
        )

    # --------------------------------------------------------
    # GET JTI + EXPIRATION
    # --------------------------------------------------------

    jti = payload.get("jti")

    exp = payload.get("exp")

    if not jti or not exp:
        raise HTTPException(
            status_code=500,
            detail="Invalid authentication token"
        )

    # --------------------------------------------------------
    # CREATE LOGIN SESSION
    # --------------------------------------------------------

    session = LoginSession(
        user_id=user.id,
        token_jti=jti,
        expires_at=datetime.fromtimestamp(
            exp,
            tz=timezone.utc
        ).replace(tzinfo=None),
        revoked=False
    )

    db.add(session)

    db.commit()

    # --------------------------------------------------------
    # RETURN TOKEN
    # --------------------------------------------------------

    return {
        "access_token": access_token,
        "token_type": "bearer"
    }


# ============================================================
# LOGOUT
# ============================================================

@router.post("/logout")
def logout_user(
    credentials: HTTPAuthorizationCredentials = Depends(
        bearer_scheme
    ),
    current_user: User = Depends(
        get_current_user
    ),
    db: Session = Depends(get_db)
):

    # --------------------------------------------------------
    # GET CURRENT TOKEN
    # --------------------------------------------------------

    token = credentials.credentials

    # --------------------------------------------------------
    # DECODE TOKEN
    # --------------------------------------------------------

    payload = decode_access_token(
        token
    )

    if payload is None:
        raise HTTPException(
            status_code=401,
            detail="Invalid or expired token"
        )

    # --------------------------------------------------------
    # GET TOKEN JTI
    # --------------------------------------------------------

    jti = payload.get("jti")

    if jti is None:
        raise HTTPException(
            status_code=401,
            detail="Invalid token"
        )

    # --------------------------------------------------------
    # FIND CURRENT LOGIN SESSION
    # --------------------------------------------------------

    session = (
        db.query(LoginSession)
        .filter(
            LoginSession.user_id == current_user.id,
            LoginSession.token_jti == jti
        )
        .first()
    )

    if session is None:
        raise HTTPException(
            status_code=401,
            detail="Session not found"
        )

    # --------------------------------------------------------
    # REVOKE SESSION
    # --------------------------------------------------------

    session.revoked = True

    db.commit()

    # --------------------------------------------------------
    # RETURN RESPONSE
    # --------------------------------------------------------

    return {
        "message": "Successfully logged out"
    }


# ============================================================
# CURRENT USER
# ============================================================

@router.get(
    "/me",
    response_model=UserResponse
)
def get_my_profile(
    current_user: User = Depends(
        get_current_user
    )
):

    return current_user

