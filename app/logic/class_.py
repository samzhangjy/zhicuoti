import hashlib
import uuid

from sqlmodel import Session, select

from app.models import Class, ClassCreate, User, UserRole
from app.errors import InvalidPayloadError


def create_class(
    *, session: Session, class_create: ClassCreate, current_user: User
) -> Class:
    """Create a new class."""
    db_obj = Class.model_validate(class_create)
    db_obj.teachers.append(current_user)
    session.add(db_obj)
    session.commit()
    session.refresh(db_obj)
    return db_obj


def _generate_invitation_code(class_id: uuid.UUID) -> str:
    """Generate an invitation code."""
    hash_object = hashlib.sha256(class_id.bytes)

    hash_int = int(hash_object.hexdigest(), 16)

    base = 36
    max_length = 6
    chars = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ"

    invitation_code = ""
    for _ in range(max_length):
        hash_int, remainder = divmod(hash_int, base)
        invitation_code = chars[remainder] + invitation_code

    return invitation_code


def get_invitation_code(*, session: Session, class_id: uuid.UUID) -> str:
    """Generate an invite code for a class."""
    class_ = get_class_by_id(session=session, class_id=class_id)
    if class_.invitation_code is None:
        class_.invitation_code = _generate_invitation_code(class_id=class_id)
        session.add(class_)
        session.commit()
        session.refresh(class_)
    return class_.invitation_code


def get_class_by_id(*, session: Session, class_id: uuid.UUID) -> Class | None:
    """Retrieve a class by ID."""
    return session.get(Class, class_id)


def delete_class(*, session: Session, class_id: uuid.UUID) -> None:
    """Delete a class by ID."""
    class_ = get_class_by_id(session=session, class_id=class_id)
    session.delete(class_)
    session.commit()


def edit_class(
    *, session: Session, class_id: uuid.UUID, class_create: ClassCreate
) -> Class:
    """Edit a class by ID."""
    class_ = get_class_by_id(session=session, class_id=class_id)
    class_.name = class_create.name
    class_.description = class_create.description
    session.add(class_)
    session.commit()
    session.refresh(class_)
    return class_


def check_is_class_teacher(*, session: Session, class_id: uuid.UUID, user: User) -> bool:
    """Check if a user is a teacher of a class."""
    class_ = get_class_by_id(session=session, class_id=class_id)
    return user.role == UserRole.TEACHER and user in class_.teachers


def join_class(*, session: Session, invitation_code: str, user: User) -> Class:
    """Join a class by invitation code."""
    statement = select(Class).where(Class.invitation_code == invitation_code)
    class_ = session.exec(statement).first()
    if class_ is None:
        raise InvalidPayloadError("无效的邀请码")
    if user.role == UserRole.STUDENT:
        if user in class_.students:
            raise InvalidPayloadError("你已经加入了这个班级")
        class_.students.append(user)
    else:
        if user in class_.teachers:
            raise InvalidPayloadError("你已经是这个班级的老师")
        class_.teachers.append(user)
    session.add(class_)
    session.commit()
    session.refresh(class_)
    return class_
