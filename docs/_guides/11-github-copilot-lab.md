---
title: GitHub Copilot Hackathon Lab
order: 11
icon_file: /assets/icons/11-github-copilot-lab.svg
icon_label: GitHub Copilot lab
tagline: Four hands-on labs that teach VS Code + GitHub Copilot as your Azure expert, repo navigator, and demo day presenter.
foundry_features:
  - GitHub Copilot
  - Azure CLI
  - VS Code Extensions
  - GitHub Pages
section: lab
---

{% assign repo = site.github.repository_url | default: 'https://github.com/ricardo-msft-SE/ai-hack-foundry-usecases' %}

## Scenario
A structured set of hands-on labs that teach hackathon participants to use GitHub Copilot in VS Code as a productivity multiplier — connecting to Azure, exploring the repo, deploying infrastructure, and building a demo day presentation.

## Labs

| Lab | Goal | Time |
|---|---|---|
| **Lab 1** | Connect VS Code to Azure AI Foundry (extensions, `@azure` queries) | 15 min |
| **Lab 2** | Clone, explore, commit, and push the hackathon repo | 20 min |
| **Lab 3** | Deploy Azure resources using `az` / `azd` CLIs with Copilot-generated commands | 25 min |
| **Lab 4** | Generate a reveal.js HTML slide deck for Demo Day | 20 min |

## Build Focus
- Authenticate VS Code to GitHub and Azure in one session.
- Use `@azure` and `@workspace` chat participants to query live resources and repo content.
- Let Copilot write, explain, and troubleshoot Azure CLI commands.
- Generate a polished single-file HTML presentation with no design tools.

## Repo Artifacts
- [README]({{ repo }}/blob/main/11-github-copilot-lab/README.md)
- [Step-by-step]({{ repo }}/blob/main/11-github-copilot-lab/step_by_step.md)

## Suggested Opening Prompt
```
@workspace What accelerators are in this repo and which one best matches a scenario involving uploaded government documents and eligibility decisions?
```
