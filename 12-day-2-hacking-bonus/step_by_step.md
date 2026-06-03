# Day 2 Hacking Bonus - Step-by-Step Guide

This guide helps teams convert public agency strategy into a real, deployable accelerator solution during the hackathon.

## Step 1 - Pick the agency and mission boundary

Define the target agency and one mission area to focus on.

Output:
- Agency name
- Mission area
- Primary user group
- Desired mission outcome

Tip:
Keep the scope narrow enough to deliver a working demo in one day.

## Step 2 - Run strategic-priority research

Use Microsoft Researcher and/or GHCP with:
- prompts/agency-strategic-priorities-research.prompt.md

Collect public artifacts such as:
- Strategic plans
- Budget narratives
- Performance reports
- Public hearings and press releases
- Inspector general or oversight findings

Output:
- Top 5 to 8 strategic priorities
- Evidence citations for each priority
- Risks or blockers currently mentioned by the agency

## Step 3 - Generate accelerator use cases

Use:
- prompts/use-case-accelerator-ideation.prompt.md

Ask for:
- 10 to 15 candidate use cases
- Mapping from each use case to one or more strategic priorities
- Suggested implementation pattern in Foundry

Output:
- Candidate use-case table with impact and feasibility scoring

## Step 4 - Select one Day 2 build candidate

Score each use case using:
- Mission impact
- Data readiness
- Build complexity in 1 day
- Security/compliance risk
- Demo clarity

Output:
- One selected use case
- One backup use case
- Definition of done

## Step 5 - Create the Foundry agent with GHCP

Use:
- prompts/ghcp-create-foundry-agent.prompt.md

Output:
- Agent definition and instruction set
- Tooling plan (knowledge, actions, optional workflow)
- Initial test prompts

## Step 6 - Provision Azure resources with GHCP

Use:
- prompts/ghcp-provision-azure-resources.prompt.md

Output:
- Resource group and required services
- IaC or CLI commands
- Environment configuration

## Step 7 - Deploy web experience

Use:
- prompts/ghcp-deploy-webapp.prompt.md

Output:
- Working web app endpoint
- Connected Foundry agent endpoint
- Basic telemetry and runbook notes

## Step 8 - Evaluate and improve

Use:
- prompts/ghcp-test-and-evaluate.prompt.md

Output:
- Test matrix and pass/fail summary
- Top quality improvements implemented

## Step 9 - Add guardrails and security checks

Use:
- prompts/ghcp-security-and-guardrails.prompt.md

Output:
- Guardrail checklist
- Identity and access configuration summary
- Risk register for unresolved items

## Step 10 - Package docs and demo assets

Use:
- prompts/ghcp-docs-and-demo-assets.prompt.md

Output:
- Architecture summary
- Demo script and talking points
- Slide and README updates

## Day 2 Exit Criteria

- One solution maps clearly to agency strategic priorities
- One deployable agentic experience is accessible for judges
- Team can explain impact, risk controls, and next-phase scale plan
