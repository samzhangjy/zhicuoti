import uuid

from fastapi import APIRouter
from fastapi.responses import StreamingResponse

from backend.api.deps import CurrentStudent, CurrentTeacher, SessionDep, OpenAIClient
from backend.logic.analyze import (
    get_class_overview,
    get_latest_problems,
    get_latest_subject_problems,
    get_per_subject_overview,
    get_student_overview,
    get_student_per_subject_overview,
    get_tag_problems,
    get_student_tag_overview,
    get_student_subject_analysis,
    get_teacher_subject_analysis,
    get_teacher_tag_analysis,
)
from backend.models import (
    GetAnalyzeLatestSubjectProblemsResponse,
    GetAnalyzeOverviewResponse,
    GetAnalyzePerSubjectResponse,
    GetAnalyzeTagProblemsResponse,
    ProblemPublic,
)

router = APIRouter(prefix="/analyze", tags=["analyze"])


@router.get("/me", response_model=GetAnalyzeOverviewResponse)
def get_my_overview_route(session: SessionDep, current_user: CurrentStudent):
    """Get a student overview."""
    overview = get_student_overview(session=session, user_id=current_user.id)
    return overview


@router.get("/me/subject/{subject_id}", response_model=GetAnalyzePerSubjectResponse)
def get_my_per_subject_overview_route(
    session: SessionDep, current_user: CurrentStudent, subject_id: uuid.UUID
):
    """Get per-subject overview of a student."""
    overview = get_student_per_subject_overview(
        session=session, user_id=current_user.id, subject_id=subject_id
    )
    return overview


@router.get("/me/tag/{tag_id}/ai")
def get_my_tag_ai_analysis_route(
    session: SessionDep,
    current_user: CurrentStudent,
    tag_id: uuid.UUID,
    openai_client: OpenAIClient,
):
    """Get the tag analysis from AI."""
    return StreamingResponse(
        get_student_tag_overview(
            session=session,
            user_id=current_user.id,
            tag_id=tag_id,
            openai_client=openai_client,
        ),
        media_type="text/event-stream",
    )


@router.get("/me/subject/{subject_id}/ai")
def get_my_subject_ai_analysis_route(
    session: SessionDep,
    current_user: CurrentStudent,
    subject_id: uuid.UUID,
    openai_client: OpenAIClient,
):
    """Get the subject analysis from AI."""
    return StreamingResponse(
        get_student_subject_analysis(
            session=session,
            user_id=current_user.id,
            subject_id=subject_id,
            openai_client=openai_client,
        ),
        media_type="text/event-stream",
    )


@router.get("/student/{user_id}", response_model=GetAnalyzeOverviewResponse)
def get_student_overview_route(
    session: SessionDep, _current_user: CurrentTeacher, user_id: uuid.UUID
):
    """Get a student overview."""
    overview = get_student_overview(session=session, user_id=user_id)
    return overview


@router.get(
    "/student/{user_id}/subject/{subject_id}",
    response_model=GetAnalyzePerSubjectResponse,
)
def get_student_per_subject_overview_route(
    session: SessionDep,
    _current_user: CurrentTeacher,
    subject_id: uuid.UUID,
    user_id: uuid.UUID,
):
    """Get per-subject overview of a student."""
    overview = get_student_per_subject_overview(
        session=session, user_id=user_id, subject_id=subject_id
    )
    return overview


@router.get("/student/{user_id}/tag/{tag_id}/ai")
def get_student_tag_ai_analysis_route(
    session: SessionDep,
    _current_user: CurrentTeacher,
    user_id: uuid.UUID,
    tag_id: uuid.UUID,
    openai_client: OpenAIClient,
):
    """Get the tag analysis from AI."""
    return StreamingResponse(
        get_student_tag_overview(
            session=session, user_id=user_id, tag_id=tag_id, openai_client=openai_client
        ),
        media_type="text/event-stream",
    )


@router.get("/student/{user_id}/subject/{subject_id}/ai")
def get_student_subject_ai_analysis_route(
    session: SessionDep,
    _current_user: CurrentTeacher,
    user_id: uuid.UUID,
    subject_id: uuid.UUID,
    openai_client: OpenAIClient,
):
    """Get the subject analysis from AI."""
    return StreamingResponse(
        get_student_subject_analysis(
            session=session,
            user_id=user_id,
            subject_id=subject_id,
            openai_client=openai_client,
        ),
        media_type="text/event-stream",
    )


@router.get("/{class_id}", response_model=GetAnalyzeOverviewResponse)
def get_class_overview_route(
    session: SessionDep, _current_user: CurrentTeacher, class_id: uuid.UUID
):
    """Get a class overview."""
    overview = get_class_overview(session=session, class_id=class_id)
    return overview


@router.get(
    "/{class_id}/subject/{subject_id}", response_model=GetAnalyzePerSubjectResponse
)
def get_per_subject_overview_route(
    session: SessionDep,
    _current_user: CurrentTeacher,
    subject_id: uuid.UUID,
    class_id: uuid.UUID,
):
    """Get per-subject overview of a class."""
    overview = get_per_subject_overview(
        session=session, class_id=class_id, subject_id=subject_id
    )
    return overview


@router.get("/{class_id}/subject/{subject_id}/ai")
def get_teacher_subject_ai_analysis_route(
    session: SessionDep,
    _current_user: CurrentTeacher,
    class_id: uuid.UUID,
    subject_id: uuid.UUID,
    openai_client: OpenAIClient,
):
    """Get the subject analysis from AI."""
    return StreamingResponse(
        get_teacher_subject_analysis(
            session=session,
            class_id=class_id,
            subject_id=subject_id,
            openai_client=openai_client,
        ),
        media_type="text/event-stream",
    )


@router.get("/{class_id}/tag/{tag_id}/ai")
def get_teacher_tag_ai_analysis_route(
    session: SessionDep,
    _current_user: CurrentTeacher,
    class_id: uuid.UUID,
    tag_id: uuid.UUID,
    openai_client: OpenAIClient,
):
    """Get the tag analysis from AI."""
    return StreamingResponse(
        get_teacher_tag_analysis(
            session=session,
            class_id=class_id,
            tag_id=tag_id,
            openai_client=openai_client,
        ),
        media_type="text/event-stream",
    )


@router.get("/{class_id}/latest", response_model=list[ProblemPublic])
def get_latest_problems_route(
    session: SessionDep, _current_user: CurrentTeacher, class_id: uuid.UUID
):
    """Get latest problems of a class."""
    problems = get_latest_problems(session=session, class_id=class_id)
    return problems


@router.get(
    "/{class_id}/subject/{subject_id}/latest",
    response_model=GetAnalyzeLatestSubjectProblemsResponse,
)
def get_latest_subject_problems_route(
    session: SessionDep,
    _current_user: CurrentTeacher,
    class_id: uuid.UUID,
    subject_id: uuid.UUID,
):
    """Get latest problems of a class."""
    subject, problems = get_latest_subject_problems(
        session=session, class_id=class_id, subject_id=subject_id
    )
    return {
        "subject": subject,
        "problems": problems,
    }


@router.get("/{class_id}/tag/{tag_id}", response_model=GetAnalyzeTagProblemsResponse)
def get_tag_problems_route(
    session: SessionDep,
    _current_user: CurrentTeacher,
    tag_id: uuid.UUID,
    class_id: uuid.UUID,
    page: int = 1,
):
    """Get problems by tag."""
    tag, problems, total_pages = get_tag_problems(
        session=session, tag_id=tag_id, class_id=class_id, page=page
    )
    return {
        "tag": tag,
        "problems": problems,
        "total_pages": total_pages,
    }
