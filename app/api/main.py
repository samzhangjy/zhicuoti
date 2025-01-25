"""API Router."""
from fastapi import APIRouter

from app.api.routes import auth, class_, subject, user

api_router = APIRouter()
api_router.include_router(auth.router)
api_router.include_router(class_.router)
api_router.include_router(subject.router)
api_router.include_router(user.router)
