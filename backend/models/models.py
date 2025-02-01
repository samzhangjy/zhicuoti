import enum
import uuid
from datetime import datetime, date

from sqlmodel import Column, Enum, Field, Relationship, SQLModel
from typing_extensions import Optional


class ClassTeacherLink(SQLModel, table=True):
    """Database model for a class teacher link."""

    class_id: uuid.UUID = Field(foreign_key="class.id", primary_key=True)
    teacher_id: uuid.UUID = Field(foreign_key="user.id", primary_key=True)


class ClassBase(SQLModel):
    """Model for a public class."""

    id: uuid.UUID
    name: str
    description: str | None


class Class(ClassBase, table=True):
    """Database model for a class."""

    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    description: str | None = Field(default=None)
    teachers: list["User"] = Relationship(
        back_populates="owned_classes", link_model=ClassTeacherLink
    )

    students: list["User"] = Relationship(back_populates="class_")

    invitation_code: str | None = Field(default=None)


class ClassCreate(SQLModel):
    """Model for creating a class."""

    name: str
    description: str | None


class ClassPublic(ClassBase):
    """Model for a public class."""


class ClassPublicWithRelations(ClassPublic):
    """Model for a public class with relations."""

    teachers: list["UserPublicInfo"]
    students: list["UserPublicInfo"]


class Subject(SQLModel, table=True):
    """Database model for a subject."""

    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    name: str

    tags: list["Tag"] = Relationship(back_populates="subject")
    teachers: list["User"] = Relationship(back_populates="subject")
    problems: list["Problem"] = Relationship(back_populates="subject")


class SubjectPublic(SQLModel):
    """Model for a public subject."""

    id: uuid.UUID
    name: str


class SubjectPublicWithRelations(SubjectPublic):
    """Model for a public subject with relations."""

    tags: list["Tag"]
    teachers: list["TeacherPublic"]


class TagProblemLink(SQLModel, table=True):
    """Database model for a tag problem link."""

    tag_id: uuid.UUID = Field(foreign_key="tag.id", primary_key=True)
    problem_id: uuid.UUID = Field(foreign_key="problem.id", primary_key=True)


class Tag(SQLModel, table=True):
    """Database model for a tag."""

    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    name: str

    subject_id: uuid.UUID = Field(foreign_key="subject.id")
    subject: Subject = Relationship(back_populates="tags")

    problems: list["Problem"] = Relationship(
        back_populates="tags", link_model=TagProblemLink
    )


class TagPublic(SQLModel):
    """Model for a public tag."""

    id: uuid.UUID
    name: str

    subject: SubjectPublic


class TagPublicWithRelations(TagPublic):
    """Model for a public tag with relations."""

    problems: list["ProblemPublic"]


class UserRole(str, enum.Enum):
    """Enum for user roles."""

    STUDENT = "student"
    TEACHER = "teacher"


class UserBase(SQLModel):
    """Base model for a user."""

    name: str
    role: UserRole


class User(UserBase, table=True):
    """Database model for a user."""

    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    hashed_password: str
    phone_number: str
    role: UserRole = Field(sa_column=Column(Enum(UserRole)))

    # for students
    # since one student can only belong to one class, one-to-many is enough
    class_id: uuid.UUID | None = Field(default=None, foreign_key="class.id")
    class_: Class | None = Relationship(back_populates="students")

    # for teachers
    # since one teacher can teach multiple classes, many-to-many is needed
    owned_classes: list[Class] = Relationship(
        back_populates="teachers", link_model=ClassTeacherLink
    )

    # for teachers, for which subject they teach
    subject_id: uuid.UUID | None = Field(default=None, foreign_key="subject.id")
    subject: Subject | None = Relationship(back_populates="teachers")

    problems: list["Problem"] = Relationship(back_populates="owner")


class UserPublic(UserBase):
    """Model for a public user."""

    id: uuid.UUID


class UserPublicInfo(UserPublic):
    """Model for a public user info."""

    phone_number: str
    subject: Subject | None


class UserMe(UserPublic):
    """Model for a user."""

    phone_number: str
    owned_classes: list[ClassPublic]
    class_: ClassPublic | None
    subject: Subject | None


class StudentPublic(UserPublic):
    """Model for a public student."""

    class_id: uuid.UUID


class TeacherPublic(UserPublic):
    """Model for a public teacher."""

    subject_id: uuid.UUID


class StudentPublicWithRelations(StudentPublic):
    """Model for a public student with relations."""

    class_: ClassPublic


class TeacherPublicWithRelations(TeacherPublic):
    """Model for a public teacher with relations."""

    subject: Subject
    owned_classes: list[ClassPublic]


class UserCreate(UserBase):
    """Model for creating a user."""

    password: str
    phone_number: str = Field(max_length=11, min_length=11)


class TeacherUpdate(SQLModel):
    """Model for updating a teacher."""

    phone_number: str = Field(max_length=11, min_length=11)
    subject_id: uuid.UUID | None


class StudentUpdate(SQLModel):
    """Model for updating a student."""

    phone_number: str = Field(max_length=11, min_length=11)


class Token(SQLModel):
    """JSON payload containing access token."""

    access_token: str
    token_type: str = "bearer"


class TokenPayload(SQLModel):
    """Contents of JWT token."""

    sub: str | None = None


class ProblemDescriptionType(str, enum.Enum):
    """Enum for problem content types."""

    TEXT = "text"
    IMAGE = "image"


