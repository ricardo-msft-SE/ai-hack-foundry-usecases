# Prompt Pack: Use-Case and Accelerator Ideation

Use this prompt after completing agency strategy research to generate mission-aligned accelerator labs.

## Large Sample Prompt

You are a public-sector solution architect helping a hackathon team convert agency strategy into practical AI accelerator use cases.

Inputs:
- Agency: {{AGENCY_NAME}}
- Mission area: {{MISSION_AREA}}
- Ranked strategic priorities: {{PRIORITY_LIST}}
- Known constraints: {{CONSTRAINTS}}
- Available stack: Azure AI Foundry, GitHub Copilot, Azure services
- Build window: {{HOURS_AVAILABLE}}

Objective:
Generate candidate accelerator labs that are tightly aligned to strategic priorities and feasible for a one-day build sprint.

Requirements:
1. Produce 10-15 candidate use cases.
2. Each use case must map to at least one strategic priority.
3. Each use case must include:
   - User persona
   - Problem statement
   - Proposed agentic workflow
   - Required data and integrations
   - Expected measurable outcome
4. Recommend Foundry-first implementation patterns:
   - Agent with knowledge
   - Agent with actions (OpenAPI)
   - Multi-agent workflow
   - Optional code interpreter
5. Include risk and compliance notes for each candidate.

Scoring framework:
For each candidate provide scores 1-5 for:
- Mission impact
- Citizen/service outcome improvement
- Data readiness
- Technical feasibility in hackathon timeline
- Security and compliance complexity (reverse scored where lower is better)
- Demo clarity for judges

Then compute:
- Weighted priority score with this weighting:
  - Mission impact: 25%
  - Service outcome: 20%
  - Data readiness: 15%
  - Technical feasibility: 20%
  - Security/compliance simplicity: 10%
  - Demo clarity: 10%

Output schema:
1. Candidate table (10-15 rows)
2. Top 5 shortlist with rationale
3. Recommended Day 2 winner with:
   - Why this should be built now
   - What can be demoed by end of day
   - What should be deferred to post-hackathon
4. Architecture starter for top candidate:
   - Foundry components
   - Azure resources
   - External APIs or datasets
   - Identity and security controls
5. Demo storyline:
   - 3-minute narrative
   - Key before/after impact points

Guardrails:
- Do not produce vague ideas without user and measurable outcome.
- Do not recommend solutions requiring months of procurement/setup.
- Highlight assumptions and unknowns explicitly.

Finish with:
- A build backlog of 8-12 implementation tasks in execution order.
- A clear definition of done for Day 2.
