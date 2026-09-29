import os
import sys
import time
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from backend.database.db import init_db
from backend.services.data_loader import seed_database_pipeline

from backend.api.auth import router as auth_router
from backend.api.dashboard import router as dashboard_router
from backend.api.equipment import router as equipment_router
from backend.api.alerts import router as alerts_router
from backend.api.evaluation import router as evaluation_router
from backend.api.edge_cases import router as edge_cases_router
from backend.api.admin import router as admin_router
from backend.api.demo import router as demo_router
from backend.api.maintenance import router as maintenance_router
from backend.api.analytics import router as analytics_router
from backend.api.reports import router as reports_router
from backend.api.settings import router as settings_router
from backend.api.search import router as search_router
from backend.api.streaming import router as streaming_router
from backend.api.benchmark import router as benchmark_router
from backend.api.data_quality import router as data_quality_router
from backend.api.notifications import router as notifications_router
from backend.api.system_health import router as system_health_router
from backend.api.ml_registry import router as ml_registry_router
from backend.api.system_metrics import router as system_metrics_router, record_request_metric
from backend.api.export import router as export_router

@asynccontextmanager
async def lifespan(app: FastAPI):
    print("Initializing SQLite Database Tables, RBAC & Model Registry...")
    init_db()
    print("Running Telemetry Data Pipeline Seeder...")
    seed_database_pipeline(days=60, force_reseed=False)
    print("EnergyIQ Backend Engine v3.0 initialized cleanly.")
    yield

app = FastAPI(
    title="EnergyIQ - Commercial Campus Energy Intelligence Platform API",
    description="Enterprise API service for microgrid telemetry, streaming, authentication, RBAC, anomaly detection, fault linking, model registry, drift monitoring, and predictive maintenance.",
    version="3.0.0",
    lifespan=lifespan
)

# CORS Configuration
allowed_origins_env = os.getenv("CORS_ORIGINS", "*")
origins = [o.strip() for o in allowed_origins_env.split(",") if o.strip()]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins if origins else ["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Observability & Request Timing Middleware
@app.middleware("http")
async def add_process_time_and_logging(request: Request, call_next):
    start_time = time.time()
    response = await call_next(request)
    process_time = round((time.time() - start_time) * 1000.0, 2)
    response.headers["X-Process-Time-MS"] = str(process_time)
    
    is_err = response.status_code >= 400
    record_request_metric(process_time, is_error=is_err)
    
    if not request.url.path.startswith("/api/auth/login"):
        print(f"[{request.method}] {request.url.path} -> {response.status_code} ({process_time}ms)")
    return response

@app.get("/")
@app.get("/api/health")
def health_check():
    return {
        "status": "online",
        "service": "EnergyIQ Intelligence Engine",
        "version": "3.0.0"
    }

# Mount Routers
app.include_router(auth_router)
app.include_router(dashboard_router)
app.include_router(equipment_router)
app.include_router(alerts_router)
app.include_router(evaluation_router)
app.include_router(edge_cases_router)
app.include_router(admin_router)
app.include_router(demo_router)
app.include_router(maintenance_router)
app.include_router(analytics_router)
app.include_router(reports_router)
app.include_router(settings_router)
app.include_router(search_router)
app.include_router(streaming_router)
app.include_router(benchmark_router)
app.include_router(data_quality_router)
app.include_router(notifications_router)
app.include_router(system_health_router)
app.include_router(ml_registry_router)
app.include_router(system_metrics_router)
app.include_router(export_router)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("backend.main:app", host="0.0.0.0", port=8000, reload=True)
