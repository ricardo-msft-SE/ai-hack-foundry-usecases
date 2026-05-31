---
title: Professional License Credential Verifier
order: 8
tagline: Automated credential extraction and validation for state licensing boards.
foundry_features:
  - Agent Service
  - Code Interpreter
  - Knowledge
  - OpenAPI Actions
  - Entra ID RBAC
---

{% assign repo = site.github.repository_url | default: 'https://github.com/ricardo-msft-SE/ai-hack-foundry-usecases' %}

## Scenario
A state licensing board agent that extracts credentials from submitted transcripts, exam results, and background checks, validates them against licensing rules, and auto-approves 70–80% of applications within 2–4 hours instead of 2–4 weeks.

## Foundry Build Focus
- Use Code Interpreter (gpt-4o vision) to replace manual credential scanning across transcripts, exam scores, and background check documents.
- Ground eligibility decisions on uploaded licensure requirements for each license type (MD, JD, RN, Contractors).
- Auto-approve, escalate, or reject via OpenAPI action calls to the state licensing database.
- Enforce staff access tiers with Entra ID RBAC (reviewers vs. final approvers).

## Repo Artifacts
- [README]({{ repo }}/blob/main/08-professional-license-credential-verifier/README.md)
- [Step-by-step]({{ repo }}/blob/main/08-professional-license-credential-verifier/step_by_step.md)
- [System prompt]({{ repo }}/blob/main/08-professional-license-credential-verifier/system_prompt.txt)
- [OpenAPI: licensing-api.json]({{ repo }}/blob/main/08-professional-license-credential-verifier/openapi/licensing-api.json)
- [Knowledge: licensure-requirements.md]({{ repo }}/blob/main/08-professional-license-credential-verifier/knowledge/licensure-requirements.md)

## Supported License Types
- **Medical (MD/DO)** — USMLE/COMLEX scores ≥ 230, accredited program, reciprocity check
- **Legal (JD)** — UBE score ≥ 270, ABA-accredited law school, character & fitness
- **Nursing (RN/LPN)** — NCLEX ≥ 205, approved nursing program, multistate compact
- **Contractors** — Apprenticeship hours, journeyperson exam ≥ 70%, state CE credits

## Suggested Demo Prompt
"Review this transcript, USMLE score report, and background check. Does this applicant meet MD licensure requirements for our state? Submit the decision."
