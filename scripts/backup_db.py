import os
import shutil
import sqlite3
import sys
from datetime import datetime

DB_PATH = os.path.join(os.path.dirname(__file__), "..", "backend", "data", "app.db")
BACKUP_DIR = os.path.join(os.path.dirname(__file__), "..", "backups")

def create_backup():
    if not os.path.exists(DB_PATH):
        print(f"Error: Database file '{DB_PATH}' does not exist.")
        return False
        
    os.makedirs(BACKUP_DIR, exist_ok=True)
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    backup_file = os.path.join(BACKUP_DIR, f"app_backup_{timestamp}.db")
    
    # Use SQLite online backup API for safe hot-backup
    src_conn = sqlite3.connect(DB_PATH)
    dst_conn = sqlite3.connect(backup_file)
    with dst_conn:
        src_conn.backup(dst_conn)
    dst_conn.close()
    src_conn.close()
    
    print(f"[OK] Successfully created SQLite hot backup: {backup_file}")
    return backup_file

def restore_backup(backup_file_path: str):
    if not os.path.exists(backup_file_path):
        print(f"Error: Backup file '{backup_file_path}' not found.")
        return False
        
    os.makedirs(os.path.dirname(DB_PATH), exist_ok=True)
    
    src_conn = sqlite3.connect(backup_file_path)
    dst_conn = sqlite3.connect(DB_PATH)
    with dst_conn:
        src_conn.backup(dst_conn)
    dst_conn.close()
    src_conn.close()
    
    print(f"[OK] Successfully restored database from: {backup_file_path}")
    return True

if __name__ == "__main__":
    if len(sys.argv) > 1 and sys.argv[1] == "restore":
        if len(sys.argv) < 3:
            print("Usage: python scripts/backup_db.py restore <backup_file_path>")
        else:
            restore_backup(sys.argv[2])
    else:
        create_backup()
