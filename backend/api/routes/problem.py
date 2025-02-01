import uuid

from fastapi import APIRouter, UploadFile
from fastapi.responses import StreamingResponse

from backend.api.deps import (
    ClassifierModel,
    CurrentStudent,
    OCRModel,
    PredictorModels,
    SessionDep,
    OpenAIClient,
    CurrentUser,
)
from backend.logic.problem import (
    assign_problem_tags,
    create_problem,
    delete_problem,
    do_ocr,
    edit_problem,
    get_my_problems,
    get_problem,
    get_problem_solution,
)
from backend.models import (
    OCRResultPublic,
    ProblemCreate,
    ProblemEdit,
    ProblemPublic,
    GetProblemsResponse,
)

router = APIRouter(prefix="/problem", tags=["problem"])


@router.post("/ocr", response_model=OCRResultPublic)
def ocr_image_route(
    session: SessionDep,
    _current_student: CurrentStudent,
    ocr_model: OCRModel,
    image: UploadFile,
):
    """Do OCR on a problem."""
    extension = image.filename.split(".")[-1]
    uploaded_file_id = uuid.uuid4()
    with open(f"assets/upload/{uploaded_file_id}.{extension}", "wb") as f:
        f.write(image.file.read())
    ocr_result = do_ocr(
        session=session,
        filepath=f"assets/upload/{uploaded_file_id}.{extension}",
        ocr_model=ocr_model,
    )
    return ocr_result


@router.post("/", response_model=ProblemPublic)
def create_problem_route(
    session: SessionDep,
    problem_create: ProblemCreate,
    classifier_model: ClassifierModel,
    predictor_models: PredictorModels,
    current_user: CurrentStudent,
):
    """Create a new problem."""
    problem = create_problem(
        session=session,
        problem_create=problem_create,
        classifier_model=classifier_model,
        owner=current_user,
    )

    predictor_model = predictor_models.get(problem.subject.name, None)

    if predictor_model is None:
        return problem

    problem, _tags = assign_problem_tags(
        session=session, problem=problem, predictor_model=predictor_model
    )
    return problem


@router.put("/{problem_id}", response_model=ProblemPublic)
def edit_problem_route(
    session: SessionDep,
    problem_edit: ProblemEdit,
    current_user: CurrentStudent,
    problem_id: uuid.UUID,
):
    """Edit a problem."""
    problem = edit_problem(
        session=session,
        problem_edit=problem_edit,
        owner_id=current_user.id,
        problem_id=problem_id,
    )
    return problem


@router.get("/my", response_model=GetProblemsResponse)
def get_my_problems_route(
    session: SessionDep, current_user: CurrentStudent, page: int = 1
):
    """Get all problems created by the current user."""
    problems, total_pages = get_my_problems(
        session=session, user=current_user, page=page
    )
    return {
        "problems": problems,
        "total_pages": total_pages,
    }


@router.get("/{problem_id}", response_model=ProblemPublic)
def get_problem_route(session: SessionDep, problem_id: uuid.UUID):
    """Get a problem by ID."""
    problem = get_problem(session=session, problem_id=problem_id)
    return problem


@router.delete("/{problem_id}")
def delete_problem_route(
    session: SessionDep, current_user: CurrentStudent, problem_id: uuid.UUID
):
    """Delete a problem."""
    delete_problem(session=session, owner_id=current_user.id, problem_id=problem_id)


@router.get("/{problem_id}/solution")
def get_problem_solution_route(
    session: SessionDep,
    _current_user: CurrentUser,
    problem_id: uuid.UUID,
    openai_client: OpenAIClient,
):
    """Get the solution of a problem by AI."""
    return StreamingResponse(
        get_problem_solution(
            session=session, problem_id=problem_id, openai_client=openai_client
        ),
        media_type="text/event-stream",
    )
