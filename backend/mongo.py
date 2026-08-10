import os
from pymongo import MongoClient, ASCENDING
from dotenv import load_dotenv

load_dotenv()

MONGODB_URI = os.getenv("MONGODB_URI", "mongodb://localhost:27017/edutrack")

try:
    client = MongoClient(MONGODB_URI, serverSelectionTimeoutMS=3000)
    db_name = MONGODB_URI.split("/")[-1].split("?")[0] or "edutrack"
    mongo_db = client[db_name]
    # Ping target database to verify connectivity (supports local MongoDB and cloud Atlas)
    mongo_db.command('ping')
    mongo_available = True
    print(f"Connected to MongoDB: {db_name}")
except Exception as e:
    client = None
    mongo_db = None
    mongo_available = False
    print(f"MongoDB connection notice: {e}. Falling back to SQLite.")

def get_mongo_db():
    return mongo_db

def get_next_sequence_value(sequence_name: str) -> int:
    """Helper to maintain integer auto-increment IDs for backward compatibility with frontend"""
    if not mongo_available or mongo_db is None:
        return 1
    counter = mongo_db.counters.find_one_and_update(
        {"_id": sequence_name},
        {"$inc": {"sequence_value": 1}},
        upsert=True,
        return_document=True
    )
    return counter["sequence_value"]
