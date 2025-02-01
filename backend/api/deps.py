from collections.abc import Generator
from typing import Annotated

import jwt
from fastapi import Depends, HTTPException, Request, status
from fastapi.security import OAuth2PasswordBearer
from jwt.exceptions import InvalidTokenError
from openai import OpenAI
from pydantic import ValidationError
from sqlmodel import Session

from backend.classifier import ProblemClassifier
from backend.config import settings
from backend.db import engine
from backend.models import TokenPayload, User, UserRole
from backend.ocr import ProblemOCRAnalyzer
from backend.predictor import ProblemPredictor
from backend.security import ALGORITHM

reusable_oauth2 = OAuth2PasswordBearer(tokenUrl=f"{settings.API_V1_STR}/login")


def get_db() -> Generator[Session, None, None]:
    with Session(engine) as session:
        yield session


SessionDep = Annotated[Session, Depends(get_db)]

TokenDep = Annotated[str, Depends(reusable_oauth2)]


def get_current_user(session: SessionDep, token: TokenDep) -> User:
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=ALGORITHM)
        token_data = TokenPayload(**payload)
    except (InvalidTokenError, ValidationError) as exc:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, detail="无效的凭证"
        ) from exc
    user = session.get(User, token_data.sub)
    if user is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="用户不存在")
    return user


def get_current_student(session: SessionDep, token: TokenDep) -> User:
    current_user = get_current_user(session=session, token=token)
    if not current_user.role == UserRole.STUDENT:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="无权操作")
    return current_user


def get_current_teacher(session: SessionDep, token: TokenDep) -> User:
    current_user = get_current_user(session=session, token=token)
    if not current_user.role == UserRole.TEACHER:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="无权操作")
    return current_user


CurrentUser = Annotated[User, Depends(get_current_user)]
CurrentStudent = Annotated[User, Depends(get_current_student)]
CurrentTeacher = Annotated[User, Depends(get_current_teacher)]


def get_ocr_model(request: Request) -> ProblemOCRAnalyzer:
    return request.app.state.ocr_model


def get_predictor_models(request: Request) -> dict[str, ProblemPredictor]:
    return request.app.state.predictor_models


def get_classifier_model(request: Request) -> ProblemClassifier:
    return request.app.state.classifier_model


def get_openai_client(request: Request) -> OpenAI:
    return request.app.state.openai_client


OCRModel = Annotated[ProblemOCRAnalyzer, Depends(get_ocr_model)]
PredictorModels = Annotated[dict[str, ProblemPredictor], Depends(get_predictor_models)]
ClassifierModel = Annotated[ProblemClassifier, Depends(get_classifier_model)]
OpenAIClient = Annotated[OpenAI, Depends(get_openai_client)]
