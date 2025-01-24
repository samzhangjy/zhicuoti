"""User business logic."""
from sqlmodel import Session, select

from app.models import User, UserCreate
from app.security import get_password_hash, verify_password


def get_user_by_phone_number(*, session: Session, phone_number: str) -> User | None:
    """Retrieve a user by phone number."""
    statement = select(User).where(User.phone_number == phone_number)
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
