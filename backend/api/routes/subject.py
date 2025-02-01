import uuid

from fastapi import APIRouter

from backend.api.deps import CurrentUser, SessionDep
from backend.logic.subject import get_subject_by_id, get_subjects
from backend.models import SubjectPublic, SubjectPublicWithRelations

router = APIRouter(prefix="/subject", tags=["subject"])


@router.get("/", response_model=list[SubjectPublic])
async def get_subjects_route(session: SessionDep):
    """Retrieve subjects."""
    subjects = get_subjects(session=session)
    return subjects


@router.get("/{subject_id}", response_model=SubjectPublicWithRelations)
async def get_subject(
    subject_id: uuid.UUID, session: SessionDep, _current_user: CurrentUser
):
    """Retrieve a subject."""
    subject = get_subject_by_id(session=session, subject_id=subject_id)
    return subject
