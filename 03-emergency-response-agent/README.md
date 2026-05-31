# 03 — Emergency Response Agent (Foundry Edition)

> Replace a custom Python multi-agent orchestration system with **three Azure AI Foundry agents wired together via a Foundry Workflow** — no orchestration code required.

## Purpose

A multi-agent system for emergency response planning and coordination. A **Coordinator agent** delegates to specialist agents — a **Weather Specialist** and a **Resources Specialist** — to generate comprehensive emergency response plans for scenarios like hurricanes, floods, wildfires, and winter storms.

## Architecture

```
Foundry Workflow (EmergencyResponseWorkflow)
└── EmergencyCoordinator (entry point / coordinator node)
    ├── WeatherSpecialist (workflow node)
    │   └── Action: WeatherAPI (real-time weather + forecast data)
    └── ResourcesSpecialist (workflow node)
        └── Action: ResourcesAPI (agency resources + inventory)

All agents share:
└── Knowledge: Emergency Procedures & Protocols
```

## Foundry Features Used

| Feature | Replaces |
|---|---|
| **3 Agents + Foundry Workflow** | Custom Python multi-agent orchestrator + Semantic Kernel planner |
| **Workflow-based delegation** | Manual sub-agent invocation code + result aggregation |
| **Knowledge (shared)** | Historical incident data + policy document retrieval code |
| **Actions (OpenAPI)** | Python plugins for weather API + agency resource APIs |

## Files

| File | Description |
|---|---|
| [`step_by_step.md`](./step_by_step.md) | Complete guide including multi-agent wiring |
| [`system_prompt_coordinator.txt`](./system_prompt_coordinator.txt) | Instructions for the Coordinator agent |
| [`system_prompt_weather.txt`](./system_prompt_weather.txt) | Instructions for the Weather Specialist agent |
| [`system_prompt_resources.txt`](./system_prompt_resources.txt) | Instructions for the Resources Specialist agent |
| [`openapi/weather-api.json`](./openapi/weather-api.json) | OpenAPI spec for weather data Action |
| [`openapi/resources-api.json`](./openapi/resources-api.json) | OpenAPI spec for agency resources Action |
| [`knowledge/emergency-procedures.md`](./knowledge/emergency-procedures.md) | Emergency protocols and response playbooks |

## Source

Foundry-first recreation of the [Emergency-Response-Agent](https://github.com/msftsean/ai-hackathon-use-cases/tree/main/Emergency-Response-Agent) accelerator.
