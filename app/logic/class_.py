from sqlmodel import Session

from app.models import Class, ClassCreate, User


def create_class(*, session: Session, class_create: ClassCreate, current_user: User) -> Class:
    """Create a new class."""
    db_obj = Class.model_validate(class_create)
    db_obj.teachers.append(current_user)
    session.add(db_obj)
    session.commit()
    session.refresh(db_obj)
    return db_obj
