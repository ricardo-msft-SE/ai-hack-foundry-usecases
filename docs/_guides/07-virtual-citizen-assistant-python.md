---
title: Virtual Citizen Assistant (Python to Foundry)
order: 07
tagline: Replace Flask and Semantic Kernel plugins with a Foundry-native appointment-capable assistant.
foundry_features:
  - Agent Service
  - Knowledge
  - OpenAPI Actions
  - Evaluation
---

{% assign repo = site.github.repository_url | default: 'https://github.com/ricardo-msft-SE/ai-hack-foundry-usecases' %}

## Scenario
A migration path from Python Flask + plugin-based orchestration to a Foundry agent that can both answer service questions and complete scheduling flows.

## Foundry Build Focus
- Move service Q and A into a grounded knowledge-driven assistant.
- Replace scheduling plugin functions with OpenAPI operations.
- Run end-to-end multi-turn tests for availability, booking, and cancellation.
- Track booking-task completion quality through evaluations.

## Repo Artifacts
- [README]({{ repo }}/blob/main/07-virtual-citizen-assistant-python/README.md)
- [Step-by-step]({{ repo }}/blob/main/07-virtual-citizen-assistant-python/step_by_step.md)
- [System prompt]({{ repo }}/blob/main/07-virtual-citizen-assistant-python/system_prompt.txt)
- [OpenAPI: scheduling-api.json]({{ repo }}/blob/main/07-virtual-citizen-assistant-python/openapi/scheduling-api.json)
- [Knowledge: city-services.md]({{ repo }}/blob/main/07-virtual-citizen-assistant-python/knowledge/city-services.md)

## Suggested Demo Prompt
"Book me a housing assistance intake appointment next Thursday and tell me exactly what documents I should bring."
