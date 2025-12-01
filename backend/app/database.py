from sqlmodel import SQLModel, Session, create_engine
from typing import Generator

DATABASE_URL = "sqlite:///./atm.db"

engine = create_engine(DATABASE_URL, echo=False, connect_args={"check_same_thread": False})


def create_db_and_tables():
    """Create all database tables."""
    SQLModel.metadata.create_all(engine)


def get_session() -> Generator[Session, None, None]:
    """Dependency for getting database sessions."""
    with Session(engine) as session:
        yield session
