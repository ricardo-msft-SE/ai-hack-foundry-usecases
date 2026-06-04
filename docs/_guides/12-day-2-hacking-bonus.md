---
title: Day 2 Hacking Bonus
order: 12
icon_file: /assets/icons/12-day2-hacking-bonus.svg
icon_label: Day 2 hacking bonus
tagline: Research agency priorities with Microsoft Researcher and/or GitHub Copilot, then convert them into build-ready Foundry accelerator solutions.
foundry_features:
  - Microsoft Researcher
  - GitHub Copilot
  - Azure AI Foundry
  - Azure CLI
section: bonus
---

{% assign repo = site.github.repository_url | default: 'https://github.com/ricardo-msft-SE/ai-hack-foundry-usecases' %}

## Scenario
Day 2 teams need a repeatable way to move from public agency strategy to deployable agent prototypes. This bonus accelerator provides prompt packs that drive research, prioritization, use-case ideation, implementation, and deployment.

## Day 2 Build Focus
- Use Microsoft Researcher and/or GitHub Copilot to gather public strategic signals for a target agency.
- Translate strategy themes into candidate accelerator labs with measurable mission outcomes.
- Score and select use cases that are feasible in hackathon timelines.
- Use GHCP in VS Code to scaffold Foundry agents, provision Azure resources, and deploy web app experiences.

## Repo Artifacts
- [README]({{ repo }}/blob/main/12-day-2-hacking-bonus/README.md)
- [Step-by-step]({{ repo }}/blob/main/12-day-2-hacking-bonus/step_by_step.md)
- [Agency strategy research prompt]({{ repo }}/blob/main/12-day-2-hacking-bonus/prompts/agency-strategic-priorities-research.prompt.md)
- [Use-case ideation prompt]({{ repo }}/blob/main/12-day-2-hacking-bonus/prompts/use-case-accelerator-ideation.prompt.md)
- [GHCP: create Foundry agent]({{ repo }}/blob/main/12-day-2-hacking-bonus/prompts/ghcp-create-foundry-agent.prompt.md)
- [GHCP: provision Azure resources]({{ repo }}/blob/main/12-day-2-hacking-bonus/prompts/ghcp-provision-azure-resources.prompt.md)
- [GHCP: deploy web app]({{ repo }}/blob/main/12-day-2-hacking-bonus/prompts/ghcp-deploy-webapp.prompt.md)
- [GHCP: test and evaluate]({{ repo }}/blob/main/12-day-2-hacking-bonus/prompts/ghcp-test-and-evaluate.prompt.md)
- [GHCP: security and guardrails]({{ repo }}/blob/main/12-day-2-hacking-bonus/prompts/ghcp-security-and-guardrails.prompt.md)
- [GHCP: docs and demo assets]({{ repo }}/blob/main/12-day-2-hacking-bonus/prompts/ghcp-docs-and-demo-assets.prompt.md)

## Suggested Opening Prompt
"I am preparing for Day 2 of a government AI hackathon. Use public information to identify this agency's top strategic priorities, then propose 10 accelerator-style use cases I can prototype with Azure AI Foundry in 1-2 days."
