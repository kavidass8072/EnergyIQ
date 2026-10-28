# EnergyIQ — Final Demonstration Script & Presentation Guide

**Project Title**: EnergyIQ — Commercial Campus Energy Intelligence & Predictive Maintenance Platform  
**Presenter**: KAVIDASS M (B.E. Computer Science and Engineering, Rathinam Technical Campus)  
**Demonstration Duration**: 5 to 7 Minutes  
**Audience**: Project Review Panel, Internal Guide, External Evaluator, Academic Faculty  

---

## PART 1: 5-7 MINUTE LIVE DEMONSTRATION SCRIPT

### Pre-Demo Preparation (Setup Checklist)
1. Open terminal 1:
   ```powershell
   cd "e:\coe project"
   python -m uvicorn backend.main:app --host 127.0.0.1 --port 8000
   ```
2. Open terminal 2:
   ```cmd
   cd "e:\coe project\frontend"
   cmd /c npm run dev
   ```
3. Open browser to `http://localhost:5173`.
4. Ensure default test credentials:
   - Admin: `admin` / `admin123`
   - Operator: `operator` / `operator123`
   - Engineer: `engineer` / `engineer123`

---

### Step-by-Step Live Walkthrough (Minute-by-Minute)

#### Minute 0:00 – 1:00 | Introduction & Platform Overview
- **Action**: Open `http://localhost:5173/login`. Log in with `admin` / `admin123`.
- **Speaking Points**:
  > *"Respected examiners and evaluation committee, welcome to the demonstration of **EnergyIQ** — an intelligent energy monitoring and predictive maintenance platform engineered for commercial and educational campuses. Traditional systems rely on manual monthly billing or static wattage thresholds that suffer from high false alarm rates. EnergyIQ introduces contextual machine learning to differentiate legitimate operational spikes from real electromechanical faults."*
- **What to show**:
  - Main Dashboard (`/`): Real-time Campus KPI cards (Active Power, Campus Base Load, Solar Generation, Battery State of Charge, Active Anomalies).
  - Energy Distribution & Microgrid Power Vector.
  - 7 campus equipment cards showing real-time operating state and dynamic health scores.

#### Minute 1:00 – 2:00 | Telemetry Streaming & Network Degradation Scenarios
- **Action**: Navigate to **Streaming Health** (`/streaming-health`).
- **Speaking Points**:
  > *"Real industrial environments face imperfect network telemetry. EnergyIQ includes a built-in streaming engine that streams live sensor data over WebSockets and can simulate 10 real-world operational and degradation scenarios."*
- **What to show**:
  - Show the live event ticker (events received, events accepted, avg latency < 5ms).
  - Select scenario: `BURST_TRAFFIC` or `DROPPED_PACKETS`. Show that the streaming validator cleanses records and imputes missing values using physical domain boundaries without pipeline failure.

#### Minute 2:00 – 3:15 | Fault Injection & Machine Learning Root-Cause Linking
- **Action**: Click the **Inject Demo Fault** button in the top navigation or sidebar.
  - Select Equipment: `Motor-01`.
  - Select Fault Type: `MECHANICAL_RESISTANCE`.
  - Click **Inject Anomaly Fault**.
- **Speaking Points**:
  > *"We now inject a mechanical resistance fault into Heavy Motor-01. Notice the instant reaction: the Contextual Isolation Forest detects a power surge above the 24-hour rolling baseline. Crucially, EnergyIQ doesn't stop at an anomaly flag—our physical fault-linking engine analyzes operating temperature, production output, and load deviation to diagnose the exact root cause: 'Mechanical Resistance' with 88% confidence."*
- **What to show**:
  - Active alert banner pops up.
  - Navigate to **Alerts** (`/alerts`).
  - Click on the new alert to open the **Explainability Drawer**: Show the feature contribution breakdown, the expected baseline power vs. actual draw, and the recommended engineering action.

#### Minute 3:15 – 4:30 | Role-Based Triage & Maintenance Work Order Lifecycle
- **Action**: 
  - Logout and log in as `operator` / `operator123`.
  - Open the alert, click **Review Alert**, select **UNDER_INVESTIGATION**, and enter note: *"Operator verified high bearing temperature"*.
  - Click **Create Work Order**: Assign to `engineer` with Priority `HIGH`.
  - Logout and log in as `engineer` / `engineer123`.
  - Navigate to **Equipment** (`/equipment`), select `Motor-01`, and show the **Health Score History** trend.
  - Navigate to **Maintenance** (`/maintenance`), locate the task, mark as **COMPLETED**, and resolve the linked alert.
