import base64
import math
import os
import shutil
import uuid

from openai import OpenAI
from sqlmodel import Session, col, func, select

from backend.classifier import ProblemClassifier
from backend.config import settings
from backend.errors import ForbiddenError, InvalidPayloadError, PredictionError
from backend.models import OCRBox, OCRResult, Problem, ProblemCreate, Subject, Tag, User
from backend.ocr import ProblemOCRAnalyzer
from backend.predictor import ProblemPredictor


def do_ocr(
    *, session: Session, filepath: str, ocr_model: ProblemOCRAnalyzer
) -> OCRResult:
    """Do OCR on a problem."""
    ocr_result, preprocessed_image = ocr_model.predict_problems(filepath)
    filepath_splitted = filepath.rsplit(".", 1)
    preprocessed_image_final_path = (
        f"{filepath_splitted[0]}-preprocessed.{filepath_splitted[1]}"
    )
    shutil.move(preprocessed_image, preprocessed_image_final_path)

    ocr_result_db = OCRResult(content=preprocessed_image_final_path)
    session.add(ocr_result_db)
    session.commit()

    for res in ocr_result:
        box_db = OCRBox(
            x1=res["box"][0],
            y1=res["box"][1],
            x2=res["box"][2],
            y2=res["box"][3],
            detected_text=res["text"],
        )
        session.add(box_db)
        session.commit()
        session.refresh(box_db)
        extension = res["img"].split(".")[-1]
        shutil.move(res["img"], f"assets/boxes/{box_db.id}.{extension}")
        ocr_result_db.boxes.append(box_db)

    session.commit()
    session.refresh(ocr_result_db)
    return ocr_result_db


def _identify_extension(filename: str) -> str:
    extensions = ["jpg", "jpeg", "png"]
    for ext in extensions:
        if os.path.exists(f"{filename}.{ext}"):
            return ext
    raise InvalidPayloadError("无法识别文件类型")


def create_problem(
    *,
    session: Session,
    problem_create: ProblemCreate,
    classifier_model: ProblemClassifier,
    owner: User,
) -> Problem:
    """Create a problem."""
    ocr_result = session.get(OCRResult, problem_create.ocr_result_id)
    if not ocr_result:
        raise InvalidPayloadError("OCR 结果不存在")

    ocr_box = session.get(OCRBox, problem_create.ocr_box_id)
    if not ocr_box:
        raise InvalidPayloadError("OCR Box 不存在")

    if ocr_box.ocr_result_id != ocr_result.id:
        raise InvalidPayloadError("OCR Box 与 OCR 结果不匹配")

    # IMPORTANT: remove box first to avoid cyclic reference
    ocr_result.boxes.remove(ocr_box)
    session.add(ocr_result)
    session.commit()
    session.refresh(ocr_result)

    ocr_result.chosen_box = ocr_box
    session.add(ocr_result)
    session.commit()
    session.refresh(ocr_result)

    mappings = {"ENG": "英语", "MATH": "数学", "ZHENGZHI": "政治", "BIOLOGY": "生物"}

    subject_classified = classifier_model.predict([ocr_box.detected_text])[0]
    subject = mappings.get(subject_classified, None)
    if subject is None:
        raise PredictionError("无法识别题目科目")

    subject_db = session.exec(select(Subject).where(Subject.name == subject)).first()

    filename = f"assets/boxes/{ocr_box.id}"
    extension = _identify_extension(filename)

    problem = Problem(
        content=f"{filename}.{extension}",
        original_answer=problem_create.original_answer,
        original_answer_type=problem_create.original_answer_type,
        correct_answer=problem_create.correct_answer,
        correct_answer_type=problem_create.correct_answer_type,
        ocr_result=ocr_result,
        subject=subject_db,
        owner=owner,
    )
    session.add(problem)
    session.commit()
    session.refresh(problem)
    return problem


def assign_problem_tags(
    *, session: Session, problem: Problem, predictor_model: ProblemPredictor
) -> list[str]:
    """Predict tags for a problem."""
    predicted_tags = predictor_model.predict_problems(
        [problem.ocr_result.chosen_box.detected_text]
    )[0]
    if len(predicted_tags) == 0:
        predicted_tags = predictor_model.predict_problems(
            [problem.ocr_result.chosen_box.detected_text], min_proba=0.1, max_tags=2
        )[0]
    for tag_name, _proba in predicted_tags:
        tag = session.exec(select(Tag).where(Tag.name == tag_name)).first()
        if tag is None:
            tag = Tag(name=tag_name, subject=problem.subject)
            session.add(tag)
            session.commit()
            session.refresh(tag)
        problem.tags.append(tag)
    session.add(problem)
    session.commit()
    session.refresh(problem)
    return problem, [tag.name for tag in problem.tags]


