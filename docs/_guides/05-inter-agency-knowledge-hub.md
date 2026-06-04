---
title: Inter-Agency Knowledge Hub
order: 5
icon_file: /assets/icons/05-inter-agency-knowledge.svg
icon_label: Inter-agency knowledge
tagline: Federated cross-department retrieval with RBAC-aware information boundaries.
foundry_features:
  - Agent Service
  - Multi-index Knowledge
  - Entra ID RBAC
  - Evaluation
---

{% assign repo = site.github.repository_url | default: 'https://github.com/ricardo-msft-SE/ai-hack-foundry-usecases' %}

## Scenario
A cross-agency assistant unifies DMV, labor, social services, health, and general services knowledge while preserving access controls.

## Foundry Build Focus
- Upload and isolate knowledge per agency index.
- Configure role-based access assumptions through Entra ID app roles.
- Enforce source-labeled citations from the correct department.
- Validate access and answer boundaries through test scenarios.

## Repo Artifacts
- [README]({{ repo }}/blob/main/05-inter-agency-knowledge-hub/README.md)
- [Step-by-step]({{ repo }}/blob/main/05-inter-agency-knowledge-hub/step_by_step.md)
- [System prompt]({{ repo }}/blob/main/05-inter-agency-knowledge-hub/system_prompt.txt)
- [Knowledge: dmv-knowledge.md]({{ repo }}/blob/main/05-inter-agency-knowledge-hub/knowledge/dmv-knowledge.md)
- [Knowledge: labor-knowledge.md]({{ repo }}/blob/main/05-inter-agency-knowledge-hub/knowledge/labor-knowledge.md)
- [Knowledge: social-services-knowledge.md]({{ repo }}/blob/main/05-inter-agency-knowledge-hub/knowledge/social-services-knowledge.md)
- [Knowledge: health-knowledge.md]({{ repo }}/blob/main/05-inter-agency-knowledge-hub/knowledge/health-knowledge.md)
- [Knowledge: general-services-knowledge.md]({{ repo }}/blob/main/05-inter-agency-knowledge-hub/knowledge/general-services-knowledge.md)

## Suggested Demo Prompt
"I am a labor case worker helping a resident with a suspended license and unemployment gap. What coordinated actions are available?"
