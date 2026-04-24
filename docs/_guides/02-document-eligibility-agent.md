---
title: Document Eligibility Agent
order: 02
tagline: Document intake, extraction, and program eligibility triage without custom OCR code.
foundry_features:
  - Agent Service
  - Document Intelligence Tool
  - OpenAPI Actions
  - Knowledge
---

{% assign repo = site.github.repository_url | default: 'https://github.com/ricardo-msft-SE/ai-hack-foundry-usecases' %}

## Scenario
An intake assistant for social programs that extracts data from submitted documents, checks eligibility policy, and routes the case.

## Foundry Build Focus
- Enable the built-in Document Intelligence tool to replace manual OCR pipelines.
- Ground decisions on uploaded policy requirements.
- Route approved/flagged cases via OpenAPI action calls.
- Enforce redaction and sensitive data handling via prompt policy.

## Repo Artifacts
- [README]({{ repo }}/blob/main/02-document-eligibility-agent/README.md)
- [Step-by-step]({{ repo }}/blob/main/02-document-eligibility-agent/step_by_step.md)
- [System prompt]({{ repo }}/blob/main/02-document-eligibility-agent/system_prompt.txt)
- [OpenAPI: case-routing-api.json]({{ repo }}/blob/main/02-document-eligibility-agent/openapi/case-routing-api.json)
- [Knowledge: eligibility-requirements.md]({{ repo }}/blob/main/02-document-eligibility-agent/knowledge/eligibility-requirements.md)

## Suggested Demo Prompt
"Review this pay stub and utility bill and tell me if this household likely qualifies for HEAP, then route the case if complete."
