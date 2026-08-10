from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

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

import sqlite3

def run_db_migrations():
    try:
        conn = sqlite3.connect("./edutrack.db")
        cursor = conn.cursor()
        existing_cols = [c[1] for c in cursor.execute("PRAGMA table_info(students)").fetchall()]
        for col in ["intervention_status", "last_alert_sent"]:
            if col not in existing_cols:
                cursor.execute(f"ALTER TABLE students ADD COLUMN {col} TEXT")
        conn.commit()
        conn.close()
    except Exception as e:
        print(f"Migration notice: {e}")

run_db_migrations()