- **Speaking Points**:
  > *"Notice the role-based workflow: The Facility Operator acknowledges the anomaly and converts it into a formal maintenance work order. The Technical Engineer logs in, reviews historical health degradation, performs the physical repair, and marks the task as completed. This closes the loop between machine learning telemetry and plant maintenance."*

#### Minute 4:30 – 5:30 | Model Governance, Drift Monitoring & Rollback
- **Action**: Navigate to **Model Registry** (`/model-registry`) (logged in as `admin`).
- **Speaking Points**:
  > *"Industrial ML models degrade over time due to seasonal drift. EnergyIQ incorporates continuous Population Stability Index (PSI) drift monitoring. If drift occurs, the administrator can inspect model versions in the Model Registry and instantly execute a rollback to a verified champion model."*
- **What to show**:
  - Model table showing versions, F1-scores, training datasets, and active status.
  - PSI drift gauge.
  - Click **Rollback Model** to demonstrate safe model reversion.

#### Minute 5:30 – 6:30 | System Observability, Data Export & Audit Logs
- **Action**:
  - Navigate to **System Health** (`/system-health`): Show memory usage, database liveness, API uptime, and component status.
  - Navigate to **Admin** (`/admin`): Show the immutable `audit_logs` table showing every action performed during our demonstration (`LOGIN_SUCCESS`, `INJECT_FAULT`, `REVIEW_ALERT`, `ACTIVATE_MODEL`).
  - Demonstrate sanitized CSV/JSON export (`/api/export/alerts?format=csv`).
- **Speaking Points**:
  > *"Every critical action across the platform is logged in an immutable audit trail for regulatory compliance. System readiness and liveness probes guarantee high availability."*

#### Minute 6:30 – 7:00 | Conclusion & PyTest Validation Evidence
- **Action**: Show terminal / report with **79 / 79 PyTest tests passing** and Vite production build.
- **Speaking Points**:
  > *"In summary, EnergyIQ is a verified, fully integrated production-oriented prototype. With 79 passing automated tests, 0 build errors, 99.4% ML precision, and full role-based access control, the system is ready for campus deployment. Thank you, and I welcome your questions."*

---

## PART 2: 12-SLIDE ACADEMIC PRESENTATION OUTLINE

### Slide 1: Title Slide
- **Title**: EnergyIQ: Commercial Campus Energy Intelligence & Predictive Maintenance Platform
- **Subtitle**: Final Project Evaluation & Viva Presentation
- **Candidate Details**: KAVIDASS M (B.E. Computer Science and Engineering)
- **Institution**: Rathinam Technical Campus, Coimbatore
- **Academic Year**: 2026 | Expected Graduation: 2028
- **Visual**: EnergyIQ logo, modern architecture preview badge, GitHub repository link.

### Slide 2: Problem Statement & Industrial Need
- **Key Points**:
  - Commercial and campus facilities waste 15%–30% of energy on undetected mechanical degradation.
  - Static BMS thresholds cause severe alert fatigue (>80% false alarms).
  - Uncoupled systems: anomaly detection is rarely integrated into field maintenance dispatch.
- **Visual**: Comparison diagram showing static threshold failure vs. contextual dynamic baseline.

### Slide 3: Proposed Solution & Key Objectives
- **Key Points**:
  - End-to-end full-stack energy intelligence platform.
  - Contextual feature engineering (operating state, production load, diurnal phase).
  - Contextual Isolation Forest (unsupervised multi-dimensional anomaly detection).
  - Physical fault root-cause linking with explainable evidence.
  - Closed-loop maintenance work order dispatch with role-based access control (RBAC).
- **Visual**: Solution overview flow diagram (Sensors $\to$ Machine Learning $\to$ Alerts $\to$ Maintenance).

### Slide 4: System Architecture
- **Key Points**:
  - 4-Tier Decoupled Architecture:
    1. Presentation: React 19, Vite, Tailwind CSS, Recharts, Error Boundaries.
    2. API Layer: FastAPI, Uvicorn, 21 modular REST routers, WebSocket streaming.
    3. Intelligence Layer: Feature engineering, Isolation Forest, Fault Linking, PSI drift.
    4. Data Layer: SQLite (with PostgreSQL migration path), indexed schemas.
