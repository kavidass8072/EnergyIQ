# SQLite Database Backup & Recovery Procedure

## 1. Overview
EnergyIQ utilizes an online SQLite hot-backup mechanism (`sqlite3.backup`) to create consistent database snapshots without interrupting live telemetry ingestion or REST API requests.

## 2. Creating a Database Backup
To create a timestamped backup of `backend/data/app.db`:
```bash
python scripts/backup_db.py
```
This saves a copy to `backups/app_backup_YYYYMMDD_HHMMSS.db`.

## 3. Restoring a Database Backup
To restore the database from a backup snapshot:
```bash
python scripts/backup_db.py restore backups/app_backup_20260929_203231.db
```

## 4. Operational Safety Guidelines
- **Zero Data Loss**: Hot backup captures transactions up to the exact moment of execution.
- **Never Auto-Delete**: Backup snapshots are stored in the local `backups/` directory and must never be automatically purged without administrator confirmation.
