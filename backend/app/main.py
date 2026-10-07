from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.database import engine, Base, SessionLocal
from app.services.seed import seed_database
from app.services.graph_service import navigation_service

# Routers
from app.routes.auth import router as auth_router
from app.routes.campus import router as campus_router
from app.routes.buildings import router as buildings_router
from app.routes.locations import router as locations_router
from app.routes.facilities import router as facilities_router
from app.routes.navigation import router as navigation_router
from app.routes.search import router as search_router
from app.routes.emergency import router as emergency_router
from app.routes.assistant import router as assistant_router
from app.routes.admin import router as admin_router

_initialized = False

def init_db():
    """Ensure database tables, seeds, and navigation graph are loaded."""
    global _initialized
    if _initialized:
        return
    try:
        Base.metadata.create_all(bind=engine)
        db = SessionLocal()
        try:
            seed_database(db)
            navigation_service.load_graph(db)
            print("[Startup] CampusNav database and routing graph successfully initialized.")
            _initialized = True
        finally:
            db.close()
    except Exception as e:
        print(f"[Init DB Error] {e}")

# Initialize eagerly for serverless environments where ASGI lifespan is not invoked
init_db()

@asynccontextmanager
async def lifespan(app: FastAPI):
    init_db()
    yield
    # Shutdown
    print("[Shutdown] CampusNav API shutting down.")

app = FastAPI(
    title=settings.PROJECT_NAME,
    description="Smart GIS-Based College Campus Navigation System API",
    version="1.0.0",
    docs_url=f"{settings.API_V1_STR}/docs",
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
    lifespan=lifespan
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API routers under /api
api_prefix = settings.API_V1_STR

app.include_router(auth_router, prefix=api_prefix)
app.include_router(campus_router, prefix=api_prefix)
app.include_router(buildings_router, prefix=api_prefix)
app.include_router(locations_router, prefix=api_prefix)
app.include_router(facilities_router, prefix=api_prefix)
app.include_router(navigation_router, prefix=api_prefix)
app.include_router(search_router, prefix=api_prefix)
app.include_router(emergency_router, prefix=api_prefix)
app.include_router(assistant_router, prefix=api_prefix)
app.include_router(admin_router, prefix=api_prefix)

@app.get("/")
@app.get(f"{api_prefix}")
@app.get(f"{api_prefix}/")
def root():
    return {
        "name": "CampusNav API",
        "version": "1.0.0",
        "docs": f"{api_prefix}/docs",
        "status": "online"
    }

@app.get(f"{api_prefix}/health")
def health_check():
    return {"status": "ok", "service": "CampusNav API"}
