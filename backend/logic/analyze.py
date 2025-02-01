import math
import uuid
from datetime import datetime, timedelta

from openai import OpenAI
from sqlmodel import Session, col, func, select

from backend.config import settings
from backend.logic.class_ import get_class_by_id
from backend.logic.subject import get_subject_by_id, get_subjects
from backend.logic.tag import get_tag
from backend.logic.user import get_user_by_id
from backend.models import Class, Problem, Subject, Tag, User, UserRole
from backend.errors import InvalidPayloadError


def _generate_day_range(past_days: int) -> tuple[datetime, datetime]:
    """Generate a day range."""
    if past_days == 0:
        end_date = datetime.now()
        start_date = end_date.replace(hour=0, minute=0, second=0, microsecond=0)
        return start_date, end_date
    end_date = datetime.now().replace(
        hour=0, minute=0, second=0, microsecond=0
    ) - timedelta(days=past_days - 1)
    start_date = end_date - timedelta(days=past_days)
    return start_date, end_date


def get_class_overview(*, session: Session, class_id: uuid.UUID) -> dict:
    """Get a class overview."""
    class_ = get_class_by_id(session=session, class_id=class_id)

    if class_ is None:
        raise InvalidPayloadError("班级不存在")

    # NOTE: weird pylint behavior that static-analyzer can't detect the `count` method
    students_cnt = session.exec(
        select(func.count(col(User.id)))  # pylint: disable=not-callable
        .where(User.class_id == class_id)
        .where(User.role == UserRole.STUDENT)
    ).first()
    teachers_cnt = session.exec(
        select(func.count(col(User.id)))  # pylint: disable=not-callable
        .where(User.owned_classes.any(Class.id == class_id))
        .where(User.role == UserRole.TEACHER)
    ).first()
    problems_cnt = session.exec(
        select(func.count(col(Problem.id))).where(  # pylint: disable=not-callable
            Problem.owner.has(User.class_id == class_id)
        )
    ).first()
    subjects_cnt = {}
    subjects = get_subjects(session=session)
    for subject in subjects:
        cnt = session.exec(
            select(func.count(col(Problem.id)))  # pylint: disable=not-callable
            .where(Problem.owner.has(User.class_id == class_id))
            .where(Problem.subject.has(Subject.id == subject.id))
        ).first()
        subjects_cnt[subject.name] = cnt

    date_cnt = {}
    for i in range(7):
        start_date, end_date = _generate_day_range(i)
        cnt = session.exec(
            select(func.count(col(Problem.id)))  # pylint: disable=not-callable
            .where(Problem.owner.has(User.class_id == class_id))
            .where(Problem.created_at >= start_date)
            .where(Problem.created_at < end_date)
        ).first()
        date_cnt[start_date.date()] = cnt

    return {
        "students_cnt": students_cnt,
        "teachers_cnt": teachers_cnt,
        "problems_cnt": problems_cnt,
        "subjects_cnt": subjects_cnt,
        "date_cnt": date_cnt,
    }


