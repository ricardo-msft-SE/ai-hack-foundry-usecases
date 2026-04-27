---
title: Policy Compliance Checker
order: 4
tagline: Structured compliance scoring and remediation planning for public-sector AI solutions.
foundry_features:
  - Agent Service
  - Code Interpreter Tool
  - Knowledge
  - Evaluation
---

{% assign repo = site.github.repository_url | default: 'https://github.com/ricardo-msft-SE/ai-hack-foundry-usecases' %}

## Scenario
A compliance analyst agent scores solution compliance across governance domains and outputs prioritized remediation steps.

## Foundry Build Focus
- Ground the checker on standards and severity criteria in Knowledge.
- Use Code Interpreter for transparent weighted scoring logic.
- Produce a consistent report structure: findings, score, roadmap.
- Track answer quality and consistency with evaluation runs.

## Repo Artifacts
- [README]({{ repo }}/blob/main/04-policy-compliance-checker/README.md)
- [Step-by-step]({{ repo }}/blob/main/04-policy-compliance-checker/step_by_step.md)
- [System prompt]({{ repo }}/blob/main/04-policy-compliance-checker/system_prompt.txt)
- [Knowledge: compliance-standards.md]({{ repo }}/blob/main/04-policy-compliance-checker/knowledge/compliance-standards.md)

## Suggested Demo Prompt
"Assess this chatbot implementation plan against city policy standards and provide weighted score with critical fixes first."
