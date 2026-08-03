import os
from datetime import datetime, timedelta
from fastapi import APIRouter, Request, Depends, HTTPException
from fastapi.responses import RedirectResponse
from jose import jwt
from passlib.context import CryptContext
from sqlalchemy.orm import Session
from dotenv import load_dotenv

from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent
load_dotenv(BASE_DIR / ".env")
print("ENV Loaded:", BASE_DIR / ".env")
print("Google Client ID:", os.getenv("GOOGLE_CLIENT_ID"))
print("GitHub Client ID:", os.getenv("GITHUB_CLIENT_ID"))
from fastapi_sso.sso.google import GoogleSSO
from fastapi_sso.sso.github import GithubSSO

# Import database session & user model/helper functions if needed
# Adjust relative/absolute imports to match your project directory structure
from database import SessionLocal
from models import User # Optional, if you wish to auto-create user in DB on SSO login

# ==========================================
# 1. Configuration & Setup
# ==========================================

# ⚠️ For local development only, allows OAuth over HTTP instead of HTTPS
os.environ["OAUTHLIB_INSECURE_TRANSPORT"] = "1"

# Define the router EXACTLY ONCE
router = APIRouter()

# ==========================================
# 2. Standard JWT Auth Configuration
# ==========================================
SECRET_KEY = os.getenv("SECRET_KEY")
ALGORITHM = os.getenv("ALGORITHM", "HS256")
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "60"))

pwd_context = CryptContext(
    schemes=["pbkdf2_sha256"],
    deprecated="auto"
)

def hash_password(password: str):
    return pwd_context.hash(password)

def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# ==========================================
# 3. SSO Initializations
# ==========================================

# --- GOOGLE ---

GOOGLE_CLIENT_ID = os.getenv("GOOGLE_CLIENT_ID")
GOOGLE_CLIENT_SECRET = os.getenv("GOOGLE_CLIENT_SECRET")


google_sso = GoogleSSO(
    client_id=GOOGLE_CLIENT_ID, 
    client_secret=GOOGLE_CLIENT_SECRET, 
    redirect_uri="http://localhost:8000/auth/callback/google",
    scope=["openid", "email", "profile", "https://www.googleapis.com/auth/calendar.readonly"]
)

# --- GITHUB ---
GITHUB_CLIENT_ID = os.getenv("GITHUB_CLIENT_ID")
GITHUB_CLIENT_SECRET = os.getenv("GITHUB_CLIENT_SECRET")


github_sso = GithubSSO(
    client_id=GITHUB_CLIENT_ID, 
    client_secret=GITHUB_CLIENT_SECRET, 
    redirect_uri="http://localhost:8000/auth/callback/github"
)


# ==========================================
# 4. Google OAuth Routes
# ==========================================
@router.get("/auth/login/google")
async def google_login():
    """Redirects the user to the Google login screen"""
    with google_sso:
        return await google_sso.get_login_redirect()

@router.get("/auth/callback/google")
async def google_callback(request: Request, db: Session = Depends(get_db)):
    """Google sends the user back here after they successfully log in"""
    try:
        with google_sso:
            google_user = await google_sso.verify_and_process(request)
        
        if not google_user or not google_user.email:
            return RedirectResponse(url="http://localhost:5173/?error=no_email_returned")
        
        print(f"Successfully authenticated with Google: {google_user.email}")
        
        # Generate a real JWT token for the authenticated user session
        access_token = create_access_token({"sub": google_user.email})
        
        # Redirect directly to your frontend dashboard with the real access token
        return RedirectResponse(url=f"http://localhost:5173/dashboard?token={access_token}")
        
    except Exception as e:
        print(f"Google OAuth Error: {str(e)}")
        return RedirectResponse(url="http://localhost:5173/?error=auth_exception")


# ==========================================
# 5. GitHub OAuth Routes
# ==========================================
@router.get("/auth/login/github")
async def github_login():
    with github_sso:
        return await github_sso.get_login_redirect()

@router.get("/auth/callback/github")
async def github_callback(request: Request, db: Session = Depends(get_db)):
    try:
        with github_sso:
            github_user = await github_sso.verify_and_process(request)
        
        if not github_user or not github_user.email:
            return RedirectResponse(url="http://localhost:5173/?error=no_email_returned")
        
        print(f"Successfully authenticated with GitHub: {github_user.email}")
        
        # Generate a real JWT token for the GitHub user session
        access_token = create_access_token({"sub": github_user.email})
        
        # Redirect directly to your frontend dashboard with the real access token
        return RedirectResponse(url=f"http://localhost:5173/dashboard?token={access_token}")
        
    except Exception as e:
        print(f"GitHub OAuth Error: {str(e)}")
        return RedirectResponse(url="http://localhost:5173/?error=auth_exception")