def get_per_subject_overview(
    *, session: Session, class_id: uuid.UUID, subject_id: uuid.UUID
) -> dict:
    """Get per-subject overview of a class."""
    class_ = get_class_by_id(session=session, class_id=class_id)
    subject = get_subject_by_id(session=session, subject_id=subject_id)

    if class_ is None or subject is None:
        raise InvalidPayloadError("班级或科目不存在")

    problems_cnt = session.exec(
        select(func.count(col(Problem.id)))  # pylint: disable=not-callable
        .where(Problem.owner.has(User.class_id == class_id))
        .where(Problem.subject.has(Subject.id == subject_id))
    ).first()

    tags_cnt = {}

    for tag in subject.tags:
        cnt = session.exec(
            select(func.count(col(Problem.id)))  # pylint: disable=not-callable
            .where(Problem.owner.has(User.class_id == class_id))
            .where(Problem.subject.has(Subject.id == subject_id))
            .where(Problem.tags.any(Tag.id == tag.id))
        ).first()
        tags_cnt[tag.name] = {"cnt": cnt, "tag_id": tag.id, "date": {}}
        for i in range(7):
            start_date, end_date = _generate_day_range(i)
            cnt = session.exec(
                select(func.count(col(Problem.id)))  # pylint: disable=not-callable
                .where(Problem.owner.has(User.class_id == class_id))
                .where(Problem.subject.has(Subject.id == subject_id))
                .where(Problem.tags.any(Tag.id == tag.id))
                .where(Problem.created_at >= start_date)
                .where(Problem.created_at < end_date)
            ).first()
            tags_cnt[tag.name]["date"][start_date.date()] = cnt

    date_cnt = {}

    for i in range(7):
        start_date, end_date = _generate_day_range(i)
        cnt = session.exec(
            select(func.count(col(Problem.id)))  # pylint: disable=not-callable
            .where(Problem.owner.has(User.class_id == class_id))
            .where(Problem.subject.has(Subject.id == subject_id))
            .where(Problem.created_at >= start_date)
            .where(Problem.created_at < end_date)
        ).first()
        date_cnt[start_date.date()] = cnt

    return {
        "problems_cnt": problems_cnt,
        "tags_cnt": tags_cnt,
        "date_cnt": date_cnt,
        "subject": subject,
    }


def get_student_overview(*, session: Session, user_id: uuid.UUID) -> dict:
    """Get a student overview."""
    student = get_user_by_id(session=session, user_id=user_id)

    if student is None:
        raise InvalidPayloadError("用户不存在")

    problems_cnt = session.exec(
        select(func.count(col(Problem.id))).where(  # pylint: disable=not-callable
            Problem.owner.has(User.id == user_id)
        )
    ).first()
    subjects_cnt = {}
    subjects = get_subjects(session=session)
    for subject in subjects:
        cnt = session.exec(
            select(func.count(col(Problem.id)))  # pylint: disable=not-callable
            .where(Problem.owner.has(User.id == user_id))
            .where(Problem.subject.has(Subject.id == subject.id))
        ).first()
        subjects_cnt[subject.name] = cnt

    date_cnt = {}
    for i in range(7):
        start_date, end_date = _generate_day_range(i)
        cnt = session.exec(
            select(func.count(col(Problem.id)))  # pylint: disable=not-callable
            .where(Problem.owner.has(User.id == user_id))
            .where(Problem.created_at >= start_date)
            .where(Problem.created_at < end_date)
        ).first()
        date_cnt[start_date.date()] = cnt

    return {
        "problems_cnt": problems_cnt,
        "subjects_cnt": subjects_cnt,
        "date_cnt": date_cnt,
    }


def get_student_per_subject_overview(
    *, session: Session, user_id: uuid.UUID, subject_id: uuid.UUID
) -> dict:
    """Get a student per-subject overview."""
    student = get_user_by_id(session=session, user_id=user_id)
    subject = get_subject_by_id(session=session, subject_id=subject_id)

    if student is None or subject is None:
        raise InvalidPayloadError("用户或科目不存在")

    problems_cnt = session.exec(
        select(func.count(col(Problem.id)))  # pylint: disable=not-callable
        .where(Problem.owner.has(User.id == user_id))
        .where(Problem.subject.has(Subject.id == subject_id))
    ).first()

    tags_cnt = {}

    for tag in subject.tags:
        cnt = session.exec(
            select(func.count(col(Problem.id)))  # pylint: disable=not-callable
            .where(Problem.owner.has(User.id == user_id))
            .where(Problem.subject.has(Subject.id == subject_id))
            .where(Problem.tags.any(Tag.id == tag.id))
        ).first()
        tags_cnt[tag.name] = {"cnt": cnt, "tag_id": tag.id, "date": {}}
        for i in range(7):
            start_date, end_date = _generate_day_range(i)
            cnt = session.exec(
                select(func.count(col(Problem.id)))  # pylint: disable=not-callable
                .where(Problem.owner.has(User.id == user_id))
                .where(Problem.subject.has(Subject.id == subject_id))
                .where(Problem.tags.any(Tag.id == tag.id))
                .where(Problem.created_at >= start_date)
                .where(Problem.created_at < end_date)
            ).first()
            tags_cnt[tag.name]["date"][start_date.date()] = cnt

    date_cnt = {}

    for i in range(7):
        start_date, end_date = _generate_day_range(i)
        cnt = session.exec(
            select(func.count(col(Problem.id)))  # pylint: disable=not-callable
            .where(Problem.owner.has(User.id == user_id))
            .where(Problem.subject.has(Subject.id == subject_id))
            .where(Problem.created_at >= start_date)
            .where(Problem.created_at < end_date)
        ).first()
        date_cnt[start_date.date()] = cnt

    return {
        "problems_cnt": problems_cnt,
        "tags_cnt": tags_cnt,
        "date_cnt": date_cnt,
        "subject": subject,
    }


