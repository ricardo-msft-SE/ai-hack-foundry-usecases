<img src="../docs/assets/icons/12-day2-hacking-bonus.svg" width="52" height="52" alt="Day 2 Hacking Bonus" />

# 12 - Day 2 Hacking Bonus (Foundry Edition)

Turn agency strategy into build-ready accelerator labs in a single hackathon day.

This bonus track is designed for Day 2 teams that want to:
- Research a target agency using public information
- Determine strategic priorities with defensible evidence
- Generate high-value accelerator use cases aligned to mission outcomes
- Build and deploy solutions quickly with GitHub Copilot in VS Code and Azure AI Foundry

## Purpose

Most hackathon teams can build quickly once they know what to build. The bottleneck is selecting the right mission problem.

Day 2 Hacking Bonus solves that by providing prompt packs that move teams through a repeatable sequence:
1. Agency research and strategic-priority extraction
2. Use-case ideation and prioritization
3. Foundry agent creation and Azure provisioning
4. Deployment, testing, and demo packaging

## Tools

- Microsoft Researcher and/or GitHub Copilot (either is acceptable)
- Azure AI Foundry
- Azure CLI and/or Azure Developer CLI
- VS Code with GitHub Copilot

## Files

| File | Description |
|---|---|
| step_by_step.md | Day 2 execution workflow from research to shipped prototype |
| prompts/agency-strategic-priorities-research.prompt.md | Large sample prompt for agency strategy research |
| prompts/use-case-accelerator-ideation.prompt.md | Large sample prompt for turning priorities into use cases |
| prompts/ghcp-create-foundry-agent.prompt.md | GHCP prompt for creating a Foundry agent |
| prompts/ghcp-provision-azure-resources.prompt.md | GHCP prompt for provisioning Azure resources |
| prompts/ghcp-deploy-webapp.prompt.md | GHCP prompt for deploying to a web app |
| prompts/ghcp-test-and-evaluate.prompt.md | GHCP prompt for testing and evaluation |
| prompts/ghcp-security-and-guardrails.prompt.md | GHCP prompt for security and guardrails |
| prompts/ghcp-docs-and-demo-assets.prompt.md | GHCP prompt for docs and demo packaging |

## Expected Outcome

By the end of Day 2, teams should have:
- A research-backed statement of top agency priorities
- A ranked short list of accelerator-grade use cases
- One implemented agentic solution in Azure AI Foundry
- Basic deployment and demo artifacts ready for presentation

## Suggested Start

1. Run the strategy research prompt first.
2. Run the use-case ideation prompt next.
3. Select one use case using impact x feasibility.
4. Execute GHCP prompts in sequence: create agent, provision resources, deploy, test, harden, document.
