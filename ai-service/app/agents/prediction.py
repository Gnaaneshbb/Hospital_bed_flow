from app.models.hospital_state import HospitalState, AgentFinding
from typing import Dict, Any, List

class PredictionAgent:
    """
    Prediction Agent: Forecasts operational capacity pressure and bed demand over 15m, 30m, 60m, and 4h horizons.
    Clearly labeled as 'Operational Forecast'.
    """
    @staticmethod
    def forecast(state: HospitalState) -> AgentFinding:
        incoming_count = len(state.incoming_patients) + len([p for p in state.patients if p.status == "ER_WAITING"])
        critical_incoming = len([p for p in state.incoming_patients if p.severity == "CRITICAL"])
        icu_available = len([b for b in state.beds if b.bed_type == "ICU" and b.status == "AVAILABLE"])
        ward_available = len([b for b in state.beds if b.bed_type == "WARD" and b.status == "AVAILABLE"])
        cleaning_in_progress = len([c for c in state.cleaning_tasks if c.status != "COMPLETED"])

        # Hybrid operational forecasting logic
        icu_deficit_30m = max(0, critical_incoming - icu_available)
        ward_demand_60m = incoming_count + (1 if icu_deficit_30m > 0 else 0)
        expected_discharges_4h = len([p for p in state.patients if p.vitals_status == "STABLE" and p.status == "ADMITTED_WARD"])

        forecasts = {
            "horizon_15m": {
                "er_queue_forecast": incoming_count + 2,
                "icu_demand": critical_incoming,
                "icu_available": icu_available,
                "icu_shortage_risk": "HIGH" if critical_incoming > icu_available else "LOW"
            },
            "horizon_30m": {
                "icu_deficit": icu_deficit_30m,
                "beds_freed_by_cleaning": min(cleaning_in_progress, 3),
                "ward_occupancy_projected_pct": min(100, int((20 - ward_available + ward_demand_60m) / 20 * 100))
            },
            "horizon_60m": {
                "projected_er_wait_time_mins": 45 if incoming_count > 8 else 15,
                "ward_capacity_bottleneck": ward_available < 3
            },
            "horizon_4h": {
                "expected_discharges": expected_discharges_4h,
                "net_capacity_delta": expected_discharges_4h - incoming_count
            }
        }

        shortage_warning = f"CRITICAL ICU SHORTAGE predicted in 30 mins (Deficit: {icu_deficit_30m} beds)." if icu_deficit_30m > 0 else "Capacity stable."
        summary = f"Operational Forecast: {shortage_warning} Projected ER Queue: {incoming_count + 2} patients."

        return AgentFinding(
            agent_name="Prediction Agent",
            status="COMPLETED",
            finding_type="OPERATIONAL_FORECAST",
            summary=summary,
            confidence_score=0.91,
            details=forecasts
        )
