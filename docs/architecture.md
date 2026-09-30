# System Architecture - HOSPITAL FLOW AI

"HOSPITAL FLOW AI" is a multi-agent hospital capacity and patient flow orchestration system designed to continuously monitor hospital operations, predict capacity bottlenecks, coordinate AI agents, enforce hard clinical safety constraints, route high-impact decisions to human approvers, and dynamically replan when conditions change.

## High-Level Data Flow

```
React Command Center UI (Vite / Tailwind / Recharts)
              |
              | REST API / STOMP WebSocket (/ws/hospital)
              v
Spring Boot 3 / 2.7 Backend (Java)
              |
              +----> PostgreSQL / Embedded H2 Database
              |
              | REST API (/api/v1/orchestrate)
              v
Python FastAPI AI Service (LangGraph Engine)
              |
              v
      LangGraph State Graph
              |
              +----> Patient Flow Agent (Triage & Care Assessment)
              +----> Bed Management Agent (Inventory & Care Matching)
              +----> Staff Agent (Workload Balancing & Reassignment)
              +----> Discharge Review Agent (Clinical Discharge Review)
              +----> Prediction Agent (Operational Forecast 15m/30m/60m/4h)
              +----> Planning Agent (Coordinated Action Plan Synthesis)
              +----> Constraint & Safety Engine (Hard Rule Validation)
              +----> Human Approval Gateway (Doctor / Nurse / Manager Sign-off)
              +----> Execution & Replanning Loop (Human Rejection Callback)
```

## Resilience & Graceful Fallback
If the Python FastAPI AI Service is offline, the Spring Boot backend automatically invokes an internal Java-native `RuleEngineFallbackService` so operational decision support remains 100% available without system downtime.
