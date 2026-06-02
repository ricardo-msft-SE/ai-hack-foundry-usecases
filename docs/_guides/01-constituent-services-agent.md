---
title: Constituent Services Agent
order: 1
tagline: Citizen service assistant for benefits, permits, schedules, and civic FAQs.
foundry_features:
  - Agent Service
  - Knowledge
  - Custom OpenAPI Tools
  - Evaluation
---

{% assign repo = site.github.repository_url | default: 'https://github.com/ricardo-msft-SE/ai-hack-foundry-usecases' %}

## Scenario
A multilingual resident-facing assistant that answers city service questions with citations and can call service APIs when needed.

## Foundry Build Focus
- Configure one assistant agent with role-grounded system instructions.
- Upload city-service policy and process documents to Knowledge.
- Attach city services API as a custom OpenAPI tool.
- Evaluate groundedness and task quality using Foundry evaluations.

## Repo Artifacts
- [README]({{ repo }}/blob/main/01-constituent-services-agent/README.md)
- [Step-by-step]({{ repo }}/blob/main/01-constituent-services-agent/step_by_step.md)
- [System prompt]({{ repo }}/blob/main/01-constituent-services-agent/system_prompt.txt)
- [OpenAPI: city-services-api.json]({{ repo }}/blob/main/01-constituent-services-agent/openapi/city-services-api.json)
- [Knowledge: city-services-overview.md]({{ repo }}/blob/main/01-constituent-services-agent/knowledge/city-services-overview.md)

## Suggested Demo Prompt
"I need help renewing a permit and understanding available utility assistance this month."
