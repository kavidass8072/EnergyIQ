from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Depends, HTTPException, status
from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any

from backend.streaming.simulator import streaming_manager
from backend.streaming.scenarios import STREAMING_SCENARIOS
from backend.auth.security import get_current_user, RoleChecker, log_audit_action

router = APIRouter(prefix="/api/streaming", tags=["streaming"])

class StreamStartRequest(BaseModel):
    interval: float = Field(2.0, ge=0.5, le=10.0, json_schema_extra={"example": 2.0})

class InjectFaultRequest(BaseModel):
    asset_id: str = Field(..., json_schema_extra={"example": "Motor-01"})
    fault_type: str = Field(..., json_schema_extra={"example": "MECHANICAL_RESISTANCE"})

class SetScenarioRequest(BaseModel):
    scenario: str = Field(..., json_schema_extra={"example": "DELAYED_PACKET"})

@router.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await streaming_manager.connect(websocket)
    try:
        await websocket.send_json({
            "type": "CONNECTION_ESTABLISHED",
            "status": streaming_manager.get_status()
        })
        while True:
            data = await websocket.receive_text()
    except WebSocketDisconnect:
        streaming_manager.disconnect(websocket)
    except Exception:
        streaming_manager.disconnect(websocket)

@router.post("/start")
def start_streaming(request: StreamStartRequest = StreamStartRequest(), current_user: dict = Depends(RoleChecker(["ADMIN", "FACILITY_OPERATOR"]))):
    streaming_manager.start(interval=request.interval)
    log_audit_action(current_user["id"], current_user["username"], "START_STREAMING", "/api/streaming/start", {"interval": request.interval})
    return {"message": "Streaming telemetry simulator started", "status": streaming_manager.get_status()}

@router.post("/stop")
def stop_streaming(current_user: dict = Depends(RoleChecker(["ADMIN", "FACILITY_OPERATOR"]))):
    streaming_manager.stop()
    log_audit_action(current_user["id"], current_user["username"], "STOP_STREAMING", "/api/streaming/stop")
    return {"message": "Streaming telemetry simulator stopped", "status": streaming_manager.get_status()}

@router.get("/status")
def get_streaming_status():
    return streaming_manager.get_status()

@router.get("/metrics")
def get_streaming_metrics():
    return streaming_manager.get_status()

@router.get("/scenarios")
def list_streaming_scenarios():
    return {"scenarios": STREAMING_SCENARIOS, "active_scenario": streaming_manager.get_status()["active_scenario"]}

@router.post("/scenario")
def set_streaming_scenario(request: SetScenarioRequest, current_user: dict = Depends(RoleChecker(["ADMIN", "FACILITY_OPERATOR"]))):
    success = streaming_manager.set_scenario(request.scenario)
    if not success:
        raise HTTPException(status_code=400, detail=f"Invalid scenario '{request.scenario}'. Must be one of {STREAMING_SCENARIOS}")
    log_audit_action(current_user["id"], current_user["username"], "SET_STREAMING_SCENARIO", "/api/streaming/scenario", {"scenario": request.scenario})
    return {"message": f"Streaming scenario set to {request.scenario}", "status": streaming_manager.get_status()}

@router.post("/inject")
def inject_streaming_fault(request: InjectFaultRequest, current_user: dict = Depends(RoleChecker(["ADMIN", "FACILITY_OPERATOR"]))):
    valid_faults = ["MECHANICAL_RESISTANCE", "STANDBY_LEAKAGE", "PRODUCTION_ANOMALY", "ELECTRICAL_SPIKE"]
    if request.fault_type not in valid_faults:
        raise HTTPException(status_code=400, detail=f"Invalid fault_type. Must be one of {valid_faults}")
        
    streaming_manager.inject_fault(request.asset_id, request.fault_type)
    log_audit_action(current_user["id"], current_user["username"], "INJECT_STREAMING_FAULT", "/api/streaming/inject", {"asset_id": request.asset_id, "fault_type": request.fault_type})
    return {"message": f"Injected {request.fault_type} into {request.asset_id}", "status": streaming_manager.get_status()}

@router.post("/clear-faults")
def clear_streaming_faults(current_user: dict = Depends(RoleChecker(["ADMIN", "FACILITY_OPERATOR"]))):
    streaming_manager.clear_all_faults()
    log_audit_action(current_user["id"], current_user["username"], "CLEAR_STREAMING_FAULTS", "/api/streaming/clear-faults")
    return {"message": "Cleared all active streaming fault injections", "status": streaming_manager.get_status()}
