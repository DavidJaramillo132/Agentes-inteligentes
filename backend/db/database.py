from motor.motor_asyncio import AsyncIOMotorClient
import certifi

from core.config import settings

# Usar certificados SSL de certifi para evitar errores TLS
client = AsyncIOMotorClient(
    settings.database.mongodb_uri,
    serverSelectionTimeoutMS=5000,
    tlsCAFile=certifi.where()
)
db = client[settings.database.mongo_db_name]
