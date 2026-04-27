---
title: Virtual Citizen Assistant (.NET to Foundry)
order: 6
tagline: Replace ASP.NET Core and Semantic Kernel orchestration with direct Foundry agent delivery.
foundry_features:
  - Agent Service
  - Knowledge
  - OpenAPI Actions
  - Evaluation
---

{% assign repo = site.github.repository_url | default: 'https://github.com/ricardo-msft-SE/ai-hack-foundry-usecases' %}

## Scenario
A migration playbook showing how a .NET web + plugin architecture can be delivered as a no-hosting Foundry agent.

## Foundry Build Focus
- Translate controller and plugin responsibilities into agent instructions and tools.
- Replace custom retrieval code with Knowledge uploads.
- Attach permit operations through OpenAPI actions.
- Compare quality with the original behavior using evaluation sets.

## Repo Artifacts
- [README]({{ repo }}/blob/main/06-virtual-citizen-assistant-dotnet/README.md)
- [Step-by-step]({{ repo }}/blob/main/06-virtual-citizen-assistant-dotnet/step_by_step.md)
- [System prompt]({{ repo }}/blob/main/06-virtual-citizen-assistant-dotnet/system_prompt.txt)
- [OpenAPI: permit-api.json]({{ repo }}/blob/main/06-virtual-citizen-assistant-dotnet/openapi/permit-api.json)
- [Knowledge: city-services.md]({{ repo }}/blob/main/06-virtual-citizen-assistant-dotnet/knowledge/city-services.md)

## Suggested Demo Prompt
"What is the status of permit P-2024-001892 and what permit types should I review for opening a restaurant?"