def get_student_tag_overview(
    *, session: Session, tag_id: uuid.UUID, user_id: uuid.UUID, openai_client: OpenAI
):
    """Get a tag overview for student."""
    tag = get_tag(session=session, tag_id=tag_id)
    if tag is None:
        raise InvalidPayloadError("标签不存在")
    problems = session.exec(
        select(Problem)
        .where(Problem.owner_id == user_id)
        .where(Problem.tags.any(Tag.id == tag_id))
        .order_by(Problem.created_at.desc())  # pylint: disable=no-member
        .limit(5)
    ).all()
    problem_info = [
        {
            "description": problem.ocr_result.chosen_box.detected_text,
            "tags": [tag.name for tag in problem.tags],
        }
        for problem in problems
    ]
    problem_info_str = ""
    for problem in problem_info:
        problem_info_str += f"- {problem['description']}\n  (Tags to this problem: {', '.join(problem['tags'])})\n"
    stream = openai_client.chat.completions.create(
        model=settings.OPENAI_MODEL,
        messages=[
            {
                "role": "system",
                "content": "You are an assitant to help analyze the cause of why students fail on certain knowledge points."
                "You will be given a tag (knowledge point) of a certain subject, alongside with at most 5 problems the student has failed "
                "on this tag recently. Your task is to analyze the cause of why the student has failed on this tag and provide ways to "
                "improve the student's performance. Your output should always be in the format of `**知识点分析：** {your analysis for this tag}"
                "\n\n**改进方法：** {your suggestions to improve the student's performance}`. Your output should mainly focus on the tag "
                "student is asking for. You can relate to other tags if needed. You MUST NOT use any headings/titles in your output. "
                "You may use Latex or Markdown to format your output. Your output should always be in Chinese.",
            },
            {
                "role": "user",
                "content": [
                    {
                        "type": "text",
                        "text": f"The student has failed on the following problems related to the tag {tag.name}: \n{problem_info_str}\nPlease give your analysis and suggestions to improve the student's performance.",
                    },
                ],
            },
        ],
        stream=True,
    )
    for chunk in stream:
        if chunk.choices[0].delta.content is not None:
            yield chunk.choices[0].delta.content


def get_student_subject_analysis(
    *,
    session: Session,
    subject_id: uuid.UUID,
    user_id: uuid.UUID,
    openai_client: OpenAI,
):
    """Get a subject overview for student."""
    subject = get_subject_by_id(session=session, subject_id=subject_id)
    if subject is None:
        raise InvalidPayloadError("科目不存在")
    problems = session.exec(
        select(Problem)
        .where(Problem.owner_id == user_id)
        .where(Problem.subject_id == subject_id)
        .order_by(Problem.created_at.desc())  # pylint: disable=no-member
        .limit(5)
    ).all()
    problem_info = [
        {
            "description": problem.ocr_result.chosen_box.detected_text,
            "tags": [tag.name for tag in problem.tags],
        }
        for problem in problems
    ]
    problem_info_str = ""
    for problem in problem_info:
        problem_info_str += f"- {problem['description']}\n  (Tags to this problem: {', '.join(problem['tags'])})\n"
    stream = openai_client.chat.completions.create(
        model=settings.OPENAI_MODEL,
        messages=[
            {
                "role": "system",
                "content": "You are an assitant to help analyze the cause of why students fail on certain subjects."
                "You will be given a certain subject, alongside with at most 5 problems the student has failed "
                "on this subject recently. Your task is to analyze the cause of why the student has failed on this subject and provide ways to "
                "improve the student's performance. Your output should always be in the format of `**学科分析：** {your analysis for this tag}"
                "\n\n**知识点分析：** {your analysis to at most 3 tags that student has failed on most}\n\n**改进方法：** "
                "{your suggestions to improve the student's performance}`. Your output must focus on the subject "
                "student is asking for. You can relate to other tags if needed. You MUST NOT use any headings/titles in your output. "
                "You may use Latex or Markdown to format your output. Your output should always be in Chinese. If no problems are "
                "provided, point out to the user and simply provide generic suggestions to improve the student's performance.",
            },
            {
                "role": "user",
                "content": [
                    {
                        "type": "text",
                        "text": f"The student has failed on the following problems of subject {subject.name}: \n{problem_info_str}\n"
                        "Please give your analysis and suggestions to improve the student's performance on this subject.",
                    },
                ],
            },
        ],
        stream=True,
    )
    for chunk in stream:
        if chunk.choices[0].delta.content is not None:
            yield chunk.choices[0].delta.content


