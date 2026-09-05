import os
import sys
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# Add root directory to sys.path so ml and backend imports work smoothly
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from backend.services.data_loader import seed_database_pipeline
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

from contextlib import asynccontextmanager

@asynccontextmanager
async def lifespan(app: FastAPI):
    print("Initializing Database and Running ML Anomaly Pipeline...")
    seed_database_pipeline(days=60, force_reseed=False)
    print("Database initialization complete.")
    yield

app = FastAPI(
    title="EnergyIQ - Campus Energy Intelligence & Fault Detector API",
    description="Enterprise API service for campus microgrid telemetry, anomaly detection, fault linking, edge cases, and predictive maintenance.",
    version="2.0.0",
    lifespan=lifespan
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
@app.get("/api/health")
def health_check():
    return {
        "status": "online",
        "service": "EnergyIQ Intelligence Engine",
        "version": "2.0.0"
    }

# Mount Routers
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

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("backend.main:app", host="0.0.0.0", port=8000, reload=True)
