# modules/mongodb.py
from motor.motor_asyncio import AsyncIOMotorClient, AsyncIOMotorCollection

MONGO_URI = "mongodb://localhost:27017"
DB_NAME = "chat_db"
COLLECTION_NAME = "messages"

client = AsyncIOMotorClient(MONGO_URI)
db = client[DB_NAME]

def get_chat_collection() -> AsyncIOMotorCollection:
    return db[COLLECTION_NAME]