def edit_problem(
    *,
    session: Session,
    problem_id: str,
    problem_edit: ProblemCreate,
    owner_id: uuid.UUID,
):
    """Edit a problem."""
    problem = session.get(Problem, problem_id)
    if not problem:
        raise InvalidPayloadError("题目不存在")

    if problem.owner_id != owner_id:
        raise ForbiddenError("你不是题目的所有者")

    problem.original_answer = problem_edit.original_answer
    problem.original_answer_type = problem_edit.original_answer_type
    problem.correct_answer = problem_edit.correct_answer
    problem.correct_answer_type = problem_edit.correct_answer_type

    new_tags = []

    for tag_name in [s.strip() for s in problem_edit.tags]:
        tag = session.exec(select(Tag).where(Tag.name == tag_name)).first()
        if tag is None:
            tag = Tag(name=tag_name, subject=problem.subject)
            session.add(tag)
            session.commit()
            session.refresh(tag)
        new_tags.append(tag)

    problem.tags = new_tags

    session.add(problem)
    session.commit()

    return problem


def get_problem(*, session: Session, problem_id: str) -> Problem:
    """Get a problem by ID."""
    problem = session.get(Problem, problem_id)
    if not problem:
        raise InvalidPayloadError("题目不存在")
    return problem


def delete_problem(*, session: Session, problem_id: str, owner_id: uuid.UUID):
    """Delete a problem."""
    problem = session.get(Problem, problem_id)
    if not problem:
        raise InvalidPayloadError("题目不存在")

    if problem.owner_id != owner_id:
        raise ForbiddenError("你不是题目的所有者")

    session.delete(problem)
    session.commit()
    return problem


def get_my_problems(*, session: Session, user: User, page: int) -> list[Problem]:
    """Get all problems of a user."""
    problems = session.exec(
        select(Problem)
        .where(Problem.owner_id == user.id)
        .order_by(Problem.created_at.desc())  # pylint: disable=no-member
        .offset((page - 1) * settings.PER_PAGE)
        .limit(settings.PER_PAGE)
    ).all()
    total_cnt = session.exec(
        select(func.count(col(Problem.id))).where(  # pylint: disable=not-callable
            Problem.owner_id == user.id
        )
    ).first()
    return (problems, math.ceil(total_cnt / settings.PER_PAGE))


def get_problem_solution(
    *, session: Session, problem_id: uuid.UUID, openai_client: OpenAI
):
    """Get a problem solution."""
    problem = get_problem(session=session, problem_id=problem_id)
    with open(problem.content, "rb") as image_file:
        base64_image = base64.b64encode(image_file.read()).decode("utf-8")
    stream = openai_client.chat.completions.create(
        model=settings.OPENAI_MODEL,
        messages=[
            {
                "role": "system",
                "content": "You are a problem solving assistant. You will be given a problem of any subjects, "
                "thus you need to give your analysis process, full solution and final answer. "
                "Your output should always be in Chinese. Your output should be in the format of "
                "`**题目分析：** {your analysis process}\n\n**题目解答：** {your solution process}\n\n**答案：** {your final answer}`."
                "You can use Markdown and Latex to format your output. Do NOT use any headings/titles in your output. Do phrase your "
                "output in a simple form for students to understand. You will also be given a list of related tags to this problem, "
                "therefore you MUST include the usage of those in your analysis process. Your analysis process MUST also include reasons of why the "
                "student gets an error on this problem. The knowledge required to use in your analysis process MUST be at the level "
                "of high school Grade 1 in China.",
            },
            {
                "role": "user",
                "content": [
                    {
                        "type": "text",
                        "text": f"Solve the following problem. Related tags: {', '.join([tag.name for tag in problem.tags])}",
                    },
                    {
                        "type": "image_url",
                        "image_url": {"url": f"data:image/jpeg;base64,{base64_image}"},
                    },
                ],
            },
        ],
        stream=True,
    )
    for chunk in stream:
        if chunk.choices[0].delta.content is not None:
            yield chunk.choices[0].delta.content
