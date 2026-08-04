import os
from datetime import datetime, timedelta
from pathlib import Path

from dotenv import load_dotenv
from fastapi import APIRouter, Request, Depends
from fastapi.responses import RedirectResponse
from jose import jwt
from passlib.context import CryptContext
from sqlalchemy.orm import Session

from fastapi_sso.sso.google import GoogleSSO
from fastapi_sso.sso.github import GithubSSO

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

SECRET_KEY = os.getenv("SECRET_KEY")
ALGORITHM = os.getenv("ALGORITHM", "HS256")
ACCESS_TOKEN_EXPIRE_MINUTES = int(
    os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "60")
)

FRONTEND_URL = os.getenv(
    "FRONTEND_URL",
    "https://edutrack-ai-pink.vercel.app"
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
# Google OAuth Setup
# ==========================================

GOOGLE_CLIENT_ID = os.getenv(
    "GOOGLE_CLIENT_ID"
)

GOOGLE_CLIENT_SECRET = os.getenv(
    "GOOGLE_CLIENT_SECRET"
)


google_sso = GoogleSSO(
    client_id=GOOGLE_CLIENT_ID,
    client_secret=GOOGLE_CLIENT_SECRET,
    redirect_uri=os.getenv(
        "GOOGLE_REDIRECT_URI"
    ),
    scope=[
        "openid",
        "email",
        "profile",
        "https://www.googleapis.com/auth/calendar.readonly"
    ]
)



# ==========================================
# GitHub OAuth Setup
# ==========================================

GITHUB_CLIENT_ID = os.getenv(
    "GITHUB_CLIENT_ID"
)

GITHUB_CLIENT_SECRET = os.getenv(
    "GITHUB_CLIENT_SECRET"
)


github_sso = GithubSSO(
    client_id=GITHUB_CLIENT_ID,
    client_secret=GITHUB_CLIENT_SECRET,
    redirect_uri=os.getenv(
        "GITHUB_REDIRECT_URI"
    )
)



# ==========================================
# Google Login
# ==========================================

@router.get("/auth/login/google")
async def google_login():

    with google_sso:

        return await google_sso.get_login_redirect()



@router.get("/auth/callback/google")
async def google_callback(
    request: Request,
    db: Session = Depends(get_db)
):

    try:

        with google_sso:

            google_user = await google_sso.verify_and_process(
                request
            )


        if not google_user or not google_user.email:

            return RedirectResponse(
                url=f"{FRONTEND_URL}/?error=no_email_returned"
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
            url=f"{FRONTEND_URL}/?error=auth_exception"
        )



# ==========================================
# GitHub Login
# ==========================================

@router.get("/auth/login/github")
async def github_login():

    with github_sso:

        return await github_sso.get_login_redirect()



@router.get("/auth/callback/github")
async def github_callback(
    request: Request,
    db: Session = Depends(get_db)
):

    try:

        with github_sso:

            github_user = await github_sso.verify_and_process(
                request
            )


        if not github_user or not github_user.email:

            return RedirectResponse(
                url=f"{FRONTEND_URL}/?error=no_email_returned"
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
            url=f"{FRONTEND_URL}/?error=auth_exception"
        )