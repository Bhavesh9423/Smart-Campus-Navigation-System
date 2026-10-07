from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker
from app.config import settings

db_url = settings.DATABASE_URL
if db_url.startswith("postgres://"):
    db_url = db_url.replace("postgres://", "postgresql://", 1)

connect_args = {}
if db_url.startswith("sqlite"):
    connect_args["check_same_thread"] = False

engine = create_engine(
    db_url,
    connect_args=connect_args,
    pool_pre_ping=True,
    echo=False
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

_tables_created = False

def ensure_tables():
    global _tables_created
    if not _tables_created:
        try:
            Base.metadata.create_all(bind=engine)
            _tables_created = True
        except Exception:
            pass

def get_db():
    ensure_tables()
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