def get_teacher_subject_analysis(
    *,
    session: Session,
    subject_id: uuid.UUID,
    class_id: uuid.UUID,
    openai_client: OpenAI,
):
    """Get a subject overview for student."""
    subject = get_subject_by_id(session=session, subject_id=subject_id)
    if subject is None:
        raise InvalidPayloadError("科目不存在")
    problems = session.exec(
        select(Problem)
        .where(Problem.owner.has(User.class_id == class_id))
        .where(Problem.subject_id == subject_id)
        .order_by(Problem.created_at.desc())  # pylint: disable=no-member
        .limit(5)
    ).all()
    problem_info = [
        {
            "description": problem.ocr_result.chosen_box.detected_text,
            "tags": [tag.name for tag in problem.tags],
            "author": problem.owner.name,
        }
        for problem in problems
    ]
    problem_info_str = ""
    for problem in problem_info:
        problem_info_str += f"- Student {problem['author']}: {problem['description']}\n  (Tags to this problem: {', '.join(problem['tags'])})\n"
    stream = openai_client.chat.completions.create(
        model=settings.OPENAI_MODEL,
        messages=[
            {
                "role": "system",
                "content": "You are an assitant to help teachers analyze the cause of why students fail on certain subjects."
                "You will be given a certain subject, alongside with at most 5 problems the student has failed "
                "on this subject recently. Your task is to analyze the cause of why the students has failed on this subject and provide ways to "
                "improve the students' performance. Your output should always be in the format of `**班级分析：** {your analysis for this subject for this class}"
                "\n\n**教学建议：** {your analysis on suggestions to improve teaching methods}\n\n**具体措施：** "
                "{your detailed analysis on how to fix this disadventage}`. Your output must focus on the subject "
                "the teacher is asking for. You can relate to other tags if needed. You MUST NOT use any headings/titles in your output. "
                "You may use Latex or Markdown to format your output. Your output should always be in Chinese. If no problems are "
                "provided, point out to the user and simply provide generic suggestions to improve the student's performance."
                "Your output may contain analysis on certain students, but your main focus should be improving the overall performance.",
            },
            {
                "role": "user",
                "content": [
                    {
                        "type": "text",
                        "text": f"Students in class has failed on the following problems of subject {subject.name}: \n{problem_info_str}\n"
                        "Please give your analysis and suggestions to improve the students' performance on this subject.",
                    },
                ],
            },
        ],
        stream=True,
    )
    for chunk in stream:
        if chunk.choices[0].delta.content is not None:
            yield chunk.choices[0].delta.content


