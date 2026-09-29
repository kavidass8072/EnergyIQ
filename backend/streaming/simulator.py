import asyncio
import json
import time
import math
import random
from datetime import datetime, timezone
from typing import Dict, Any, List, Set, Optional
from fastapi import WebSocket

from backend.database.db import get_connection
from backend.streaming.validator import validate_and_clean_telemetry, CANONICAL_EQUIPMENT
from backend.streaming.scenarios import scenario_engine, STREAMING_SCENARIOS
from backend.fault_linking.engine import analyze_and_link_fault

class StreamingManager:
    def __init__(self):
        self.is_running: bool = False
        self.interval: float = 2.0
        self.active_assets: List[str] = list(CANONICAL_EQUIPMENT)
        self.connected_websockets: Set[WebSocket] = set()
        self.task: Optional[asyncio.Task] = None
        self.active_injections: Dict[str, str] = {}
        self.last_alert_timestamps: Dict[str, float] = {}
        self.alert_cooldown_seconds: float = 300.0
        
        # Extended Metrics Tracking for Phase 3
        self.events_received: int = 0
        self.events_accepted: int = 0
        self.events_rejected: int = 0
        self.duplicate_events: int = 0
        self.out_of_order_events: int = 0
        self.dropped_events: int = 0
        self.invalid_events: int = 0
        self.reconnect_count: int = 0
        self.latencies_ms: List[float] = []
        self.active_anomalies: int = 0
        self.start_time: Optional[float] = None
        self.seen_timestamps: Set[str] = set()

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.connected_websockets.add(websocket)
        self.reconnect_count += 1

    def disconnect(self, websocket: WebSocket):
        self.connected_websockets.discard(websocket)

    async def broadcast(self, message: Dict[str, Any]):
        disconnected = set()
        for ws in self.connected_websockets:
            try:
                await ws.send_json(message)
            except Exception:
                disconnected.add(ws)
        for ws in disconnected:
            self.connected_websockets.discard(ws)

    def start(self, interval: float = 2.0):
        if self.is_running:
            return
        self.is_running = True
        self.interval = interval
        self.start_time = time.time()
        try:
            loop = asyncio.get_running_loop()
            self.task = loop.create_task(self._streaming_loop())
        except RuntimeError:
            self.task = None

    def stop(self):
        self.is_running = False
        if self.task and not self.task.done():
            self.task.cancel()
        self.task = None

    def set_scenario(self, scenario_name: str) -> bool:
        return scenario_engine.set_scenario(scenario_name)

    def inject_fault(self, asset_id: str, fault_type: str):
        self.active_injections[asset_id] = fault_type

    def clear_fault(self, asset_id: str):
        if asset_id in self.active_injections:
            del self.active_injections[asset_id]

    def clear_all_faults(self):
        self.active_injections.clear()

    def get_status(self) -> Dict[str, Any]:
        elapsed = (time.time() - self.start_time) if (self.start_time and self.is_running) else 0.0
        eps = round(self.events_received / elapsed, 2) if elapsed > 0 else 0.0
        avg_lat = round(sum(self.latencies_ms) / len(self.latencies_ms), 2) if self.latencies_ms else 0.0
        max_lat = round(max(self.latencies_ms), 2) if self.latencies_ms else 0.0

        return {
            "is_running": self.is_running,
            "interval": self.interval,
            "active_scenario": scenario_engine.active_scenario,
            "connected_clients": len(self.connected_websockets),
            "active_assets": len(self.active_assets),
            "events_received": self.events_received,
            "events_accepted": self.events_accepted,
            "events_rejected": self.events_rejected,
            "duplicate_events": self.duplicate_events,
            "out_of_order_events": self.out_of_order_events,
            "dropped_events": self.dropped_events,
            "invalid_events": self.invalid_events,
            "reconnect_count": self.reconnect_count,
            "events_per_sec": eps,
            "avg_latency_ms": avg_lat,
            "max_latency_ms": max_lat,
            "active_anomalies": self.active_anomalies,
            "active_injections": self.active_injections
        }

    def _generate_synthetic_tick(self, asset_id: str) -> Dict[str, Any]:
        now_dt = datetime.now()
        now_str = now_dt.strftime("%Y-%m-%d %H:%M:%S")
        hour = now_dt.hour
        
        profiles = {
            "HVAC-01": {"type": "HVAC", "base_kw": 45.0, "state": "ON", "prod": 0.0, "temp": 24.0},
            "HVAC-02": {"type": "HVAC", "base_kw": 38.0, "state": "ON", "prod": 0.0, "temp": 23.5},
            "Motor-01": {"type": "Heavy Motor", "base_kw": 28.0, "state": "ON", "prod": 85.0, "temp": 42.0},
            "Compressor-01": {"type": "Industrial Compressor", "base_kw": 55.0, "state": "ON", "prod": 90.0, "temp": 50.0},
            "Pump-01": {"type": "Fluid Pump", "base_kw": 18.0, "state": "ON", "prod": 60.0, "temp": 35.0},
            "Production-Line-01": {"type": "Assembly Line", "base_kw": 85.0, "state": "ON", "prod": 120.0, "temp": 38.0},
            "Cooling-Unit-01": {"type": "Chiller", "base_kw": 62.0, "state": "ON", "prod": 0.0, "temp": 18.0}
        }
        
        prof = profiles.get(asset_id, {"type": "Equipment", "base_kw": 30.0, "state": "ON", "prod": 50.0, "temp": 30.0})
        diurnal = 1.0 + 0.15 * math.sin(math.pi * (hour - 8) / 12)
        noise = random.uniform(-1.5, 1.5)
        energy_kwh = max(1.0, round(prof["base_kw"] * diurnal + noise, 2))
        
        solar_gen = max(0.0, round(50.0 * math.sin(math.pi * (hour - 6) / 12), 2)) if 6 <= hour <= 18 else 0.0
        battery_soc = max(20.0, min(95.0, 60.0 + 20.0 * math.cos(math.pi * hour / 12)))
        grid_kwh = max(0.0, round(energy_kwh - solar_gen * 0.2, 2))
        
        record = {
            "timestamp": now_str,
            "equipment_id": asset_id,
            "equipment_type": prof["type"],
            "energy_kwh": energy_kwh,
            "operating_state": prof["state"],
            "production_output": prof["prod"],
            "solar_generation_kwh": solar_gen,
            "battery_soc": battery_soc,
            "grid_consumption_kwh": grid_kwh,
            "temperature": round(prof["temp"] + random.uniform(-0.5, 0.5), 1),
            "maintenance_days": 18,
            "maintenance_status": "OK"
        }
        
        inj_fault = self.active_injections.get(asset_id)
        if inj_fault == "MECHANICAL_RESISTANCE":
            record["energy_kwh"] = round(energy_kwh * 1.65, 2)
            record["temperature"] = round(record["temperature"] + 12.0, 1)
        elif inj_fault == "STANDBY_LEAKAGE":
            record["operating_state"] = "OFF"
            record["energy_kwh"] = 8.5
            record["production_output"] = 0.0
        elif inj_fault == "PRODUCTION_ANOMALY":
            record["energy_kwh"] = round(energy_kwh * 1.45, 2)
            record["production_output"] = 0.0
        elif inj_fault == "ELECTRICAL_SPIKE":
            record["energy_kwh"] = round(energy_kwh * 2.2, 2)
            
        return record

    async def _streaming_loop(self):
        while self.is_running:
            try:
                for asset_id in self.active_assets:
                    if not self.is_running:
                        break
                        
                    t_start = time.time()
                    raw_event = self._generate_synthetic_tick(asset_id)
                    
                    # Apply scenario transformation
                    scenario_records = scenario_engine.apply_scenario(raw_event)
                    
                    if not scenario_records:
                        self.dropped_events += 1
                        continue
                        
                    for event_item in scenario_records:
                        self.events_received += 1
                        ts_key = f"{event_item.get('equipment_id')}:{event_item.get('timestamp')}"
                        
                        # Check duplicate
                        if ts_key in self.seen_timestamps:
                            self.duplicate_events += 1
                        else:
                            self.seen_timestamps.add(ts_key)
                            if len(self.seen_timestamps) > 1000:
                                self.seen_timestamps.pop()

                        # Validate event
                        is_valid, cleaned, issues = validate_and_clean_telemetry(event_item)
                        
                        if is_valid:
                            self.events_accepted += 1
                        else:
                            self.events_rejected += 1
                            self.invalid_events += 1
                            
                        # Process alert logic
                        alert_created = self._process_telemetry_event(cleaned)
                        
                        # Latency measurement
                        lat = round((time.time() - t_start) * 1000.0, 2)
                        self.latencies_ms.append(lat)
                        if len(self.latencies_ms) > 100:
                            self.latencies_ms.pop(0)

                        payload = {
                            "type": "TELEMETRY_TICK",
                            "data": cleaned,
                            "alert": alert_created,
                            "stats": self.get_status()
                        }
                        await self.broadcast(payload)

                await asyncio.sleep(self.interval)
            except asyncio.CancelledError:
                break
            except Exception as e:
                print(f"Error in streaming loop: {e}")
                await asyncio.sleep(self.interval)

    def _process_telemetry_event(self, record: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        conn = get_connection()
        cursor = conn.cursor()
        
        cursor.execute("""
            SELECT AVG(energy_kwh) as avg_kw, COUNT(*) as cnt
            FROM telemetry
            WHERE equipment_id = ? AND operating_state = 'ON'
            ORDER BY id DESC LIMIT 48
        """, (record["equipment_id"],))
        b_row = cursor.fetchone()
        expected = float(b_row["avg_kw"]) if (b_row and b_row["avg_kw"]) else record["energy_kwh"]
        if expected <= 0.01:
            expected = record["energy_kwh"]
            
        dev_pct = ((record["energy_kwh"] - expected) / expected * 100.0) if expected > 0.01 else 0.0
        
        is_anomaly = 0
        score = 15.0
        severity = "NORMAL"
        
        if record["operating_state"] == "OFF" and record["energy_kwh"] > 2.0:
            is_anomaly = 1
            score = 88.0
            severity = "HIGH"
        elif dev_pct > 35.0:
            is_anomaly = 1
            score = min(98.0, 50.0 + dev_pct * 0.8)
            severity = "CRITICAL" if dev_pct > 65.0 else ("HIGH" if dev_pct > 45.0 else "MEDIUM")
            
        record["is_anomaly"] = is_anomaly
        record["anomaly_score"] = round(score, 1)
        record["severity"] = severity
        
        record["rolling_mean_24h"] = expected
        record["hour_of_day"] = datetime.now().hour
        fault_res = analyze_and_link_fault(record)
        record["fault_label"] = fault_res["likely_fault"] if is_anomaly else "NORMAL"
        
        cursor.execute("""
            INSERT INTO telemetry (
                timestamp, equipment_id, equipment_type, energy_kwh, operating_state,
                production_output, solar_generation_kwh, battery_soc, grid_consumption_kwh,
                temperature, maintenance_days, maintenance_status, is_anomaly, fault_label,
                anomaly_score, severity
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            record["timestamp"], record["equipment_id"], record["equipment_type"], record["energy_kwh"],
            record["operating_state"], record["production_output"], record["solar_generation_kwh"],
            record["battery_soc"], record["grid_consumption_kwh"], record["temperature"],
            record["maintenance_days"], record["maintenance_status"], record["is_anomaly"],
            record["fault_label"], record["anomaly_score"], record["severity"]
        ))
        
        new_alert = None
        if is_anomaly:
            self.active_anomalies += 1
            key = f"{record['equipment_id']}:{fault_res['likely_fault']}"
            now_ts = time.time()
            last_ts = self.last_alert_timestamps.get(key, 0.0)
            
            if (now_ts - last_ts) > self.alert_cooldown_seconds:
                self.last_alert_timestamps[key] = now_ts
                evidence_json = json.dumps(fault_res["evidence"])
                cursor.execute("""
                    INSERT INTO alerts (
                        timestamp, equipment_id, equipment_type, severity, energy_kwh,
                        expected_kwh, dev_pct, operating_state, production_output,
                        maintenance_days, likely_fault, fault_confidence, evidence_json,
                        recommended_action, status
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'ACTIVE')
                """, (
                    record["timestamp"], record["equipment_id"], record["equipment_type"],
                    severity, record["energy_kwh"], round(expected, 2), round(dev_pct, 1),
                    record["operating_state"], record["production_output"], record["maintenance_days"],
                    fault_res["likely_fault"], fault_res["fault_confidence"], evidence_json,
                    fault_res["recommended_action"]
                ))
                alert_id = cursor.lastrowid
                
                cursor.execute("""
                    INSERT INTO notifications (timestamp, title, message, severity, read_status, target_role)
                    VALUES (?, ?, ?, ?, 0, 'FACILITY_OPERATOR')
                """, (
                    record["timestamp"],
                    f"Anomaly Alert: {record['equipment_id']}",
                    f"{fault_res['likely_fault']} detected on {record['equipment_id']} (+{dev_pct:.1f}% energy deviation).",
                    severity
                ))
                
                new_alert = {
                    "id": alert_id,
                    "timestamp": record["timestamp"],
                    "equipment_id": record["equipment_id"],
                    "equipment_type": record["equipment_type"],
                    "severity": severity,
                    "likely_fault": fault_res["likely_fault"],
                    "fault_confidence": fault_res["fault_confidence"],
                    "dev_pct": round(dev_pct, 1),
                    "recommended_action": fault_res["recommended_action"]
                }
                
        conn.commit()
        conn.close()
        return new_alert

streaming_manager = StreamingManager()
