import os

from dotenv import load_dotenv

load_dotenv(override=True)


# --------------------------------------------------
# DATABASE
# --------------------------------------------------

DATABASE_URL = os.getenv("DATABASE_URL")


# --------------------------------------------------
# AI API KEYS
# --------------------------------------------------

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

GROQ_API_KEY = os.getenv("GROQ_API_KEY")


# --------------------------------------------------
# JWT AUTHENTICATION
# --------------------------------------------------

JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY")

JWT_ALGORITHM = os.getenv(
    "JWT_ALGORITHM",
    "HS256"
)

ACCESS_TOKEN_EXPIRE_MINUTES = int(
    os.getenv(
        "ACCESS_TOKEN_EXPIRE_MINUTES",
        "60"
    )
)


# --------------------------------------------------
# DEBUG / KEY CHECKS
# --------------------------------------------------

print(
    "GEMINI KEY LOADED:",
    bool(GEMINI_API_KEY)
)

print(
    "GROQ KEY LOADED:",
    bool(GROQ_API_KEY)
)

print(
    "JWT SECRET LOADED:",
    bool(JWT_SECRET_KEY)
)