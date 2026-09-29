import csv
import io
import json
from fastapi import APIRouter, Depends, HTTPException, Query, Response
from backend.database.db import get_connection
from backend.auth.security import RoleChecker, log_audit_action

router = APIRouter(prefix="/api/export", tags=["export"])

@router.get("/{resource}")
def export_data_resource(
    resource: str,
    format: str = Query("json", regex="^(json|csv)$"),
    limit: int = Query(500, ge=1, le=5000),
    current_user: dict = Depends(RoleChecker(["ADMIN", "FACILITY_OPERATOR", "TECHNICAL_ENGINEER"]))
):
    """Exports system operational data (alerts, maintenance, telemetry) in CSV or JSON format."""
    allowed_resources = ["alerts", "maintenance", "telemetry", "audit_logs"]
    if resource not in allowed_resources:
        raise HTTPException(status_code=400, detail=f"Invalid resource '{resource}'. Allowed: {allowed_resources}")
        
    table_name = "maintenance_tasks" if resource == "maintenance" else resource
    
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute(f"SELECT * FROM {table_name} ORDER BY id DESC LIMIT ?", (limit,))
    rows = [dict(r) for r in cursor.fetchall()]
    conn.close()
    
    log_audit_action(current_user["id"], current_user["username"], "EXPORT_DATA", f"/api/export/{resource}", {"format": format, "records": len(rows)})
    
    if format == "csv":
        if not rows:
            return Response(content="", media_type="text/csv")
        output = io.StringIO()
        writer = csv.DictWriter(output, fieldnames=rows[0].keys())
        writer.writeheader()
        writer.writerows(rows)
        return Response(
            content=output.getvalue(),
            media_type="text/csv",
            headers={"Content-Disposition": f"attachment; filename=energyiq_{resource}_export.csv"}
        )
    else:
        return {"resource": resource, "count": len(rows), "data": rows}
