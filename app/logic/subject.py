from sqlmodel import Session, select

from app.models import Subject


def get_subjects(*, session: Session):
    """Retrieve subjects."""
    statement = select(Subject)
    return session.exec(statement).all()


def get_subject_by_id(*, session: Session, subject_id: int) -> Subject | None:
    """Retrieve a subject by ID."""
    return session.get(Subject, subject_id)
