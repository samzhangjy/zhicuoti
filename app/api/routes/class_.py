from fastapi import APIRouter
from app.api.deps import SessionDep, CurrentTeacher
from app.logic.class_ import create_class
from app.models import ClassCreate, ClassPublic


router = APIRouter(prefix="/class", tags=["class"])

@router.post("/", response_model=ClassPublic)
def new_class(session: SessionDep, current_user: CurrentTeacher, class_create: ClassCreate):
    """Create a new class."""
    class_ = create_class(session=session, class_create=class_create, current_user=current_user)
    return class_
