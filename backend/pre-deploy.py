from pprint import pprint

from sqlmodel import Session

from backend.db import engine
from backend.models import Subject


def generate_subjects():
    """Generate subjects."""
    subjects = ["语文", "数学", "英语", "物理", "化学", "生物", "历史", "地理", "政治"]
    session = Session(engine)
    objs = []
    for subject in subjects:
        db_obj = Subject(name=subject)
        session.add(db_obj)
        objs.append(db_obj)
    session.commit()
    return objs


if __name__ == "__main__":
    print("Generating subjects...")
    objs = generate_subjects()
    print("Subjects generated:")
    pprint(objs)
