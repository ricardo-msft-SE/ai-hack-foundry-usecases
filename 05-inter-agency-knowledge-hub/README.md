<img src="../docs/assets/icons/05-inter-agency-knowledge.svg" width="52" height="52" alt="Inter-Agency Knowledge Hub" />

# 05 — Inter-Agency Knowledge Hub (Foundry Edition)

> Replace a custom Python cross-agency search system with a **zero-code** Azure AI Foundry agent using multiple Knowledge indexes and Entra ID role-based access control.

## Purpose

A unified knowledge hub that lets authorized staff search across multiple city agency knowledge bases simultaneously — with permission-aware result filtering based on the user's Entra ID role. Staff only see documents their role permits them to access.

## Architecture

```
KnowledgeHubAgent
├── Knowledge Index: DMV (Transportation)
├── Knowledge Index: Department of Labor
├── Knowledge Index: Social Services
├── Knowledge Index: Public Health
└── Knowledge Index: General Services

Access Control: Entra ID roles → filter which indexes are queried
```

## Foundry Features Used

| Feature | Replaces |
|---|---|
| **Agent Service** | Flask API + Semantic Kernel conversation loop |
| **Multiple Knowledge indexes** | 5 separate custom RAG pipelines + `SearchClient` per agency |
| **Azure AI Search security filters** | Custom permission-aware result filtering code |
| **Entra ID authentication** | Custom MSAL authentication code |
| **Built-in citation tracking** | Custom citation and audit log code |

## Files

| File | Description |
|---|---|
| [`step_by_step.md`](./step_by_step.md) | Complete guide including multi-index + RBAC setup |
| [`system_prompt.txt`](./system_prompt.txt) | System instructions for the knowledge hub agent |
| [`knowledge/dmv-knowledge.md`](./knowledge/dmv-knowledge.md) | Department of Motor Vehicles sample knowledge base |
| [`knowledge/labor-knowledge.md`](./knowledge/labor-knowledge.md) | Department of Labor sample knowledge base |
| [`knowledge/social-services-knowledge.md`](./knowledge/social-services-knowledge.md) | Social Services department sample knowledge base |
| [`knowledge/health-knowledge.md`](./knowledge/health-knowledge.md) | Public Health department sample knowledge base |
| [`knowledge/general-services-knowledge.md`](./knowledge/general-services-knowledge.md) | General Services / Procurement sample knowledge base |

## Source

Foundry-first recreation of the [Inter-Agency-Knowledge-Hub](https://github.com/msftsean/ai-hackathon-use-cases/tree/main/Inter-Agency-Knowledge-Hub) accelerator.
