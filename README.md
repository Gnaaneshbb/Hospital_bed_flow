# HOSPITAL FLOW AI
### A Multi-Agent Hospital Capacity & Patient Flow Orchestration System

> **Academic Research Prototype** | Transparent Multi-Agent Decision Support Platform

---

## 1. Project Overview

**HOSPITAL FLOW AI** is a real-time hospital capacity and patient flow orchestration platform powered by a cooperating team of AI agents coordinated via **LangGraph**. The system continuously monitors Emergency Room (ER) occupancy, ICU and Ward bed availability, staff workloads, bed sanitization queues, and predicted patient arrivals.

When sudden hospital operational events occur—such as an emergency surge of **12 incoming critical patients**—the system activates specialized agents to analyze care requirements, match bed inventory, balance nurse workloads, predict capacity deficits, validate plans against clinical hard rules, route high-risk actions to authorized human approvers, and **dynamically replan** if a human rejects an action.

---

## 2. Key Innovation & Differentiation

Existing hospital capacity management software functions primarily as static databases or basic rule engines.

Our key innovation is:
> **"A transparent multi-agent orchestration and decision-support platform demonstrating a continuous agentic loop: OBSERVE → REASON → PLAN → VALIDATE → REQUEST HUMAN APPROVAL → EXECUTE → OBSERVE AGAIN → REPLAN."**

---

## 3. Technology Stack

- **Frontend**: React 18, TypeScript, Vite, Tailwind CSS, Recharts, Lucide React icons, STOMP / WebSocket client.
- **Backend**: Java 11/17+, Spring Boot (Spring Web, Spring Data JPA, Spring WebSocket, Spring Security), PostgreSQL / H2 fallback, Flyway migrations.
- **AI / Agent Layer**: Python 3.11/3.13+, FastAPI, LangGraph, Pydantic, LLM Provider Abstraction (Gemini, OpenAI, Mock/Deterministic engine).
- **DevOps**: Docker, Docker-Compose, `.env.example`.

---

## 4. Multi-Agent System Architecture

```
                                    +-----------------------+
                                    |    React Frontend     |
                                    | (Command Center UI)   |
                                    +-----------+-----------+
                                                |
                                        REST / WebSocket
                                                |
                                                v
                                    +-----------------------+
                                    |   Spring Boot Backend |
                                    | (State, REST, WS Hub) |
                                    +-----+-----------+-----+
                                          |           |
                                 PostgreSQL          REST API
                                 (Database)           |
                                                      v
                                            +-----------------------+
                                            | Python FastAPI Service|
                                            | (LangGraph Engine)    |
                                            +-----------+-----------+
                                                        |
         +------------------+------------------+--------+--------+------------------+
         |                  |                  |                 |                  |
         v                  v                  v                 v                  v
  Patient Flow          Bed Mgmt             Staff           Discharge          Prediction
     Agent                Agent              Agent             Agent              Agent
         |                  |                  |                 |                  |
         +------------------+------------------+-----------------+------------------+
                                                |
                                                v
                                         Planning Agent
                                                |
                                                v
                                    Constraint & Safety Engine
                                                |
                                                v
                                     Human Approval Gateway
                                                |
                                                v
                                      Execution & Replanning
```

### Agents Responsibilities

1. **Orchestrator Agent (LangGraph)**: Maintains state (`HospitalState`), coordinates flow, triggers replanning.
2. **Patient Flow Agent**: Operational triage & care level estimation.
3. **Bed Management Agent**: Inventory matching, step-down transfer identification, cleaning queue tracking.
4. **Staff Agent**: Workload score monitoring (>85% overload detection) & float nurse reassignments.
5. **Discharge Review Agent**: Flags stable patients for clinical discharge review.
6. **Prediction Agent**: Operational demand forecasting across 15m, 30m, 60m, and 4h horizons.
7. **Planning Agent**: Synthesizes findings into structured Candidate Action Plans.
8. **Constraint & Safety Validator**: Enforces hard rules (no occupied/cleaning bed allocations, ICU care matching, prior human rejection respect).

---

## 5. Quick Start & Local Execution

### Option A: Docker Compose (Recommended)
```bash
docker-compose up --build
```
Access points:
- **Frontend Command Center**: `http://localhost:5173`
- **Spring Boot REST API**: `http://localhost:8080/api/hospital/state`
- **FastAPI AI Service**: `http://localhost:8000/api/v1/health`

### Option B: Local Microservices Setup

1. **Python AI Service**:
```bash
cd ai-service
py -m pip install -r requirements.txt
py main.py
```

2. **Spring Boot Backend**:
```bash
cd backend
.\mvnw.cmd compile
# or run via Spring Boot Maven plugin
```

3. **React Frontend**:
```bash
cd frontend
npm install
npm run dev
```

---

## 6. Crisis Scenario Demonstration Protocol

1. Open `http://localhost:5173`.
2. Click **"RUN CRISIS SCENARIO"** in the navigation header.
3. Observe real-time 12-emergency patient arrival telemetry.
4. Review generated HIGH RISK action in **Approvals** tab (e.g. Step-down transfer `P103` from ICU to Ward).
5. Click **REJECT** and input clinical feedback reason: *"Patient exhibits unstable cardiac arrhythmia."*
6. Watch the system automatically trigger an **Agent Replanning** cycle and present an updated alternative plan.

---

## 7. Safety Disclaimer & Positioning

This software is an academic operational capacity decision-support research prototype. It does **NOT** provide autonomous medical diagnosis, treatment recommendations, autonomous patient transfers, or autonomous discharges. Clinical decisions explicitly require human authorization.
