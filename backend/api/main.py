"""API Router."""

from fastapi import APIRouter

from backend.api.routes import auth, class_, problem, static, subject, tag, user, analyze, utils

api_router = APIRouter()
api_router.include_router(auth.router)
api_router.include_router(class_.router)
api_router.include_router(subject.router)
api_router.include_router(user.router)
api_router.include_router(problem.router)
api_router.include_router(static.router)
api_router.include_router(tag.router)
api_router.include_router(analyze.router)
api_router.include_router(utils.router)
