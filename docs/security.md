# Security & Authentication Architecture

## 1. Overview
EnergyIQ implements defense-in-depth security standards suitable for Industrial IoT and Enterprise SaaS environments:
- **JWT (JSON Web Token) Authentication**: Stateless access tokens with configurable expiration (60 minutes).
- **Role-Based Access Control (RBAC)**: Fine-grained endpoint permissions enforced via FastAPI dependency injection.
- **Password Hashing**: PBKDF2 with SHA-256 and unique random salt per user.
- **Audit Logging**: Immutable tracking of critical system actions stored in the `audit_logs` table.

## 2. User Roles & Access Matrix
| Role | Identifier | Permissions & Accessible Modules |
| :--- | :--- | :--- |
| **System Administrator** | `ADMIN` | Full access to all endpoints, user management, reseed DB, model activation, streaming control. |
| **Facility Operator** | `FACILITY_OPERATOR` | Access to Live Energy, Equipment status, Alert center, Maintenance tasks, Streaming Health, Demo injection. |
| **Technical Engineer** | `TECHNICAL_ENGINEER` | Access to AI Insights, Analytics, ML Evaluation, Benchmark ML, Data Quality, Model Registry, Edge Cases. |

## 3. Audit Logging
Every sensitive API operation (model activation, user creation, demo injection, streaming start/stop) automatically records:
- `user_id` and `username`
- `action` (e.g. `ACTIVATE_MODEL`, `START_STREAMING`)
- `endpoint` requested
- `details_json` (payload parameters)
- `timestamp` (UTC)
