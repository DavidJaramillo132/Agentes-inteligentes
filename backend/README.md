# 🤖 Backend - Agentes Inteligentes

API backend construida con **FastAPI** que integra agentes de inteligencia artificial usando el framework **Agno**, autenticación de usuarios con **JWT**, y almacenamiento en **MongoDB**.

---

## 📋 Tabla de Contenidos

- [Tecnologías Utilizadas](#-tecnologías-utilizadas)
- [Arquitectura del Proyecto](#-arquitectura-del-proyecto)
- [Estructura de Carpetas](#-estructura-de-carpetas)
- [Configuración de Variables de Entorno](#-configuración-de-variables-de-entorno)
- [Instalación y Ejecución](#-instalación-y-ejecución)
- [Endpoints de la API](#-endpoints-de-la-api)
- [Agentes de IA](#-agentes-de-ia)
- [Módulos del Sistema](#-módulos-del-sistema)
- [Base de Datos](#-base-de-datos)

---

## 🛠 Tecnologías Utilizadas

| Tecnología | Versión | Descripción |
|------------|---------|-------------|
| **Python** | 3.10+ | Lenguaje de programación principal |
| **FastAPI** | 0.115.12 | Framework web moderno y de alto rendimiento |
| **Agno** | 1.5.8 | Framework para construir agentes de IA |
| **Groq** | 0.26.0 | Proveedor de modelos LLM (Llama 3.1) |
| **MongoDB** | - | Base de datos NoSQL |
| **Motor** | 3.7.1 | Driver asíncrono para MongoDB |
| **PyJWT** | 2.10.1 | Manejo de tokens JWT |
| **Pydantic** | 2.11.5 | Validación de datos y schemas |
| **Uvicorn** | 0.34.3 | Servidor ASGI para FastAPI |
| **Passlib** | 1.7.4 | Hashing de contraseñas (bcrypt) |

---

## 🏗 Arquitectura del Proyecto

```
┌─────────────────────────────────────────────────────────────────────┐
│                           CLIENTE                                    │
│                    (Frontend / Agno Playground)                      │
└─────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────┐
│                         FastAPI Application                          │
│                          (main.py - Puerto 8000)                     │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│   ┌───────────────┐   ┌───────────────┐   ┌───────────────────────┐ │
│   │  /auth        │   │  /users       │   │  /agents              │ │
│   │  (Autenticación)  │  (Usuarios)   │   │  (Agno Playground)    │ │
│   └───────────────┘   └───────────────┘   └───────────────────────┘ │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
                                    │
                    ┌───────────────┴───────────────┐
                    ▼                               ▼
        ┌───────────────────┐           ┌───────────────────────────┐
        │     MongoDB       │           │     Groq API              │
        │  (Almacenamiento) │           │  (Modelos LLM)            │
        └───────────────────┘           └───────────────────────────┘
```

---

## 📁 Estructura de Carpetas

```
backend/
├── main.py                    # Punto de entrada de la aplicación
├── requirements.txt           # Dependencias del proyecto
├── .gitignore                 # Archivos ignorados por Git
│
├── agno_agents/               # 🤖 Módulo de Agentes de IA
│   ├── agent_app.py           # Configuración del Playground de Agno
│   └── agents/
│       ├── __init__.py        # Exportación de todos los agentes
│       ├── web_agent.py       # Agente de búsqueda web (DuckDuckGo)
│       ├── finance_agent.py   # Agente de finanzas (YFinance)
│       ├── hackernews_agent.py# Agente de HackerNews
│       ├── wikipedia_agent.py # Agente de Wikipedia
│       └── python_agent.py    # Agente de ejecución Python
│
├── core/                      # ⚙️ Configuración central
│   ├── config.py              # Clase Settings principal
│   ├── db.py                  # Configuración base de datos
│   ├── envs/                  # Variables de entorno
│   │   ├── .agents.env        # Configuración de agentes (API keys)
│   │   ├── .app.dev.env       # Config de app (desarrollo)
│   │   ├── .app.prod.env      # Config de app (producción)
│   │   ├── .db.dev.env        # Config de BD (desarrollo)
│   │   ├── .db.prod.env       # Config de BD (producción)
│   │   └── .jwt.env           # Config de JWT
│   └── settings/
│       ├── __init__.py        # Exportación de settings
│       ├── app_settings.py    # Configuración de la aplicación
│       ├── database_settings.py # Configuración de MongoDB
│       ├── jwt_settings.py    # Configuración de JWT
│       └── agents_settings.py # Configuración de agentes IA
│
├── db/                        # 🗄️ Capa de base de datos
│   ├── __init__.py
│   ├── database.py            # Conexión a MongoDB
│   └── utils/
│       ├── __init__.py
│       ├── base_model.py      # PyObjectId para Pydantic
│       └── convert_id.py      # Utilidad de conversión de IDs
│
├── modules/                   # 📦 Módulos de negocio
│   ├── mongodb.py             # Cliente MongoDB para chat
│   │
│   ├── auth/                  # 🔐 Módulo de autenticación
│   │   ├── __init__.py
│   │   ├── auth_routes.py     # Rutas de autenticación
│   │   ├── model/
│   │   │   └── user_model.py  # Modelo de usuario
│   │   ├── schemas/
│   │   │   ├── __init__.py
│   │   │   ├── token_schema.py      # Schema de Token
│   │   │   └── login_response_schema.py # Schema de respuesta login
│   │   └── services/
│   │       ├── __init__.py
│   │       ├── auth_service.py  # Lógica de autenticación
│   │       └── token_service.py # Creación/validación de JWT
│   │
│   └── user/                  # 👤 Módulo de usuarios
│       ├── __init__.py
│       ├── user_routes.py     # Rutas de usuarios
│       ├── model/
│       │   └── user_model.py  # Modelo de usuario
│       ├── schemas/
│       │   ├── __init__.py
│       │   ├── user_schemas.py  # Schemas de usuario
│       │   └── user_in_db.py    # Schema de usuario en BD
│       └── services/
│           ├── __init__.py
│           └── user_service.py  # Lógica de negocio de usuarios
│
├── tmp/                       # Archivos temporales
└── venv/                      # Entorno virtual de Python
```

---

## 🔧 Configuración de Variables de Entorno

El proyecto utiliza múltiples archivos `.env` ubicados en `core/envs/`:

### 📝 `.agents.env` - Configuración de Agentes IA

```env
# API Key de Groq (obligatorio)
GROQ_API_KEY=gsk_xxxxxxxxxxxxxxxxxxxxxxxx

# Modelo de IA a utilizar (opcional, default: llama-3.1-70b-versatile)
MODEL_ID=llama-3.1-70b-versatile
```

### 📝 `.app.dev.env` / `.app.prod.env` - Configuración de Aplicación

```env
# Nombre de la aplicación
APP_NAME=Proyecto Agentes

# Entorno (dev/prod)
ENVIRONMENT=dev

# Modo debug
DEBUG=true

# Orígenes permitidos para CORS (separados por comas)
ALLOWED_ORIGINS=["http://localhost:3000","http://localhost:5173"]
```

### 📝 `.db.dev.env` / `.db.prod.env` - Configuración de MongoDB

```env
# URI de conexión a MongoDB
MONGODB_URI=mongodb://localhost:27017

# Nombre de la base de datos
MONGO_DB_NAME=agentes_db
```

### 📝 `.jwt.env` - Configuración de JWT

```env
# Clave secreta para firmar tokens JWT
JWT_SECRET_KEY=tu_clave_secreta_muy_segura

# Algoritmo de encriptación
JWT_ALGORITHM=HS256

# Tiempo de expiración en minutos
JWT_EXPIRATION_MINUTES=60
```

---

## 🚀 Instalación y Ejecución

### Prerrequisitos

- Python 3.10 o superior
- MongoDB instalado y corriendo
- Cuenta en [Groq](https://console.groq.com/) para obtener API Key

### 1️⃣ Clonar y configurar entorno virtual

```bash
cd backend
python -m venv venv

# Windows
.\venv\Scripts\activate

# Linux/Mac
source venv/bin/activate
```

### 2️⃣ Instalar dependencias

```bash
pip install -r requirements.txt
```

### 3️⃣ Configurar variables de entorno

1. Copia los archivos de ejemplo en `core/envs/`
2. Configura tu `GROQ_API_KEY` en `.agents.env`
3. Configura tu `MONGODB_URI` en `.db.dev.env`
4. Genera una clave segura para `JWT_SECRET_KEY` en `.jwt.env`

### 4️⃣ Iniciar MongoDB

```bash
# Si usas Docker
docker run -d -p 27017:27017 --name mongodb mongo:latest

# O inicia tu servicio local de MongoDB
```

### 5️⃣ Ejecutar la aplicación

```bash
# Desarrollo con hot-reload
python main.py

# O usando uvicorn directamente
uvicorn main:app --host 127.0.0.1 --port 8000 --reload
```

La API estará disponible en: **http://127.0.0.1:8000**

---

## 📡 Endpoints de la API

### 🔐 Autenticación (`/auth`)

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| `POST` | `/auth/register` | Registrar nuevo usuario |
| `POST` | `/auth/login` | Iniciar sesión |
| `GET` | `/auth/me?token={token}` | Obtener usuario actual |

#### Ejemplo: Registro de Usuario

```bash
curl -X POST http://localhost:8000/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email": "usuario@ejemplo.com", "password": "contraseña123"}'
```

#### Ejemplo: Login

```bash
curl -X POST http://localhost:8000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "usuario@ejemplo.com", "password": "contraseña123"}'
```

**Respuesta:**
```json
{
  "access_token": {
    "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6...",
    "token_type": "bearer"
  },
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "email": "usuario@ejemplo.com"
  }
}
```

---

### 👤 Usuarios (`/users`)

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| `GET` | `/users/` | Obtener todos los usuarios |
| `GET` | `/users/{user_id}` | Obtener usuario por ID |

---

### 🤖 Agentes IA (`/agents`)

El endpoint `/agents` monta el **Agno Playground**, que proporciona una interfaz para interactuar con los agentes de IA.

| URL | Descripción |
|-----|-------------|
| `http://localhost:8000/agents` | Interfaz del Playground de Agno |

Para acceder al playground visual, puedes usar el paquete de Agno:

```bash
pip install agno[playground]
agno playground --api-url http://localhost:8000/agents
```

---

## 🤖 Agentes de IA

El proyecto incluye **5 agentes de IA** especializados, todos potenciados por modelos de **Groq (Llama 3.1)**:

### 1. 🌐 Web Agent
Realiza búsquedas en internet usando DuckDuckGo.

```python
# Configuración
tools: DuckDuckGoTools()
instructions: ["Always include sources"]
```

**Ejemplo de uso:** "¿Cuáles son las últimas noticias sobre inteligencia artificial?"

---

### 2. 💰 Finance Agent
Consulta información financiera de acciones y mercados.

```python
# Configuración
tools: YFinanceTools(
    stock_price=True,
    analyst_recommendations=True,
    company_info=True,
    company_news=True
)
instructions: ["Always use tables to display data"]
```

**Ejemplo de uso:** "¿Cuál es el precio actual de Tesla (TSLA)?"

---

### 3. 📰 HackerNews Agent
Obtiene contenido de HackerNews (noticias de tecnología).

```python
# Configuración
tools: HackerNewsTools()
instructions: ["Always include sources"]
```

**Ejemplo de uso:** "¿Cuáles son las historias más populares en HackerNews hoy?"

---

### 4. 📚 Wikipedia Agent
Busca y resume información de Wikipedia.

```python
# Configuración
tools: WikipediaTools()
instructions: ["Always include sources"]
```

**Ejemplo de uso:** "¿Qué es la computación cuántica?"

---

### 5. 🐍 Python Agent
Ejecuta código Python para cálculos y análisis.

```python
# Configuración
tools: PythonTools()
instructions: ["Always include sources"]
```

**Ejemplo de uso:** "Calcula el factorial de 10"

---

### Características Comunes de los Agentes

Todos los agentes comparten estas configuraciones:

| Característica | Valor |
|---------------|-------|
| **Modelo** | `llama-3.1-70b-versatile` (Groq) |
| **Almacenamiento** | MongoDB (historial de conversaciones) |
| **Historial** | Últimas 5 respuestas |
| **Formato** | Markdown |
| **Fecha/Hora** | Incluida en instrucciones |

---

## 📦 Módulos del Sistema

### 🔐 Módulo de Autenticación (`modules/auth`)

Maneja el registro, login y validación de usuarios.

**Componentes principales:**

- **`AuthService`**: Lógica de autenticación
  - `register_user()`: Registra usuarios con contraseña hasheada (bcrypt)
  - `login_user()`: Autentica y genera token JWT
  - `get_current_user()`: Valida token y retorna usuario

- **`TokenService`**: Manejo de tokens JWT
  - `create_access_token()`: Genera token con expiración
  - `decode_token()`: Decodifica y valida token

**Flujo de autenticación:**

```
1. Usuario envía email + password
2. AuthService hashea password con bcrypt
3. Se guarda en MongoDB
4. Al login, se valida password
5. Se genera JWT con datos del usuario
6. Cliente usa JWT en peticiones subsecuentes
```

---

### 👤 Módulo de Usuarios (`modules/user`)

Gestiona operaciones CRUD de usuarios.

**Componentes principales:**

- **`UserService`**: Lógica de negocio
  - `get_user_by_id()`: Busca usuario por ObjectId
  - `get_all_users()`: Lista todos los usuarios

---

## 🗄️ Base de Datos

### MongoDB

El proyecto utiliza **MongoDB** como base de datos NoSQL con el driver asíncrono **Motor**.

**Conexión:**

```python
from motor.motor_asyncio import AsyncIOMotorClient
from core.config import settings

client = AsyncIOMotorClient(settings.database.mongodb_uri)
db = client[settings.database.mongo_db_name]
```

### Colecciones

| Colección | Descripción |
|-----------|-------------|
| `users` | Información de usuarios |
| `web_agent` | Historial del Web Agent |
| `finance_agent` | Historial del Finance Agent |
| `hackernews_team_agent` | Historial del HackerNews Agent |
| `wikipedia_agent` | Historial del Wikipedia Agent |
| `python_agent` | Historial del Python Agent |

### Modelo de Usuario

```json
{
  "_id": ObjectId("..."),
  "email": "usuario@ejemplo.com",
  "hashed_password": "$2b$12$..."
}
```

---

## 🔒 Seguridad

| Aspecto | Implementación |
|---------|---------------|
| **Contraseñas** | Hashing con bcrypt (Passlib) |
| **Autenticación** | JWT (JSON Web Tokens) |
| **CORS** | Configurado via middleware |
| **Validación** | Pydantic schemas |

---

## 📝 Notas Importantes

1. **Modelo de IA**: El proyecto usa `llama-3.1-70b-versatile` para mejor compatibilidad con function calling.

2. **Variables de entorno**: Asegúrate de configurar TODAS las variables antes de ejecutar.

3. **MongoDB**: Debe estar corriendo antes de iniciar la aplicación.

4. **Groq API**: Necesitas una cuenta gratuita en [Groq](https://console.groq.com/) para obtener tu API key.

---

## 🐛 Solución de Problemas

### Error: `ModelProviderError: Failed to call a function`

**Causa**: Problema de compatibilidad del modelo con function calling.

**Solución**: Asegúrate de usar `llama-3.1-70b-versatile` en lugar de `llama-3.3-70b-versatile`.

---

### Error: `Connection refused` a MongoDB

**Causa**: MongoDB no está corriendo.

**Solución**:
```bash
# Verificar servicio
mongod --version

# Iniciar con Docker
docker run -d -p 27017:27017 mongo:latest
```

---

### Error: `Invalid API Key`

**Causa**: API key de Groq no configurada o inválida.

**Solución**: Verifica tu `.agents.env` tenga una API key válida de [Groq Console](https://console.groq.com/).

---

## 📄 Licencia

Este proyecto está bajo la Licencia MIT.

---

## 👨‍💻 Autor

Desarrollado para el proyecto de **Agentes Inteligentes**.
