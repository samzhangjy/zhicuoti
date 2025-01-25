import enum
import uuid

from sqlmodel import Column, Enum, Field, Relationship, SQLModel


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

    teachers: list["UserPublic"]
    students: list["UserPublic"]


class Subject(SQLModel, table=True):
    """Database model for a subject."""

    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    name: str

    tags: list["Tag"] = Relationship(back_populates="subject")
    teachers: list["User"] = Relationship(back_populates="subject")


class SubjectPublic(SQLModel):
    """Model for a public subject."""

    id: uuid.UUID
    name: str


class SubjectPublicWithRelations(SubjectPublic):
    """Model for a public subject with relations."""

    tags: list["Tag"]
    teachers: list["TeacherPublic"]


class Tag(SQLModel, table=True):
    """Database model for a tag."""

    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    name: str

    subject_id: uuid.UUID = Field(foreign_key="subject.id")
    subject: Subject = Relationship(back_populates="tags")


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


class UserPublic(UserBase):
    """Model for a public user."""

    id: uuid.UUID


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

    phone_number: str
    subject_id: uuid.UUID | None


class StudentUpdate(SQLModel):
    """Model for updating a student."""

    phone_number: str


class Token(SQLModel):
    """JSON payload containing access token."""

    access_token: str
    token_type: str = "bearer"


class TokenPayload(SQLModel):
    """Contents of JWT token."""

    sub: str | None = None
