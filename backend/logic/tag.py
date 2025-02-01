import uuid

from sqlmodel import Session, select

from backend.errors import InvalidPayloadError
from backend.models import Tag, Problem


def get_tags(*, session: Session) -> list[Tag]:
    """Get all tags."""
    tags = session.exec(select(Tag)).all()
    return tags


def get_tags_for_user(*, session: Session, user_id: uuid.UUID) -> list[Tag]:
    """Get all tags."""
    tags = session.exec(
        select(Tag).where(Tag.problems.any(Problem.owner_id == user_id))
    ).all()
    return tags


def get_tag(*, session: Session, tag_id: uuid.UUID) -> Tag:
    """Get a tag by ID."""
    tag = session.get(Tag, tag_id)
    if not tag:
        raise InvalidPayloadError("标签不存在")
    return tag


def get_tag_for_user(*, session: Session, tag_id: uuid.UUID, user_id: uuid.UUID) -> Tag:
    """Get a tag by ID."""
    tag = session.exec(select(Tag).where(Tag.id == tag_id)).first()
    if not tag:
        raise InvalidPayloadError("标签不存在")
    problems = session.exec(
        select(Problem)
        .where(Problem.tags.any(Tag.id == tag_id))
        .where(Problem.owner_id == user_id)
    ).all()
    tag.problems = problems
    return tag


def search_tags(*, session: Session, query: str, subject_id: uuid.UUID) -> list[Tag]:
    """Search tags by name."""
    tags = session.exec(
        select(Tag).where(Tag.name.contains(query)).where(Tag.subject_id == subject_id)
    ).all()
    return tags
