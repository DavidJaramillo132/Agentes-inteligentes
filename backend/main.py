import logging
import os
import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from core.config import settings

from agno_agents.agent_app import agent_app

from modules.user import users_router
from modules.auth import auth_router
# from modules.chat.router import router as chat_router

logger = logging.getLogger(__name__)

app = FastAPI()


@app.exception_handler(Exception)
async def global_exception_handler(request, exc: Exception):
    """Loguea cualquier excepcion no capturada y devuelve 500 con JSON para que CORS se aplique."""
    logger.exception("Error no capturado: %s", exc)
    return JSONResponse(
        status_code=500,
        content={"detail": "Internal server error"},
    )

# CORS: usa settings para poder override con ALLOWED_ORIGINS en Render
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.app.allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Ahora montamos las rutas
app.mount("/agents", agent_app)
app.include_router(users_router, prefix="/users", tags=["user"])
app.include_router(auth_router, prefix="/auth", tags=["auth"])
# app.include_router(chat_router, prefix="/chat", tags=["chat"])


if __name__ == "__main__":
    # Render asigna el puerto dinámicamente via PORT env var
    port = int(os.environ.get("PORT", 8000))
    
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=port,
        reload=False  # Sin reload en producción
    )
