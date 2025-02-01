"""User business logic."""

from sqlmodel import Session, select

from backend.models import User, UserCreate, TeacherUpdate, StudentUpdate, Subject
from backend.security import get_password_hash, verify_password
from backend.errors import InvalidPayloadError


def get_user_by_phone_number(*, session: Session, phone_number: str) -> User | None:
    """Retrieve a user by phone number."""
    statement = select(User).where(User.phone_number == phone_number)
    return session.exec(statement).first()


def get_user_by_id(*, session: Session, user_id: int) -> User | None:
    """Retrieve a user by id."""
    statement = select(User).where(User.id == user_id)
    return session.exec(statement).first()


def create_user(*, session: Session, user_create: UserCreate) -> User:
    """Create a new user."""
    db_obj = User.model_validate(
        user_create, update={"hashed_password": get_password_hash(user_create.password)}
    )
    session.add(db_obj)
    session.commit()
    session.refresh(db_obj)
    return db_obj


def authenticate(*, session: Session, phone_number: str, password: str) -> User | None:
    """Authenticate a user."""
    user = get_user_by_phone_number(session=session, phone_number=phone_number)
    if not user or not verify_password(password, user.hashed_password):
        return None
    return user


def edit_teacher(*, session: Session, user: User, user_in: TeacherUpdate) -> User:
    """Edit a user."""
    user = session.get(User, user.id)
    if user is None:
        raise InvalidPayloadError("用户不存在")
    if get_user_by_phone_number(session=session, phone_number=user_in.phone_number) is not None:
        raise InvalidPayloadError("手机号已被注册")
    if user_in.subject_id is not None:
        subject = session.get(Subject, user_in.subject_id)
        if not subject:
            raise InvalidPayloadError("科目不存在") 
    user.subject_id = user_in.subject_id
    user.phone_number = user_in.phone_number
    session.add(user)
    session.commit()
    session.refresh(user)
    return user


def edit_student(*, session: Session, user: User, user_in: StudentUpdate) -> User:
    """Edit a user."""
    user = session.get(User, user.id)
    if user is None:
        raise InvalidPayloadError("用户不存在")
    if get_user_by_phone_number(session=session, phone_number=user_in.phone_number) is not None:
        raise InvalidPayloadError("手机号已被注册")
    user.phone_number = user_in.phone_number
    session.add(user)
    session.commit()
    session.refresh(user)
    return user
