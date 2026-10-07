import sys
import os

# Add backend directory to sys.path so app imports work seamlessly
backend_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "backend"))
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

try:
    from app.main import app, init_db
    # Ensure tables, sample data, and routing graph are loaded
    init_db()
except Exception as e:
    import traceback
    err_trace = traceback.format_exc()
    print(f"[Vercel Handler Init Error] {err_trace}")
    from fastapi import FastAPI
    from fastapi.responses import JSONResponse
    app = FastAPI()
    @app.api_route("/{path:path}", methods=["GET", "POST", "PUT", "DELETE", "OPTIONS", "HEAD", "PATCH"])
    async def fallback_handler(path: str):
        return JSONResponse(
            status_code=500,
            content={"error": "API Initialization Error", "details": str(e), "traceback": err_trace}
        )
