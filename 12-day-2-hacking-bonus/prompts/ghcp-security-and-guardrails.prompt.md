# GHCP Prompt: Security and Guardrails

Use in VS Code chat with GitHub Copilot to harden a Day 2 prototype with practical guardrails.

## Large Sample Prompt

Act as a cloud security architect reviewing a hackathon AI solution.

Context:
- Use case: {{SELECTED_USE_CASE}}
- Data sensitivity: {{LOW_MEDIUM_HIGH}}
- Users: {{INTERNAL_EXTERNAL_MIXED}}
- Hosting model: {{HOSTING_MODEL}}

Deliverables:
1. Threat model lite:
   - Top abuse/misuse scenarios
   - Top data leakage paths
   - Top reliability/security failure modes
2. Guardrail checklist:
   - Prompt-level guardrails
   - Tool/action restrictions
   - Data access boundaries
   - Logging and monitoring basics
3. Identity and access guidance:
   - Least privilege RBAC
   - Managed identity usage
   - Secret handling
4. Safe-response strategy:
   - Disallowed content behavior
   - Uncertainty handling
   - Escalation and human handoff
5. Remediation actions:
   - Must-do today
   - Should-do after demo

Output format:
- Risk register table (risk, impact, likelihood, mitigation, owner)
- Security control map tied to architecture components
- Copy-ready backlog tasks

Constraints:
- Prioritize fast, high-value controls for Day 2.
- Separate demo-safe shortcuts from production-ready controls.
- Do not invent compliance claims without evidence.

Finish with:
- A 10-point pre-demo security checklist the team can run in 5 minutes.
