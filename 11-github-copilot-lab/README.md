<img src="../docs/assets/icons/11-github-copilot-lab.svg" width="52" height="52" alt="GitHub Copilot Hackathon Lab" />

# GitHub Copilot Hackathon Lab

> Turn VS Code + GitHub Copilot into your Azure CLI expert, repo navigator, infrastructure deployer, and slide deck generator — four self-contained labs for hackathon day one.

## Purpose

This lab teaches participants how to use **GitHub Copilot (GHCP)** and **VS Code** as productivity multipliers alongside Azure AI Foundry. It is designed to be completed on the first day of the hackathon before teams dive into their accelerator builds.

## Labs at a Glance

| Lab | Goal | Time |
|---|---|---|
| **Lab 1** — Connect VS Code to Azure AI Foundry | Authenticate VS Code to Azure and Foundry; browse agents and deployments from the editor | 15 min |
| **Lab 2** — Connect to Your GitHub Repo | Clone the repo, explore it with Copilot, commit and push a change | 20 min |
| **Lab 3** — Deploy Azure Resources with CLIs and Copilot | Use Copilot to write and run `az` / `azd` commands that provision Foundry infrastructure | 25 min |
| **Lab 4** — Create an HTML Demo Day Presentation | Use Copilot to generate a polished reveal.js slide deck for the final hackathon demo | 20 min |

**Total estimated time: ~80 minutes**

## Prerequisites

- [VS Code](https://code.visualstudio.com/) installed
- A GitHub account with **GitHub Copilot** access (individual, team, or enterprise license)
- An Azure subscription with Contributor access

## Skills Covered

| Skill | How it's taught |
|---|---|
| Azure authentication from VS Code | Lab 1 — Azure Account + Azure AI Foundry extensions |
| Querying Foundry resources with Copilot | Lab 1 — `@azure` chat prompts |
| Git clone, explore, commit, push | Lab 2 — Source Control panel + `@workspace` prompts |
| Azure CLI + `azd` provisioning | Lab 3 — Copilot-generated `az` commands |
| HTML slide deck generation | Lab 4 — Copilot generates a full reveal.js presentation |

## Lab Guide

→ **[Step-by-Step Guide](./step_by_step.md)** — full instructions for all four labs

---

*This lab is infrastructure-agnostic: participants can use any accelerator use case as their content for Lab 4's presentation.*
