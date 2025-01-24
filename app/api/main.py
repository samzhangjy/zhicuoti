"""API Router."""
from fastapi import APIRouter

from app.api.routes import auth, class_

api_router = APIRouter()
api_router.include_router(auth.router)
api_router.include_router(class_.router)
