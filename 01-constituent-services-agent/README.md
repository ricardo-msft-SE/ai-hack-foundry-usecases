# 01 — Constituent Services Agent (Foundry Edition)

> Replace a custom Python Flask + Semantic Kernel chatbot with a **zero-code** Azure AI Foundry agent.

## Purpose

An AI-powered chatbot that answers citizen questions about city services — food assistance, business permits, parking, trash schedules, and more — with **citations from official documents**.

## Foundry Features Used

| Feature | Replaces |
|---|---|
| **Agent Service** | Flask web API + Semantic Kernel conversation loop |
| **Knowledge** | Custom RAG pipeline + `SearchClient` code + vector indexing |
| **Custom OpenAPI tools** | `@kernel_function` Python plugin classes |

## Files

| File | Description |
|---|---|
| [`step_by_step.md`](./step_by_step.md) | Complete click-by-click Foundry portal guide |
| [`system_prompt.txt`](./system_prompt.txt) | Copy-paste system instructions for the agent |
| [`openapi/city-services-api.json`](./openapi/city-services-api.json) | OpenAPI spec to upload as a custom OpenAPI tool |
| [`knowledge/city-services-overview.md`](./knowledge/city-services-overview.md) | Sample city services document for the Knowledge base |

## Source

Foundry-first recreation of the [Constituent-Services-Agent](https://github.com/msftsean/ai-hackathon-use-cases/tree/main/Constituent-Services-Agent) accelerator.
