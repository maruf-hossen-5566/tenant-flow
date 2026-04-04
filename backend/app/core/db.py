from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker

from app.core.config import settings

# SQLite Setup
# SQLAlCHEMY_DB_URL = "sqlite:///./app.db"
# engine = create_engine(SQLALCHEMY_DB_URL, connect_args={"check_same_thread": False})

SQLALCHEMY_DB_URL = settings.DATABASE_URL
engine = create_engine(SQLALCHEMY_DB_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()
