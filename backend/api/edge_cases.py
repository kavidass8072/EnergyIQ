from fastapi import APIRouter
from ml.edge_cases import run_edge_case_tests

router = APIRouter(prefix="/api/edge-cases", tags=["edge-cases"])

@router.get("/run")
def execute_edge_cases():
    test_results = run_edge_case_tests()
    passed_count = sum(1 for t in test_results if t["status"] == "PASSED")
    
    return {
        "total_cases": len(test_results),
        "passed_cases": passed_count,
        "failed_cases": len(test_results) - passed_count,
        "all_passed": passed_count == len(test_results),
        "cases": test_results
    }