class Problem(SQLModel, table=True):
    """Database model for a problem."""

    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    created_at: datetime = Field(default=datetime.now())
    content: str  # image url
    original_answer: str | None  # image url or text, same below
    original_answer_type: ProblemDescriptionType | None = Field(
        sa_column=Column(Enum(ProblemDescriptionType)), default=None
    )
    correct_answer: str | None
    correct_answer_type: ProblemDescriptionType | None = Field(
        sa_column=Column(Enum(ProblemDescriptionType)), default=None
    )
    subject_id: uuid.UUID = Field(foreign_key="subject.id")
    subject: Subject = Relationship(back_populates="problems")

    tags: list[Tag] = Relationship(back_populates="problems", link_model=TagProblemLink)

    ocr_result: "OCRResult" = Relationship(
        back_populates="problem",
        sa_relationship_kwargs={
            "uselist": False,
            "foreign_keys": "OCRResult.problem_id",
        },
    )
    owner_id: uuid.UUID = Field(foreign_key="user.id")
    owner: User = Relationship(back_populates="problems")


class OCRBox(SQLModel, table=True):
    """Database model for an OCR box."""

    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    x1: int
    y1: int
    x2: int
    y2: int
    detected_text: str
    ocr_result_id: uuid.UUID | None = Field(foreign_key="ocrresult.id")
    ocr_result: Optional["OCRResult"] = Relationship(
        back_populates="boxes",
        sa_relationship_kwargs={"foreign_keys": "OCRBox.ocr_result_id"},
    )

    be_chosen_by: Optional["OCRResult"] = Relationship(
        back_populates="chosen_box",
        sa_relationship_kwargs={
            "uselist": False,
            "foreign_keys": "OCRResult.chosen_box_id",
        },
    )


class OCRBoxPublic(SQLModel):
    """Model for a public OCR box."""

    id: uuid.UUID
    x1: int
    y1: int
    x2: int
    y2: int
    detected_text: str


class OCRResult(SQLModel, table=True):
    """Model for OCR result."""

    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    content: str | None
    problem_id: uuid.UUID | None = Field(foreign_key="problem.id", default=None)
    problem: Problem | None = Relationship(
        back_populates="ocr_result",
        sa_relationship_kwargs={
            "foreign_keys": "OCRResult.problem_id",
            "uselist": False,
        },
    )
    boxes: list[OCRBox] = Relationship(
        back_populates="ocr_result",
        sa_relationship_kwargs={
            "foreign_keys": "OCRBox.ocr_result_id",
        },
    )

    chosen_box_id: uuid.UUID | None = Field(
        foreign_key="ocrbox.id",
        default=None,
    )
    chosen_box: OCRBox | None = Relationship(
        sa_relationship_kwargs={
            "foreign_keys": "OCRResult.chosen_box_id",
        },
        back_populates="be_chosen_by",
    )


class OCRResultPublic(SQLModel):
    """Model for a public OCR result."""

    id: uuid.UUID
    content: str | None
    problem_id: uuid.UUID | None
    boxes: list[OCRBoxPublic]
    chosen_box: OCRBoxPublic | None


class ProblemCreate(SQLModel):
    """Model for creating a problem."""

    original_answer: str | None
    original_answer_type: ProblemDescriptionType | None
    correct_answer: str | None
    correct_answer_type: ProblemDescriptionType | None
    ocr_result_id: uuid.UUID
    ocr_box_id: uuid.UUID


class ProblemEdit(SQLModel):
    """Model for editing a problem."""

    original_answer: str | None
    original_answer_type: ProblemDescriptionType | None
    correct_answer: str | None
    correct_answer_type: ProblemDescriptionType | None

    tags: list[str]


class ProblemPublicBase(SQLModel):
    """Model for a public problem."""

    id: uuid.UUID
    created_at: datetime
    content: str
    original_answer: str | None
    original_answer_type: ProblemDescriptionType | None
    correct_answer: str | None
    correct_answer_type: ProblemDescriptionType | None
    subject: SubjectPublic


class ProblemPublic(ProblemPublicBase):
    """Model for a public problem."""

    tags: list[TagPublic]
    owner: UserPublic

    ocr_result: OCRResultPublic


# Page-specific models


class GetProblemsResponse(SQLModel):
    """Model for get my problems response."""

    problems: list[ProblemPublic]
    total_pages: int


class GetAnalyzeTagProblemsResponse(SQLModel):
    """Model for get analyze tag problems response."""

    tag: TagPublic
    problems: list[ProblemPublic]
    total_pages: int


class GetAnalyzeLatestSubjectProblemsResponse(SQLModel):
    """Model for get analyze latest subject problems response."""

    subject: SubjectPublic
    problems: list[ProblemPublic]


class GetAnalyzeOverviewResponse(SQLModel):
    """Model for get analyze overview response."""

    problems_cnt: int
    subjects_cnt: dict[str, int]
    date_cnt: dict[date, int]


class AnalyzePerSubjectTagCntEntity(SQLModel):
    """Model for analyze per subject tag count entity."""

    cnt: int
    tag_id: uuid.UUID
    date: dict[date, int]


class GetAnalyzePerSubjectResponse(SQLModel):
    """Model for get analyze per subject response."""

    subject: SubjectPublic
    problems_cnt: int
    date_cnt: dict[date, int]
    tags_cnt: dict[str, AnalyzePerSubjectTagCntEntity]
