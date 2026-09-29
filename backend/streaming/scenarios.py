import time
import random
from datetime import datetime, timedelta
from typing import Dict, Any, List, Optional

STREAMING_SCENARIOS = [
    "NORMAL_TELEMETRY",
    "MISSING_PACKET",
    "DELAYED_PACKET",
    "DUPLICATE_PACKET",
    "OUT_OF_ORDER_PACKET",
    "SENSOR_MALFUNCTION",
    "SUDDEN_POWER_SPIKE",
    "GRADUAL_POWER_DRIFT",
    "EXTREME_TEMPERATURE",
    "CONNECTION_INTERRUPTION",
    "RECONNECTION",
    "BURST_TRAFFIC"
]

class ScenarioEngine:
    def __init__(self):
        self.active_scenario: str = "NORMAL_TELEMETRY"
        self.drift_counter: float = 0.0

    def set_scenario(self, scenario_name: str):
        if scenario_name in STREAMING_SCENARIOS:
            self.active_scenario = scenario_name
            self.drift_counter = 0.0
            return True
        return False

    def apply_scenario(self, raw_record: Dict[str, Any]) -> List[Dict[str, Any]]:
        """
        Applies active scenario transformations to raw telemetry payload.
        Returns a list of records (allows burst traffic or packet duplication/drop).
        """
        scenario = self.active_scenario
        records = [dict(raw_record)]

        if scenario == "NORMAL_TELEMETRY":
            return records

        elif scenario == "MISSING_PACKET":
            # Simulate packet drop (return empty list)
            return []

        elif scenario == "DELAYED_PACKET":
            # Simulate network latency delay
            time.sleep(0.15) # 150ms artificial delay
            return records

        elif scenario == "DUPLICATE_PACKET":
            # Duplicate the packet
            dup = dict(raw_record)
            return [raw_record, dup]

        elif scenario == "OUT_OF_ORDER_PACKET":
            # Set timestamp 1 hour into the past
            past_dt = datetime.now() - timedelta(hours=1)
            records[0]["timestamp"] = past_dt.strftime("%Y-%m-%d %H:%M:%S")
            return records

        elif scenario == "SENSOR_MALFUNCTION":
            # Zero energy while operating state ON
            records[0]["operating_state"] = "ON"
            records[0]["energy_kwh"] = 0.0
            records[0]["production_output"] = 80.0
            return records

        elif scenario == "SUDDEN_POWER_SPIKE":
            records[0]["energy_kwh"] = round(records[0]["energy_kwh"] * 2.2, 2)
            return records

        elif scenario == "GRADUAL_POWER_DRIFT":
            self.drift_counter += 1.5
            records[0]["energy_kwh"] = round(records[0]["energy_kwh"] + self.drift_counter, 2)
            return records

        elif scenario == "EXTREME_TEMPERATURE":
            records[0]["temperature"] = 92.5
            return records

        elif scenario == "BURST_TRAFFIC":
            # Simulate burst of 3 rapid events
            r1 = dict(raw_record)
            r2 = dict(raw_record)
            r2["energy_kwh"] = round(r2["energy_kwh"] * 1.05, 2)
            r3 = dict(raw_record)
            r3["energy_kwh"] = round(r3["energy_kwh"] * 1.10, 2)
            return [r1, r2, r3]

        return records

scenario_engine = ScenarioEngine()
