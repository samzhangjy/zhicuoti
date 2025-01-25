import uuid

from fastapi import APIRouter, HTTPException, status

from app.api.deps import CurrentTeacher, SessionDep, CurrentUser
from app.logic.class_ import (
    create_class,
    get_class_by_id,
    delete_class,
    edit_class,
    get_invitation_code,
    check_is_class_teacher,
    join_class
)
from app.models import ClassCreate, ClassPublic, ClassPublicWithRelations

router = APIRouter(prefix="/class", tags=["class"])


@router.post("/", response_model=ClassPublic)
async def create_class_route(
    session: SessionDep, current_user: CurrentTeacher, class_create: ClassCreate
):
    """Create a new class."""
    class_ = create_class(
        session=session, class_create=class_create, current_user=current_user
    )
    return class_


@router.get("/{class_id}/invitation-code")
async def invite_class_route(
    session: SessionDep, class_id: uuid.UUID, current_user: CurrentTeacher
):
    """Generate an invitation code for a class."""
    if not check_is_class_teacher(
        session=session, class_id=class_id, user=current_user
    ):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, detail="你不是这个班级的老师"
        )
    code = get_invitation_code(session=session, class_id=class_id)
    return {"invitation_code": code}


@router.get("/{class_id}", response_model=ClassPublicWithRelations)
async def get_class_route(session: SessionDep, class_id: uuid.UUID):
    """Retrieve a class by ID."""
    class_ = get_class_by_id(session=session, class_id=class_id)
    return class_


@router.delete("/{class_id}")
async def delete_class_route(
    session: SessionDep, class_id: uuid.UUID, current_user: CurrentTeacher
):
    """Delete a class by ID."""
    if not check_is_class_teacher(session=session, class_id=class_id, user=current_user):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, detail="你不是这个班级的老师"
        )
    delete_class(session=session, class_id=class_id)
    return {"message": "班级已删除"}


@router.put("/{class_id}", response_model=ClassPublic)
async def edit_class_route(
    session: SessionDep,
    class_id: uuid.UUID,
    current_user: CurrentTeacher,
    class_create: ClassCreate,
):
    """Edit a class by ID."""
    class_ = get_class_by_id(session=session, class_id=class_id)
    if current_user not in class_.teachers:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, detail="你不是这个班级的老师"
        )
    edit_class(session=session, class_id=class_id, class_create=class_create)
    return class_


@router.post("/join", response_model=ClassPublic)
async def join_class_route(session: SessionDep, invitation_code: str, current_user: CurrentUser):
    """Join a class by invitation code."""
    class_ = join_class(session=session, invitation_code=invitation_code, user=current_user)
    return class_