def get_teacher_tag_analysis(
    *,
    session: Session,
    tag_id: uuid.UUID,
    class_id: uuid.UUID,
    openai_client: OpenAI,
):
    """Get a tag overview for student."""
    tag = get_tag(session=session, tag_id=tag_id)
    if tag is None:
        raise InvalidPayloadError("标签不存在")
    problems = session.exec(
        select(Problem)
        .where(Problem.owner.has(User.class_id == class_id))
        .where(Problem.tags.any(Tag.id == tag_id))
        .order_by(Problem.created_at.desc())  # pylint: disable=no-member
        .limit(settings.PER_PAGE)
    ).all()
    problem_info = [
        {
            "description": problem.ocr_result.chosen_box.detected_text,
            "tags": [tag.name for tag in problem.tags],
            "author": problem.owner.name,
        }
        for problem in problems
    ]
    problem_info_str = ""
    for problem in problem_info:
        problem_info_str += f"- Student {problem['author']}: {problem['description']}\n  (Tags to this problem: {', '.join(problem['tags'])})\n"
    stream = openai_client.chat.completions.create(
        model=settings.OPENAI_MODEL,
        messages=[
            {
                "role": "system",
                "content": "You are an assitant to help teachers analyze the cause of why students fail on certain knowledge points."
                "You will be given a certain tag (knowledge point), alongside with some problems the student has failed "
                "on this tag recently. Your task is to analyze the cause of why the students has failed on this tag and provide ways to "
                "improve the students' performance. Your output should always be in the format of `**知识点分析：** {your analysis for this tag for this class}"
                "\n\n**教学建议：** {your analysis on suggestions to improve teaching methods}\n\n**具体措施：** "
                "{your detailed analysis on how to fix this disadventage}`. Your output must focus on the tag "
                "the teacher is asking for. You can relate to other tags if needed. You MUST NOT use any headings/titles in your output. "
                "You may use Latex or Markdown to format your output. Your output should always be in Chinese. If no problems are "
                "provided, point out to the user and simply provide generic suggestions to improve the student's performance."
                "Your output may contain analysis on certain students, but your main focus should be improving the overall performance.",
            },
            {
                "role": "user",
                "content": [
                    {
                        "type": "text",
                        "text": f"Students in class has failed on the following problems of tag {tag.name}: \n{problem_info_str}\n"
                        "Please give your analysis and suggestions to improve the students' performance on this tag.",
                    },
                ],
            },
        ],
        stream=True,
    )
    for chunk in stream:
        if chunk.choices[0].delta.content is not None:
            yield chunk.choices[0].delta.content


def get_latest_problems(*, session: Session, class_id: uuid.UUID) -> list[Problem]:
    """Get latest problems of a class."""
    problems = session.exec(
        select(Problem)
        .where(Problem.owner.has(User.class_id == class_id))
        .order_by(col(Problem.created_at).desc())  # pylint: disable=no-member
        .limit(settings.PER_PAGE)
    ).all()
    return problems


def get_latest_subject_problems(
    *, session: Session, class_id: uuid.UUID, subject_id: uuid.UUID
) -> list[Problem]:
    """Get latest problems of a class per subject."""
    subject = get_subject_by_id(session=session, subject_id=subject_id)
    problems = session.exec(
        select(Problem)
        .where(Problem.owner.has(User.class_id == class_id))
        .where(Problem.subject.has(Subject.id == subject_id))
        .order_by(col(Problem.created_at).desc())  # pylint: disable=no-member
        .limit(settings.PER_PAGE)
    ).all()
    return subject, problems


def get_tag_problems(
    *, session: Session, class_id: uuid.UUID, tag_id: uuid.UUID, page: int
) -> list[Problem]:
    """Get problems of a tag."""
    tag = get_tag(session=session, tag_id=tag_id)
    problems = session.exec(
        select(Problem)
        .where(Problem.owner.has(User.class_id == class_id))
        .where(Problem.tags.any(Tag.id == tag_id))
        .order_by(Problem.created_at.desc())  # pylint: disable=no-member
        .offset((page - 1) * settings.PER_PAGE)
        .limit(settings.PER_PAGE)
    ).all()
    total_cnt = session.exec(
        select(func.count(col(Problem.id)))  # pylint: disable=not-callable
        .where(Problem.owner.has(User.class_id == class_id))
        .where(Problem.tags.any(Tag.id == tag_id))
    ).first()
    return tag, problems, math.ceil(total_cnt / settings.PER_PAGE)
