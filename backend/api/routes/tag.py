import uuid

from fastapi import APIRouter

from backend.api.deps import SessionDep, CurrentStudent
from backend.logic.tag import get_tag, get_tags, search_tags, get_tag_for_user, get_tags_for_user
from backend.models import TagPublic, TagPublicWithRelations

router = APIRouter(prefix="/tag", tags=["tag"])


@router.get("/", response_model=list[TagPublic])
def get_tags_route(session: SessionDep):
    """Get all tags."""
    tags = get_tags(session=session)
    return tags


@router.get("/my", response_model=list[TagPublic])
def get_tags_for_user_route(current_user: CurrentStudent, session: SessionDep):
    """Get all tags."""
    tags = get_tags_for_user(session=session, user_id=current_user.id)
    return tags


@router.get("/search", response_model=list[TagPublic])
def search_tags_route(session: SessionDep, query: str, subject_id: uuid.UUID):
    """Search tags by name."""
    tags = search_tags(session=session, query=query, subject_id=subject_id)
    return tags


@router.get("/{tag_id}", response_model=TagPublicWithRelations)
def get_tag_route(tag_id: uuid.UUID, session: SessionDep):
    """Get a tag by ID."""
    tag = get_tag(session=session, tag_id=tag_id)
    return tag


@router.get("/{tag_id}/my", response_model=TagPublicWithRelations)
def get_tag_for_user_route(tag_id: uuid.UUID, current_user: CurrentStudent, session: SessionDep):
    """Get a tag by ID."""
    tag = get_tag_for_user(session=session, tag_id=tag_id, user_id=current_user.id)
    return tag
