from fastapi import APIRouter

from app.api.deps import CurrentTeacher, CurrentStudent, SessionDep
from app.logic.user import edit_student, edit_teacher
from app.models import TeacherUpdate, UserMe, StudentUpdate

router = APIRouter(prefix="/user", tags=["user"])


@router.put("/teacher", response_model=UserMe)
async def edit_teacher_route(
    session: SessionDep, current_user: CurrentTeacher, user_in: TeacherUpdate
):
    """Edit the current user."""
    user = edit_teacher(session=session, user=current_user, user_in=user_in)
    return user


@router.put("/student", response_model=UserMe)
async def edit_student_route(
    session: SessionDep, current_user: CurrentStudent, user_in: StudentUpdate
):
    """Edit the current user."""
    user = edit_student(session=session, user=current_user, user_in=user_in)
    return user
