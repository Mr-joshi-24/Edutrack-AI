from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import sqlite3

DATABASE_URL = "sqlite:///./edutrack.db"

engine = create_engine(
    DATABASE_URL,
    connect_args={"check_same_thread": False}
)

SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine
)

Base = declarative_base()

def run_db_migrations():
    try:
        conn = sqlite3.connect("./edutrack.db")
        cursor = conn.cursor()
        existing_cols = [c[1] for c in cursor.execute("PRAGMA table_info(students)").fetchall()]
        cols_to_add = [
            ("roll_no", "TEXT"),
            ("branch", "TEXT"),
            ("intervention_status", "TEXT"),
            ("last_alert_sent", "TEXT")
        ]
        for col, col_type in cols_to_add:
            if col not in existing_cols:
                cursor.execute(f"ALTER TABLE students ADD COLUMN {col} {col_type}")
        conn.commit()
        conn.close()
    except Exception as e:
        print(f"Migration notice: {e}")

run_db_migrations()