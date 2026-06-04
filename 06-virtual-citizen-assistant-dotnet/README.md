<img src="../docs/assets/icons/06-virtual-assistant-dotnet.svg" width="52" height="52" alt="Virtual Citizen Assistant (.NET)" />

# 06 — Virtual Citizen Assistant (.NET)

Foundry-First recreation of the .NET 9 + ASP.NET Core MVC + Semantic Kernel citizen assistant.

## What This Replaces

| Original Component | Foundry Equivalent |
|---|---|
| ASP.NET Core MVC controllers | Azure AI Foundry Agent Service |
| Semantic Kernel orchestration loop | Managed agent conversation engine |
| Azure AI Search SDK (`SearchClient`) | Built-in Knowledge (auto-RAG) |
| `document_retrieval_plugin.cs` | Knowledge indexes (no code) |
| Bootstrap UI + Razor views | Foundry Playground / Teams channel / Copilot Studio |
| Azure App Service hosting | No hosting required |
| Application Insights telemetry | Built-in Foundry tracing |
| CI/CD pipeline (GitHub Actions) | None needed for prototype |

## Key Scenario

A resident visits the city portal and asks questions about permits, services, and schedules. The original solution required a full .NET web application with Semantic Kernel plugins, Azure AI Search configuration, and App Service hosting. With Foundry, you configure an agent in a browser — no infrastructure to provision, no code to write.

## Files in This Folder

| File | Purpose |
|---|---|
| [step_by_step.md](./step_by_step.md) | Full guide to recreating this agent in Foundry |
| [system_prompt.txt](./system_prompt.txt) | Paste this into the agent's System Instructions field |
| [openapi/permit-api.json](./openapi/permit-api.json) | Upload as a custom OpenAPI tool to enable permit status lookups |
| [knowledge/city-services.md](./knowledge/city-services.md) | Upload as a Knowledge file |

## Foundry Features Used

- **Agent Service** — replaces the MVC controller + Semantic Kernel loop
- **Knowledge** — replaces SearchClient + RAG pipeline
- **Custom OpenAPI tools** — replaces .NET plugin methods
- **Evaluation** — replaces custom logging/telemetry scripts

## Source

Foundry-first recreation of the [.NET-API-Virtual-Citizen-Assistant](https://github.com/msftsean/ai-hackathon-use-cases/tree/main/.NET-API-Virtual-Citizen-Assistant) accelerator.
