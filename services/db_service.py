from __future__ import annotations

import os
import datetime
from typing import Any, Dict, List, Optional
from pymongo import MongoClient
from pymongo.errors import PyMongoError, ServerSelectionTimeoutError

MONGO_URI = os.getenv("MONGODB_URI", "mongodb://localhost:27017/")
MONGO_DB_NAME = os.getenv("MONGODB_DB_NAME", "AI")

_client: Optional[MongoClient] = None
_db = None


def get_client() -> Optional[MongoClient]:
    global _client
    if _client is None:
        try:
            _client = MongoClient(MONGO_URI, serverSelectionTimeoutMS=2500, connectTimeoutMS=2500)
            # Ping to verify connection
            _client.admin.command('ping')
        except Exception as err:
            _client = None
    return _client


def get_db():
    global _db
    client = get_client()
    if client:
        try:
            _db = client[MONGO_DB_NAME]
            return _db
        except Exception:
            return None
    return None


def get_db_status() -> Dict[str, Any]:
    try:
        client = get_client()
        if not client:
            return {
                "connected": False,
                "database": MONGO_DB_NAME,
                "uri": MONGO_URI,
                "collections": [],
                "error": "Could not connect to MongoDB server"
            }
        db = client[MONGO_DB_NAME]
        collections = db.list_collection_names()
        return {
            "connected": True,
            "database": MONGO_DB_NAME,
            "uri": MONGO_URI,
            "collections": collections,
            "collections_count": len(collections),
            "error": None
        }
    except Exception as e:
        return {
            "connected": False,
            "database": MONGO_DB_NAME,
            "uri": MONGO_URI,
            "collections": [],
            "error": str(e)
        }


def save_user_profile(profile: Dict[str, Any], user_id: str = "default_student") -> bool:
    try:
        db = get_db()
        if db is None:
            return False
        doc = dict(profile)
        doc["user_id"] = user_id
        doc["updated_at"] = datetime.datetime.utcnow().isoformat()
        db["users"].update_one({"user_id": user_id}, {"$set": doc}, upsert=True)
        return True
    except Exception:
        return False


def get_user_profile(user_id: str = "default_student") -> Optional[Dict[str, Any]]:
    try:
        db = get_db()
        if db is None:
            return None
        doc = db["users"].find_one({"user_id": user_id}, {"_id": 0})
        return doc
    except Exception:
        return None


def save_study_session(session_data: Dict[str, Any], user_id: str = "default_student") -> bool:
    try:
        db = get_db()
        if db is None:
            return False
        doc = dict(session_data)
        doc["user_id"] = user_id
        doc["created_at"] = datetime.datetime.utcnow().isoformat()
        db["study_sessions"].insert_one(doc)
        return True
    except Exception:
        return False


def save_quiz_attempt(quiz_result: Dict[str, Any], user_id: str = "default_student") -> bool:
    try:
        db = get_db()
        if db is None:
            return False
        doc = dict(quiz_result)
        doc["user_id"] = user_id
        doc["timestamp"] = datetime.datetime.utcnow().isoformat()
        db["quiz_attempts"].insert_one(doc)
        
        # Also record in results collection for analytics
        db["results"].insert_one({
            "user_id": user_id,
            "type": "quiz",
            "score": quiz_result.get("score"),
            "total": quiz_result.get("total"),
            "score_pct": quiz_result.get("score_pct"),
            "topic": quiz_result.get("topic", "general"),
            "created_at": datetime.datetime.utcnow().isoformat()
        })
        return True
    except Exception:
        return False


def save_tutor_chat(chat_data: Dict[str, Any], user_id: str = "default_student") -> bool:
    try:
        db = get_db()
        if db is None:
            return False
        doc = dict(chat_data)
        doc["user_id"] = user_id
        doc["timestamp"] = datetime.datetime.utcnow().isoformat()
        db["chat_history"].insert_one(doc)
        return True
    except Exception:
        return False


def save_topic_mastery(assessment: List[Dict[str, Any]], user_id: str = "default_student") -> bool:
    try:
        db = get_db()
        if db is None:
            return False
        for item in assessment:
            topic = item.get("topic")
            if not topic:
                continue
            mastery_doc = {
                "user_id": user_id,
                "topic": topic,
                "score_pct": item.get("score_pct", 0),
                "predicted_level": item.get("predicted_level", "beginner"),
                "status": item.get("status", "in_progress"),
                "updated_at": datetime.datetime.utcnow().isoformat()
            }
            db["topic_mastery"].update_one(
                {"user_id": user_id, "topic": topic},
                {"$set": mastery_doc},
                upsert=True
            )
        return True
    except Exception:
        return False


def get_chat_history(user_id: str = "default_student", limit: int = 20) -> List[Dict[str, Any]]:
    try:
        db = get_db()
        if db is None:
            return []
        cursor = db["chat_history"].find({"user_id": user_id}, {"_id": 0}).sort("timestamp", -1).limit(limit)
        return list(cursor)[::-1]
    except Exception:
        return []

