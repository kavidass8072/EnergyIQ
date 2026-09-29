from fastapi import APIRouter, HTTPException, Depends
from typing import List, Dict, Any
from ml.benchmark.adapters import SyntheticDatasetAdapter, ASHRAEDatasetAdapter
from ml.benchmark.evaluator import evaluate_benchmark_dataset
from backend.auth.security import RoleChecker, log_audit_action, get_current_user

router = APIRouter(prefix="/api/benchmark", tags=["benchmark-evaluation"])

ADAPTERS = {
    "synthetic": SyntheticDatasetAdapter(),
    "ashrae": ASHRAEDatasetAdapter()
}

@router.get("/adapters")
def list_benchmark_adapters():
    return [
        {"id": key, **adapter.get_metadata()}
        for key, adapter in ADAPTERS.items()
    ]

@router.get("/evaluate")
def run_benchmark_eval(adapter_id: str = "synthetic", current_user: dict = Depends(RoleChecker(["ADMIN", "TECHNICAL_ENGINEER"]))):
    if adapter_id not in ADAPTERS:
        raise HTTPException(status_code=400, detail=f"Invalid adapter_id '{adapter_id}'. Valid options: {list(ADAPTERS.keys())}")
        
    adapter = ADAPTERS[adapter_id]
    result = evaluate_benchmark_dataset(adapter)
    
    log_audit_action(
        current_user["id"],
        current_user["username"],
        "RUN_BENCHMARK_EVALUATION",
        f"/api/benchmark/evaluate?adapter={adapter_id}",
        {"adapter_id": adapter_id, "record_count": result["record_count"]}
    )
    
    return result
