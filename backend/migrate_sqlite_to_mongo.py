import sqlite3
import os
from pymongo import MongoClient
from dotenv import load_dotenv

load_dotenv()

MONGODB_URI = os.getenv("MONGODB_URI", "mongodb://localhost:27017/edutrack")

def migrate():
    sqlite_path = "./edutrack.db"
    if not os.path.exists(sqlite_path):
        print(f"SQLite database {sqlite_path} not found.")
        return

    print(f"Connecting to SQLite ({sqlite_path})...")
    sqlite_conn = sqlite3.connect(sqlite_path)
    sqlite_conn.row_factory = sqlite3.Row
    cursor = sqlite_conn.cursor()

    print(f"Connecting to MongoDB ({MONGODB_URI})...")
    client = MongoClient(MONGODB_URI, serverSelectionTimeoutMS=5000)
    db_name = MONGODB_URI.split("/")[-1].split("?")[0] or "edutrack"
    mongo_db = client[db_name]

    # 1. Migrate Students
    students = [dict(row) for row in cursor.execute("SELECT * FROM students").fetchall()]
    if students:
        mongo_db.students.delete_many({})
        mongo_db.students.insert_many(students)
        max_id = max(s["id"] for s in students)
        mongo_db.counters.update_one({"_id": "student_id"}, {"$set": {"sequence_value": max_id}}, upsert=True)
        print(f"Migrated {len(students)} students to MongoDB.")

    # 2. Migrate Marks
    marks = [dict(row) for row in cursor.execute("SELECT * FROM marks").fetchall()]
    if marks:
        mongo_db.marks.delete_many({})
        mongo_db.marks.insert_many(marks)
        max_id = max(m["id"] for m in marks)
        mongo_db.counters.update_one({"_id": "marks_id"}, {"$set": {"sequence_value": max_id}}, upsert=True)
        print(f"Migrated {len(marks)} marks records to MongoDB.")

    # 3. Migrate Attendance
    attendance = [dict(row) for row in cursor.execute("SELECT * FROM attendance").fetchall()]
    if attendance:
        mongo_db.attendance.delete_many({})
        mongo_db.attendance.insert_many(attendance)
        max_id = max(a["id"] for a in attendance)
        mongo_db.counters.update_one({"_id": "attendance_id"}, {"$set": {"sequence_value": max_id}}, upsert=True)
        print(f"Migrated {len(attendance)} attendance records to MongoDB.")

    # 4. Migrate Users
    users = [dict(row) for row in cursor.execute("SELECT * FROM users").fetchall()]
    if users:
        mongo_db.users.delete_many({})
        mongo_db.users.insert_many(users)
        max_id = max(u["id"] for u in users) if users else 0
        mongo_db.counters.update_one({"_id": "user_id"}, {"$set": {"sequence_value": max_id}}, upsert=True)
        print(f"Migrated {len(users)} user accounts to MongoDB.")

    print("Migration from SQLite to MongoDB completed successfully!")

if __name__ == "__main__":
    try:
        migrate()
    except Exception as e:
        print(f"Migration error: {e}")
