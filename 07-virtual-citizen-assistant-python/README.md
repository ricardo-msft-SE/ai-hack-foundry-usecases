# 07 — Virtual Citizen Assistant (Python)

Foundry-First recreation of the Python + Semantic Kernel + Flask citizen assistant — with scheduling.

## What This Replaces

| Original Component | Foundry Equivalent |
|---|---|
| Flask routes and views | Azure AI Foundry Agent Service |
| Semantic Kernel orchestration | Managed agent conversation engine |
| `document_retrieval_plugin.py` | Built-in Knowledge (auto-RAG) |
| `scheduling_plugin.py` | OpenAPI Action (scheduling API) |
| Azure AI Search client | Knowledge indexes (no code) |
| `app.py` Flask startup | No startup code needed |
| Gunicorn / Azure App Service | No hosting required |
| `.env` secrets file | Foundry managed credentials |

## Key Scenario

A resident uses the city portal to ask questions about services **and to book appointments** — things like scheduling a building inspection, booking a benefits counseling session, or reserving a DMV appointment. The original Python solution used Semantic Kernel with custom `@kernel_function`-decorated plugin methods to call the scheduling API. With Foundry, you upload an OpenAPI spec and the agent handles appointment booking natively.

## Files in This Folder

| File | Purpose |
|---|---|
| [step_by_step.md](./step_by_step.md) | Full guide to recreating this agent in Foundry |
| [system_prompt.txt](./system_prompt.txt) | Paste this into the agent's System Instructions field |
| [openapi/scheduling-api.json](./openapi/scheduling-api.json) | Upload as an Action to enable appointment booking |
| [knowledge/city-services.md](./knowledge/city-services.md) | Upload as a Knowledge file |

## Foundry Features Used

- **Agent Service** — replaces Flask app + Semantic Kernel loop
- **Knowledge** — replaces `document_retrieval_plugin.py`
- **Actions (OpenAPI)** — replaces `scheduling_plugin.py`
- **Evaluation** — replaces custom logging and assertion scripts
