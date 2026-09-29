from fastapi import APIRouter, Depends, HTTPException
from typing import List, Dict, Any, Optional
from backend.database.db import get_connection
from backend.auth.security import get_current_user

router = APIRouter(prefix="/api/notifications", tags=["notifications"])

@router.get("")
def list_notifications(unread_only: bool = False, limit: int = 50, user: dict = Depends(get_current_user)):
    conn = get_connection()
    cursor = conn.cursor()
    
    user_role = user.get("role", "FACILITY_OPERATOR")
    
    query = "SELECT * FROM notifications WHERE (target_role = ? OR target_role = 'ALL' OR target_role IS NULL)"
    params = [user_role]
    
    if unread_only:
        query += " AND read_status = 0"
        
    query += " ORDER BY id DESC LIMIT ?"
    params.append(limit)
    
    cursor.execute(query, params)
    rows = cursor.fetchall()
    
    cursor.execute("SELECT COUNT(*) as unread FROM notifications WHERE read_status = 0 AND (target_role = ? OR target_role = 'ALL' OR target_role IS NULL)", (user_role,))
    unread_cnt = cursor.fetchone()["unread"]
    
    conn.close()
    
    return {
        "unread_count": unread_cnt,
        "notifications": [dict(r) for r in rows]
    }

@router.post("/{notification_id}/read")
def mark_notification_read(notification_id: int, user: dict = Depends(get_current_user)):
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("UPDATE notifications SET read_status = 1 WHERE id = ?", (notification_id,))
    conn.commit()
    conn.close()
    return {"message": f"Notification {notification_id} marked as read"}

@router.post("/read-all")
def mark_all_notifications_read(user: dict = Depends(get_current_user)):
    conn = get_connection()
    cursor = conn.cursor()
    user_role = user.get("role", "FACILITY_OPERATOR")
    cursor.execute("UPDATE notifications SET read_status = 1 WHERE (target_role = ? OR target_role = 'ALL' OR target_role IS NULL)", (user_role,))
    conn.commit()
    conn.close()
    return {"message": "All notifications marked as read"}
