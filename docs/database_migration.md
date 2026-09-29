# Database Migration & PostgreSQL Deployment Guide

## 1. Overview
EnergyIQ defaults to an embedded SQLite database (`backend/data/app.db`) for lightweight local development, automated testing, and demonstration. For enterprise production deployments, EnergyIQ supports migrating to PostgreSQL.

## 2. Configuration Parameters
Database connectivity is controlled via the `DATABASE_URL` environment variable:
- **SQLite (Default)**: `sqlite:///backend/data/app.db`
- **PostgreSQL**: `postgresql://energyiq_user:secure_password@postgres_host:5432/energyiq_db`

## 3. SQLite to PostgreSQL Migration Procedure

### Step 1: Export SQLite Schema & Data
```bash
python scripts/backup_db.py
```
This generates a consistent SQLite snapshot `backups/app_backup_YYYYMMDD_HHMMSS.db`.

### Step 2: Provision PostgreSQL Database
```sql
CREATE DATABASE energyiq_db;
CREATE USER energyiq_user WITH ENCRYPTED PASSWORD 'secure_password';
GRANT ALL PRIVILEGES ON DATABASE energyiq_db TO energyiq_user;
```

### Step 3: Run Alembic / Schema Migration
Initialize PostgreSQL tables using Alembic or standard DDL:
```bash
alembic upgrade head
```

### Step 4: Update Environment Variables
In `.env` or Docker configuration:
```env
DATABASE_URL=postgresql://energyiq_user:secure_password@localhost:5432/energyiq_db
```
