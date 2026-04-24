---
title: Emergency Response Agent
order: 03
tagline: Multi-agent emergency coordination across weather signals and resource readiness.
foundry_features:
  - Agent Service
  - Connected Agents
  - OpenAPI Actions
  - Knowledge
---

{% assign repo = site.github.repository_url | default: 'https://github.com/ricardo-msft-SE/ai-hack-foundry-usecases' %}

## Scenario
A coordinator agent delegates to specialists for weather and resource intelligence, then generates a phased response plan.

## Foundry Build Focus
- Create specialist agents first, then connect them into a coordinator.
- Attach weather and dispatch APIs as separate tools.
- Keep operating procedures and evacuation policy in Knowledge.
- Evaluate for actionability, timing, and escalation accuracy.

## Repo Artifacts
- [README]({{ repo }}/blob/main/03-emergency-response-agent/README.md)
- [Step-by-step]({{ repo }}/blob/main/03-emergency-response-agent/step_by_step.md)
- [System prompt: coordinator]({{ repo }}/blob/main/03-emergency-response-agent/system_prompt_coordinator.txt)
- [System prompt: weather specialist]({{ repo }}/blob/main/03-emergency-response-agent/system_prompt_weather.txt)
- [System prompt: resources specialist]({{ repo }}/blob/main/03-emergency-response-agent/system_prompt_resources.txt)
- [OpenAPI: weather-api.json]({{ repo }}/blob/main/03-emergency-response-agent/openapi/weather-api.json)
- [OpenAPI: resources-api.json]({{ repo }}/blob/main/03-emergency-response-agent/openapi/resources-api.json)
- [Knowledge: emergency-procedures.md]({{ repo }}/blob/main/03-emergency-response-agent/knowledge/emergency-procedures.md)

## Suggested Demo Prompt
"A severe storm is expected in 10 hours. Build a phased response plan and identify immediate staffing gaps."