- **Visual**: High-level 4-tier architectural block diagram.

### Slide 5: Machine Learning & Energy Intelligence Pipeline
- **Key Points**:
  - Quantile baseline normalization (25th percentile of `ON` state) prevents continuous wear from distorting baselines.
  - Diurnal cyclic sine/cosine encoding captures time-of-day campus occupancy.
  - Isolation Forest ensemble (100 estimators, contamination = 0.05).
  - Zero target leakage: strict exclusion of ground-truth labels from training matrices.
- **Visual**: Feature engineering pipeline diagram with mathematical formulas.

### Slide 6: Physical Fault Root-Cause Linking Engine
- **Key Points**:
  - Eliminates "black-box" alerting by mapping anomaly signatures to 10 physical failure modes.
  - Evaluates operational state (`ON`/`OFF`), energy deviation ($\Delta E\%$), production throughput, and temperature.
  - Generates human-readable evidence summaries and recommended engineering actions.
- **Visual**: Decision matrix table showing fault types (Standby Leakage, Mechanical Resistance, Electrical Surge, etc.).

### Slide 7: Real-Time Telemetry Streaming & Degradation Scenarios
- **Key Points**:
  - WebSocket telemetry streamer with sub-second transmission.
  - 10 operational and network degradation scenarios (Burst traffic, dropped packets, duplicates, out-of-order).
  - Automated ingestion validator: boundary checks and mean imputation prevent pipeline crash.
  - Duplicate alert suppression via cooldown timers (300-second window).
- **Visual**: WebSocket architecture diagram with scenario selector UI screenshot.

### Slide 8: Role-Based Access Control & User Workflows
- **Key Points**:
  - 3 strict role definitions:
    - `ADMIN`: User management, system configuration, model rollback, audit inspection.
    - `FACILITY_OPERATOR`: Real-time monitoring, alert triage, work order dispatch.
    - `TECHNICAL_ENGINEER`: Health history diagnostics, work order execution, alert resolution.
  - Salted PBKDF2 password hashing (100,000 rounds) + JWT HS256 tokens.
- **Visual**: Swimlane diagram tracing an alert from detection through operator triage to engineering resolution.

### Slide 9: Experimental Evaluation & Empirical Results
- **Key Points**:
  - Evaluated on 60-day physics-consistent campus dataset (10,080 records across 7 assets).
  - Compared proposed Contextual Isolation Forest vs. baseline Rolling Z-score:
    - **Precision**: 99.41% vs. 68.4% (**+31.01%**)
    - **Recall**: 80.09% vs. 62.1% (**+17.99%**)
    - **F1-Score**: 88.71% vs. 65.1% (**+23.61%**)
    - **False Positive Rate**: 0.03% vs. 8.2% (**-8.17%**)
- **Visual**: Bar chart comparing Precision, Recall, and F1-score.

### Slide 10: Model Governance & Drift Monitoring
- **Key Points**:
  - Population Stability Index (PSI) monitoring across rolling 7-day feature windows.
  - Model Registry storing versioned models with evaluation metrics and training provenance.
  - Instant one-click rollback mechanism to restore champion models during performance degradation.
- **Visual**: PSI distribution chart and Model Registry interface diagram.

### Slide 11: Verification, Testing & Quality Assurance
- **Key Points**:
  - **79 / 79 PyTest tests passed (100%)** in 8.98 seconds.
  - Comprehensive 18-step end-to-end integration test (`tests/test_final_e2e.py`).
  - Production Vite build: 2,180 modules transformed, 0 errors in 610ms.
  - Immutable audit trail recording all logins, fault injections, and status changes.
- **Visual**: Terminal screenshot of passing test suite and clean Vite build.

### Slide 12: Summary, Academic Contribution & Future Work
- **Key Points**:
  - Delivered a robust, production-oriented prototype meeting 97% verified completion.
  - Bridged the gap between AI energy analytics and physical maintenance dispatch.
  - Future work: Hardware edge IoT microcontrollers (Modbus/BACnet) and multi-day deep sequence forecasting (TFT).
- **Visual**: Summary conclusion card with GitHub repository link and acknowledgments.
