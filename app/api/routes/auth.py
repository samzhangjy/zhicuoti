"""Authentication routes."""

from datetime import timedelta
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException
from fastapi.security import OAuth2PasswordRequestForm

from app.api.deps import SessionDep, CurrentUser
from app.config import settings
from app.logic.user import authenticate, create_user, get_user_by_phone_number
from app.models import UserCreate, UserPublic, Token, User, UserMe
from app.security import create_access_token

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/register", response_model=UserPublic)
def register(session: SessionDep, user_in: UserCreate):
    """Register a new user."""
    user = get_user_by_phone_number(session=session, phone_number=user_in.phone_number)
    if user:
        raise HTTPException(status_code=400, detail="手机号已经注册")
    user = create_user(session=session, user_create=user_in)
    return user


@router.post("/login")
def login(
    session: SessionDep, form_data: Annotated[OAuth2PasswordRequestForm, Depends()]
) -> Token:
    """Login a user."""
    user = authenticate(
        session=session, phone_number=form_data.username, password=form_data.password
    )
    if user is None:
        raise HTTPException(status_code=400, detail="手机号或密码错误")
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    return Token(
        access_token=create_access_token(user.id, expires_delta=access_token_expires)
    )

@router.get("/me", response_model=UserMe)
def get_me(current_user: CurrentUser) -> User:
    """Get current user."""
    return current_user
