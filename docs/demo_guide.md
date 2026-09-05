# 🎬 EnergyIQ Demonstration & Evaluation Guide

## 1. Overview
This guide provides step-by-step instructions for demonstrating **EnergyIQ** to evaluators, facility managers, and software engineers.

---

## 2. Step-by-Step Demonstration Script

### Step 1: Campus Overview & System Health
1. Launch application and navigate to **Overview**.
2. Point out the dynamic **System Status badge** (`● System Healthy` / `● Warning` / `● Degraded`).
3. Explain the **Microgrid Power Vector**: Solar ☀️, Battery Storage 🔋, Grid Import ⚡, and Campus Load 🏭.
4. Highlight the **48h Energy Consumption & Baseline Trend** graph.

---

### Step 2: Equipment Health & Asset Detail
1. Navigate to **Equipment**.
2. Observe the **Health Score (0–100)** badge for each asset (e.g. `95 / 100 ● Healthy` or `68 / 100 ● Action Required`).
3. Click `Motor-01` to view its 72h historical energy vs baseline curve, health timeline, and maintenance log.

---

### Step 3: Interactive Demo Fault Injection
1. Navigate to **Demo Center** (or click **Demo Controls** in sidebar).
2. Select target asset: `Motor-01`.
3. Click **Inject Mechanical Resistance**.
4. Observe notification: `Fault injected! Alert generated.`
5. Return to **Overview** and **Alerts**:
   - Notice System Status changes to `● System Warning` or `● Degraded`.
   - Notice `Motor-01` active alert appears at top of inbox.

---

### Step 4: Alert Inspector & Dual View Modes
1. Click **Inspect Evidence** on the newly generated alert.
2. In **Operator View**:
   - Review actual energy vs baseline expected energy, deviation (+62%), operating state (`ON`), and production rate.
   - Read the plain-language explanation and recommended maintenance action steps.
3. Switch to **Technical View**:
   - Point out the Isolation Forest Tree Score, Z-Score deviation, and explanation of **Model Signal vs Fault Linking Rule Interpretation**.
4. Click **Create Maintenance Task**.

---

### Step 5: Maintenance Workflow
1. Navigate to **Maintenance**.
2. Verify the newly created maintenance task appears under **Work Orders**.
3. Click **Mark Complete** to resolve the work order.

---

### Step 6: ML Evaluation & Edge Cases
1. Navigate to **ML Evaluation** to review the precision/recall/F1 metrics and confusion matrix.
2. Navigate to **Edge Cases** and click **Run All Edge Case Tests**. Verify all 7 stress cases pass.

---

### Step 7: System Reset
1. Navigate back to **Demo Center**.
2. Click **Reset Demo Data** and confirm.
3. Verify system returns to clean default baseline state.
