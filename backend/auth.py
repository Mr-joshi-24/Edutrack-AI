import os
from datetime import datetime, timedelta
from pathlib import Path

from dotenv import load_dotenv
from fastapi import APIRouter, Request, Depends, HTTPException
from fastapi.responses import RedirectResponse
from jose import jwt
from passlib.context import CryptContext
from sqlalchemy.orm import Session

from database import SessionLocal
from models import User


# ==========================================
# Load Environment Variables
# ==========================================

BASE_DIR = Path(__file__).resolve().parent
load_dotenv(BASE_DIR / ".env")

print("ENV Loaded:", BASE_DIR / ".env")
print("Google Client ID:", os.getenv("GOOGLE_CLIENT_ID"))
print("GitHub Client ID:", os.getenv("GITHUB_CLIENT_ID"))


# ==========================================
# Router
# ==========================================

router = APIRouter()


# ==========================================
# JWT Configuration
# ==========================================

SECRET_KEY = os.getenv("SECRET_KEY", "fallback_secret_key_change_me")
ALGORITHM = os.getenv("ALGORITHM", "HS256")
ACCESS_TOKEN_EXPIRE_MINUTES = int(
    os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "60")
)

FRONTEND_URL = os.getenv(
    "FRONTEND_URL",
    "https://edutrack-ai-pink.vercel.app"
)

BACKEND_URL = os.getenv(
    "BACKEND_URL",
    "https://edutrack-ai-backend-oouq.onrender.com"
)

pwd_context = CryptContext(
    schemes=["pbkdf2_sha256"],
    deprecated="auto"
)


def hash_password(password: str):
    return pwd_context.hash(password)


def verify_password(plain_password, hashed_password):
    return pwd_context.verify(
        plain_password,
        hashed_password
    )


def create_access_token(data: dict):

    to_encode = data.copy()

    expire = datetime.utcnow() + timedelta(
        minutes=ACCESS_TOKEN_EXPIRE_MINUTES
    )

    to_encode.update({
        "exp": expire
    })

    return jwt.encode(
        to_encode,
        SECRET_KEY,
        algorithm=ALGORITHM
    )


# ==========================================
# Database
# ==========================================

def get_db():

    db = SessionLocal()

    try:
        yield db

    finally:
        db.close()



# ==========================================
# OAuth Configuration (read at module level, but SSO objects created lazily)
# ==========================================

GOOGLE_CLIENT_ID = os.getenv("GOOGLE_CLIENT_ID")
GOOGLE_CLIENT_SECRET = os.getenv("GOOGLE_CLIENT_SECRET")
GOOGLE_REDIRECT_URI = os.getenv(
    "GOOGLE_REDIRECT_URI",
    f"{BACKEND_URL}/auth/callback/google"
)

GITHUB_CLIENT_ID = os.getenv("GITHUB_CLIENT_ID")
GITHUB_CLIENT_SECRET = os.getenv("GITHUB_CLIENT_SECRET")
GITHUB_REDIRECT_URI = os.getenv(
    "GITHUB_REDIRECT_URI",
    f"{BACKEND_URL}/auth/callback/github"
)

print(f"FRONTEND_URL: {FRONTEND_URL}")
print(f"GOOGLE_REDIRECT_URI: {GOOGLE_REDIRECT_URI}")
print(f"GITHUB_REDIRECT_URI: {GITHUB_REDIRECT_URI}")


# ==========================================
# Google Login
# ==========================================

@router.get("/auth/login/google")
async def google_login():

    if not GOOGLE_CLIENT_ID or not GOOGLE_CLIENT_SECRET:
        raise HTTPException(
            status_code=500,
            detail="Google OAuth is not configured. Set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET environment variables."
        )

    from fastapi_sso.sso.google import GoogleSSO

    google_sso = GoogleSSO(
        client_id=GOOGLE_CLIENT_ID,
        client_secret=GOOGLE_CLIENT_SECRET,
        redirect_uri=GOOGLE_REDIRECT_URI,
        scope=[
            "openid",
            "email",
            "profile",
        ]
    )

    async with google_sso:
        return await google_sso.get_login_redirect()



@router.get("/auth/callback/google")
async def google_callback(
    request: Request,
    db: Session = Depends(get_db)
):

    try:

        from fastapi_sso.sso.google import GoogleSSO

        google_sso = GoogleSSO(
            client_id=GOOGLE_CLIENT_ID,
            client_secret=GOOGLE_CLIENT_SECRET,
            redirect_uri=GOOGLE_REDIRECT_URI,
            scope=[
                "openid",
                "email",
                "profile",
            ]
        )

        async with google_sso:
            google_user = await google_sso.verify_and_process(
                request
            )


        if not google_user or not google_user.email:

            return RedirectResponse(
                url=f"{FRONTEND_URL}/login?error=no_email_returned"
            )


        print(
            f"Google Login Successful: {google_user.email}"
        )


        access_token = create_access_token(
            {
                "sub": google_user.email
            }
        )


        return RedirectResponse(
            url=f"{FRONTEND_URL}/dashboard?token={access_token}"
        )


    except Exception as e:

        print(
            "Google OAuth Error:",
            str(e)
        )

        return RedirectResponse(
            url=f"{FRONTEND_URL}/login?error=auth_exception"
        )



# ==========================================
# GitHub Login
# ==========================================

@router.get("/auth/login/github")
async def github_login():

    if not GITHUB_CLIENT_ID or not GITHUB_CLIENT_SECRET:
        raise HTTPException(
            status_code=500,
            detail="GitHub OAuth is not configured. Set GITHUB_CLIENT_ID and GITHUB_CLIENT_SECRET environment variables."
        )

    from fastapi_sso.sso.github import GithubSSO

    github_sso = GithubSSO(
        client_id=GITHUB_CLIENT_ID,
        client_secret=GITHUB_CLIENT_SECRET,
        redirect_uri=GITHUB_REDIRECT_URI
    )

    async with github_sso:
        return await github_sso.get_login_redirect()



@router.get("/auth/callback/github")
async def github_callback(
    request: Request,
    db: Session = Depends(get_db)
):

    try:

        from fastapi_sso.sso.github import GithubSSO

        github_sso = GithubSSO(
            client_id=GITHUB_CLIENT_ID,
            client_secret=GITHUB_CLIENT_SECRET,
            redirect_uri=GITHUB_REDIRECT_URI
        )

        async with github_sso:
            github_user = await github_sso.verify_and_process(
                request
            )


        if not github_user or not github_user.email:

            return RedirectResponse(
                url=f"{FRONTEND_URL}/login?error=no_email_returned"
            )


        print(
            f"GitHub Login Successful: {github_user.email}"
        )


        access_token = create_access_token(
            {
                "sub": github_user.email
            }
        )


        return RedirectResponse(
            url=f"{FRONTEND_URL}/dashboard?token={access_token}"
        )


    except Exception as e:

        print(
            "GitHub OAuth Error:",
            str(e)
        )

        return RedirectResponse(
            url=f"{FRONTEND_URL}/login?error=auth_exception"
        )